(() => {
    'use strict';

    // 提交新建的文章标题的表单提交验证
    document.querySelector('form[name="create-article"]').addEventListener('submit', checkForm);

    function checkForm(e) {
        e.preventDefault();

        const form = e.target;
        const input = form.querySelector('input[name="article-title"]');
        if (input.value.length <= 0 || input.value.length > 255) {
            showHintBox('标题长度应小于256', 'hint', 'up to down');
            return undefined;
        }
        form.submit();
    }
})();