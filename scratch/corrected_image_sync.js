/**
 * corrected_image_sync.js
 */
async function syncImages() {
    try {
        const url = "https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items.json";
        const res = await fetch(url);
        const items = await res.json();
        if (!items) return;

        Object.keys(items).forEach(key => {
            const name = items[key].name;
            
            // Exact matching to fix the mismatch
            if (name === "بيتزا مارجاريتار") {
                items[key].image = "images/pizza-margherita.jpg";
            }
            if (name === "بولو الفريدو") {
                items[key].image = "images/chicken-creamy.jpg";
            }
            if (name === "دجاج بالليمون والاعشاب") {
                items[key].image = "images/chicken-lemon.jpg";
            }
            if (name === "حمص لحمه بالصنوبر") {
                items[key].image = "images/hummus-meat.jpg";
            }
            if (name === "رويال سالمون") {
                items[key].image = "images/salmon-royal.jpg";
            }
            if (name === "فخارة لحمة") {
                items[key].image = "images/fakhara-lahma.jpg";
            }
        });

        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(items)
        });
        console.log("✅ Final Image Path Correction Applied.");
    } catch(e) { console.error(e); }
}
syncImages();
