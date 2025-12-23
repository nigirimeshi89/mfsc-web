// public/js/parts/layout.js

/* * Astroへの完全移行に伴い、JSによるヘッダー/フッターの動的生成は廃止しました。
 * 現在は src/layouts/Layout.astro 内で直接記述されています。
 */

document.addEventListener('DOMContentLoaded', () => {
    /* // --- 以下の処理はAstro側で行うため停止 ---

    // ★1. 今いるページが「limited」かチェック
    const isLimited = document.body.classList.contains('limited');

    // ★2. メニューの中身を切り替え
    let navHTML = '';

    if (isLimited) {
        navHTML = `
            <ul id="g-navi" class="nav01c">
                <li><a href="/limited">Top</a></li>
                <li><a href="/limited/gallery">Gallery</a></li>
                <li><a href="/limited/live">Live</a></li>
                <li><a href="/limited/schedule">Schedule</a></li>
                <li><a href="/limited/member">Member</a></li>
            </ul>
        `;
    } else {
        navHTML = `
            <ul id="g-navi" class="nav01c">
                <li><a href="/">Top</a></li>
                <li><a href="/gallery">Gallery</a></li>
                <li><a href="/schedule">Schedule</a></li>
                <li><a href="/member">Member</a></li>
            </ul>
        `;
    }

    // ヘッダー全体のHTML
    const headerHTML = `
    <header id="header">
        <h1><a href="/">Trajectory of Modern</a></h1>
        <div class="g-nav-openbtn">
            <div class="openbtn-area"><span></span><span></span><span></span></div>
        </div>
        <nav id="g-nav">
            <div id="g-nav-list">
                ${navHTML} </div>
        </nav>
        <div class="search-open-btn"></div>
    </header>
    
    // (中略) ...検索窓などのHTML...
    `;

    // フッターは共通
    const footerHTML = `
    <footer id="footer">
        <div class="footer-info">
            <p class="footer-logo">日本工業大学</p>
            <address>〒345-8501 埼玉県南埼玉郡宮代町学園台4-1<br>
                クラブ棟2階207号室</address>
        </div>
        <div class="footer-link">
            <small>&copy; Modern Folk Song Club</small>
        </div>
    </footer>
    `;

    // HTMLへの書き出し処理（★ここを止めるのが一番大事！）
    const headerPlace = document.getElementById('header-placeholder');
    const footerPlace = document.getElementById('footer-placeholder');

    if (headerPlace) headerPlace.outerHTML = headerHTML;
    if (footerPlace) footerPlace.outerHTML = footerHTML;
    */
});