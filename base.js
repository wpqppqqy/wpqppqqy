// 这里修改为你要加载的同目录下md文件名
const targetMdFile = "README.md";
const container = document.getElementById('md-container');

// 配置marked开启代码高亮支持
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, {
                language: lang
            }).value;
        }
        return hljs.highlightAuto(code).value;
    }
});

// 异步加载并渲染md文件
fetch(targetMdFile)
    .then(res => {
        if (!res.ok) throw new Error(`文件加载失败，状态码：${res.status}`);
        return res.text();
    })
    .then(mdText => {
        // 将md文本转为HTML并插入页面
        container.innerHTML = marked.parse(mdText);
        // 手动触发全局代码高亮
        hljs.highlightAll();
    })
    .catch(err => {
        container.innerHTML = `<p style="color:red;">加载MD文件出错：${err.message}</p>
                <p>请确认当前HTML文件和${targetMdFile}放在同一目录下，并且通过本地服务器（如VS Code的Live Server插件）打开页面，避免本地文件跨域限制。</p>`;
        console.error('加载失败详情:', err);
    });