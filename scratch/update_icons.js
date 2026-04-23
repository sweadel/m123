const https = require('https');

const catUpdates = {
    "ar-breakfast": { icon: "fa-egg" },
    "ar-cold-mezze": { icon: "fa-leaf" },
    "ar-hot-mezze": { icon: "fa-fire-burner" },
    "ar-soups": { icon: "fa-bowl-rice" }, // Has steam in FA
    "ar-mains": { icon: "fa-utensils" },
    "ar-oven": { icon: "fa-fire" },
    "ar-grill": { icon: "fa-fire-flame-curved" },
    "in-starters": { icon: "fa-cheese" },
    "in-salads": { icon: "fa-seedling" }
};

async function updateIcons() {
    for (const [id, data] of Object.entries(catUpdates)) {
        const body = JSON.stringify(data);
        const options = {
            hostname: 'tallow-ahbabna-default-rtdb.firebaseio.com',
            path: `/categories_meta/${id}.json`,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        };

        await new Promise((resolve) => {
            const req = https.request(options, (res) => {
                res.on('data', () => {});
                res.on('end', resolve);
            });
            req.write(body);
            req.end();
        });
        console.log(`Updated icon for ${id}`);
    }
    console.log("Category icons updated.");
}

updateIcons();
