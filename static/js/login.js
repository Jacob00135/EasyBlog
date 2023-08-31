(() => {
    'use strict';

    // 限制input的输入长度和输入字符
    document.querySelectorAll('input[data-js-check="1"]').forEach((input) => {
        input.addEventListener('input', checkInput);
    });

    // 提交时，检查输入长度、输入字符是否合法。若不合法，弹窗警告，若合法，则提交
    document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', checkForm);
    });

    function checkInput(e) {
        const input = e.target;
        const value = input.value;
        const maxLength = parseInt(input.getAttribute('data-maxlength'));
        if (value.length > maxLength) {
            input.value = value.slice(0, maxLength);
            return undefined;
        }
        const illegalChar = input.getAttribute('data-illegal-char');
        const reg = new RegExp(illegalChar, 'g');
        input.value = input.value.replace(reg, '');
    }

    function checkForm(e) {
        e.preventDefault();

        const form = e.target;
        const inputArr = form.querySelectorAll('input[data-js-check="1"]');
        for (let i = 0; i < inputArr.length; i++) {
            let input = inputArr[i];
            let value = input.value;
            let minLength = parseInt(input.getAttribute('data-minlength'));
            let maxLength = parseInt(input.getAttribute('data-maxlength'));
            let hintContent = input.getAttribute('data-illegal-hint');
            if (value.length < minLength || value.length > maxLength) {
                showHintBox(hintContent, 'error', 'up to down');
                return undefined;
            }
            let illegalChar = input.getAttribute('data-illegal-char');
            let reg = new RegExp(illegalChar, 'g');
            if (reg.test(value)) {
                showHintBox(hintContent, 'error', 'up to down');
                return undefined;
            }
        }
        form.submit();
    }
})();