(() => {
    'use strict';

    // 删除图片的事件
    const deleteImageUrl = document.getElementById('image-list').getAttribute('data-delete-image-url');
    document.querySelectorAll('#image-list ul li .delete-image').forEach((btn) => {
        btn.addEventListener('click', deleteImage);
    });

    // 上传图片提交事件
    document.querySelector('form[name="upload-image"]').addEventListener('submit', checkUploadImage);

    function deleteImage(e) {
        const check = confirm('确定要删除此图片吗？');
        if (!check) {
            return undefined;
        }

        const btn = e.target;
        const filename = btn.getAttribute('data-image-filename');
        const data = {'filename': filename}
        myajax.postJson(deleteImageUrl, data).then(
            (data) => {
                showHintBox(data['message'], 'success', 'up to down', 1000);
                btn.parentElement.remove();
            },
            (data) => {
                showHintBox(data['message'], 'error', 'up to down');
            }
        );
    }

    function checkUploadImage(e) {
        e.preventDefault();

        const form = e.target;
        const files = form.querySelector('input[name="images"]').files;
        if (files.length <= 0) {
            showHintBox('未选择文件', 'error', 'up to down');
            return undefined;
        }

        // 检查是否是图片类型
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (file.type.split('/', 1)[0] !== 'image') {
                showHintBox('上传的必须都是图片类型', 'warning', 'up to down');
                return undefined;
            }
        }

        form.submit();
    }
})();