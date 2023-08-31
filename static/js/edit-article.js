(() => {
    'use strict';

    const root = document.getElementById('root');
    const nav = document.querySelector('#top-nav > nav');
    const editor = document.querySelector('#editor textarea');
    const previewer = document.querySelector('#previewer');
    const mdToHtmlPostUrl = document.getElementById('editor').getAttribute('data-convert-url');
    let oldEditorContent = editor.value;

    // 修改文章标题按钮的点击事件
    document.querySelector('#top-nav .title .update-title').addEventListener('click', updateArticleTitle);

    // 手动渲染按钮
    document.querySelector('#top-nav .render a').addEventListener('click', renderMarkdown);

    // 设置渲染方式的按钮的点击事件
    const renderInterval = 1000;  // 有间隔实时渲染的间隔，单位为ms
    document.querySelectorAll('#top-nav .setting .render-option').forEach((node) => {
        node.addEventListener('click', setRenderMethod);
    });
    document.querySelector('#top-nav .setting .render-option[data-selected="1"]').click();

    // 保存按钮
    document.querySelector('#top-nav .save a').addEventListener('click', saveArticle);

    // Ctrl + S保存
    window.addEventListener('keydown', quickSaveArticle);
    window.addEventListener('keyup', keyupCtrl);

    // 自动保存
    const autoSaveOption = document.querySelector('#top-nav .auto-save');
    autoSaveOption.autoSaveInterval = 10 * 1000;  // 自动保存间隔，单位为ms
    autoSaveOption.lastSaveContent = editor.value;  // 上一次保存的内容
    autoSaveOption.addEventListener('click', switchAutoSave);
    if (autoSaveOption.getAttribute('data-selected') === '1') {
        setAutoSave();
    }

    // 设置显示模式的按钮的点击事件
    document.querySelectorAll('#top-nav .setting .show-mode-option').forEach((node) => {
        node.addEventListener('click', setShowMode);
    });
    document.querySelector('#top-nav .setting .show-mode-option[data-selected="1"]').click();

    // 插入图片按钮的点击事件
    document.querySelector('#top-nav .insert-image summary').addEventListener('click', showImageList);

    function updateArticleTitle(e) {
        const input = document.querySelector('#top-nav .title input[name="article-title"]');
        const btn = document.querySelector('#top-nav .title .update-title');

        // 若输入框只读，设置成可写
        if (input.getAttribute('readonly') !== null) {
            input.removeAttribute('readonly');
            input.focus();
            btn.classList.remove('edit');
            btn.classList.add('submit');
            return undefined;
        }

        // 若新旧标题一致，不提交
        const oldTitle = document.querySelector('head > title').innerHTML;
        const newTitle = input.value;
        if (oldTitle === newTitle) {
            input.value = oldTitle;
            input.setAttribute('readonly', 'readonly');
            btn.classList.remove('submit');
            btn.classList.add('edit');
            return undefined;
        }

        // 检查新标题的合法性
        if (newTitle.length <= 0 || newTitle.length > 255) {
            input.value = oldTitle;
            input.setAttribute('readonly', 'readonly');
            btn.classList.remove('submit');
            btn.classList.add('edit');
            showHintBox('标题长度应小于256且不为空', 'hint', 'up to down');
            return undefined;
        }

        // 提交新标题
        const articleId = previewer.getAttribute('data-article-id');
        const url = input.getAttribute('data-submit-url');
        const data = {'article-id': articleId, 'article-title': newTitle};
        myajax.postJson(url, data).then(
            (data) => {
                showHintBox(data['message'], 'success', 'up to down', 1000);
                document.querySelector('head > title').innerHTML = newTitle;
                input.value = newTitle;
            },
            (data) => {
                showHintBox(data['message'], 'error', 'up to down');
                input.value = oldTitle;
            }
        );

        input.setAttribute('readonly', 'readonly');
        btn.classList.remove('submit');
        btn.classList.add('edit');
    }

    function renderMarkdown(e) {
        const data = {'source_markdown': editor.value};
        myajax.postJson(mdToHtmlPostUrl, data).then(
            (data) => {
                previewer.innerHTML = data['data'];
                oldEditorContent = editor.value;
                previewer.querySelectorAll('.codehilite').forEach((codeBox) => {
                    appendLineNumToCode(codeBox);
                });
            },
            (data) => {
                showHintBox(data['message'], 'error', 'up to down');
                oldEditorContent = editor.value;
            }
        );
    }

    function setRenderMethod(e) {
        const a = e.target;
        const current = document.querySelector('#top-nav .setting .render-option[data-selected="1"]');
        current.setAttribute('data-selected', '0');
        a.setAttribute('data-selected', '1');

        const renderMethod = a.getAttribute('data-render-method');
        if (renderMethod === 'manually') {
            editor.removeEventListener('input', renderMarkdown);
            clearInterval(editor.renderTimer);
            return undefined;
        } else if (renderMethod === 'no-interval') {
            editor.addEventListener('input', renderMarkdown);
            clearInterval(editor.renderTimer);
            return undefined;
        } else if (renderMethod === 'interval') {
            editor.removeEventListener('input', renderMarkdown);
            editor.renderTimer = setInterval(() => {
                if (editor.value !== oldEditorContent) {
                    renderMarkdown();
                }
            }, renderInterval);
        } else {
            throw '不支持的渲染方式：' + renderMethod;
        }
    }

    function saveArticle(e) {
        const url = document.querySelector('#top-nav .save').getAttribute('data-save-url');
        const data = {
            'article-id': previewer.getAttribute('data-article-id'),
            'article-source-markdown': editor.value
        };
        myajax.postJson(url, data).then(
            (data) => {
                if (e.hintMethod !== 'silent') {    
                    showHintBox(data['message'], 'success', 'up to down', 1000);
                }
            },
            (data) => {
                showHintBox(data['message'], 'error', 'up to down');
            }
        );
    }

    function quickSaveArticle(e) {
        if (e.keyCode === 17) {
            window.keydownCtrl = true;
            return undefined;
        }

        if (window.keydownCtrl && e.keyCode === 'S'.charCodeAt()) {
            e.preventDefault();
            saveArticle({'hintMethod': 'hint'});
        }
    }

    function keyupCtrl(e) {
        if (e.keyCode === 17) {
            window.keydownCtrl = false;
        }
    }

    function setAutoSave() {
        autoSaveOption.autoSaveTimer = setInterval(() => {
            if (editor.value !== autoSaveOption.lastSaveContent) {
                saveArticle({'hintMethod': 'silent'});
                autoSaveOption.lastSaveContent = editor.value;
            }
        }, autoSaveOption.autoSaveInterval);
    }

    function switchAutoSave(e) {
        if (autoSaveOption.getAttribute('data-selected') === '1') {
            autoSaveOption.setAttribute('data-selected', '0');
            clearInterval(autoSaveOption.autoSaveTimer);
        } else {
            autoSaveOption.setAttribute('data-selected', '1');
            setAutoSave();
        }
    }

    function setShowMode(e) {
        const option = e.target;
        const currentOption = document.querySelector('#top-nav .setting .show-mode-option[data-selected="1"]');
        currentOption.setAttribute('data-selected', '0');
        option.setAttribute('data-selected', '1');

        const showMode = option.getAttribute('data-show-mode');
        if (showMode === 'only-editor') {
            previewer.classList.add('hidden');
            editor.parentElement.classList.remove('hidden');

            root.classList.remove('container');
            nav.classList.remove('container');

            root.classList.add('container-fluid');
            nav.classList.add('container-fluid');
        } else if (showMode === 'only-previewer') {
            editor.parentElement.classList.add('hidden');
            previewer.classList.remove('hidden');

            root.classList.remove('container-fluid');
            nav.classList.remove('container-fluid');

            root.classList.add('container');
            nav.classList.add('container');
        } else if (showMode === 'show-all') {
            editor.parentElement.classList.remove('hidden');
            previewer.classList.remove('hidden');

            root.classList.remove('container');
            nav.classList.remove('container');

            root.classList.add('container-fluid');
            nav.classList.add('container-fluid');
        } else {
            throw '不支持的显示模式：' + showMode;
        }
    }

    function showImageList(e) {
        const url = document.querySelector('#top-nav .insert-image').getAttribute('data-get-image-list-url');
        myajax.getJson(url).then(
            (data) => {
                const filenames = data['data']['filenames'];
                const routePrefix = data['data']['route_prefix'];
                const empty = document.querySelector('#top-nav .insert-image .empty-image-list');
                const imageList = document.querySelector('#top-nav .insert-image .image-list ul');

                // 当没有图片时显示无图片
                if (filenames.length === 0) {
                    empty.classList.remove('hidden');
                    imageList.parentElement.classList.add('hidden');
                    return undefined;
                }

                // 有图片时列出所有图片
                empty.classList.add('hidden');
                imageList.parentElement.classList.remove('hidden');
                const imageListHTML = [];
                for (let i = 0; i < filenames.length; i++) {
                    let imageUrl = `${routePrefix}/${filenames[i]}`;
                    let filename = filenames[i];
                    imageListHTML.push(`
                        <li>
                            <a href="javascript:;" data-image-url="${imageUrl}" title="${filename}">
                                ${filename}
                            </a>
                        </li>
                    `);
                }
                imageList.innerHTML = imageListHTML.join('');

                // 注册插入图片事件
                for (let i = 0; i < imageList.children.length; i++) {
                    imageList.children[i].addEventListener('click', insertImage);
                }
            },
            (data) => {
                showHintBox(data['message'], 'error', 'up to down');
            }
        );
    }

    function insertImage(e) {
        // 确定光标位置 --> 把文章分成两部分 --> 插入代码 --> 重设光标位置
        const a = e.target;
        const imageUrl = a.getAttribute('data-image-url');
        const markdownCode = `![${imageUrl}](${imageUrl})`;
        editor.focus();
        const cursorLocation = editor.selectionStart;
        const editorContent = editor.value;
        const left = editorContent.slice(0, cursorLocation);
        const right = editorContent.slice(cursorLocation, editorContent.length);
        const newContent = left + markdownCode + right;
        const newCursorLocation = left.length + markdownCode.length;
        editor.value = newContent;
        editor.setSelectionRange(newCursorLocation, newCursorLocation);

        // 备选方案：复制代码到剪切板
        // navigator.clipboard.writeText(markdownCode).then(
        //     (data) => {
        //         showHintBox('已复制插入图片的代码到剪切板', 'success', 'up to down', 1500);
        //     },
        //     (err) => {
        //         showHintBox(err, 'error', 'up to down');
        //     }
        // );
    }
})();