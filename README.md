# DevLog Panel - Ricardo's Technical Blog

这是一个个人技术博客。项目采用原生的 HTML、CSS 和 JavaScript 构建，没有使用庞大的 JS 框架，利用 Vite 作为打包器与开发服务器，部署于 Cloudflare Pages 平台。

---

## 🌟 核心特性

1. **拟物纸张视觉 (Warm Paper)**
   - 温润雅致的拟物纸张黄配色 (`#f6f3eb` 纸张背景 / `#1c1917` 柔和炭黑文字)。
   - 融入复古 CRT 屏幕微弱扫描线滤镜（Scanline Overlay）与现代毛玻璃（Frosted Glass）悬浮导航栏。
   - 交互式打字机字符滚动（Text Scramble）动画。

2. **高性能与编译时预构建 (Build-Time Pre-compilation)**
   - 在构建（Build）阶段，通过自定义 Node 脚本 `scripts/build-posts.cjs` 静态解析 `posts/` 目录下的所有 Markdown 文章，避免了运行时解析 Markdown 的高额开销。
   - 极轻量化的打包体积与 sub-second 级别秒开响应速度。

3. **双语支持(Internationalization)**
   - 支持中/英 (ZH/EN) 双语切换，全站 UI 字段和文章内容同步翻译。
   - 若某篇文章缺少对应的英文版文件，系统会自动降级显示中文原版，防止渲染崩溃。

4. **实时 Git 提交记录时间轴 (Live Git Changelog)**
   - 编译时自动读取 Git 仓库最新的 30 次提交历史，通过语义判定自动将 Commit 划分为 `FEATURE`、`BUGFIX`、`UI/STYLE` 等类别。
   - 自适应适配 CI 构建环境（如 Cloudflare Pages）的浅克隆限制，具备自动 Unshallow 抓取完整 Commit 链的功能。

5. **交互式开发者工具箱 (真不知道该写什么了...)**
   - **JWT 编码解析器 (JWT Decoder)**：本地快速解析 JWT 载荷与头部。
   - **时间戳转换器 (Timestamp Converter)**：提供实时时间戳与格式化 LOC/UTC 相互转换。
   - **Base64 编解码器 (Base64 Coder)**：提供安全的 Base64 编码与解码功能。
   - **正则表达式测试器 (Regex Tester)**：实时匹配正则表达式并以 `<mark>` 高亮高保真预览。

6. **Markdown 阅读器体验 (Rich Post Reader)**
   - **Mermaid 流程图支持**：在正文中书写 ```mermaid 会被自动绘制成高保真矢量拓扑图。
   - **Mac 终端风格代码块**：带有红黄绿控制钮、语言标和一键“COPY”功能，集成 Highlight.js（Atom One Dark 皮肤）。
   - **GitHub 风格警告框 (Alert Callouts)**：支持 `[!NOTE]`、`[!TIP]`、`[!IMPORTANT]`、`[!WARNING]`、`[!CAUTION]` 五类警示卡片。
   - **智能多级侧边大纲 (Dynamic TOC)**：自动提取文章中的 `H1`、`H2`、`H3` 标题，支持树状缩进排版并配合页面滚动实时高亮锚定。

7. **实时边缘遥测面板 (Site Telemetry Dashboard)**
   - 边缘端动态获取并展示累计浏览量 (PV)、独立访客数 (UV)。
   - 实时测量网页加载耗时、网络往返延时（TTFB）、访客所在的 Cloudflare 边缘节点代码（IATA 码）以及当前连接的协议版本（如 HTTP/3）。

---

## 🛠️ 技术栈

*   **核心引擎**：原生 HTML5 + 响应式 Vanilla CSS3 + 原生 JavaScript (ES6 Modules)
*   **开发与构建**：[Vite](https://vite.dev/)
*   **后端算力**：[Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/) (Serverless Edge Runtime)
*   **排版解析库**：
    *   [Highlight.js](https://highlightjs.org/) (语法高亮)
    *   [Mermaid.js](https://mermaid.js.org/) (图表绘制)

---

## 📂 项目结构

```text
├── .gitignore
├── ARTICLE_TEMPLATE.md       # 文章新建模板与排版写作指南
├── README.md                 # 项目说明文档
├── index.html                # 单页面应用主骨架
├── package.json              # 依赖与脚本配置
├── posts/                    # 博客 Markdown 源文件存放处
│   ├── [post-id].zh.md       # 中文版博文
│   └── [post-id].en.md       # 英文版博文
├── public/                   # 静态资源（头像、Logo等）
├── scripts/                  # 构建辅助脚本
│   └── build-posts.cjs       # Markdown 与 Git 日志提取编译器
├── functions/                # Cloudflare Pages Serverless 函数
│   └── api/
│       └── analytics.js      # 边缘分析数据代理服务
├── src/                      # 核心源码
│   ├── main.js               # 页面路由、Markdown 解析器、交互逻辑及系统时钟
│   ├── style.css             # 极客风格 UI 设计系统与核心样式表
│   └── mockData.js           # 本地模拟与工具箱配置数据
```

---

## 🚀 快速开始

### 1. 克隆并安装依赖
```bash
git clone https://github.com/Ricardoliuliuliu/RicardoBlogNew.git
cd RicardoBlogNew
npm install
```

### 2. 启动本地开发服务
```bash
npm run dev
```
此命令会自动编译 `posts/` 目录下的文章和 Git 日志并生成映射，随后启动 Vite 本地服务（通常为 `http://localhost:5173`）。

### 3. 构建生产版本
```bash
npm run build
```
编译并将优化压缩后的静态资源输出到 `dist/` 文件夹中，用于静态托管。

---

## 📝 新增博文步骤

1. 在项目根目录下打开 [ARTICLE_TEMPLATE.md](file:///d:/blogNew/blogNew_web/ARTICLE_TEMPLATE.md) 复制模板。
2. 在 `posts/` 文件夹下创建新文件：
   - 中文版：`posts/your-post-id.zh.md`
   - 英文版：`posts/your-post-id.en.md`
3. 确保中英文版本的 YAML Frontmatter 元数据中的 `id` 保持一致。
4. 本地在终端运行一次 `npm run build:posts` 或重启开发服务，即可看到最新发表的文章。

---

## 📄 开源许可证

本项目基于 MIT 许可证开源。作者：**Ricardo**。
