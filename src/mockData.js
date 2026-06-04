export const timelineLogs = [
  {
    id: "t-1",
    stardate: "BUILD-1.2.4",
    date: "2026-06-03",
    status: "OK",
    category: "DEPLOYMENT",
    en: "Deployed blog engine v1.2.4. Refactored the responsive grid system for widescreen fluid viewports. Status: ACTIVE.",
    zh: "博客系统 v1.2.4 版本成功部署上线。重构了针对宽屏显示器的响应式流式布局。状态：激活。"
  },
  {
    id: "t-2",
    stardate: "BUILD-1.2.0",
    date: "2026-05-28",
    status: "WARN",
    category: "PERFORMANCE",
    en: "Diagnosed rendering loop anomalies in Safari container. Adjusted GPU acceleration overlays. Resolved.",
    zh: "定位了 Safari 浏览器上的重渲染循环异常。调整了图形显卡加速硬件指令。故障已修复。"
  },
  {
    id: "t-3",
    stardate: "BUILD-1.1.2",
    date: "2026-05-18",
    status: "OK",
    category: "BUNDLING",
    en: "Rebuilt asset pipeline configurations using vanilla Vite. Client bundles compressed to 8.4KB. Speed optimal.",
    zh: "使用原生 Vite 重新配置了打包流水线。生产环境静态代码文件体积压缩至 8.4KB。速度极佳。"
  },
  {
    id: "t-4",
    stardate: "BUILD-1.1.0",
    date: "2026-05-15",
    status: "OK",
    category: "PUBLISHING",
    en: "Completed draft on Monospace UI design principles. Uploaded to static directories for review.",
    zh: "完成《等宽排版在网页设计中的静谧美学》技术文章撰写。已提交静态分发节点以供审阅。"
  },
  {
    id: "t-5",
    stardate: "BUILD-1.0.1",
    date: "2026-04-26",
    status: "ALERT",
    category: "HOSTING",
    en: "Observed load spike on cloud VPS node. Migrated database partitions to high-performance SSD block storage.",
    zh: "云端主机出现临时负荷峰值。已将主数据库分区迁移至高性能固态硬盘存储块。"
  }
];

export const projects = [
  {
    id: "p-helios",
    code: "PKG-HELIOS",
    status: "ACTIVE",
    statusClass: "status-active",
    en: {
      name: "Helios UI",
      spec: "Minimalist CSS UI Library",
      description: "A lightweight, style-agnostic CSS UI component library designed for building technical consoles and dashboards with zero boilerplate."
    },
    zh: {
      name: "赫利俄斯 UI",
      spec: "极简无框 CSS 组件库",
      description: "一个轻量级、无预置样式的 CSS UI 组件库，专为快速构建低渲染开销的控制台与系统监控面板设计。"
    }
  },
  {
    id: "p-orion",
    code: "LIB-ORION",
    status: "MAINTENANCE",
    statusClass: "status-maint",
    en: {
      name: "Orion Parser",
      spec: "Markdown AST Compiler Subsystem",
      description: "A fast parser converting markdown files into abstract syntax trees for secure rendering in client browsers."
    },
    zh: {
      name: "猎户座解析器",
      spec: "Markdown 语法树分析器",
      description: "多用途的高性能 Markdown 分析器，负责在前端将 Markdown 文档即时安全地编译为标准的抽象语法树与 HTML 代码。"
    }
  },
  {
    id: "p-aegis",
    code: "SHIELD-AEGIS",
    status: "STANDBY",
    statusClass: "status-standby",
    en: {
      name: "Aegis Guard",
      spec: "Client Security & CSP Shield",
      description: "Automated scanner enforcing strict content security policies and preventing XSS vulnerabilities on static pages."
    },
    zh: {
      name: "埃癸斯卫士",
      spec: "前端安全与 CSP 防护组件",
      description: "自动化前端安全扫描组件，负责自动为页面装载严格的内容安全策略（CSP），以杜绝静态页面中的跨站脚本注入（XSS）漏洞。"
    }
  }
];
