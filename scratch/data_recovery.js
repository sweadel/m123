const fs = require('fs');
const https = require('https');

const dump = JSON.parse(fs.readFileSync('scratch/db_dump.json', 'utf8'));
const DB_URL = 'https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items';

async function updateItem(key, data) {
    return new Promise((resolve, reject) => {
        const url = `${DB_URL}/${key}.json`;
        const body = JSON.stringify(data);
        const options = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };
        const req = https.request(url, options, (res) => {
            let resBody = '';
            res.on('data', d => resBody += d);
            res.on('end', () => resolve(resBody));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function run() {
    console.log('Restoring data from dump...');
    
    const affectedIds = [
        "item_1776718856053_68", "item_1776718856053_69", "item_1776718856053_70", 
        "item_1776718856053_71", "item_1776718856053_72", "item_1776718856053_75",
        "item_1776718856053_86", "item_1776718856053_87", "item_1776718856053_88", 
        "item_1776718856053_89", "item_1776718856053_90"
    ];

    const oldItems = dump.items || {};

    // Specific updates I wanted to apply
    const updates = {
        "item_1776718856053_68": { "prices": { "quarter": "6.00", "half": "12.00", "kilo": "24.00" }, "price": "6.00" },
        "item_1776718856053_69": { "prices": { "quarter": "6.00", "half": "12.00", "kilo": "24.00" }, "price": "6.00" },
        "item_1776718856053_70": { "prices": { "quarter": "6.00", "half": "12.00", "kilo": "20.00" }, "price": "6.00" },
        "item_1776718856053_71": { "prices": { "quarter": "6.00", "half": "12.00", "kilo": "24.00" }, "price": "6.00" },
        "item_1776718856053_72": { "prices": { "quarter": "6.00", "half": "12.00", "kilo": "24.00" }, "price": "6.00" },
        "item_1776718856053_75": { "prices": { "quarter": "6.00", "half": "12.00", "kilo": "24.00" }, "price": "6.00" },
        
        "item_1776718856053_86": { "nameEn": "Margherita Pizza", "descEn": "Handmade dough topped with tomato sauce, mozzarella, and fresh basil.", "name": "بيتزا مارغريتا", "category": "in-pizza", "price": "5.00" },
        "item_1776718856053_87": { "nameEn": "Veggie Pizza", "descEn": "Handmade dough with mushroom, peppers, olives, and mozzarella.", "name": "بيتزا خضار", "category": "in-pizza", "price": "5.00" },
        "item_1776718856053_88": { "nameEn": "Alfredo Pizza", "descEn": "Handmade dough with grilled chicken, mushroom, and creamy Alfredo sauce.", "name": "بيتزا الفريدو", "category": "in-pizza", "price": "5.00" },
        "item_1776718856053_89": { "nameEn": "Pepperoni Pizza", "descEn": "Handmade dough with tomato sauce, mozzarella, and beef pepperoni.", "name": "بيتزا ببروني", "category": "in-pizza", "price": "5.00" },
        "item_1776718856053_90": { "nameEn": "BBQ Chicken Pizza", "descEn": "Handmade dough with zinger chicken, bell peppers, and BBQ sauce.", "name": "بيتزا زنجر باربيكيو", "category": "in-pizza", "price": "5.00" }
    };

    for (const id of affectedIds) {
        const original = oldItems[id] || {};
        const update = updates[id] || {};
        // Merge original with update
        const final = { ...original, ...update };
        await updateItem(id, final);
        console.log(`Restored and Updated: ${id}`);
    }

    console.log('Recovery completed.');
}

run();
