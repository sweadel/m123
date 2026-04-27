const https = require('https');

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
    console.log('Applying final organization fixes...');

    const fixes = {
        "item_1776718856053_66": { "category": "ar-oven" },
        "item_1776718856053_67": { "category": "ar-oven" },
        "item_1776718856053_13": { "category": "in-breakfast" },
        "-Oqwh7VvAU8t9h5P42V7": { "price": "4.50" }, // قلاية بندورة باللحمة
        "-Oqwh7_61KR8GP3BhlTD": { "price": "3.50" }  // مفركة بطاطا
    };

    for (const [key, data] of Object.entries(fixes)) {
        await updateItem(key, data);
        console.log(`Fixed item: ${key}`);
    }

    console.log('Final fixes applied.');
}

run();
