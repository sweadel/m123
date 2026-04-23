const https = require('https');

https.get('https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items.json', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const items = JSON.parse(data);
        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        
        console.log("--- Items with Emojis ---");
        Object.values(items).forEach(item => {
            const nameAr = item.nameAr || item.name || "";
            const descAr = item.descAr || item.desc || "";
            if (emojiRegex.test(nameAr) || emojiRegex.test(descAr)) {
                console.log(`- ${nameAr}: ${descAr}`);
            }
        });
    });
}).on('error', (err) => {
    console.error('Error: ' + err.message);
});
