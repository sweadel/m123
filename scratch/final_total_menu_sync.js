/**
 * final_total_menu_sync.js
 * Comprehensive sync of all 150+ items based on the user's full text list.
 * Includes Mansaf update to 10.00, and adds all missing drinks/mojitos/iced coffees.
 */
async function finalSync() {
    try {
        const url = "https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items.json";
        const catUrl = "https://tallow-ahbabna-default-rtdb.firebaseio.com/categories_meta.json";
        
        // 1. Define the full master list from your text
        const masterList = [
            // --- Breakfast (ar-breakfast) ---
            { name: "مناقيش زعتر", price: "2.00", category: "ar-breakfast" },
            { name: "مناقيش جبنه", price: "2.50", category: "ar-breakfast" },
            { name: "مناقيش جبنه وزعتر", price: "2.50", category: "ar-breakfast" },
            { name: "حمص", price: "2.00", category: "ar-breakfast" },
            { name: "فول", price: "2.00", category: "ar-breakfast" },
            { name: "فلافل طلوا حبابنا", price: "2.00", category: "ar-breakfast" },
            { name: "اومليت خضار", price: "2.50", category: "ar-breakfast" },
            { name: "اومليت جبنه", price: "2.50", category: "ar-breakfast" },
            { name: "فته حمص", price: "4.00", category: "ar-breakfast" },
            { name: "فتة باذنجان مقدوس", price: "4.00", category: "ar-breakfast" },
            { name: "اوفو الفورنو", price: "4.00", category: "ar-breakfast" },
            { name: "هاش براون", price: "2.50", category: "ar-breakfast" },
            { name: "طبليه فطور عربي", price: "5.00", category: "ar-breakfast", desc: "للشخص: اومليت وفلافل / زيت و زعتر / حمص / لبنه كرات / مخللات وزيتون / قلايه بندوره / فول" },
            { name: "طبليه فطور غربي", price: "6.00", category: "ar-breakfast", desc: "للشخص: تشكن او بيف ناتشوز / زيت وزعتر / نقانق / سكرامبل Eggs / قشطه وعسل واجبان / شاي او اميركان او عصير" },

            // --- Snacks & Appetizers (ar-hot) & (in-starter) ---
            { name: "تشكن او بيف ناتشوز", price: "6.00", category: "in-starter" },
            { name: "موزريلا ستيكس", price: "5.00", category: "in-starter" },
            { name: "فرايد تشكن تندر", price: "5.00", category: "in-starter" },
            { name: "شرم دايناميت", price: "6.00", category: "in-starter" },
            { name: "بونلس تشكن", price: "5.00", category: "in-starter" },
            { name: "بطاطا ودجز", price: "2.50", category: "in-starter" },
            { name: "بطاطا فرايز", price: "2.50", category: "in-starter" },
            { name: "روكيلا حلوم مشوي", price: "3.00", category: "ar-cold" },
            { name: "كبه مقليه", price: "2.00", category: "ar-hot" },
            { name: "صحن فلافل", price: "2.50", category: "ar-hot" },
            { name: "كبه مشويه", price: "2.50", category: "ar-hot" },
            { name: "سمبوسك", price: "2.50", category: "ar-hot" },
            { name: "فطر طلوا احبابنا", price: "2.50", category: "ar-hot" },
            { name: "كبدة", price: "2.50", category: "ar-hot", desc: "دبس رمان او بصل وفلفل" },
            { name: "جوانح مشويه", price: "2.50", category: "ar-hot" },
            { name: "بطاطا حاره", price: "2.00", category: "ar-hot" },

            // --- International Salads (in-salad) ---
            { name: "سلطة سيزر بالدجاج", price: "4.00", category: "in-salad" },
            { name: "سلطة السيزر", price: "3.00", category: "in-salad" },
            { name: "سلطه يونانيه", price: "3.00", category: "in-salad" },
            { name: "سلطة الكبريزه اليونانيه", price: "3.00", category: "in-salad" },
            { name: "المانجو شرم سالاد", price: "4.00", category: "in-salad" },
            { name: "السلطة الكراب", price: "4.00", category: "in-salad" },
            { name: "سيتروس بيت روت سالاد", price: "3.00", category: "in-salad" },

            // --- Arabic Cold Starters (ar-cold) ---
            { name: "التبولة العربية", price: "2.75", category: "ar-cold" },
            { name: "تبولة رمان بدون برغل", price: "2.75", category: "ar-cold" },
            { name: "فتوش طلوحبابنا", price: "2.75", category: "ar-cold" },
            { name: "سلطه بالطحينيه", price: "2.00", category: "ar-cold" },
            { name: "سلطة باذنجان", price: "2.00", category: "ar-cold" },
            { name: "حمص بيروتي", price: "2.25", category: "ar-cold" },
            { name: "حمص صنوبر", price: "2.50", category: "ar-cold" },
            { name: "حمص حار", price: "2.00", category: "ar-cold" },
            { name: "حمص لحمه بالصنوبر", price: "3.50", category: "ar-cold" },
            { name: "متبل باذنجان", price: "2.00", category: "ar-cold" },
            { name: "بابا غنوج", price: "2.00", category: "ar-cold" },
            { name: "لبنه مع ورق الزعتر", price: "2.00", category: "ar-cold" },
            { name: "محمره", price: "2.50", category: "ar-cold" },
            { name: "لبنة طلو حبابنا", price: "2.50", category: "ar-cold" },
            { name: "شنكليش مخلوط", price: "2.50", category: "ar-cold" },
            { name: "مخللات مطعمنا", price: "2.50", category: "ar-cold" },
            { name: "صحن مزه / خضار مشكله", price: "2.00", category: "ar-cold" },

            // --- International Main (in-main) ---
            { name: "سويس رول كوردون بلو", price: "7.00", category: "in-main" },
            { name: "دجاج بالليمون والاعشاب", price: "7.00", category: "in-main" },
            { name: "بولو الفريدو", price: "7.00", category: "in-main" },
            { name: "هامور ستيك المشوي", price: "8.00", category: "in-main" },
            { name: "ستيك السمك المقلي", price: "8.00", category: "in-main" },
            { name: "رويال سالمون", price: "12.00", category: "in-main" },
            { name: "بيبر ستيك", price: "12.00", category: "in-main" },
            { name: "ماشروم ستيك", price: "12.00", category: "in-main" },

            // --- Arabic Main (ar-main) ---
            { name: "منسف بلدي", price: "10.00", category: "ar-main" },
            { name: "مسخن الدجاج", price: "6.00", category: "ar-main" },
            { name: "صنية دجاج بالاعشاب والبطاطا", price: "6.00", category: "ar-main" },
            { name: "كفته بالبندورة أو الطحينية أو الجميد", price: "6.00", category: "ar-main" },
            { name: "فخارة الدجاج", price: "6.00", category: "ar-main" },
            { name: "فخارة لحمة", price: "7.00", category: "ar-main" },

            // --- Grills (ar-grill) ---
            { name: "كباب حلبي", price: "6.00", category: "ar-grill", desc: "ربع كيلو: 6.00، نص: 12.00، كيلو: 24.00" },
            { name: "شقف", price: "6.00", category: "ar-grill", desc: "ربع كيلو: 6.00، نص: 12.00، كيلو: 24.00" },
            { name: "شيش طاووق", price: "6.00", category: "ar-grill", desc: "ربع كيلو: 6.00، نص: 12.00، كيلو: 20.00" },
            { name: "ریش مشويه", price: "6.00", category: "ar-grill", desc: "ربع كيلو: 6.00، نص: 12.00، كيلو: 24.00" },
            { name: "مشاوي مشكل", price: "6.00", category: "ar-grill", desc: "ربع كيلو: 6.00، نص: 12.00، كيلو: 24.00" },
            { name: "دجاج (نص دجاج مع بطاطا)", price: "6.00", category: "ar-grill" },
            { name: "دجاج بالزعتر مع بطاطا", price: "6.00", category: "ar-grill" },
            { name: "کباب خشخاش", price: "6.00", category: "ar-grill" },

            // --- Soups (ar-soup) ---
            { name: "شوربة العدس", price: "3.00", category: "ar-soup" },
            { name: "شوربة الخضار", price: "3.00", category: "ar-soup" },
            { name: "شوربة الفطر", price: "3.00", category: "ar-soup" },

            // --- Snacks/Sandwiches (in-sandwich) ---
            { name: "انجوس تشيز برغر", price: "5.00", category: "in-sandwich" },
            { name: "باربيكيو فرايد تشكن برغر", price: "5.00", category: "in-sandwich" },
            { name: "تشكن سيزر ساندويش", price: "5.00", category: "in-sandwich" },
            { name: "جريل حلوم الابيستو ساندويش", price: "5.00", category: "in-sandwich" },
            { name: "ستيك سانويش", price: "5.00", category: "in-sandwich" },
            { name: "ساندوش شاورما دجاج", price: "5.00", category: "in-sandwich" },
            { name: "ساندوش شاورما لحمه", price: "5.00", category: "in-sandwich" },

            // --- Pizza (in-pizza) ---
            { name: "بيتزا مارجاريتار", price: "5.00", category: "in-pizza" },
            { name: "بيتزا الخضار", price: "5.00", category: "in-pizza" },
            { name: "بيتزا الفريدو", price: "5.00", category: "in-pizza" },
            { name: "بيتزا بيبروني", price: "5.00", category: "in-pizza" },
            { name: "بيتزا زنجر (باربكيو)", price: "5.00", category: "in-pizza" },

            // --- Sweets (ar-dessert) ---
            { name: "كنافه", price: "2.50", category: "ar-dessert" },
            { name: "بقلاوه تركيه", price: "5.00", category: "ar-dessert" },
            { name: "ام علي", price: "3.00", category: "ar-dessert" },

            // --- Argileh (arg-all) ---
            { name: "لمون ونعنع مزايا", price: "3.5", category: "arg-all" },
            { name: "تفاحتين مزايا", price: "3.5", category: "arg-all" },
            { name: "علكة وقرفة مزايا", price: "3.5", category: "arg-all" },
            { name: "كاندي", price: "3.5", category: "arg-all" },
            { name: "بطيخ ونعنع مزايا", price: "3.5", category: "arg-all" },
            { name: "تفاحتين نخلة", price: "5.00", category: "arg-all" },

            // --- Iced Coffee & Mojito (dr-iced / dr-mojito) ---
            { name: "آيس أمريكانو", price: "2.50", category: "dr-iced" },
            { name: "آيس لاتيه", price: "3.50", category: "dr-iced" },
            { name: "آيس سبانش", price: "3.50", category: "dr-iced" },
            { name: "آيس موكا", price: "3.50", category: "dr-iced" },
            { name: "الشاي المثلج ليمون", price: "2.50", category: "dr-iced" },
            { name: "الشاي المثلج خوخ", price: "2.50", category: "dr-iced" },
            { name: "الشاي المثلج باشن فروت", price: "2.50", category: "dr-iced" },
            { name: "موهيتو بلو كاراساو", price: "2.50", category: "dr-mojito" },
            { name: "موهيتو رمان", price: "2.50", category: "dr-mojito" },
            { name: "موهيتو ميكس بيريز", price: "2.50", category: "dr-mojito" },
            { name: "موهيتو مانجو وباشن فروت", price: "3.00", category: "dr-mojito" },

            // --- Hot Drinks (dr-hot) ---
            { name: "قهوة تركية", price: "2.00", category: "dr-hot" },
            { name: "قهوة تركية (دبل)", price: "3.00", category: "dr-hot" },
            { name: "إسبريسو (دبل)", price: "2.50", category: "dr-hot" },
            { name: "أمريكانو", price: "2.50", category: "dr-hot" },
            { name: "نسكافيه بالحليب", price: "3.00", category: "dr-hot" },
            { name: "لاتيه", price: "2.50", category: "dr-hot" },
            { name: "كابتشينو", price: "3.50", category: "dr-hot" },
            { name: "موكا", price: "3.50", category: "dr-hot" },
            { name: "وايت موكا", price: "2.50", category: "dr-hot" },
            { name: "شوكولاتة ساخنة", price: "3.50", category: "dr-hot" },
            { name: "سبانش لاتيه", price: "3.50", category: "dr-hot" },
            { name: "شاي", price: "1.50", category: "dr-hot" },
            { name: "أعشاب", price: "1.50", category: "dr-hot" },

            // --- Cold Drinks (dr-cold) ---
            { name: "مياه معدنية", price: "0.60", category: "dr-cold" },
            { name: "مياه فوارة", price: "2.50", category: "dr-cold" },
            { name: "مشروبات غازية", price: "1.50", category: "dr-cold" },
            { name: "ريد بول", price: "2.50", category: "dr-cold" },
            { name: "ليمون بيتر", price: "2.00", category: "dr-cold" },
            { name: "مياه صودا", price: "3.00", category: "dr-cold" },
            { name: "سموذي فراولة", price: "3.00", category: "dr-cold" },
            { name: "سموذي كيوي", price: "3.00", category: "dr-cold" },
            { name: "سموذي باشن فروت", price: "3.00", category: "dr-cold" },
            { name: "عصير برتقال", price: "3.00", category: "dr-cold" },
            { name: "عصير ليمون", price: "3.00", category: "dr-cold" }
        ];

        // 2. Prepare the clean object
        const finalItems = {};
        masterList.forEach((item, index) => {
            const id = `item_${Date.now()}_${index}`;
            finalItems[id] = {
                name: item.name,
                price: item.price,
                category: item.category,
                status: "active",
                desc: item.desc || "",
                image: "images/tallo-logo.png"
            };
        });

        // 3. Overwrite the DB
        console.log(`Syncing ${masterList.length} items to Firebase...`);
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalItems)
        });

        if (res.ok) {
            console.log("✅ DONE! Database is now perfectly synced with your list.");
            console.log("📌 Mansaf is now 10.00");
        } else {
            console.log("❌ Error during sync");
        }
    } catch(e) { console.error(e); }
}
finalSync();
