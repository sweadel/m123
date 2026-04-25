/**
 * js/admin.js v10.5 — النسخة النهائية المعتمدة
 * المجلد: طلو احبابنا (GitHub Repo)
 */

if (localStorage.getItem('admin_auth') !== 'true') window.location.href = 'login.html';

const fbCfg = {
    apiKey: "AIzaSyCwMxgmrfnsme4pgLx00tgjGCo-gQBMUo8",
    authDomain: "tallow-ahbabna.firebaseapp.com",
    projectId: "tallow-ahbabna",
    storageBucket: "tallow-ahbabna.firebasestorage.app",
    messagingSenderId: "1025966646494",
    appId: "1:1025966646494:web:f89373fad63d988f298e4f",
    databaseURL: "https://tallow-ahbabna-default-rtdb.firebaseio.com"
};
if (!firebase.apps.length) firebase.initializeApp(fbCfg);
const db = firebase.database();

const REFS = {
    menu: db.ref('menu_items'),
    cats: db.ref('categories_meta'),
    logs: db.ref('audit_logs'),
    trash: db.ref('deleted_items'),
    design: db.ref('settings/design'),
    home: db.ref('settings/home'),
    feed: db.ref('feedback')
};

let menuItems=[], catItems=[], feedItems=[], editKey=null, editCatKey=null, isSaving=false, activeFilterCat='all';

function navigateTo(id) {
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-view="${id}"]`)?.classList.add('active');
    document.querySelectorAll('.view').forEach(v => { v.style.display='none'; v.classList.remove('active'); });
    const t = document.getElementById(id);
    if(t) { t.style.display='block'; setTimeout(()=>t.classList.add('active'),10); }
    document.getElementById('sidebar')?.classList.remove('open');
}

REFS.menu.on('value', s => { menuItems=[]; if(s.exists()) Object.entries(s.val()).forEach(([k,v])=>menuItems.push({key:k, ...v})); renderTable(); updateStats(); });
REFS.cats.on('value', s => { catItems=[]; if(s.exists()) Object.entries(s.val()).forEach(([k,v])=>catItems.push({id:k, ...v})); catItems.sort((a,b)=>(a.order||0)-(b.order||0)); rebuildSelects(); renderCatTable(); renderTable(); updateStats(); });
REFS.feed.on('value', s => { feedItems=[]; if(s.exists()) Object.entries(s.val()).forEach(([k,v])=>feedItems.push({key:k, ...v})); renderFeedTable(); updateStats(); });
REFS.design.on('value', s => { const d=s.val(); if(d){ if(document.getElementById('d_primary')) document.getElementById('d_primary').value=d.primary; if(document.getElementById('d_bg')) document.getElementById('d_bg').value=d.bg; } });
REFS.home.on('value', s => { const h=s.val(); if(h){ if(document.getElementById('h_video')) document.getElementById('h_video').value=h.video; if(document.getElementById('h_tagline')) document.getElementById('h_tagline').value=h.tagline; } });

function renderTable() {
    const b = document.getElementById('menu-table-body'); if(!b) return;
    const q = (document.getElementById('globalSearch')?.value||'').toLowerCase();
    const filtered = menuItems.filter(i => (activeFilterCat==='all'||i.category===activeFilterCat) && (!q || (i.name||'').toLowerCase().includes(q) || (i.nameEn||'').toLowerCase().includes(q)));
    b.innerHTML = '';
    filtered.forEach(i => {
        const act = i.status!=='inactive';
        let opts = catItems.map(c => `<option value="${c.id}" ${i.category===c.id?'selected':''}>${c.nameAr}</option>`).join('');
        b.innerHTML += `<tr><td><img src="${i.image||'images/tallo-logo.png'}" class="item-thumb"></td><td>${i.name}</td><td><select class="form-control" onchange="quickMoveItem('${i.key}', this.value)">${opts}</select></td><td>${i.price} JD</td><td><button onclick="toggleItem('${i.key}','${i.status}')" class="status-pill ${act?'status-active':'status-hidden'}">${act?'نشط':'مخفي'}</button></td><td><button onclick="editItem('${i.key}')" class="btn-primary">تعديل</button></td></tr>`;
    });
}

function renderCatTable() {
    const b = document.getElementById('cat-table-body'); if(!b) return; b.innerHTML = '';
    catItems.forEach(c => {
        const act = c.status!=='hidden';
        b.innerHTML += `<tr><td>${c.nameAr}</td><td>${c.section}</td><td>${c.order}</td><td><button onclick="toggleCat('${c.id}','${c.status}')" class="status-pill ${act?'status-active':'status-hidden'}">${act?'ظاهر':'مخفي'}</button></td><td><button onclick="editCat('${c.id}')" class="btn-primary">تعديل</button></td></tr>`;
    });
}

function renderFeedTable() {
    const b = document.getElementById('feed-table-body'); if(!b) return; b.innerHTML = '';
    feedItems.reverse().forEach(f => { b.innerHTML += `<tr><td>${new Date(f.timestamp).toLocaleString()}</td><td>${f.name}</td><td>${f.rating}⭐</td><td>${f.message}</td></tr>`; });
}

function saveItem() {
    if(isSaving) return; const name = document.getElementById('itemName').value; if(!name) return; isSaving=true;
    const data = { name, nameEn: document.getElementById('itemNameEn').value, category: document.getElementById('itemCategory').value, price: document.getElementById('itemPrice').value, image: document.getElementById('itemImg').value, desc: document.getElementById('itemDesc').value, descEn: document.getElementById('itemDescEn').value, updatedAt: firebase.database.ServerValue.TIMESTAMP };
    const r = editKey ? REFS.menu.child(editKey) : REFS.menu.push();
    r.set(data).then(() => { closeItemModal(); isSaving=false; });
}

function saveCategory() {
    const name = document.getElementById('catNameAr').value; if(!name) return;
    const data = { nameAr: name, nameEn: document.getElementById('catNameEn').value, section: document.getElementById('catSection').value, order: parseInt(document.getElementById('catOrder').value)||0, icon: document.getElementById('catIcon').value, updatedAt: firebase.database.ServerValue.TIMESTAMP };
    REFS.cats.child(editCatKey || name.toLowerCase().replace(/\s+/g, '-')).update(data).then(closeCatModal);
}

function saveDesignSettings() { REFS.design.update({ primary: document.getElementById('d_primary').value, bg: document.getElementById('d_bg').value }).then(()=>alert('تم الحفظ')); }
function saveHomeSettings() { REFS.home.update({ video: document.getElementById('h_video').value, tagline: document.getElementById('h_tagline').value }).then(()=>alert('تم الحفظ')); }

function quickMoveItem(k, c) { REFS.menu.child(k).update({ category: c }); }
function setFilterCat(id) { activeFilterCat=id; rebuildSelects(); renderTable(); }
function rebuildSelects() {
    const t = document.getElementById('catFilterTabs'); if(!t) return;
    t.innerHTML = `<button class="cat-filter-tab ${activeFilterCat==='all'?'active':''}" onclick="setFilterCat('all')">الكل</button>`;
    catItems.forEach(c => t.innerHTML += `<button class="cat-filter-tab ${activeFilterCat===c.id?'active':''}" onclick="setFilterCat('${c.id}')">${c.nameAr}</button>`);
    const s = document.getElementById('itemCategory'); if(s) s.innerHTML = catItems.map(c => `<option value="${c.id}">${c.nameAr}</option>`).join('');
}

function updateStats() {
    if(document.getElementById('stat-total')) document.getElementById('stat-total').textContent = menuItems.length;
    if(document.getElementById('stat-cats')) document.getElementById('stat-cats').textContent = catItems.length;
    if(document.getElementById('stat-feed')) document.getElementById('stat-feed').textContent = feedItems.length;
}

function openItemModal() { editKey=null; document.getElementById('itemForm').reset(); document.getElementById('itemModal').classList.add('active'); }
function closeItemModal() { document.getElementById('itemModal').classList.remove('active'); }
function openCatModal() { editCatKey=null; document.getElementById('catForm').reset(); document.getElementById('catModal').classList.add('active'); }
function closeCatModal() { document.getElementById('catModal').classList.remove('active'); }
function editItem(k) { const i=menuItems.find(x=>x.key===k); if(!i) return; editKey=k; document.getElementById('itemName').value=i.name; document.getElementById('itemCategory').value=i.category; document.getElementById('itemPrice').value=i.price; document.getElementById('itemImg').value=i.image; document.getElementById('itemDesc').value=i.desc; document.getElementById('itemDescEn').value=i.descEn; document.getElementById('itemModal').classList.add('active'); }
function editCat(id) { const c=catItems.find(x=>x.id===id); if(!c) return; editCatKey=id; document.getElementById('catNameAr').value=c.nameAr; document.getElementById('catSection').value=c.section; document.getElementById('catOrder').value=c.order; document.getElementById('catModal').classList.add('active'); }
function toggleItem(k, s) { REFS.menu.child(k).update({ status: s==='inactive'?'active':'inactive' }); }
function toggleCat(id, s) { REFS.cats.child(id).update({ status: s==='hidden'?'active':'hidden' }); }
function onGlobalSearch() { renderTable(); }
function logout() { localStorage.clear(); window.location.href='login.html'; }
document.addEventListener('DOMContentLoaded', () => { if(document.getElementById('current-user-display')) document.getElementById('current-user-display').textContent = localStorage.getItem('admin_user')||'المدير'; });
