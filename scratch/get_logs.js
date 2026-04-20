async function getLogs() {
    try {
        const res = await fetch("https://tallow-ahbabna-default-rtdb.firebaseio.com/audit_logs.json");
        const logs = await res.json();
        console.log(JSON.stringify(logs, null, 2));
    } catch(e) {
        console.error(e);
    }
}
getLogs();
