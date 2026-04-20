async function recoverPrices() {
    try {
        console.log("Fetching logs...");
        const res = await fetch("https://tallow-ahbabna-default-rtdb.firebaseio.com/audit_logs.json");
        const logs = await res.json();
        if (!logs) { console.log("No logs found."); return; }
        
        const priceMap = {}; // nameAr -> price
        
        Object.values(logs).forEach(log => {
            // Logs from admin.js saveItem look like this:
            // { action: 'تعديل صنف' / 'إضافة صنف', details: 'اسم الصنف: ...', ... }
            if (log.action === 'تعديل صنف' || log.action === 'إضافة صنف') {
                const nameMatch = log.details.match(/اسم الصنف:\s*(.*)/);
                if (nameMatch) {
                    const name = nameMatch[1].trim();
                    // We need to find the price. If the log has a snapshot, it's easy.
                    if (log.snapshot && log.snapshot.price) {
                        priceMap[name] = log.snapshot.price;
                    }
                }
            }
        });
        
        console.log("Recovered prices map:");
        console.log(JSON.stringify(priceMap, null, 2));
    } catch(e) {
        console.error("Error:", e);
    }
}
recoverPrices();
