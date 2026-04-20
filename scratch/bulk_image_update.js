/**
 * bulk_image_update.js
 */
async function bulkUpdate() {
    try {
        const url = "https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items.json";
        const res = await fetch(url);
        const items = await res.json();
        if (!items) return;

        Object.keys(items).forEach(key => {
            const name = items[key].name;
            if (name === "بيتزا مارجاريتار" || name === "بيتزا مارغريتا") items[key].image = "images/pizza-margherita.jpg";
            if (name === "بولو الفريدو") items[key].image = "images/chicken-creamy.jpg";
            if (name === "دجاج بالليمون والاعشاب") items[key].image = "images/chicken-lemon.jpg";
            if (name === "حمص لحمه بالصنوبر") items[key].image = "images/hummus-meat.jpg";
            if (name === "رويال سالمون") items[key].image = "images/salmon-royal.jpg";
        });

        await fetch(url, { method: 'PUT', body: JSON.stringify(items) });
        console.log("✅ 5 Images synced to DB");
    } catch(e) { console.error(e); }
}
bulkUpdate();
