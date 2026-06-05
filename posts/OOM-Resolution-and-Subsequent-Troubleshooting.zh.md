---
id: "OOM-Resolution-and-Subsequent-Troubleshooting"
lang: "zh"
date: "2026.06.05"
stardate: "BUILD-1.2.8"
author: "Ricardo"
readTime: "6.0 min"
wordCount: 1800
category: "System"
title: "一次真实的线上OOM问题解决及后续排查"
summary: "2026年4月2日上午11时51分，刚好我值班，fuck，生产服务 `gccloud-res-manage`发生严重的 Java 堆内存溢出（`OutOfMemoryError: Java heap space`），导致大量请求失败。"
tags: ["Java", "SpringBoot", "OOM"]
---

# 生产环境 OOM 问题分析


## 1. 问题概述

2026年4月2日上午11时51分，生产服务 `gccloud-res-manage`发生严重的 Java 堆内存溢出（`OutOfMemoryError: Java heap space`），刚好我值班，真的是fuck了，导致大量请求失败。

## 2. 事故时间线

| 时间          | 事件                                                         | 严重程度 |
| ------------- | ------------------------------------------------------------ | -------- |
| 11:46:01      | `BizDataService` 翻译操作耗时 407,721ms（约 6.8 分钟），内存开始堆积 | ⚠️ 警告   |
| 11:46:01      | Broken pipe 异常，客户端因等待超时主动断开连接               | ⚠️ 警告   |
| 11:51:16      | OOM 首次出现，堆内存耗尽                                     | 🔴 严重   |
| 11:51:20      | Netty 线程抛出 OOM，蔓延至网络层                             | 🔴 严重   |
| 11:51:57      | 多个 HTTP 请求线程同时 OOM，大面积失败                       | 🔴 严重   |
| 11:53:00      | Redis 序列化操作因 OOM 失败，缓存层完全瘫痪                  | 🔴 严重   |
| 11:59:25      | Jedis 连接池状态损坏，计时出现负数                           | 🔴 严重   |
| 11:59:25      | `ResourceServiceImpl` 出现 NullPointerException，为 OOM 次生异常 | 🔴 严重   |
| 11:51 ~ 12:00 | JVM 处于苟活状态，内存需求极低的线程仍能偶发执行             | 🟡 降级   |
| 12:00         | 手动重启服务，恢复正常                                       | ✅ 恢复   |


## 3. 根本原因分析

### 3.1 直接原因：深度递归导致邻接矩阵内存爆炸

`GrfAllEdge` 类使用二维数组作为图的邻接矩阵，当光路节点数量为 30,483 时，单次内存分配量为：

```
30,483 × 30,483 × 4 字节 = 3,717,584,784 字节 ≈ 3.55 GB
```

MAT（Memory Analyzer Tool）分析结果证实：

| MAT 分析项        | 数值                                   |
| ----------------- | -------------------------------------- |
| 问题线程          | `http-nio-8004-exec-39`                |
| 线程占用内存      | 3,814,142,968 字节（91.33%）           |
| 根对象类型        | `int[30483][]`                         |
| 根对象字段名      | `GrfAllEdge.matrix`                    |
| MAT Retained Heap | 3,717,584,768 字节（与计算值完全吻合） |

### 3.2 完整调用链

```
AutoOpenOpticalController.queryRoute   ← HTTP 入口
  → AutoOpenOpticalService.queryRoute
  → AutoOpenOpticalService.getRouteByNode
  → GrfAllEdge.getNodeRoute2
  → GrfAllEdge.dfsStack（递归）         ← 递归 DFS
    → dfsStack → dfsStack → ...         ← 大量重复递归帧
      → Integer.valueOf()               ← 装箱，line 94
```

### 3.3 为什么期间内存一直未被 GC 回收

GC 回收对象的条件是：对象不可达（无任何 GC Root 持有其强引用）。但此处存在完整的强引用链：

```
GC Root
  └── http-nio-8004-exec-39（活跃线程）
        └── 线程栈帧（dfsStack 局部变量）
              └── GrfAllEdge 实例
                    └── int[30483][]  ← 3.55 GB，无法回收
```

> **注意**：GC Root 并不仅限于静态变量，活跃线程的栈帧局部变量同样是 GC Root。只要 `exec-39` 线程的递归未结束，其持有的 `matrix` 引用就永远可达，GC 对这 3.55 GB 无能为力。

### 3.4 次生异常：OOM 引发的 NullPointerException

OOM 期间 `CacheAspect` 捕获了 Redis 序列化异常后静默返回 `null`，而调用方未做判空处理，导致 NPE：

```
CacheAspect.aground (CacheAspect.java:62)
  → Redis get 时 OOM → catch 异常 → 返回 null
  → BizMetaService.getBigClassIdBySpecId 拿到 null
  → ResourceServiceImpl.pageQueryResource (line 2273) → NPE
```

> 这类 NPE 是 OOM 的伴生症状，解决根本问题后自然会消失。

### 3.5 OOM 期间为何仍有部分线程正常执行

OOM 是可捕获的 `Error`，只杀死抛出异常的线程，不会停止整个 JVM 进程。期间堆内存长期处于 90% 以上占用状态：

- 内存需求极低的操作（单条记录查询、心跳日志）能从 GC 缝隙中抢到资源，偶发成功
- 内存需求稍大的操作（序列化、大结果集）立即 OOM 阵亡
- 本质是各线程在争抢剩余的 ~9% 堆空间

------

## 4. 解决方案

### 4.1 一：邻接矩阵改为邻接表（根治，最高优先级）

项目中光纤网络是典型的稀疏图，边的数量远少于节点数²，使用邻接矩阵极度浪费内存，改为邻接表后内存可减少 **99% 以上**。

**改造前（问题代码）：**

```java
public class GrfAllEdge {
    int[][] matrix; // 30483×30483 = 3.55 GB，灾难根源

    public GrfAllEdge(int nodeCount) {
        matrix = new int[nodeCount][nodeCount]; // 内存爆炸
    }
}
```

**改造后（邻接表）：**

```java
public class GrfAllEdge {
    // 内存复杂度 O(N+E)，N=节点数，E=边数
    Map<Integer, List<Integer>> adjList = new HashMap<>();

    public void addEdge(int u, int v) {
        adjList.computeIfAbsent(u, k -> new ArrayList<>()).add(v);
        adjList.computeIfAbsent(v, k -> new ArrayList<>()).add(u);
    }

    public List<Integer> neighbors(int u) {
        return adjList.getOrDefault(u, Collections.emptyList());
    }
}
```

### 4.2 二：DFS 递归改为迭代（配合方案一）

递归 DFS 存在 `StackOverflowError` 风险，改为显式栈的迭代实现后彻底消除递归深度问题：

```java
List<List<Integer>> dfsIterative(int start, int target) {
    List<List<Integer>> result = new ArrayList<>();
    Deque<Object[]> stack = new ArrayDeque<>();
    stack.push(new Object[]{start, new ArrayList<>(List.of(start))});
    Set<Integer> visited = new HashSet<>();

    while (!stack.isEmpty()) {
        Object[] frame = stack.pop();
        int curr = (int) frame[0];
        List<Integer> path = (List<Integer>) frame[1];

        if (curr == target) { result.add(new ArrayList<>(path)); continue; }
        if (visited.contains(curr)) continue;
        visited.add(curr);

        for (int next : adjList.getOrDefault(curr, Collections.emptyList())) {
            if (!visited.contains(next)) {
                List<Integer> newPath = new ArrayList<>(path);
                newPath.add(next);
                stack.push(new Object[]{next, newPath});
            }
        }
    }
    return result;
}
```

### 4.3 三：入口节点数校验（最根本的方法）

在代码改造期间，先在业务入口加节点数限制，防止 OOM 再次发生（后续证实用户根本用不到太高的光路节点数量，遂直接减少前端页面入口处可选的节点最大值，直接减少了递归深度）：

```java
// AutoOpenOpticalService.queryRoute 方法入口
if (nodeList.size() > 5000) {
    throw new BusinessException(
        "光路节点数量过大（" + nodeList.size() + "），请缩小查询范围");
}
```

### 4.4 四：修复 CacheAspect 异常处理（消除次生 NPE）

缓存切面捕获异常后不能静默返回 `null`，应降级执行真实业务方法：

```java
// CacheAspect.java:62 修复
try {
    Object cached = cacheUtils.get(key);
    if (cached != null) return cached;
} catch (Exception e) {
    log.error("Redis get 异常，", e);
    return pjp.proceed(); // 降级：执行真实方法，不返回 null
}
```

------

## 5. 涉及知识点

| 知识点             | 说明                                                         |
| ------------------ | ------------------------------------------------------------ |
| GC Root 类型       | 活跃线程栈帧、静态变量、JNI引用、synchronized锁持有者、已加载Class对象 |
| OOM 不等于进程崩溃 | OOM 是可捕获的 `Error`，只杀死当前线程，JVM 进程继续运行     |
| 邻接矩阵 vs 邻接表 | 邻接矩阵 O(N²) 空间，适合稠密图；邻接表 O(N+E)，适合稀疏图   |
| Heap Dump 时机     | 配置 `HeapDumpOnOutOfMemoryError` 后，在首次 OOM 时生成快照  |
| Broken pipe 原因   | 服务端响应过慢，客户端超时主动关闭连接，服务端继续写数据触发 |
| 次生 NPE 原因      | OOM 中断对象初始化过程，或缓存异常后静默返回 null 导致调用方 NPE |

