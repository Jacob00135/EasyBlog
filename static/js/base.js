(() => {
    'use strict';

    // 切换主题的按钮的点击事件
    document.querySelector('#top-nav .theme-switcher').addEventListener('click', switchTheme);

    // 设置全局提示框的位置居中
    adjustHintBoxLocation();
    (new ResizeObserver((eventArray) => {
        adjustHintBoxLocation();
    })).observe(document.getElementById('hint-box'));

    // 关闭提示框事件
    document.querySelector('#hint-box .close').addEventListener('click', closeHintBox);

    // 下载Markdown源文件按钮的点击事件
    const downloadMarkdownBtn = document.querySelector('#top-nav .download-markdown a');
    if (downloadMarkdownBtn !== null) {
        downloadMarkdownBtn.addEventListener('click', downloadMarkdown);
    }

    // 顶部导航栏的删除文章按钮的点击事件
    const navDeleteArticleBtn = document.querySelector('#top-nav .delete-article a');
    if (navDeleteArticleBtn !== null) {
        const deleteArticleUrl = document.querySelector('info').getAttribute('data-delete-article-url');
        const articleId = document.querySelector('#previewer').getAttribute('data-article-id');
        const eventListener = getDeleteArticleFunction(
            deleteArticleUrl,
            articleId,
            (data) => {
                location.assign('/');
            }
        );
        navDeleteArticleBtn.addEventListener('click', eventListener);
    }

    // 为页面中的代码区域添加左侧行号
    document.querySelectorAll('#previewer .codehilite').forEach((codeBox) => {
        appendLineNumToCode(codeBox);
    });

    function closeHintBox(e) {
        const hintBox = document.getElementById('hint-box');
        hintBoxAnimate(-hintBox.offsetTop);
    }

    function switchTheme(e) {
        // 获取当前主题
        let nowTheme = document.documentElement.getAttribute('data-theme');
        if (nowTheme === null) {
            nowTheme = 'light';
        }

        // 更改主题
        const newTheme = nowTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);

        // 把更改的主题保存到浏览器缓存
        localStorage.setItem('theme', newTheme);
    }

    function adjustHintBoxLocation(e) {
        const hintBox = document.getElementById('hint-box');
        const w = hintBox.offsetWidth;
        const marginLeft = Math.ceil(-w / 2);
        hintBox.style.marginLeft = marginLeft + 'px';
    }

    function downloadMarkdown(e) {
        const a = e.target;

        // 生成文件
        const fileContent = document.querySelector('#editor textarea').value;
        const articleTitle = document.querySelector('head > title').innerHTML;
        const filename = articleTitle + '.md';
        const options = {type: 'text/plain'}
        const file = new File([fileContent], filename, options);

        // 生成文件URL并添加到链接
        const downloader = document.createElement('a');
        const fileUrl = URL.createObjectURL(file);
        downloader.href = fileUrl;
        downloader.download = filename;

        // 下载
        downloader.click();
    }
})();