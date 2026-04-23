/**
 * design-sync.js v3.0
 * Synchronizes the website design with Firebase settings in real-time.
 * Optimized for Tallo Ahbabna's premium arched-header layout.
 */

(function() {
    // 1. Initial Styles to prevent flickering
    const style = document.createElement('style');
    style.id = 'firebase-design-styles';
    document.head.appendChild(style);

    // 2. Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCwMxgmrfnsme4pgLx00tgjGCo-gQBMUo8",
        authDomain: "tallow-ahbabna.firebaseapp.com",
        projectId: "tallow-ahbabna",
        storageBucket: "tallow-ahbabna.firebasestorage.app",
        messagingSenderId: "1025966646494",
        appId: "1:1025966646494:web:f89373fad63d988f298e4f",
        databaseURL: "https://tallow-ahbabna-default-rtdb.firebaseio.com"
    };

    if (!window.firebase) {
        console.error("Firebase SDK not loaded!");
        return;
    }

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    
    // Listen for Design Settings
    db.ref('settings/design').on('value', snapshot => {
        const d = snapshot.val();
        if (!d) return;
        applyDesign(d);
    });

    function applyDesign(d) {
        // --- A. CSS Variables Injection ---
        // Using variables allows us to update colors while keeping the premium structure intact
        let css = `
            :root {
                --gold: ${d.primaryColor || '#C5A022'};
                --gold-dark: ${d.primaryColor || '#a8841c'};
                --bg: ${d.pageBg || '#0B0B0E'};
                --card-bg: ${d.cardBg || 'rgba(255, 255, 255, 0.03)'};
                --font-main: '${d.fontFamily || 'IBM Plex Sans Arabic'}', sans-serif;
            }
            body { 
                background-color: var(--bg);
                font-family: var(--font-main);
                font-weight: ${d.fontBold ? '800' : '700'};
            }
            .sec-title { color: var(--gold); }
            .pill.active { background: var(--gold); color: #000; }
            .promo-banner { background: var(--gold); color: #000; }
        `;
        style.innerHTML = css;

        // --- B. DOM Updates ---
        
        // Logo Synchronization
        const logos = document.querySelectorAll('#main-logo, .logo-wrap img');
        logos.forEach(img => { 
            if(d.logoUrl && !img.src.includes(d.logoUrl)) img.src = d.logoUrl; 
        });

        // Search Visibility
        const searchBox = document.querySelector('.search-row');
        if (searchBox) searchBox.style.display = d.showSearch === false ? 'none' : 'flex';

        // Promotional Banner Update
        const promo = document.getElementById('promo-banner');
        if (promo) {
            if (d.bannerActive && d.bannerText) {
                promo.style.display = 'block';
                const txtEl = promo.querySelector('.promo-text');
                if(txtEl) txtEl.textContent = d.bannerText;
            } else {
                promo.style.display = 'none';
            }
        }
    }
})();
