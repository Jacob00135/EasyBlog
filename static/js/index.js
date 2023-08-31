(() => {
    'use strict';

    // 删除文章按钮事件
    const deleteArticleUrl = document.querySelector('info').getAttribute('data-delete-article-url');
    document.querySelectorAll('.article .footer .article-action .delete').forEach((node) => {
        const articleId = node.getAttribute('data-article-id');
        const eventListener = getDeleteArticleFunction(
            deleteArticleUrl,
            articleId,
            (data) => {
                document.querySelector(`.article[data-article-id="${articleId}"]`).remove();
            }
        );
        node.addEventListener('click', eventListener);
    });
})();