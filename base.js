// 基础配置 直接读取子模块静态文件 无API调用
const WIKI_ROOT = './wiki/';
let wikiConfig = {};

// 初始化加载所有Wiki资源
async function initWiki() {
    // 读取Wiki配置文件
    try {
        const configRes = await fetch(`${WIKI_ROOT}_config.yml`);
        const configText = await configRes.text();
        wikiConfig = jsyaml.load(configText) || {};
    } catch (e) {
        console.log('无自定义Wiki配置，使用默认规则');
    }

    // 渲染侧边栏
    try {
        const sidebarRes = await fetch(`${WIKI_ROOT}_Sidebar.md`);
        const sidebarText = await sidebarRes.text();
        document.getElementById('sidebar-content').innerHTML = marked.parse(sidebarText);
        // 转换侧边栏内部链接为Hash路由
        document.querySelectorAll('#sidebar-content a').forEach(a => {
            const href = a.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('http')) {
                const pageName = href.replace('.md', '');
                a.setAttribute('href', `#/${pageName}`);
            }
        });
    } catch (e) {
        // 无自定义侧边栏自动生成提示
        document.getElementById('sidebar-content').innerHTML = '<p>可在_Sidebar.md自定义导航</p>';
    }

    // 渲染页脚
    try {
        const footerRes = await fetch(`${WIKI_ROOT}_Footer.md`);
        const footerText = await footerRes.text();
        document.getElementById('wiki-footer').innerHTML = marked.parse(footerText);
    } catch (e) {
        document.getElementById('wiki-footer').innerHTML = '<p>Powered by GitHub Pages 单页Wiki</p>';
    }

    // 监听Hash路由变化
    window.addEventListener('hashchange', renderPage);
    renderPage();
}

// 渲染当前选中的MD页面
async function renderPage() {
    // 更新导航active状态
    document.querySelectorAll('.wiki-nav a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === window.location.hash);
    });

    const hash = window.location.hash.slice(2) || 'Home';
    try {
        const mdRes = await fetch(`${WIKI_ROOT}${hash}.md`);
        if (!mdRes.ok) throw new Error('404');
        const mdText = await mdRes.text();
        let rendered = marked.parse(mdText);
        // 转换GitHub Wiki特有[[内部链接]]语法
        rendered = rendered.replace(/$\[([^\]]+)$\]/g, (match, pageName) => {
            return `<a href="#/${pageName}">${pageName}</a>`;
        });
        // 处理常规md链接，将.md后缀转换为hash路由
        rendered = rendered.replace(/<a href="([^"]+)\.md"/g, '<a href="#/$1"');
        document.getElementById('main-content').innerHTML = rendered;
    } catch (e) {
        document.getElementById('main-content').innerHTML = '<h1>404 页面不存在</h1><p>该Wiki页面还未创建</p>';
    }
}

// 补全原script语法错误，添加括号修复启动逻辑
// 启动Wiki
initWiki();