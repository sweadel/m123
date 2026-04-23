const https = require('https');

https.get('https://tallow-ahbabna-default-rtdb.firebaseio.com/.json', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const db = JSON.parse(data);
        const str = JSON.stringify(db);
        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        const matches = str.match(emojiRegex);
        
        console.log("Found emojis in DB:", matches);
        
        // Find where they are
        function findPath(obj, path = "") {
            for (let key in obj) {
                const currentPath = path ? `${path}/${key}` : key;
                if (typeof obj[key] === 'string' && emojiRegex.test(obj[key])) {
                    console.log(`Path: ${currentPath} -> Value: ${obj[key]}`);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    findPath(obj[key], currentPath);
                }
            }
        }
        findPath(db);
    });
}).on('error', (err) => {
    console.error('Error: ' + err.message);
});
