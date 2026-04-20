async function checkDB() {
    try {
        const res = await fetch("https://tallow-ahbabna-default-rtdb.firebaseio.com/.json");
        const data = await res.json();
        console.log(Object.keys(data));
        // Check for common backup names
        const possible = ['old', 'backup', 'items', 'menu', 'history'];
        possible.forEach(p => {
            if (data[p]) console.log(`Found node: ${p}`);
        });
    } catch(e) { console.error(e); }
}
checkDB();
