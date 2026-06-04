---
id: "distributed-sharding-performance"
lang: "en"
date: "2026.06.03"
stardate: "BUILD-1.3.0"
author: "Ricardo"
readTime: "5.5 min"
wordCount: 1550
category: "Database"
title: "Distributed Database Sharding & Performance Tuning under High Concurrency"
summary: "An in-depth analysis of sharding algorithm designs, database connection pools, and transactional consistency adjustments using Spring Boot and MySQL."
tags: ["MySQL", "Sharding", "Spring Boot", "Performance"]
---

### 0x01 Background & Bottleneck Diagnostics

Under extreme traffic loads supporting millions of daily active users, single-node relational databases hit severe physical bottlenecks in I/O throughput, CPU usage, and physical storage. Normally, when a single table scales past **5 million rows** or exceeds **2GB** in size, index traversal depth on the B+ Tree increases, and random disk disk access latencies degrade query execution speeds dramatically.

To push through these limits, we restructured our high-volume transactional ordering schema by migrating to a **horizontally sharded (Sharding)** database architecture.

---

### 0x02 Sharding Strategy & Router Architecture

Selecting the right Sharding Key is critical. Poor partition boundaries lead to data skew and expensive cross-node scatter-gather queries that degrade network interfaces.

#### 1. Partition Selection
We designated `user_id` as the primary routing dimension. The sharding logic applies modular arithmetic to ensure an even distribution of write loads:

$$\text{DbIndex} = (\text{user\_id} \bmod 10000) / 100 \bmod N$$
$$\text{TableIndex} = (\text{user\_id} \bmod 10000) \bmod M$$

Where $N$ represents physical database instances, and $M$ defines tables per database instance.

#### 2. Sharding Hash Routing Code
Before writing records to persistent storage, the system's routing logic validates the route coordinates to prevent data drift:

```java
public class ShardingRouter {
    private static final int TOTAL_SHARDS = 100; // Virtual nodes count

    public static String route(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("Sharding key: userId cannot be null.");
        }
        int hashCode = Math.abs(userId.hashCode());
        int dbNode = (hashCode % TOTAL_SHARDS) / 10;
        int tableNode = (hashCode % TOTAL_SHARDS) % 10;
        return String.format("db_node_%d.t_order_%d", dbNode, tableNode);
    }
}
```

---

### 0x03 Distributed Transactions & HikariCP Tuning

Horizontal sharding breaks standard database ACID transactions. Forcing 2-Phase Commit (2PC) under high concurrency incurs extensive thread blocking, bloating response time (RT) metrics.

#### 1. Eventual Consistency with Message Queues
Instead of strict locks, we adopted **eventual consistency via reliable transactional message queues (RocketMQ)**, enabling non-blocking asynchronous state checks.

#### 2. HikariCP Connection Pool Configurations
To ensure thread availability and prevent connection starvation during request surges, we optimized our connection pool variables:

```properties
# HikariCP Performance Settings
spring.datasource.hikari.maximum-pool-size=30
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.connection-timeout=5000
spring.datasource.hikari.max-lifetime=1800000
```

> [!IMPORTANT]
> A larger pool size does not guarantee higher throughput. According to $\text{Pool Size} = \text{Core Count} \times 2 + \text{Effective Spindle Count}$, oversized pools degrade performance due to excessive thread context-switching on server CPUs.

---

### 0x04 Tuning Optimization Results

Following these changes, stress-testing under peak synthetic workloads demonstrated high stability:
*   **Average Response Time (RT)**: Reduced from `280ms` down to a flat `14ms`.
*   **Write Operations Throughput**: Scaled past `15,000+ TPS` without database replication lag.
*   **Connection Wait Time**: Stabilized close to `0ms`.
