const https = require('https');

const DB_URL = 'https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items.json';

async function getItems() {
    return new Promise((resolve, reject) => {
        https.get(DB_URL, (res) => {
            let resBody = '';
            res.on('data', d => resBody += d);
            res.on('end', () => resolve(JSON.parse(resBody)));
        }).on('error', reject);
    });
}

async function run() {
    const items = await getItems();
    Object.entries(items).forEach(([key, item]) => {
        console.log(`${key}: ${item.name} (${item.category})`);
    });
}

run();
