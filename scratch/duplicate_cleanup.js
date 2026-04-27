const https = require('https');

const DB_URL = 'https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items';

async function deleteItem(key) {
    return new Promise((resolve, reject) => {
        const url = `${DB_URL}/${key}.json`;
        const options = { method: 'DELETE' };
        const req = https.request(url, options, (res) => {
            res.on('end', () => resolve());
            res.on('data', () => {});
        });
        req.on('error', reject);
        req.end();
    });
}

async function updateItem(key, data) {
    return new Promise((resolve, reject) => {
        const url = `${DB_URL}/${key}.json`;
        const body = JSON.stringify(data);
        const options = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        };
        const req = https.request(url, options, (res) => {
            res.on('end', () => resolve());
            res.on('data', () => {});
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function run() {
    console.log('Cleaning up duplicates...');

    // 1. Delete redundant pizza entries
    const toDelete = [
        "item_1776718856053_86", 
        "item_1776718856053_87", 
        "item_1776718856053_89", 
        "item_1776718856053_90"
    ];

    for (const id of toDelete) {
        await deleteItem(id);
        console.log(`Deleted duplicate pizza: ${id}`);
    }

    // 2. Ensure remaining pizzas have full data
    const pizzaUpdates = {
        "item_pizza_margarita": { "nameEn": "Margherita Pizza", "desc": "صوص طماطم، موزاريلا وريحان.", "descEn": "Tomato sauce, mozzarella and fresh basil.", "price": "5.00" },
        "item_pizza_veggie": { "nameEn": "Veggie Pizza", "desc": "فطر، فلفل، زيتون وموزاريلا.", "descEn": "Mushroom, peppers, olives and mozzarella cheese.", "price": "5.00" },
        "item_pizza_pepperoni": { "nameEn": "Pepperoni Pizza", "desc": "صوص طماطم، موزاريلا وبيبروني بقري.", "descEn": "Tomato sauce, mozzarella and beef pepperoni.", "price": "5.00" },
        "item_pizza_bbq": { "nameEn": "BBQ Chicken Pizza", "desc": "دجاج، فلفل وصوص باربيكيو.", "descEn": "Grilled chicken, bell peppers, and signature BBQ sauce.", "price": "5.00" }
    };

    for (const [key, data] of Object.entries(pizzaUpdates)) {
        await updateItem(key, data);
        console.log(`Updated pizza data: ${key}`);
    }

    // 3. Fix Hummus duplication in Breakfast
    // item_1776718856053_3 is the Breakfast Hummus.
    // -OqgtdByaetwFuBP0yz2 is the Meat Hummus.
    await updateItem("item_1776718856053_3", { 
        "nameEn": "Plain Hummus", 
        "descEn": "Smooth and creamy traditional hummus topped with olive oil.",
        "name": "حمص بالطحينة" 
    });
    console.log('Fixed Hummus duplicate.');

    console.log('Cleanup completed.');
}

run();
