async function getPriceLogs() {
    try {
        const res = await fetch("https://tallow-ahbabna-default-rtdb.firebaseio.com/audit_logs.json");
        const logs = await res.json();
        const priceChanges = Object.values(logs).filter(l => l.action === 'تعديل صنف' && l.snapshot);
        console.log(JSON.stringify(priceChanges, null, 2));
    } catch(e) {
        console.error(e);
    }
}
getPriceLogs();
