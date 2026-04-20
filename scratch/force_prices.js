async function forceUpdatePrices() {
    try {
        const url = "https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items.json";
        const res = await fetch(url);
        const items = await res.json();
        
        if (!items) return;
        
        Object.keys(items).forEach(key => {
            const name = items[key].name;
            if (name === "مناقيش زعتر") items[key].price = "2.00";
            if (name === "مناقيش جبنه") items[key].price = "2.50";
            if (name === "مناقيش جبنه وزعتر") items[key].price = "2.50";
            if (name === "حمص") items[key].price = "2.50";
        });
        
        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(items)
        });
        console.log("Prices forced successfully.");
    } catch(e) { console.error(e); }
}
forceUpdatePrices();
