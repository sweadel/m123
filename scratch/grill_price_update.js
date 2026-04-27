const https = require('https');

const DB_URL = 'https://tallow-ahbabna-default-rtdb.firebaseio.com';

async function updateDB(path, data) {
    return new Promise((resolve, reject) => {
        const url = `${DB_URL}/${path}.json`;
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
    console.log('Starting specific grill pricing updates...');

    const items = {
        // Kabab, Shkaf, Chops, Mixed, Khashkhash (Price: 6, 12, 24)
        "item_1776718856053_68": { // كباب حلبي
            "prices": { "quarter": "6.00", "half": "12.00", "kilo": "24.00" },
            "price": "6.00"
        },
        "item_1776718856053_69": { // شقف
            "prices": { "quarter": "6.00", "half": "12.00", "kilo": "24.00" },
            "price": "6.00"
        },
        "item_1776718856053_71": { // ريش مشويه
            "prices": { "quarter": "6.00", "half": "12.00", "kilo": "24.00" },
            "price": "6.00"
        },
        "item_1776718856053_72": { // مشاوي مشكل
            "prices": { "quarter": "6.00", "half": "12.00", "kilo": "24.00" },
            "price": "6.00"
        },
        "item_1776718856053_75": { // كباب خشخاش
            "prices": { "quarter": "6.00", "half": "12.00", "kilo": "24.00" },
            "price": "6.00"
        },
        // Shish Taouk (Price: 6, 12, 20)
        "item_1776718856053_70": { // شيش طاووق
            "prices": { "quarter": "6.00", "half": "12.00", "kilo": "20.00" },
            "price": "6.00"
        }
    };

    await updateDB('menu_items', items);
    console.log('Grill prices updated with specific user values.');
}

run();
