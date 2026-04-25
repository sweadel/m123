/**
 * js/admin.js v11.5 — النسخة الذهبية النهائية
 * مطعم طلو احبابنا | Tallo Ahbabna
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

// ══════════════ المراقبة والتحميل ══════════════

REFS.menu.on('value', snap => {
    menuItems = [];
    if(snap.exists()) Object.entries(snap.val()).forEach(([k,v]) => menuItems.push({key:k, ...v}));
    renderTable();
    renderCatTable();
    updateStats();
});

REFS.cats.on('value', snap => {
    catItems = [];
    if(snap.exists()) Object.entries(snap.val()).forEach(([k,v]) => catItems.push({id:k, ...v}));
    catItems.sort((a,b) => (a.order||0) - (b.order||0));
    rebuildSelects();
    renderCatTable();
    renderTable();
    updateStats();
});

REFS.feed.on('value', s => { 
    feedItems=[]; if(s.exists()) Object.entries(s.val()).forEach(([k,v])=>feedItems.push({key:k, ...v})); 
    renderFeedTable(); 
    updateStats(); 
});

// ══════════════ إدارة المنيو ══════════════

function renderTable() {
    const b = document.getElementById('menu-table-body');
    if(!b) return;
    const q = (document.getElementById('globalSearch')?.value || '').toLowerCase();
    const filtered = menuItems.filter(i => (activeFilterCat==='all'||i.category===activeFilterCat) && (!q || (i.name||'').toLowerCase().includes(q) || (i.nameEn||'').toLowerCase().includes(q)));
    b.innerHTML = '';
    filtered.forEach(i => {
        const act = i.status!=='inactive';
        let opts = catItems.map(c => `<option value="${c.id}" ${i.category===c.id?'selected':''}>${c.nameAr}</option>`).join('');
        b.innerHTML += `<tr>
            <td><img src="${i.image||'images/tallo-logo.png'}" class="item-thumb" onerror="this.src='images/tallo-logo.png'"></td>
            <td><b>${i.name}</b><br><small>${i.nameEn||''}</small></td>
            <td><select class="form-control" onchange="quickMoveItem('${i.key}', this.value)">${opts}</select></td>
            <td style="color:var(--gold); font-weight:bold;">${i.price} JD</td>
            <td><button onclick="toggleItem('${i.key}','${i.status}')" class="status-pill ${act?'status-active':'status-hidden'}">${act?'نشط':'مخفي'}</button></td>
            <td><div style="display:flex; gap:5px;">
                <button class="btn-primary" style="padding:6px;" onclick="editItem('${i.key}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-primary" style="background:rgba(231,76,60,0.1); color:#e74c3c; padding:6px;" onclick="deleteItem('${i.key}')"><i class="fa-solid fa-trash"></i></button>
            </div></td></tr>`;
    });
}

function saveItem() {
    if(isSaving) return; 
    const name = document.getElementById('itemName').value.trim();
    const category = document.getElementById('itemCategory').value;
    if(!name || !category) return alert('يرجى ملء الاسم والقسم');
    isSaving=true;
    const data = { 
        name, nameEn: document.getElementById('itemNameEn').value.trim(), 
        category: category, 
        price: document.getElementById('itemPrice').value.trim(), 
        image: document.getElementById('itemImg').value.trim(), 
        desc: document.getElementById('itemDesc').value.trim(), 
        descEn: document.getElementById('itemDescEn').value.trim(), 
        updatedAt: firebase.database.ServerValue.TIMESTAMP 
    };
    const r = editKey ? REFS.menu.child(editKey) : REFS.menu.push();
    r.set(data).then(() => { closeItemModal(); log(editKey?'تعديل وجبة':'إضافة وجبة', name); }).finally(() => isSaving=false);
}

// ══════════════ إدارة الأقسام ══════════════

function renderCatTable() {
    const b = document.getElementById('cat-table-body');
    if(!b) return; b.innerHTML = '';
    catItems.forEach(c => {
        const act = c.status !== 'hidden';
        const itemCount = menuItems.filter(i => i.category === c.id).length;
        b.innerHTML += `<tr>
            <td style="font-size:1.2rem; color:var(--gold);"><i class="fa-solid ${c.icon || 'fa-folder'}"></i></td>
            <td><b>${c.nameAr}</b><br><small>${c.nameEn || ''}</small></td>
            <td><span class="status-pill" style="background:rgba(255,255,255,0.05); color:#ccc;">${c.section || '---'}</span></td>
            <td><b>${itemCount}</b> وجبة</td>
            <td>${c.order || 0}</td>
            <td><button onclick="toggleCat('${c.id}','${c.status}')" class="status-pill ${act?'status-active':'status-hidden'}">${act?'ظاهر':'مخفي'}</button></td>
            <td><div style="display:flex; gap:5px;">
                <button class="btn-primary" style="padding:6px;" onclick="editCat('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-primary" style="background:rgba(231,76,60,0.1); color:#e74c3c; padding:6px;" onclick="deleteCat('${c.id}')"><i class="fa-solid fa-trash"></i></button>
            </div></td></tr>`;
    });
}

function saveCategory() {
    const name = document.getElementById('catNameAr').value.trim();
    if(!name) return alert('أدخل الاسم العربي');
    const data = {
        nameAr: name, nameEn: document.getElementById('catNameEn').value.trim(),
        section: document.getElementById('catSection').value,
        order: parseInt(document.getElementById('catOrder').value) || 0,
        icon: document.getElementById('catIcon').value.trim(),
        descAr: document.getElementById('catDescAr').value.trim(),
        descEn: document.getElementById('catDescEn').value.trim(),
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    const id = editCatKey || name.toLowerCase().replace(/\s+/g, '-');
    REFS.cats.child(id).update(data).then(() => { closeCatModal(); log('إدارة الأقسام', `حفظ القسم: ${name}`); });
}

// ══════════════ وظائف مساعدة ══════════════

function quickMoveItem(k, c) { REFS.menu.child(k).update({ category: c }).then(() => log('نقل سريع', 'تغيير قسم الوجبة')); }
function rebuildSelects() {
    const t = document.getElementById('catFilterTabs'), s = document.getElementById('itemCategory'); 
    if(t) {
        t.innerHTML = `<button class="cat-filter-tab ${activeFilterCat==='all'?'active':''}" onclick="setFilterCat('all')">الكل</button>`;
        catItems.forEach(c => t.innerHTML += `<button class="cat-filter-tab ${activeFilterCat===c.id?'active':''}" onclick="setFilterCat('${c.id}')">${c.nameAr}</button>`);
    }
    if(s) s.innerHTML = '<option value="" disabled selected>اختر القسم...</option>' + catItems.map(c => `<option value="${c.id}">${c.nameAr}</option>`).join('');
}

function updateStats() {
    if(document.getElementById('stat-total')) document.getElementById('stat-total').textContent = menuItems.length;
    if(document.getElementById('stat-cats')) document.getElementById('stat-cats').textContent = catItems.length;
    if(document.getElementById('stat-feed')) document.getElementById('stat-feed').textContent = feedItems.length;
}

function log(a, d) { REFS.logs.push({ action: a, details: d, user: localStorage.getItem('admin_user')||'المدير', timestamp: firebase.database.ServerValue.TIMESTAMP }); }
function logout() { localStorage.clear(); window.location.href='login.html'; }
function setFilterCat(id) { activeFilterCat=id; renderTable(); }
function openItemModal() { editKey=null; document.getElementById('itemForm').reset(); document.getElementById('itemModal').classList.add('active'); }
function closeItemModal() { document.getElementById('itemModal').classList.remove('active'); }
function openCatModal() { editCatKey=null; document.getElementById('catForm').reset(); document.getElementById('catModal').classList.add('active'); }
function closeCatModal() { document.getElementById('catModal').classList.remove('active'); }
function editItem(k) { const i=menuItems.find(x=>x.key===k); if(!i) return; editKey=k; document.getElementById('itemName').value=i.name; document.getElementById('itemNameEn').value=i.nameEn||''; document.getElementById('itemCategory').value=i.category; document.getElementById('itemPrice').value=i.price; document.getElementById('itemImg').value=i.image; document.getElementById('itemDesc').value=i.desc; document.getElementById('itemDescEn').value=i.descEn; document.getElementById('itemModal').classList.add('active'); }
function editCat(id) { const c=catItems.find(x=>x.id===id); if(!c) return; editCatKey=id; document.getElementById('catNameAr').value=c.nameAr; document.getElementById('catNameEn').value=c.nameEn||''; document.getElementById('catSection').value=c.section; document.getElementById('catOrder').value=c.order; document.getElementById('catIcon').value=c.icon; document.getElementById('catDescAr').value=c.descAr||''; document.getElementById('catDescEn').value=c.descEn||''; document.getElementById('catModal').classList.add('active'); }
function deleteItem(k) { if(confirm('حذف؟')) { const i=menuItems.find(x=>x.key===k); REFS.trash.push({...i, deletedAt: Date.now()}).then(()=>REFS.menu.child(k).remove()); } }
function deleteCat(id) { if(confirm('حذف القسم؟')) REFS.cats.child(id).remove(); }
function toggleItem(k, s) { REFS.menu.child(k).update({ status: s==='inactive'?'active':'inactive' }); }
function toggleCat(id, s) { REFS.cats.child(id).update({ status: s==='hidden'?'active':'hidden' }); }
function onGlobalSearch() { renderTable(); }
function renderFeedTable() { const b = document.getElementById('feed-table-body'); if(!b) return; b.innerHTML = ''; feedItems.reverse().forEach(f => { b.innerHTML += `<tr><td>${new Date(f.timestamp).toLocaleString()}</td><td>${f.name}</td><td>${f.rating}⭐</td><td>${f.message}</td></tr>`; }); }
document.addEventListener('DOMContentLoaded', () => { if(document.getElementById('current-user-display')) document.getElementById('current-user-display').textContent = localStorage.getItem('admin_user')||'المدير'; });
