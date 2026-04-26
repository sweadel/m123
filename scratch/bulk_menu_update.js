const https = require('https');

const DB_URL = 'https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items';

async function fetchAll() {
    return new Promise((resolve, reject) => {
        https.get(`${DB_URL}.json`, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
    });
}

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

async function addItem(key, data) {
    return new Promise((resolve, reject) => {
        const url = `${DB_URL}/${key}.json`;
        const body = JSON.stringify(data);
        const options = {
            method: 'PUT',
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
    console.log('Fetching items...');
    const items = await fetchAll();
    
    // Find keys
    let arayesKey = Object.keys(items).find(k => items[k].name && items[k].name.includes('عرايس'));
    let pizzaKeys = Object.keys(items).filter(k => items[k].category === 'in-pizza');
    let herbsKey = 'item_1776718856053_123'; // أعشاب
    let steakKey = 'item_1776718856053_83'; // ستيك سانوويش
    
    console.log('Arayes Key:', arayesKey);

    const updates = [];

    // 1. Update Arayes
    if (arayesKey) {
        updates.push(updateItem(arayesKey, { name: 'عرايس باللحمة البلدية', nameEn: 'Local Meat Arayes' }));
    } else {
        // Add if not found
        updates.push(addItem('item_arayes_local', {
            name: 'عرايس باللحمة البلدية',
            nameEn: 'Local Meat Arayes',
            category: 'ar-grill',
            price: '5.00',
            status: 'active',
            image: 'images/tallo-logo.png'
        }));
    }

    // 2. Update Pizza Name
    pizzaKeys.forEach(k => {
        updates.push(updateItem(k, { name: 'بيتزا يدوية الصنع', nameEn: 'Handmade Pizza' }));
    });

    // 3. Update Herbs to Zohourat
    updates.push(updateItem(herbsKey, { name: 'زهورات', nameEn: 'Zohourat (Herbal Tea)' }));

    // 4. Update Steak Sandwich
    updates.push(updateItem(steakKey, { name: 'ستيك ساندوتش', nameEn: 'Steak Sandwich' }));

    // 5. Add New Pasta Items
    updates.push(addItem('item_penne_arrabbiata', {
        name: 'بينّا أرابياتا',
        nameEn: 'Penne Arrabbiata',
        category: 'in-pasta',
        price: '4.00',
        status: 'active',
        image: 'images/tallo-logo.png',
        desc: 'مكرونة بيني بصلصة الطماطم الحارة.',
        descEn: 'Penne pasta with spicy tomato sauce.'
    }));
    updates.push(addItem('item_penne_pesto', {
        name: 'بينّا بيستو',
        nameEn: 'Penne Pesto',
        category: 'in-pasta',
        price: '5.00',
        status: 'active',
        image: 'images/tallo-logo.png',
        desc: 'مكرونة بيني بصلصة البيستو والريحان.',
        descEn: 'Penne pasta with creamy pesto sauce.'
    }));
    updates.push(addItem('item_fettuccine_no_chicken', {
        name: 'فيتوتشيني الفريدو بدون دجاج',
        nameEn: 'Fettuccine Alfredo (No Chicken)',
        category: 'in-pasta',
        price: '4.00',
        status: 'active',
        image: 'images/tallo-logo.png',
        desc: 'مكرونة فيتوتشيني مع صوص الفريدو والفطر.',
        descEn: 'Fettuccine with Alfredo sauce and mushrooms.'
    }));
    updates.push(addItem('item_fettuccine_with_chicken', {
        name: 'فيتوتشيني الفريدو مع دجاج',
        nameEn: 'Fettuccine Alfredo (With Chicken)',
        category: 'in-pasta',
        price: '5.00',
        status: 'active',
        image: 'images/tallo-logo.png',
        desc: 'مكرونة فيتوتشيني مع صوص الفريدو وقطع الدجاج.',
        descEn: 'Fettuccine with Alfredo sauce and grilled chicken.'
    }));

    // 6. Add Mojito Classic
    updates.push(addItem('item_mojito_classic', {
        name: 'موهيتو كلاسيك',
        nameEn: 'Classic Mojito',
        category: 'dr-mojito',
        price: '2.50',
        status: 'active',
        image: 'images/tallo-logo.png',
        desc: 'ليمون، نعناع طازج، صودا وسكر.',
        descEn: 'Fresh lime, mint, soda and sugar.'
    }));

    await Promise.all(updates);
    console.log('All updates completed successfully.');
}

run();
