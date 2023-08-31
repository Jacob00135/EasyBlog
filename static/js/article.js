(() => {
    'use strict';

    // 返回顶部的按钮的点击事件
    document.getElementById('to-top').addEventListener('click', backToTop);
    window.addEventListener('scroll', showToTopButton);

    // 导出为html的事件
    document.querySelector('#top-nav .export-to-html').addEventListener('click', exportToHtml);

    function backToTop(e) {
        window.scroll(0, 0);
    }

    function showToTopButton(e) {
        if (window.pageYOffset > document.body.offsetHeight * 0.1) {
            document.getElementById('to-top').classList.remove('hidden');
        } else {
            document.getElementById('to-top').classList.add('hidden');
        }
    }

    function exportToHtml(e) {
        // html模板，后续填入内容
        function fillHTMLBackbone(articleTitle, pageMainContent, style) {
            return `<!doctype html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8"/>
                    <meta name="viewport"
                          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"/>
                    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
                    <title>${articleTitle}</title>
                    ${style}
                    <style>
                        #to-top::after {
                            font-family: "Consolas","Menlo","Roboto Mono","Ubuntu Monospace","Noto Mono","Oxygen Mono","Liberation Mono",monospace,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
                            font-size: 30px;
                            content: "↑";
                        }
                    </style>
                    <script>
                        (() => {
                            // 设置主题，默认暗色
                            const theme = localStorage.getItem('theme') || 'dark';
                            document.documentElement.setAttribute('data-theme', theme);
                            localStorage.setItem('theme', theme);
                        })();
                    </script>
                </head>
                <body>
                    <div id="root" class="container">
                        <div id="top-nav">
                            <nav class="container">
                                <ul>
                                    <li class="theme-switcher" title="切换主题">
                                        <button type="button"></button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        <article id="previewer">
                            ${pageMainContent}
                        </article>
                        <button id="to-top" class="hidden" type="button"></button>
                    </div>
                    <script>
                        (() => {
                            // 切换主题的按钮的点击事件
                            document.querySelector('#top-nav .theme-switcher').addEventListener('click', switchTheme);

                            // 返回顶部的按钮的点击事件
                            document.getElementById('to-top').addEventListener('click', backToTop);
                            window.addEventListener('scroll', showToTopButton);

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

                            function backToTop(e) {
                                window.scroll(0, 0);
                            }

                            function showToTopButton(e) {
                                if (window.pageYOffset > document.body.offsetHeight * 0.1) {
                                    document.getElementById('to-top').classList.remove('hidden');
                                } else {
                                    document.getElementById('to-top').classList.add('hidden');
                                }
                            }
                        })();
                    </script>
                </body>
                </html>
            `;
        };

        // 获取CSS的函数，由于涉及异步，所以需要使用递归的方式编写
        const cssUrlPrefix = document.querySelector('#top-nav .export-to-html').getAttribute('data-get-css-url-prefix');
        function getCSS(filenames, result, promise) {
            if (promise === undefined) {
                promise = myajax.get(cssUrlPrefix + filenames.shift());
                return getCSS(filenames, result, promise);
            }

            return promise.then((cssContent) => {
                result.push('<style>');
                result.push(cssContent);
                result.push('</style>');
                if (filenames.length === 0) {
                    return new Promise((resolve, reject) => {
                        resolve(result.join(''));
                    });
                }
                promise = myajax.get(cssUrlPrefix + filenames.shift());
                return getCSS(filenames, result, promise);
            });
        }

        // 将图片转换成BASE64并嵌入HTML的函数，由于转换过程涉及异步，所以要用递归的方式来写
        function convert(content, matchReg, callback) {
            const result1 = matchReg.exec(content);
            if (result1 === null) {
                callback && callback(content);
                return undefined;
            }

            // 提取图片url、url所在位置
            const result2 = /src="(.*?)"/g.exec(result1[1]);
            const imageUrl = result2[1];
            const replaceStart = result1.index + 5 + result2.index + 5;
            const replaceEnd = replaceStart + imageUrl.length;

            // 把图片内容转换成BASE64
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.addEventListener('load', () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = image.naturalHeight;
                canvas.width = image.naturalWidth;
                ctx.drawImage(image, 0, 0);
                const base64 = canvas.toDataURL();

                // 用BASE64替换掉原本的url
                const newContent = [content.slice(0, replaceStart), base64, content.slice(replaceEnd, content.length)].join('');

                // 进行下一次转换
                convert(newContent, matchReg, callback);
            });
            image.src = imageUrl;
        }

        // 使用Promise处理流程
        const cssFilenameArray = ['pico.min.css', 'pico.docs.min.css', 'base.css', 'article.css', 'code-hilite.css'];
        getCSS(cssFilenameArray, []).then((style) => {
            // 填充html骨架
            const articleTitle = document.querySelector('head > title').innerHTML;
            const pageMainContent = document.getElementById('previewer').innerHTML;
            const doc = fillHTMLBackbone(articleTitle, pageMainContent, style);

            // 将图片转换成BASE64并嵌入HTML，然后导出
            convert(doc, /<img (.*?)>/g, (newDoc) => {
                const filename = articleTitle + '.html';
                const file = new File([newDoc], filename, {type: 'text/html'});
                const downloader = document.createElement('a');
                downloader.href = URL.createObjectURL(file);
                downloader.download = filename;
                downloader.click();
            });
        });
    }
})();