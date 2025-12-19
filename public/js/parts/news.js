document.addEventListener('DOMContentLoaded', () => {
    const newsListElement = document.getElementById('news-list');
    if (!newsListElement) return;

    // ★今いるページが「limited（限定ページ）」かどうかチェック
    const isLimitedPage = document.body.classList.contains('limited');

    let htmlHTML = '';

    newsData.forEach(item => {
        // 日付とタイトルのセットを作成
        const content = `<time datetime="${item.datetime}">${item.date}</time>${item.title}`;

        // ★限定ページ かつ URLがある場合だけ、<a>タグで包む
        if (isLimitedPage && item.url) {
            htmlHTML += `<li><a href="${item.url}">${content}</a></li>`;
        } else {
            // それ以外（普通のindex.htmlなど）は文字だけ
            htmlHTML += `<li>${content}</li>`;
        }
    });

    newsListElement.innerHTML = htmlHTML;
});