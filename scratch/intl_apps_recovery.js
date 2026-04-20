async function intlAppsUpdate() {
    try {
        const url = "https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items.json";
        const res = await fetch(url);
        const items = await res.json();
        if (!items) return;

        const prices = {
            "Chicken or Beef Nachos": "6.00",
            "Mozzarella Sticks": "5.00",
            "Fried Chicken Tenders": "5.00",
            "Shrimp Dynamite": "6.00",
            "Boneless Chicken": "5.00",
            "Potato Wedges": "2.50",
            "French Fries": "2.00"
        };

        Object.keys(items).forEach(key => {
            const name = items[key].nameEn || items[key].name || "";
            if (prices[name]) {
                items[key].price = prices[name];
                console.log(`Updated INTL: ${name} -> ${prices[name]}`);
            } else {
                for (let pName in prices) {
                    if (name.toLowerCase().includes(pName.toLowerCase()) || pName.toLowerCase().includes(name.toLowerCase())) {
                        items[key].price = prices[pName];
                        console.log(`Fuzzy Updated INTL: ${name} -> ${prices[pName]}`);
                        break;
                    }
                }
            }
        });

        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(items)
        });
        console.log("International Appetizers update complete!");
    } catch(e) { console.error(e); }
}
intlAppsUpdate();
