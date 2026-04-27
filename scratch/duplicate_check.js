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
    console.log('--- Checking for Duplicate Items ---');
    const items = await getItems();
    if (!items) return console.log('No items found.');

    const nameMap = {};
    const nameEnMap = {};
    const duplicates = [];

    Object.entries(items).forEach(([key, item]) => {
        const name = (item.name || '').trim();
        const nameEn = (item.nameEn || '').trim();

        if (name) {
            if (!nameMap[name]) nameMap[name] = [];
            nameMap[name].push({ key, cat: item.category });
        }
        if (nameEn) {
            if (!nameEnMap[nameEn]) nameEnMap[nameEn] = [];
            nameEnMap[nameEn].push({ key, cat: item.category });
        }
    });

    console.log('\n--- Duplicate Names (Arabic) ---');
    Object.entries(nameMap).forEach(([name, occurrences]) => {
        if (occurrences.length > 1) {
            console.log(`- "${name}": Found ${occurrences.length} times in [${occurrences.map(o => o.cat).join(', ')}]`);
            duplicates.push(...occurrences.map(o => o.key));
        }
    });

    console.log('\n--- Duplicate Names (English) ---');
    Object.entries(nameEnMap).forEach(([nameEn, occurrences]) => {
        if (occurrences.length > 1) {
            console.log(`- "${nameEn}": Found ${occurrences.length} times in [${occurrences.map(o => o.cat).join(', ')}]`);
        }
    });
}

run();
