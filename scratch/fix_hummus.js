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
    console.log('Starting updates...');

    // 1. Move "Hummus with Meat & Pine" to Hot Mezze
    const update1 = await updateItem('-OqgtdByaetwFuBP0yz2', {
        category: 'ar-hot-mezze',
        updatedAt: Date.now()
    });
    console.log('Update 1 (Move Meat Hummus):', update1);

    // 2. Fix Plain Hummus description
    const update2 = await updateItem('item_1776718856053_3', {
        desc: 'حمص بطحينة بلدي فاخر مع زيت زيتون.',
        descAr: 'حمص بطحينة بلدي فاخر مع زيت زيتون.',
        descEn: 'Premium local hummus with tahini and olive oil.',
        updatedAt: Date.now()
    });
    console.log('Update 2 (Fix Plain Hummus):', update2);

    console.log('Done.');
}

run();
