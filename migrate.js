const fs = require('fs');

async function migrate() {
    console.log("Reading local files...");
    const arHtml = fs.readFileSync('menu.html', 'utf8');
    const enHtml = fs.readFileSync('menu-en.html', 'utf8');

    const localItems = [];

    // Parse ARABIC
    const sections = arHtml.split(/<h2 /i).slice(1);
    sections.forEach(secStr => {
        const idMatch = secStr.match(/id=['"]([^'"]+)['"]/);
        if(!idMatch) return;
        const catId = idMatch[1];
        
        const cardsMatches = secStr.matchAll(/<a[^>]*class="menu-card"[^>]*>([\s\S]*?)<\/a>/gi);
        for(const match of cardsMatches) {
            const cardInner = match[1];
            const wholeCard = match[0];
            
            let nameAr = '';
            const dataTMatch = wholeCard.match(/data-t=['"]([^'"]+)['"]/);
            if(dataTMatch) nameAr = dataTMatch[1];
            
            if(!nameAr) {
               const nameMatch = cardInner.match(/<h3 class="card-name">([^<]+)<\/h3>/);
               if(nameMatch) nameAr = nameMatch[1];
            }
            
            let descAr = '';
            const descMatch = wholeCard.match(/data-desc=['"]([^'"]*)['"]/);
            if(descMatch) descAr = descMatch[1];
            
            let image = '';
            const imgMatch = cardInner.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
            if(imgMatch) image = imgMatch[1];

            if(nameAr) {
                localItems.push({
                    name: nameAr.trim(),
                    nameEn: '',
                    category: catId,
                    price: '',
                    status: 'active',
                    desc: descAr.trim(),
                    descEn: '',
                    image: image.trim()
                });
            }
        }
    });

    // Parse ENGLISH
    const sectionsEn = enHtml.split(/<h2 /i).slice(1);
    sectionsEn.forEach(secStr => {
        const cardsMatches = secStr.matchAll(/<a[^>]*class="menu-card"[^>]*>([\s\S]*?)<\/a>/gi);
        for(const match of cardsMatches) {
            const cardInner = match[1];
            const wholeCard = match[0];
            
            let nameAr = '';
            const dataTMatch = wholeCard.match(/data-t=['"]([^'"]+)['"]/);
            if(dataTMatch) nameAr = dataTMatch[1];
            
            let nameEn = '';
            const nameMatch = cardInner.match(/<h3 class="card-name">([^<]+)<\/h3>/);
            if(nameMatch) nameEn = nameMatch[1].replace('&amp;', '&');

            let descEn = '';
            const descMatch = wholeCard.match(/data-desc=['"]([^'"]*)['"]/);
            if(descMatch) descEn = descMatch[1];
            
            if(nameAr && nameEn) {
                const existing = localItems.find(i => i.name === nameAr.trim());
                if(existing) {
                    existing.nameEn = nameEn.trim();
                    existing.descEn = descEn.trim();
                }
            }
        }
    });

    console.log(`Parsed ${localItems.length} items from local files.`);

    console.log("Fetching existing data from Firebase...");
    let firebaseData = {};
    try {
        const res = await fetch("https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items.json");
        if(res.ok) {
            firebaseData = await res.json() || {};
        }
    } catch(err) {
        console.error("Error fetching firebase data:", err);
    }

    const firebasePayload = {};
    let matchedCount = 0;

    localItems.forEach((localItem, index) => {
        // Try to find matching item in Firebase to preserve price and status
        // We match by Arabic name
        let existingKey = Object.keys(firebaseData).find(k => firebaseData[k].name === localItem.name);
        
        // If not found by exact string, check old names just in case...
        // e.g., Latte -> Cafe Latte
        if(!existingKey) {
             if(localItem.name === 'هوت تشوكلت') existingKey = Object.keys(firebaseData).find(k => firebaseData[k].name === 'شوكولاتة ساخنة');
             if(localItem.name === 'زهورات') existingKey = Object.keys(firebaseData).find(k => firebaseData[k].name === 'أعشاب');
             if(localItem.name === 'ستيك ساندويش') existingKey = Object.keys(firebaseData).find(k => firebaseData[k].name === 'فيلي ستيك ساندويش');
        }

        if(existingKey) {
             const existingData = firebaseData[existingKey];
             // Preserve status and price
             localItem.price = existingData.price || '';
             localItem.status = existingData.status || 'active';
             matchedCount++;
        }

        const key = `migrated_item_${Date.now()}_${index}`;
        firebasePayload[key] = localItem;
    });

    console.log(`Matched ${matchedCount} items with existing Firebase data (preserved properties).`);

    console.log("Uploading merged data to Firebase...");
    try {
        const response = await fetch("https://tallow-ahbabna-default-rtdb.firebaseio.com/menu_items.json", {
            method: 'PUT',
            body: JSON.stringify(firebasePayload),
            headers: { 'Content-Type': 'application/json' }
        });
        
        if(response.ok) {
            console.log("Migration successful! Firebase is updated.");
        } else {
            console.error("Migration failed:", await response.text());
        }
    } catch(err) {
         console.error("Fetch error:", err);
    }
}

migrate();
