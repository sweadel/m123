const https = require('https');

const DB_URL = 'https://tallow-ahbabna-default-rtdb.firebaseio.com/.json';

async function getDB() {
    return new Promise((resolve, reject) => {
        https.get(DB_URL, (res) => {
            let resBody = '';
            res.on('data', d => resBody += d);
            res.on('end', () => resolve(JSON.parse(resBody)));
        }).on('error', reject);
    });
}

async function run() {
    console.log('--- Menu Audit Starting ---');
    const db = await getDB();
    const items = db.menu_items || {};
    const cats = db.categories_meta || {};

    const issues = [];

    // 1. Check Categories
    const catList = Object.keys(cats);
    console.log(`Auditing ${catList.length} categories...`);
    
    catList.forEach(id => {
        const cat = cats[id];
        if (!cat.nameAr) issues.push(`Category ${id} is missing Arabic name.`);
        if (!cat.nameEn) issues.push(`Category ${id} is missing English name.`);
        
        const itemCount = Object.values(items).filter(i => i.category === id).length;
        if (itemCount === 0) issues.push(`Category ${id} (${cat.nameAr}) has NO items.`);
    });

    // 2. Check Items
    const itemList = Object.keys(items);
    console.log(`Auditing ${itemList.length} items...`);

    itemList.forEach(id => {
        const item = items[id];
        if (!item.name) issues.push(`Item ${id} is missing Arabic name.`);
        if (!item.nameEn) issues.push(`Item ${id} (${item.name}) is missing English name.`);
        if (!item.category) issues.push(`Item ${id} (${item.name}) is not assigned to any category.`);
        else if (!cats[item.category]) issues.push(`Item ${id} (${item.name}) assigned to non-existent category: ${item.category}.`);
        
        if (!item.price && (!item.prices || !item.prices.quarter)) {
            issues.push(`Item ${id} (${item.name}) has NO price.`);
        }
        
        if (item.image === 'images/tallo-logo.png') {
            // This is the default logo, not necessarily an error but good to note.
        }
    });

    if (issues.length === 0) {
        console.log('--- SUCCESS: No critical issues found! ---');
    } else {
        console.log('--- Issues Found: ---');
        issues.forEach(i => console.log('- ' + i));
    }
}

run();
