import { blogPosts } from './blogPosts.js';
import { timelineLogs, projects } from './mockData.js';

// Global variables
let activeCategory = 'ALL';
let currentLang = localStorage.getItem('lang') || 'zh'; // Default to Chinese
let currentTool = 'jwt';
let tsInterval = null;

// Global copy helpers for HTML actions
window.copyCodeText = function (btn) {
  const container = btn.closest('.code-block-container');
  const codeEl = container.querySelector('code');
  if (!codeEl) return;

  navigator.clipboard.writeText(codeEl.innerText).then(() => {
    const originalText = btn.innerText;
    btn.innerText = 'COPIED!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy code: ', err);
  });
};

window.copyShareLink = function (btn) {
  const shareUrl = window.location.href;
  navigator.clipboard.writeText(shareUrl).then(() => {
    const originalText = btn.innerText;
    btn.innerText = UI_TEXT[currentLang].copiedLink;
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy share link: ', err);
  });
};

// ==========================================================================
// TRANSLATION DICTIONARY
// ==========================================================================
const UI_TEXT = {
  en: {
    overview: "[ OVERVIEW ]",
    directory: "[ ARTICLES ]",
    timeline: "[ TIMELINE ]",
    modules: "[ TOOLBOX ]",
    titleGreeting: "About the Author",
    profileName: "Ricardo",
    profileRole: '<span class="role-goal">Goal to become</span><span class="role-name">Senior Backend Architect</span>',
    profileStatusText: "Active Coding",
    profileFocusLabel: "FOCUS:",
    profileFocusVal: "Backend,AI,Fullstack",
    profileLocLabel: "LOCATION:",
    profileLocVal: "Chongqing, China",
    profileBioLabel: "BIO:",
    profileBioVal: "Passionate about designing clean web architectures, minimal design systems, and building smooth 60FPS digital user interfaces.",
    techFeTitle: "Java",
    techToolsTitle: "Python",
    latestLogs: "Latest Articles",
    viewAllDirectory: "[ VIEW ALL ARTICLES ]",
    telemetryTitle: "Server Status",
    cpuLoad: "CPU USAGE",
    memAllocation: "RAM USAGE",
    bandwidthTransmit: "PAGE SPEED",
    systemUptime: "HOST UPTIME",
    liveActivityGraph: "Realtime Server Activity",
    relayParameters: "Site Parameters",
    orbitRotation: "TOTAL READS",
    lblVisitors: "UNIQUE VISITORS",
    coreEncryption: "SSL ENCRYPTION",
    emergencyBeacon: "CONTACT STATUS",
    statusSecure: "STATUS: OPERATIONAL",
    coreRelay: "Ricardo Blog V1.2.4",
    activeNodeMonitors: "Developer Utility Suite",
    realtimeDiagnostics: "[ STATUS: OPERATIONAL ]",
    statusStreams: "Development Chronicle",
    orderChronological: "[ ORDER: CHRONOLOGICAL ]",
    subsystemCatalog: "Article Category Archive",
    terminalWelcome: "DEVELOPER CONSOLE SECURE. CONNECTION ESTABLISHED.\nType <span class=\"cmd-success\">help</span> to view available commands.",
    terminalPrompt: "ricardo@devlog:~#",
    terminalInputPlaceholder: "Type 'help'...",
    tocTitle: "Table of Contents",
    logSpecs: "Article Info",
    backToDirectory: "< BACK TO ARTICLES",
    specIndex: "ARTICLE ID",
    specAuthor: "AUTHOR",
    specDuration: "READ TIME",
    specLink: "ACCESS",
    shareLink: "SHARE ARTICLE",
    copiedLink: "LINK COPIED!",
    titleHome: "Ricardo's Technical Blog",
    titlePosts: "Articles Archive - Ricardo's Blog",
    titleTimeline: "Build Changelog - Ricardo's Blog",
    titleProjects: "Developer Toolbox - Ricardo's Blog"
  },
  zh: {
    overview: "[ 概 览 ]",
    directory: "[ 文 章 ]",
    timeline: "[ 时间轴 ]",
    modules: "[ 工具箱 ]",
    titleGreeting: "关于作者",
    profileName: "Ricardo",
    profileRole: '<span class="role-goal">目标成为</span><span class="role-name">高级后端架构师、高级AI开发工程师、高级全栈牛马</span>',
    profileStatusText: "在线编码中",
    profileFocusLabel: "研究方向:",
    profileFocusVal: "后端开发、AI开发、全栈开发",
    profileLocLabel: "工作地点:",
    profileLocVal: "中国·重庆",
    profileBioLabel: "个人简介:",
    profileBioVal: "主语言Java，爱好Python",
    techFeTitle: "Java",
    techToolsTitle: "Python",
    latestLogs: "最新发布文章",
    viewAllDirectory: "[ 查看全部技术文章 ]",
    telemetryTitle: "服务器运行状态",
    cpuLoad: "CPU 占用",
    memAllocation: "内存占用",
    bandwidthTransmit: "页面加载速度",
    systemUptime: "主机运行时间",
    liveActivityGraph: "服务器实时活动图",
    relayParameters: "站点性能参数",
    orbitRotation: "文章总阅读量",
    lblVisitors: "独立访客人数",
    coreEncryption: "SSL 安全证书",
    emergencyBeacon: "联络信道状态",
    statusSecure: "状态: 正常运行",
    coreRelay: "Ricardo Blog V1.2.4",
    activeNodeMonitors: "开发者辅助工具箱",
    realtimeDiagnostics: "[ 运行状态: 正常运行 ]",
    statusStreams: "建站历程与更新",
    orderChronological: "[ 顺序: 历史时间轴 ]",
    subsystemCatalog: "文章分类与归档",
    terminalWelcome: "开发控制台连接已建立。系统运行状态良好。\n输入 <span class=\"cmd-success\">help</span> 获取可用命令清单。",
    terminalPrompt: "ricardo@devlog:~#",
    terminalInputPlaceholder: "输入 'help'...",
    tocTitle: "目录导读",
    logSpecs: "文章基本信息",
    backToDirectory: "< 返回文章目录",
    specIndex: "文章标识",
    specAuthor: "责任作者",
    specDuration: "建议阅读时间",
    specLink: "访问状态",
    shareLink: "复制分享链接",
    copiedLink: "链接已复制！",
    titleHome: "Ricardo 的技术博客",
    titlePosts: "文章归档 - Ricardo 的技术博客",
    titleTimeline: "升级日志 - Ricardo 的技术博客",
    titleProjects: "开发者工具箱 - Ricardo 的技术博客"
  }
};

const MARQUEE_TEXTS = {
  en: "RICARDO DEVLOG V1.2.4 ONLINE /// CATEGORIES: FRONTEND ARCHITECTURE, INTERFACE DESIGN, PERFORMANCE OPTIMIZATION /// SSL SECURE PROTOCOL ACTIVE /// SITE SERVER STATUS: 100% OPERATIONAL /// ",
  zh: "Ricardo的技术日志 V1.2.4 在线运行 /// 文章类别: 前端架构, 界面交互设计, 网页性能优化 /// SSL 安全证书已启用 /// 服务器运行状态: 稳定无延迟 /// "
};

// ==========================================================================
// CLIENT-SIDE ROUTER
// ==========================================================================
function router() {
  const hash = window.location.hash || '#home';

  // Clean active states on nav
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-route') === hash.split('/')[0]) {
      link.classList.add('active');
    }
  });

  // Simple routing matcher
  if (hash === '#home' || hash === '') {
    showPage('home');
    renderHomeFeed();
    updateRealtimeMetrics();
  } else {

    if (hash === '#posts') {
      showPage('posts');
      renderPostsList();
    } else if (hash.startsWith('#posts/')) {
      const postId = hash.split('/')[1];
      showPage('post-detail');
      renderPostDetail(postId);
    } else if (hash === '#timeline') {
      showPage('timeline');
      renderTimeline();
    } else if (hash === '#projects') {
      showPage('projects');
      renderProjects();
    } else {
      // Fallback
      window.location.hash = '#home';
    }
  }

  // Scroll to top on navigation
  window.scrollTo(0, 0);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  const activePage = document.getElementById(pageId);
  if (activePage) {
    activePage.classList.add('active');
  }
}

// ==========================================================================
// TELEMETRY & SYSTEM METRICS
// ==========================================================================
function initSystemMetrics() {
  const utcClock = document.getElementById('utc-clock');
  const localClock = document.getElementById('local-clock');
  const uptimeWidget = document.getElementById('sys-uptime');

  const startTime = Date.now() - 34219000; // Simulated uptime offset (approx 9.5 hours)

  function updateTimes() {
    const now = new Date();

    // Format: YYYY-MM-DD HH:MM:SS
    const formatDateTime = (d, isUTC) => {
      const year = isUTC ? d.getUTCFullYear() : d.getFullYear();
      const month = String((isUTC ? d.getUTCMonth() : d.getMonth()) + 1).padStart(2, '0');
      const day = String(isUTC ? d.getUTCDate() : d.getDate()).padStart(2, '0');
      const hours = String(isUTC ? d.getUTCHours() : d.getHours()).padStart(2, '0');
      const minutes = String(isUTC ? d.getUTCMinutes() : d.getMinutes()).padStart(2, '0');
      const seconds = String(isUTC ? d.getUTCSeconds() : d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    if (utcClock) utcClock.innerText = formatDateTime(now, true);
    if (localClock) localClock.innerText = formatDateTime(now, false);

    // Uptime calculation
    const elapsed = Date.now() - startTime;
    const hrs = Math.floor(elapsed / 3600000).toString().padStart(3, '0');
    const mins = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
    const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
    if (uptimeWidget) {
      uptimeWidget.innerText = `${hrs}H ${mins}M ${secs}S`;
    }
  }

  updateTimes();
  setInterval(updateTimes, 1000);
}

// Telemetry animation removed.

async function updateRealtimeMetrics() {
  const pvVal = document.getElementById('param-pv-value');
  const uvVal = document.getElementById('param-uv-value');
  const statusVal = document.getElementById('param-status-value');

  try {
    const response = await fetch('/api/analytics');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (pvVal && data.pageViews !== undefined) {
      pvVal.innerText = `${data.pageViews.toLocaleString()} PV`;
    }
    if (uvVal && data.uniques !== undefined) {
      uvVal.innerText = `${data.uniques.toLocaleString()} UV`;
    }
    if (statusVal && data.bandwidthMB !== undefined) {
      const isZH = currentLang === 'zh';
      statusVal.innerText = isZH ? `在线 (近7天流量: ${data.bandwidthMB}MB)` : `ONLINE (${data.bandwidthMB}MB Last 7d)`;
      statusVal.style.color = 'var(--text-primary)';
    }
  } catch (err) {
    console.warn("Cloudflare real-time analytics sync skipped or failed. Falling back to default metrics.", err);
  }
}

// ==========================================================================
// TEXT SCRAMBLE ANIMATION
// ==========================================================================
class TextScrambler {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 30);
      const end = start + Math.floor(Math.random() * 30);
      this.queue.push({ from, to, start, end, char: '' });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span style="color:var(--text-primary); text-shadow:0 0 3px rgba(0,0,0,0.1);">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// Scramble hover triggers
function initTextScramble() {
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const originalText = el.innerText;
    const scrambler = new TextScrambler(el);

    el.addEventListener('mouseenter', () => {
      scrambler.setText(originalText);
    });
  });
}

// Flat mode - card effects
function bindCardInteractiveEffects() {
  // Flat layout mode
}

// ==========================================================================
// INTERACTIVE SYSTEM CLI TERMINAL
// ==========================================================================
function initTerminal() {
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalBody = document.getElementById('terminal-body');

  if (!terminalInput || !terminalOutput) return;

  // Print welcome diagnostic
  terminalOutput.innerHTML = `${UI_TEXT[currentLang].terminalWelcome}\n`;

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = terminalInput.value.trim();
      terminalInput.value = '';
      if (val) {
        processCommand(val);
      }
    }
  });

  function processCommand(cmdLine) {
    const rawCmd = cmdLine.toLowerCase().split(' ');
    const cmd = rawCmd[0];
    const args = rawCmd.slice(1);

    let response = `\n<span class="cmd-prompt">&gt; ${cmdLine}</span>\n`;
    const isZH = currentLang === 'zh';

    switch (cmd) {
      case 'help':
        if (isZH) {
          response += `系统可用命令:
  <span class="cmd-success">help</span>      显示当前控制台帮助指令。
  <span class="cmd-success">posts</span>     列出所有已发表的技术文章。
  <span class="cmd-success">read [id]</span> 调阅指定文章内容 (例如: read monospace-elegance)。
  <span class="cmd-success">about</span>     显示作者个人简介与建站信息。
  <span class="cmd-success">sysinfo</span>   查看服务器性能与浏览器内核数据。
  <span class="cmd-success">theme</span>     开启或关闭屏幕偏光滤镜。
  <span class="cmd-success">clear</span>     清理终端历史缓冲区。`;
        } else {
          response += `Available commands:
  <span class="cmd-success">help</span>      Display console help menu.
  <span class="cmd-success">posts</span>     List all published technical articles.
  <span class="cmd-success">read [id]</span> View content of a specific post (e.g. read monospace-elegance).
  <span class="cmd-success">about</span>     Display author profile and site info.
  <span class="cmd-success">sysinfo</span>   View server statistics and browser diagnostics.
  <span class="cmd-success">theme</span>     Toggle screen scanline filter overlays.
  <span class="cmd-success">clear</span>     Purge diagnostic buffer terminal window.`;
        }
        break;

      case 'posts':
        response += isZH ? `<span class="cmd-header">已发表的文章列表:</span>\n` : `<span class="cmd-header">PUBLISHED POSTS:</span>\n`;
        blogPosts.forEach(post => {
          const title = isZH ? post.zh.title : post.en.title;
          response += `  • [${post.id}] - ${title} (${post.date})\n`;
        });
        break;

      case 'read':
        if (!args[0]) {
          response += isZH
            ? `<span class="cmd-alert">错误: 缺少目标 [id] 参数。用法: read [文章标识]</span>`
            : `<span class="cmd-alert">ERROR: Target parameter [id] undefined. Usage: read [post-id]</span>`;
        } else {
          const match = blogPosts.find(p => p.id === args[0]);
          if (match) {
            const title = isZH ? match.zh.title : match.en.title;
            const summary = isZH ? match.zh.summary : match.en.summary;
            response += `<span class="cmd-header">${title.toUpperCase()}</span>
Build: ${match.stardate} | Date: ${match.date}
--------------------------------------------------
${summary}

${isZH ? '页面阅读地址' : 'Go to page'}: <a href="#posts/${match.id}">#/posts/${match.id}</a>`;
          } else {
            response += isZH
              ? `<span class="cmd-alert">错误: 未找到目标文章 [${args[0]}]。输入 'posts' 获取列表。</span>`
              : `<span class="cmd-alert">ERROR: Post [${args[0]}] not found. Type 'posts' for active listings.</span>`;
          }
        }
        break;

      case 'about':
        if (isZH) {
          response += `作者档案：Ricardo
职业经历：高级前端开发工程师 / 网页交互设计者
当前坐标：中国 / 远程办公
建站宗旨：最小网络开销设计，追求视觉纯净性与极致性能表现。`;
        } else {
          response += `Author Profile: Ricardo
Occupation: Senior Frontend Engineer & Web Designer.
Location: China / Remote.
Protocols: Minimizing network overhead, visual purity, and high performance.`;
        }
        break;

      case 'sysinfo':
        response += isZH ? `实时服务器性能数据:` : `System Diagnostics:`;
        response += `
  - Host Uptime: ${document.getElementById('sys-uptime')?.innerText || 'ACTIVE'}
  - Server Node: Cloud VM (East China Region)
  - SSL Certificate: TLS 1.3 SECURE (HTTPS)
  - Client Agent: ${navigator.userAgent.slice(0, 50)}...`;
        break;

      case 'theme':
        const scanlineEl = document.querySelector('.scanlines');
        if (scanlineEl) {
          if (scanlineEl.style.display === 'none') {
            scanlineEl.style.display = 'block';
            response += isZH ? `偏光滤镜扫描线: 启用` : `Scanline screen overlays: ENABLED`;
          } else {
            scanlineEl.style.display = 'none';
            response += isZH ? `偏光滤镜扫描线: 停用` : `Scanline screen overlays: DISABLED`;
          }
        }
        break;

      case 'clear':
        terminalOutput.innerHTML = '';
        return;

      default:
        response += isZH
          ? `<span class="cmd-alert">指令解析故障: "${cmd}" 是未注册的指令。输入 'help' 重新查询。</span>`
          : `<span class="cmd-alert">COMMAND ERROR: "${cmd}" is unrecognized. Try 'help' for instructions.</span>`;
    }

    terminalOutput.innerHTML += response;
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }
}

// ==========================================================================
// TRANSLATION ENGINE & UI BINDINGS
// ==========================================================================
function updateLanguageUI() {
  const lang = currentLang;
  const dict = UI_TEXT[lang];

  // Helper function to safely set innerText
  const setTxt = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  };

  // Helper function to safely set innerHTML
  const setHtml = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  // Helper function to safely set placeholder
  const setPlaceholder = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = text;
  };

  // Update navigation links
  setTxt('nav-overview', dict.overview);
  setTxt('nav-directory', dict.directory);
  setTxt('nav-timeline', dict.timeline);
  setTxt('nav-modules', dict.modules);

  // Update big brutalist section headers
  setTxt('header-home', lang === 'en' ? 'OVERVIEW' : '概 览');
  setTxt('header-posts', lang === 'en' ? 'ARTICLE DIRECTORY' : '文章归档');
  setTxt('header-timeline', lang === 'en' ? 'BUILD CHANGELOG' : '升级日志');
  setTxt('header-projects', lang === 'en' ? 'TOOLBOX' : '工具箱');

  // Welcome console card (Profile Card)
  setTxt('title-greeting', dict.titleGreeting);
  setTxt('profile-name-text', dict.profileName);
  setHtml('profile-title-text', dict.profileRole);
  setTxt('profile-status-text', dict.profileStatusText);

  setTxt('profile-focus-label', dict.profileFocusLabel);
  setTxt('profile-focus-val', dict.profileFocusVal);
  setTxt('profile-loc-label', dict.profileLocLabel);
  setTxt('profile-loc-val', dict.profileLocVal);
  setTxt('profile-bio-label', dict.profileBioLabel);
  setTxt('profile-bio-val', dict.profileBioVal);

  setTxt('tech-group-fe-title', dict.techFeTitle);
  setTxt('tech-group-tools-title', dict.techToolsTitle);

  // Latest logs header
  setTxt('feed-title-latest', dict.latestLogs);
  setTxt('feed-all-link', dict.viewAllDirectory);

  // Telemetry labels removed

  // Site params
  setTxt('panel-title-relays', dict.relayParameters);
  setTxt('lbl-rotation', dict.orbitRotation);
  setTxt('lbl-visitors', dict.lblVisitors);
  setTxt('lbl-encryption', dict.coreEncryption);
  setTxt('lbl-beacon', dict.emergencyBeacon);

  // Page specific headers
  setTxt('feed-title-directory', dict.subsystemCatalog);
  setTxt('feed-title-timeline', dict.statusStreams);
  setTxt('lbl-order', dict.orderChronological);
  setTxt('feed-title-modules', dict.activeNodeMonitors);
  setTxt('lbl-diagnostics', dict.realtimeDiagnostics);

  // Terminal input bindings
  setTxt('terminal-prompt-label', dict.terminalPrompt);
  setPlaceholder('terminal-input', dict.terminalInputPlaceholder);

  // Footer nodes
  setTxt('footer-version', dict.coreRelay);
  setTxt('footer-secure', dict.statusSecure);

  // Toggle button indicator
  setTxt('lang-switcher', lang === 'en' ? 'ZH' : 'EN');

  // Update Scrolling Ticker marquee content
  const marqueeText = MARQUEE_TEXTS[lang];
  const marqueeContent = document.querySelector('.marquee-content');
  if (marqueeContent) {
    marqueeContent.innerHTML = `
      <span>${marqueeText}</span>
      <span>${marqueeText}</span>
    `;
  }

  // Re-run the active view renderer to draw content in correct language
  const hash = window.location.hash || '#home';
  if (hash === '#home' || hash === '') {
    renderHomeFeed();
    updateRealtimeMetrics();
  } else if (hash === '#posts') {
    renderPostsList();
  } else if (hash.startsWith('#posts/')) {
    const postId = hash.split('/')[1];
    renderPostDetail(postId);
  } else if (hash === '#timeline') {
    renderTimeline();
  } else if (hash === '#projects') {
    renderProjects();
  }
}

function initLangSwitcher() {
  const switcher = document.getElementById('lang-switcher');
  if (switcher) {
    switcher.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'zh' : 'en';
      localStorage.setItem('lang', currentLang);
      updateLanguageUI();
    });
  }
}

// ==========================================================================
// RENDERERS (LOCALIZED DATA DRAWS)
// ==========================================================================

// 1. Home Feed
function renderHomeFeed() {
  document.title = UI_TEXT[currentLang].titleHome;
  const homeFeed = document.getElementById('home-latest-posts');
  if (!homeFeed) return;

  const isZH = currentLang === 'zh';

  homeFeed.innerHTML = blogPosts.map(post => {
    const content = isZH ? post.zh : post.en;
    return `
      <div class="article-card" onclick="window.location.hash='#posts/${post.id}'">
        <div class="article-meta">
          <div class="article-meta-left">
            <span>POST: <span>[${post.id.slice(0, 10)}]</span></span>
            <span>DATE: <span>${post.date}</span></span>
          </div>
          <div class="article-stardate">${post.stardate}</div>
        </div>
        <h3 class="article-card-title">${content.title}</h3>
        <p class="article-card-summary">${content.summary}</p>
        <div class="article-card-tags">
          ${content.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');

  bindCardInteractiveEffects();
}

// 2. Full Posts list page with Category Filter
function renderPostsList() {
  document.title = UI_TEXT[currentLang].titlePosts;
  const container = document.getElementById('posts-container');
  const filtersEl = document.getElementById('posts-filters');
  if (!container) return;

  const isZH = currentLang === 'zh';

  // Render Filters
  const allCategories = ['ALL', ...new Set(blogPosts.map(p => p.category.toUpperCase()))];
  if (filtersEl) {
    filtersEl.innerHTML = allCategories.map(cat => `
      <button class="filter-btn ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">
        ${cat === 'ALL' ? (isZH ? '全部' : 'ALL') : cat}
      </button>
    `).join('');

    filtersEl.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-category');
        renderPostsList();
      });
    });
  }

  // Filter list
  const filtered = activeCategory === 'ALL'
    ? blogPosts
    : blogPosts.filter(p => p.category.toUpperCase() === activeCategory);

  container.innerHTML = filtered.map(post => {
    const content = isZH ? post.zh : post.en;
    return `
      <div class="article-card" onclick="window.location.hash='#posts/${post.id}'">
        <div class="article-meta">
          <div class="article-meta-left">
            <span>ID: <span>[${post.id.slice(0, 10)}]</span></span>
            <span>CATEGORY: <span>${post.category}</span></span>
            <span>READ TIME: <span>${post.readTime}</span></span>
          </div>
          <div class="article-stardate">${post.stardate}</div>
        </div>
        <h3 class="article-card-title">${content.title}</h3>
        <p class="article-card-summary">${content.summary}</p>
        <div class="article-card-tags">
          ${content.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');

  bindCardInteractiveEffects();
}

// 3. Post Detail Reader
function renderPostDetail(postId) {
  const post = blogPosts.find(p => p.id === postId);
  const readerArea = document.getElementById('reader-area');
  const isZH = currentLang === 'zh';
  const dict = UI_TEXT[currentLang];

  if (!post || !readerArea) {
    if (readerArea) {
      readerArea.innerHTML = `<h3>${isZH ? '未找到对应文章' : 'ARTICLE NOT FOUND'}</h3><a href="#posts">${dict.backToDirectory}</a>`;
    }
    return;
  }

  const localizedPost = isZH ? post.zh : post.en;
  document.title = `${localizedPost.title} - ${dict.titleHome}`;

  // Simple Markdown Parser (Headers, lists, tables, alerts)
  function parseMarkdown(md) {
    let html = md.trim();

    // Tables
    const tableRegex = /\|(.+)\|[\r\n]+\|[\s:\-|]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;
    html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
      const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
      const rows = bodyRows.split('\n')
        .map(row => row.trim())
        .filter(row => row)
        .map(row => {
          const cells = row.split('|').map(c => c.trim()).filter(c => c);
          return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
        }).join('');

      return `<table>\n<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>\n<tbody>${rows}</tbody>\n</table>\n\n`;
    });

    // Code blocks with syntax highlighting placeholders
    html = html.replace(/\`\`\`(javascript|css)([\s\S]*?)\`\`\`/g, (match, lang, code) => {
      const escapedCode = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<div class="code-block-container">
        <div class="code-block-header">
          <span>${lang.toUpperCase()}</span>
          <button class="copy-code-btn" onclick="copyCodeText(this)">COPY</button>
        </div>
        <pre><code class="language-${lang}">${escapedCode.trim()}</code></pre>
      </div>`;
    });

    // Inline codes
    html = html.replace(/\`([\s\S]*?)\`/g, '<code>$1</code>');

    // Headers h1, h2, h3
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bullet list blocks
    html = html.replace(/(?:^\s*-\s+.*(?:\r?\n|$))+/gm, (match) => {
      const items = match.trim().split('\n').map(line => {
        const itemText = line.replace(/^\s*-\s+/, '').trim();
        return `<li>${itemText}</li>`;
      }).join('\n');
      return `<ul>\n${items}\n</ul>\n\n`;
    });

    // Number list blocks
    html = html.replace(/(?:^\s*\d+\.\s+.*(?:\r?\n|$))+/gm, (match) => {
      const items = match.trim().split('\n').map(line => {
        const itemText = line.replace(/^\s*\d+\.\s+/, '').trim();
        return `<li>${itemText}</li>`;
      }).join('\n');
      return `<ol>\n${items}\n</ol>\n\n`;
    });

    // Blockquotes & Warnings (Anchored to beginning of line ^)
    html = html.replace(/^\>\s*\[!WARNING\]([\s\S]*?)(?=\n\n|\n*$)/gim, `<blockquote><strong>[${isZH ? '警告提示' : 'WARNING ALERT'}]:</strong>$1</blockquote>`);
    html = html.replace(/^\>\s*(.*$)/gim, '<blockquote>$1</blockquote>');

    // Paragraphs
    html = html.split('\n\n').map(p => {
      if (p.trim().startsWith('<') || p.trim().endsWith('>')) return p;
      return `<p>${p.trim()}</p>`;
    }).join('\n\n');

    return html;
  }

  // HTML Render
  readerArea.innerHTML = `
    <aside class="reader-aside-left">
      <div class="toc-title">${dict.logSpecs}</div>
      <div class="spec-grid">
        <div class="spec-label">${dict.specIndex}</div>
        <div class="spec-val">[${post.id.slice(0, 12)}]</div>
        <div class="spec-label">${dict.specAuthor}</div>
        <div class="spec-val">${post.author}</div>
        <div class="spec-label">${dict.specDuration}</div>
        <div class="spec-val">${post.readTime}</div>
        <div class="spec-label">${dict.specLink}</div>
        <div class="spec-val" style="color: var(--text-primary); font-weight: bold;">SECURE</div>
      </div>
      <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
        <button class="share-log-btn" onclick="copyShareLink(this)">[ ${dict.shareLink} ]</button>
        <a class="back-to-logs" href="#posts">${dict.backToDirectory}</a>
      </div>
    </aside>

    <article class="reader-body-panel">
      <div class="reader-header">
        <span class="reader-category">${post.category}</span>
        <h1 class="reader-title">${localizedPost.title}</h1>
        <div class="reader-meta-row">
          <div class="reader-meta-item">VERSION: <span>${post.stardate}</span></div>
          <div class="reader-meta-item">DATE: <span>${post.date}</span></div>
          <div class="reader-meta-item">SIZE: <span>${post.wordCount} ${isZH ? '字' : 'WORDS'}</span></div>
        </div>
      </div>
      <div class="post-content" id="post-body-content">
        ${parseMarkdown(localizedPost.content)}
      </div>
    </article>

    <aside class="reader-aside-right">
      <div class="toc-title">${dict.tocTitle}</div>
      <ul class="toc-list" id="toc-list">
        <!-- Rendered dynamically -->
      </ul>
    </aside>
  `;

  // Dynamic TOC generator
  const postBody = document.getElementById('post-body-content');
  const tocList = document.getElementById('toc-list');
  if (postBody && tocList) {
    const headings = postBody.querySelectorAll('h3');
    headings.forEach((heading, idx) => {
      const id = `heading-${idx}`;
      heading.id = id;

      const li = document.createElement('li');
      li.className = 'toc-item';
      if (idx === 0) li.classList.add('active');
      li.innerText = heading.innerText.replace('▶ ', '');
      li.addEventListener('click', () => {
        heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      tocList.appendChild(li);
    });

    window.removeEventListener('scroll', handleTocHighlight);
    window.addEventListener('scroll', handleTocHighlight);
  }
}

function handleTocHighlight() {
  const headings = document.querySelectorAll('#post-body-content h3');
  const tocItems = document.querySelectorAll('#toc-list .toc-item');
  if (headings.length === 0 || tocItems.length === 0) return;

  let currentIdx = 0;
  const triggerHeight = window.innerHeight * 0.4;

  headings.forEach((heading, idx) => {
    const rect = heading.getBoundingClientRect();
    if (rect.top <= triggerHeight) {
      currentIdx = idx;
    }
  });

  tocItems.forEach((item, idx) => {
    if (idx === currentIdx) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// 4. Timeline
function renderTimeline() {
  document.title = UI_TEXT[currentLang].titleTimeline;
  const timelineEl = document.getElementById('timeline-feed');
  if (!timelineEl) return;

  const isZH = currentLang === 'zh';

  timelineEl.innerHTML = timelineLogs.map(log => {
    const message = isZH ? log.zh : log.en;
    return `
      <div class="timeline-item status-${log.status.toLowerCase()}">
        <div class="timeline-node"></div>
        <div class="timeline-content">
          <div class="timeline-meta">
            <span class="timeline-stardate">${log.stardate}</span>
            <span class="timeline-category">${log.category} // ${log.date}</span>
          </div>
          <div class="timeline-text">${message}</div>
          <div style="margin-top:0.75rem; text-align:right;">
            <span class="timeline-badge">${log.status}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 5. Developer Toolbox
function renderProjects() {
  document.title = UI_TEXT[currentLang].titleProjects;

  if (tsInterval) {
    clearInterval(tsInterval);
    tsInterval = null;
  }

  const viewContainer = document.getElementById('tool-view-container');
  if (!viewContainer) return;

  const sidebarNav = document.getElementById('toolbox-sidebar-nav');
  if (sidebarNav) {
    const btns = sidebarNav.querySelectorAll('.tool-btn');
    btns.forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    });

    sidebarNav.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sidebarNav.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentTool = e.target.getAttribute('data-tool');

        if (typeof TextScrambler !== 'undefined') {
          const scrambler = new TextScrambler(e.target);
          scrambler.setText(e.target.innerText);
        }

        initActiveTool();
      });

      if (btn.getAttribute('data-tool') === currentTool) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  initActiveTool();
}

function initActiveTool() {
  const container = document.getElementById('tool-view-container');
  if (!container) return;

  if (tsInterval) {
    clearInterval(tsInterval);
    tsInterval = null;
  }

  const isZH = currentLang === 'zh';

  if (currentTool === 'jwt') {
    container.innerHTML = `
      <div class="tool-grid">
        <div class="tool-io-group">
          <div class="tool-io-label">
            <span>JWT TOKEN (${isZH ? '输入 JWT 字符串' : 'Paste JWT Token'})</span>
          </div>
          <textarea id="jwt-input" class="tool-textarea" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."></textarea>
        </div>
        <div class="tool-row-actions">
          <button id="jwt-decode-btn" class="tool-btn-primary">DECODE (${isZH ? '解析' : 'Decode'})</button>
          <button id="jwt-clear-btn" class="tool-btn-secondary">${isZH ? '清空' : 'Clear'}</button>
        </div>
        <div id="jwt-output-section" style="display:none; flex-direction:column; gap:1rem;">
          <div class="tool-io-group">
            <div class="tool-io-label">HEADER (${isZH ? '头部' : 'Header'})</div>
            <div id="jwt-header-output" class="tool-output-box" style="background:#0f172a; color:#f1f5f9; border-color:#334155;"></div>
          </div>
          <div class="tool-io-group">
            <div class="tool-io-label">PAYLOAD (${isZH ? '载荷' : 'Payload'})</div>
            <div id="jwt-payload-output" class="tool-output-box" style="background:#0f172a; color:#f1f5f9; border-color:#334155;"></div>
          </div>
        </div>
        <div id="jwt-error-output" class="tool-output-box" style="display:none; color:#ef4444; border-color:#fca5a5; background-color:rgba(239,68,68,0.05);"></div>
      </div>
    `;

    const input = document.getElementById('jwt-input');
    const decodeBtn = document.getElementById('jwt-decode-btn');
    const clearBtn = document.getElementById('jwt-clear-btn');
    const outSection = document.getElementById('jwt-output-section');
    const errOut = document.getElementById('jwt-error-output');
    const headerOut = document.getElementById('jwt-header-output');
    const payloadOut = document.getElementById('jwt-payload-output');

    const runDecode = () => {
      const token = input.value.trim();
      errOut.style.display = 'none';
      outSection.style.display = 'none';
      if (!token) return;

      const parts = token.split('.');
      if (parts.length !== 3) {
        errOut.innerText = isZH ? "无效的 JWT：JWT 必须由英文句点 (.) 隔开的三个部分组成。" : "Invalid JWT: Token must consist of 3 base64url segments separated by dots.";
        errOut.style.display = 'block';
        return;
      }

      try {
        const base64UrlDecode = (str) => {
          let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) base64 += '=';
          return decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        };

        const headerDec = base64UrlDecode(parts[0]);
        const payloadDec = base64UrlDecode(parts[1]);

        headerOut.innerText = JSON.stringify(JSON.parse(headerDec), null, 2);
        payloadOut.innerText = JSON.stringify(JSON.parse(payloadDec), null, 2);
        outSection.style.display = 'flex';
      } catch (err) {
        errOut.innerText = (isZH ? "解析失败：" : "Decoding Failed: ") + err.message;
        errOut.style.display = 'block';
      }
    };

    decodeBtn.addEventListener('click', runDecode);
    input.addEventListener('input', runDecode);
    clearBtn.addEventListener('click', () => {
      input.value = '';
      errOut.style.display = 'none';
      outSection.style.display = 'none';
    });

  } else if (currentTool === 'timestamp') {
    container.innerHTML = `
      <div class="tool-grid">
        <div class="technical-panel" style="padding:1rem; background-color:var(--panel-bg-subtle);">
          <div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:0.85rem; align-items:center;">
            <span>CURRENT UNIX TIME (${isZH ? '当前时间戳' : 'Current Timestamp'}):</span>
            <span id="ts-live-now" style="font-weight:bold; color:var(--text-primary); font-size:1.1rem;">0</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-top:0.5rem;">
          <!-- Timestamp to Date -->
          <div class="tool-io-group" style="border-right: 1px solid var(--border-color); padding-right:1.5rem;">
            <div class="tool-io-label" style="font-weight:bold; color:var(--text-primary);">${isZH ? '时间戳 ➔ 本地/UTC时间' : 'Timestamp ➔ Date Time'}</div>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
              <input type="text" id="ts-to-date-input" class="tool-input" style="flex:1;" placeholder="e.g. 1780473548">
              <select id="ts-unit-select" class="tool-input" style="width:75px; padding:0 0.5rem;">
                <option value="s">${isZH ? '秒' : 'Sec'}</option>
                <option value="ms">${isZH ? '毫秒' : 'Ms'}</option>
              </select>
            </div>
            <div class="tool-row-actions" style="margin-top:0.75rem;">
              <button id="ts-to-date-btn" class="tool-btn-primary" style="padding:0.4rem 0.8rem;">${isZH ? '转换' : 'Convert'}</button>
              <button id="ts-to-date-now-btn" class="tool-btn-secondary" style="padding:0.4rem 0.8rem;">${isZH ? '使用当前' : 'Use Current'}</button>
            </div>
            <div class="tool-io-group" style="margin-top:1rem;">
              <div class="tool-io-label">LOCAL TIME (${isZH ? '本地时间' : 'Local Time'})</div>
              <div id="ts-to-date-local" class="tool-output-box">-</div>
            </div>
            <div class="tool-io-group" style="margin-top:0.5rem;">
              <div class="tool-io-label">UTC TIME (${isZH ? 'UTC 时间' : 'UTC Time'})</div>
              <div id="ts-to-date-utc" class="tool-output-box">-</div>
            </div>
          </div>

          <!-- Date to Timestamp -->
          <div class="tool-io-group">
            <div class="tool-io-label" style="font-weight:bold; color:var(--text-primary);">${isZH ? '本地时间 ➔ 时间戳' : 'Date Time ➔ Timestamp'}</div>
            <input type="text" id="date-to-ts-input" class="tool-input" style="margin-top:0.5rem;" placeholder="e.g. 2026-06-03 17:00:00">
            <div class="tool-row-actions" style="margin-top:0.75rem;">
              <button id="date-to-ts-btn" class="tool-btn-primary" style="padding:0.4rem 0.8rem;">${isZH ? '转换' : 'Convert'}</button>
              <button id="date-to-ts-now-btn" class="tool-btn-secondary" style="padding:0.4rem 0.8rem;">${isZH ? '使用当前' : 'Use Current'}</button>
            </div>
            <div class="tool-io-group" style="margin-top:1rem;">
              <div class="tool-io-label">SECONDS (${isZH ? '时间戳 - 秒' : 'Timestamp - Sec'})</div>
              <div id="date-to-ts-sec" class="tool-output-box">-</div>
            </div>
            <div class="tool-io-group" style="margin-top:0.5rem;">
              <div class="tool-io-label">MILLISECONDS (${isZH ? '时间戳 - 毫秒' : 'Timestamp - Ms'})</div>
              <div id="date-to-ts-ms" class="tool-output-box">-</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const liveNow = document.getElementById('ts-live-now');
    const updateLiveTs = () => {
      if (liveNow) {
        liveNow.innerText = Math.floor(Date.now() / 1000);
      }
    };
    updateLiveTs();
    tsInterval = setInterval(updateLiveTs, 1000);

    const tsInput = document.getElementById('ts-to-date-input');
    const tsUnit = document.getElementById('ts-unit-select');
    const tsBtn = document.getElementById('ts-to-date-btn');
    const tsNowBtn = document.getElementById('ts-to-date-now-btn');
    const tsLocal = document.getElementById('ts-to-date-local');
    const tsUtc = document.getElementById('ts-to-date-utc');

    const runTsToDate = () => {
      let val = parseInt(tsInput.value.trim());
      if (isNaN(val)) {
        tsLocal.innerText = isZH ? "错误：请输入数字" : "Error: Invalid Number";
        tsUtc.innerText = "-";
        return;
      }
      if (tsUnit.value === 's') {
        val = val * 1000;
      }
      const d = new Date(val);
      if (isNaN(d.getTime())) {
        tsLocal.innerText = isZH ? "错误：非法日期" : "Error: Invalid Date";
        tsUtc.innerText = "-";
        return;
      }

      const formatD = (date, isUTC) => {
        const y = isUTC ? date.getUTCFullYear() : date.getFullYear();
        const mo = String((isUTC ? date.getUTCMonth() : date.getMonth()) + 1).padStart(2, '0');
        const day = String(isUTC ? date.getUTCDate() : date.getDate()).padStart(2, '0');
        const h = String(isUTC ? date.getUTCHours() : date.getHours()).padStart(2, '0');
        const mi = String(isUTC ? date.getUTCMinutes() : date.getMinutes()).padStart(2, '0');
        const s = String(isUTC ? date.getUTCSeconds() : date.getSeconds()).padStart(2, '0');
        return `${y}-${mo}-${day} ${h}:${mi}:${s}`;
      };

      tsLocal.innerText = formatD(d, false);
      tsUtc.innerText = formatD(d, true);
    };

    tsBtn.addEventListener('click', runTsToDate);
    tsNowBtn.addEventListener('click', () => {
      const now = Date.now();
      tsInput.value = tsUnit.value === 's' ? Math.floor(now / 1000) : now;
      runTsToDate();
    });

    const dateInput = document.getElementById('date-to-ts-input');
    const dateBtn = document.getElementById('date-to-ts-btn');
    const dateNowBtn = document.getElementById('date-to-ts-now-btn');
    const outSec = document.getElementById('date-to-ts-sec');
    const outMs = document.getElementById('date-to-ts-ms');

    const runDateToTs = () => {
      const val = dateInput.value.trim();
      if (!val) return;
      const parsed = Date.parse(val.replace(/-/g, '/'));
      if (isNaN(parsed)) {
        outSec.innerText = isZH ? "错误：无法解析的日期格式" : "Error: Unrecognized format";
        outMs.innerText = "-";
        return;
      }
      outSec.innerText = Math.floor(parsed / 1000);
      outMs.innerText = parsed;
    };

    dateBtn.addEventListener('click', runDateToTs);
    dateNowBtn.addEventListener('click', () => {
      const now = new Date();
      const formatLocal = (date) => {
        const y = date.getFullYear();
        const mo = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return `${y}-${mo}-${day} ${h}:${mi}:${s}`;
      };
      dateInput.value = formatLocal(now);
      runDateToTs();
    });

  } else if (currentTool === 'base64') {
    container.innerHTML = `
      <div class="tool-grid">
        <div class="tool-io-group">
          <div class="tool-io-label">INPUT TEXT (${isZH ? '输入文本' : 'Input Text'})</div>
          <textarea id="b64-input" class="tool-textarea" placeholder="e.g. Hello World..."></textarea>
        </div>
        <div class="tool-row-actions">
          <button id="b64-encode-btn" class="tool-btn-primary">ENCODE (${isZH ? '编码' : 'Encode'})</button>
          <button id="b64-decode-btn" class="tool-btn-primary">DECODE (${isZH ? '解码' : 'Decode'})</button>
          <button id="b64-clear-btn" class="tool-btn-secondary">${isZH ? '清空' : 'Clear'}</button>
        </div>
        <div class="tool-io-group">
          <div class="tool-io-label">OUTPUT RESULT (${isZH ? '输出结果' : 'Output Result'})</div>
          <div id="b64-output" class="tool-output-box" style="min-height: 100px;"></div>
        </div>
      </div>
    `;

    const input = document.getElementById('b64-input');
    const encodeBtn = document.getElementById('b64-encode-btn');
    const decodeBtn = document.getElementById('b64-decode-btn');
    const clearBtn = document.getElementById('b64-clear-btn');
    const output = document.getElementById('b64-output');

    encodeBtn.addEventListener('click', () => {
      const text = input.value;
      try {
        output.innerText = btoa(unescape(encodeURIComponent(text)));
        output.style.color = 'var(--text-primary)';
      } catch (err) {
        output.innerText = (isZH ? "编码错误：" : "Encoding error: ") + err.message;
        output.style.color = '#ef4444';
      }
    });

    decodeBtn.addEventListener('click', () => {
      const text = input.value.trim();
      try {
        output.innerText = decodeURIComponent(escape(atob(text)));
        output.style.color = 'var(--text-primary)';
      } catch (err) {
        output.innerText = (isZH ? "解码错误（输入必须是合法的 Base64 字符串）：" : "Decoding error (Input must be valid Base64): ") + err.message;
        output.style.color = '#ef4444';
      }
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      output.innerText = '';
    });

  } else if (currentTool === 'regex') {
    container.innerHTML = `
      <div class="tool-grid">
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.25rem; align-items: end;">
          <div class="tool-io-group">
            <div class="tool-io-label">REGULAR EXPRESSION (${isZH ? '正则表达式' : 'Regular Expression'})</div>
            <input type="text" id="regex-pattern" class="tool-input" placeholder="e.g. \\\\b[a-zA-Z]{4}\\\\b">
          </div>
          <div class="tool-io-group">
            <div class="tool-io-label">FLAGS (${isZH ? '修饰符' : 'Flags'})</div>
            <div style="display:flex; gap:0.75rem; align-items:center; height:38px; font-family:var(--font-mono); font-size:0.8rem; user-select:none;">
              <label style="cursor:pointer;"><input type="checkbox" id="regex-flag-g" checked style="cursor:pointer;"> g</label>
              <label style="cursor:pointer;"><input type="checkbox" id="regex-flag-i" style="cursor:pointer;"> i</label>
              <label style="cursor:pointer;"><input type="checkbox" id="regex-flag-m" style="cursor:pointer;"> m</label>
            </div>
          </div>
        </div>

        <div class="tool-io-group">
          <div class="tool-io-label">TEST TEXT (${isZH ? '测试文本' : 'Test Text'})</div>
          <textarea id="regex-text" class="tool-textarea" placeholder="Paste test string here..."></textarea>
        </div>

        <div class="tool-row-actions">
          <button id="regex-test-btn" class="tool-btn-primary">RUN TEST (${isZH ? '运行匹配测试' : 'Run Test'})</button>
          <button id="regex-clear-btn" class="tool-btn-secondary">${isZH ? '清空' : 'Clear'}</button>
        </div>

        <div class="tool-io-group">
          <div class="tool-io-label">MATCH QUANTITY (${isZH ? '匹配统计' : 'Match Statistics'})</div>
          <div id="regex-results-summary" class="tool-output-box" style="font-weight:bold; min-height:40px; display:flex; align-items:center;">-</div>
        </div>

        <div class="tool-io-group">
          <div class="tool-io-label">MATCH HIGHLIGHTS (${isZH ? '匹配高亮' : 'Matches Highlighted'})</div>
          <div id="regex-highlighted" class="tool-output-box" style="min-height: 120px; line-height: 1.6; background-color:#0f172a; color:#f1f5f9; border-color:#334155;"></div>
        </div>
      </div>
    `;

    const patternEl = document.getElementById('regex-pattern');
    const textEl = document.getElementById('regex-text');
    const flagG = document.getElementById('regex-flag-g');
    const flagI = document.getElementById('regex-flag-i');
    const flagM = document.getElementById('regex-flag-m');
    const testBtn = document.getElementById('regex-test-btn');
    const clearBtn = document.getElementById('regex-clear-btn');
    const summary = document.getElementById('regex-results-summary');
    const highlight = document.getElementById('regex-highlighted');

    const runRegex = () => {
      const pattern = patternEl.value;
      const text = textEl.value;
      highlight.innerHTML = '';
      summary.innerText = '-';
      if (!pattern) return;

      let flags = '';
      if (flagG.checked) flags += 'g';
      if (flagI.checked) flags += 'i';
      if (flagM.checked) flags += 'm';

      try {
        const regex = new RegExp(pattern, flags);
        const escapeHtml = (unsafe) => {
          return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        };

        const matches = text.match(regex);
        if (!matches) {
          summary.innerText = isZH ? "未匹配到任何内容。" : "No matches found.";
          highlight.innerHTML = escapeHtml(text);
          return;
        }

        summary.innerText = isZH ? `匹配成功！共找到 ${matches.length} 处匹配。` : `Success! Found ${matches.length} match(es).`;

        let count = 0;
        const highlightedText = text.replace(regex, (match) => {
          count++;
          return `<mark class="regex-mark" style="background:#84cc16; color:#0f172a; border-radius:4px; padding:0 3px; font-weight:bold; box-shadow:0 0 4px rgba(132,204,22,0.6);">${escapeHtml(match)}</mark>`;
        });

        highlight.innerHTML = highlightedText;
      } catch (err) {
        summary.innerText = (isZH ? "正则语法错误：" : "Regex error: ") + err.message;
        summary.style.color = '#ef4444';
      }
    };

    testBtn.addEventListener('click', runRegex);
    patternEl.addEventListener('input', runRegex);
    textEl.addEventListener('input', runRegex);
    clearBtn.addEventListener('click', () => {
      patternEl.value = '';
      textEl.value = '';
      summary.innerText = '-';
      highlight.innerHTML = '';
    });
  }
}

// ==========================================================================
// SYSTEM INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Init clocks
  initSystemMetrics();

  // Language switch binder
  initLangSwitcher();

  // Initial trigger for translation UI sync
  updateLanguageUI();

  // Run routing
  router();
  window.addEventListener('hashchange', router);

  // Text scramble setup
  initTextScramble();

  // Setup terminal drawer
  initTerminal();

  console.log("DevLog System Active.");
});
