/**
 * sync_categories.js
 * Ensures the category IDs in the DB match the ones used in our items sync.
 */
async function syncCats() {
    try {
        const url = "https://tallow-ahbabna-default-rtdb.firebaseio.com/categories_meta.json";
        const cats = {
            "ar-breakfast": { nameAr: "الإفطار والمناقيش", section: "arabic", order: 1, icon: "fa-bread-slice" },
            "ar-cold": { nameAr: "سلطات ومقبلات باردة", section: "arabic", order: 2, icon: "fa-bowl-rice" },
            "ar-hot": { nameAr: "مقبلات ساخنة", section: "arabic", order: 3, icon: "fa-fire-burner" },
            "ar-main": { nameAr: "الأطباق الرئيسية", section: "arabic", order: 4, icon: "fa-utensils" },
            "ar-grill": { nameAr: "المشاوي على الجمر", section: "arabic", order: 5, icon: "fa-fire" },
            "ar-soup": { nameAr: "شوربات", section: "arabic", order: 6, icon: "fa-bowl" },
            "ar-dessert": { nameAr: "الحلويات", section: "arabic", order: 7, icon: "fa-ice-cream" },
            "in-salad": { nameAr: "سلطات عالمية", section: "intl", order: 10, icon: "fa-leaf" },
            "in-main": { nameAr: "أطباق عالمية", section: "intl", order: 11, icon: "fa-plate-wheat" },
            "in-sandwich": { nameAr: "ساندوتشات ونكهات", section: "intl", order: 12, icon: "fa-hamburger" },
            "in-pizza": { nameAr: "بيتزا", section: "intl", order: 13, icon: "fa-pizza-slice" },
            "in-starter": { nameAr: "مقبلات عالمية", section: "intl", order: 14, icon: "fa-cheese" },
            "dr-hot": { nameAr: "مشروبات ساخنة", section: "drinks", order: 20, icon: "fa-mug-hot" },
            "dr-cold": { nameAr: "مشروبات باردة وعصائر", section: "drinks", order: 21, icon: "fa-glass-water" },
            "dr-iced": { nameAr: "قهوة وشاي مثلج", section: "drinks", order: 22, icon: "fa-ice-cream" },
            "dr-mojito": { nameAr: "موهيتو", section: "drinks", order: 23, icon: "fa-glass-citrus" },
            "arg-all": { nameAr: "أراجيل منوعة", section: "argileh", order: 30, icon: "fa-smoking" }
        };
        await fetch(url, { method: 'PUT', body: JSON.stringify(cats) });
        console.log("✅ Categories Synced");
    } catch(e) { console.error(e); }
}
syncCats();
