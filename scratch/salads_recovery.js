async function saladsUpdate() {
    try {
        const url = "https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items.json";
        const res = await fetch(url);
        const items = await res.json();
        if (!items) return;

        const prices = {
            "Chicken Caesar Salad": "4.50",
            "Caesar Salad": "3.00",
            "Greek Salad": "3.00",
            "Mango & Pomegranate Salad": "4.00",
            "Crab Salad": "4.00",
            "Citrus Beetroot Salad": "3.50",
            "Garden & House Salads": "3.00"
        };

        Object.keys(items).forEach(key => {
            const name = items[key].nameEn || items[key].name || "";
            if (prices[name]) {
                items[key].price = prices[name];
                console.log(`Updated Salad: ${name} -> ${prices[name]}`);
            } else {
                for (let pName in prices) {
                    if (name.toLowerCase().includes(pName.toLowerCase()) || pName.toLowerCase().includes(name.toLowerCase())) {
                        items[key].price = prices[pName];
                        console.log(`Fuzzy Updated Salad: ${name} -> ${prices[pName]}`);
                        break;
                    }
                }
            }
        });

        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(items)
        });
        console.log("Salads update complete!");
    } catch(e) { console.error(e); }
}
saladsUpdate();
