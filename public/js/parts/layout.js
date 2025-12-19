document.addEventListener('DOMContentLoaded', () => {
    // ★1. 今いるページが「limited」かチェック
    const isLimited = document.body.classList.contains('limited');

    // ★2. メニューの中身を切り替え
    let navHTML = '';

    if (isLimited) {
        // 【限定版】のメニュー
        // ※まだ限定ページを作っていない場合は、一旦このままでOKです。
        // ※将来的に限定ページもAstro化したら、ここも /limited/member などに変えます。
        navHTML = `
            <ul id="g-navi" class="nav01c">
                <li><a href="/limited">Top</a></li>
                <li><a href="/limited/gallery">Gallery</a></li>
                <li><a href="/live">Live</a></li>
                <li><a href="/limited/schedule">Schedule</a></li>
                <li><a href="/limited/member">Member</a></li>
            </ul>
        `;
    } else {
        // 【通常版】のメニュー (Astro用に修正済み！)
        // /Public/MEMBER.html → /member になっています
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
    // ※タイトルのリンクも /index.html から / に直しました
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

    <div id="search-wrap">
        <div class="close-btn"><span></span><span></span></div>
        <div class="search-area">
            <form id="login_form">
                <input type="password" id="pass" placeholder="Password" autocomplete="off">
            </form>
            <script src="/js/passwordAuth.js"></script>
        </div>
    </div>
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

    // HTMLへの書き出し処理
    const headerPlace = document.getElementById('header-placeholder');
    const footerPlace = document.getElementById('footer-placeholder');

    if (headerPlace) headerPlace.outerHTML = headerHTML;
    if (footerPlace) footerPlace.outerHTML = footerHTML;
});