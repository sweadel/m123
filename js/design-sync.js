/**
 * design-sync.js v4.0 — Fixed field names to match admin.js saves
 * Maps: gold, bg, font (saved by admin) → CSS variables
 */
(function() {
    const style = document.createElement('style');
    style.id = 'firebase-design-styles';
    document.head.appendChild(style);

    if (!window.firebase) return;
    if (!firebase.apps.length) firebase.initializeApp({
        apiKey: "AIzaSyCwMxgmrfnsme4pgLx00tgjGCo-gQBMUo8",
        authDomain: "tallow-ahbabna.firebaseapp.com",
        projectId: "tallow-ahbabna",
        storageBucket: "tallow-ahbabna.firebasestorage.app",
        messagingSenderId: "1025966646494",
        appId: "1:1025966646494:web:f89373fad63d988f298e4f",
        databaseURL: "https://tallow-ahbabna-default-rtdb.firebaseio.com"
    });
    const db = firebase.database();

    db.ref('settings/design').on('value', snap => {
        const d = snap.val();
        if (!d) return;
        applyDesign(d);
    });

    function applyDesign(d) {
        // Field names saved by admin.js: gold, bg, font
        const gold  = d.gold  || '#C5A022';
        const bg    = d.bg    || '#0a0a0a';
        const font  = d.font  || "'IBM Plex Sans Arabic', sans-serif";

        style.innerHTML = `
            :root {
                --gold: ${gold};
                --gold-dark: ${gold};
                --bg: ${bg};
                --bg-dark: ${bg};
                --font-main: ${font};
                --font-arabic: ${font};
            }
            body { background-color: var(--bg); font-family: var(--font-main); }
            .sec-title { color: var(--gold); }
        `;

        // Tab label overrides
        const pills = document.querySelectorAll('#mainTabRow .pill');
        if (pills.length >= 5) {
            if (d.labelArabic)   pills[0].textContent = d.labelArabic;
            if (d.labelIntl)     pills[1].textContent = d.labelIntl;
            if (d.labelDesserts) pills[2].textContent = d.labelDesserts;
            if (d.labelDrinks)   pills[3].textContent = d.labelDrinks;
            if (d.labelArgileh)  pills[4].textContent = d.labelArgileh;
        }

        // Logo
        document.querySelectorAll('#main-logo, .logo-wrap img').forEach(img => {
            if (d.logoUrl && !img.src.includes(d.logoUrl)) img.src = d.logoUrl;
        });

        // Header bg
        const hdrTop = document.querySelector('.hdr-top');
        if (hdrTop && d.headerBg) hdrTop.style.backgroundImage = `url('${d.headerBg}')`;

        // Search visibility
        const searchBox = document.querySelector('.search-row');
        if (searchBox) searchBox.style.display = d.showSearch === false ? 'none' : 'flex';
    }

    // Promo banner sync (separate path: settings/home)
    db.ref('settings/home').on('value', snap => {
        const h = snap.val() || {};
        const banner = document.getElementById('promo-banner');
        if (!banner) return;
        const text = banner.querySelector('.promo-text');
        banner.style.display = h.promoShow ? 'flex' : 'none';
        if (text) text.textContent = h.promoText || '';
    });
})();
