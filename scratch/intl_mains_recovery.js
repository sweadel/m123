async function intlMainsUpdate() {
    try {
        const url = "https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items.json";
        const res = await fetch(url);
        const items = await res.json();
        if (!items) return;

        const prices = {
            "Swiss Roll Cordon Bleu": "7.00",
            "Herb Chicken & Potato Tray": "7.00",
            "Alfredo Pasta": "7.00",
            "Pesto Pasta": "7.00",
            "Fillet Tray": "8.00",
            "Grilled Hamour": "8.00"
        };

        Object.keys(items).forEach(key => {
            const name = items[key].nameEn || items[key].name || "";
            if (prices[name]) {
                items[key].price = prices[name];
                console.log(`Updated Main: ${name} -> ${prices[name]}`);
            } else {
                for (let pName in prices) {
                    if (name.toLowerCase().includes(pName.toLowerCase()) || pName.toLowerCase().includes(name.toLowerCase())) {
                        items[key].price = prices[pName];
                        console.log(`Fuzzy Updated Main: ${name} -> ${prices[pName]}`);
                        break;
                    }
                }
            }
        });

        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(items)
        });
        console.log("International Mains update complete!");
    } catch(e) { console.error(e); }
}
intlMainsUpdate();
