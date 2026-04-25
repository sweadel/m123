/**
 * js/admin.js v7.0 — نظام التحكم الشامل والموثق
 * مطعم طلوا حبابنا | Tallo Ahbabna
 */

// 1. فحص الأمان (هل المدير مسجل دخول؟)
if (localStorage.getItem('admin_auth') !== 'true') window.location.href = 'login.html';

// 2. إعدادات Firebase
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

// مراجع الجداول في قاعدة البيانات
const REFS = {
    menu: db.ref('menu_items'),
    cats: db.ref('categories_meta'),
    logs: db.ref('audit_logs'),
    trash: db.ref('deleted_items')
};

// متغيرات تخزين البيانات المؤقتة
let menuItems = [], catItems = [], editKey = null, editCatKey = null;

// ══════════════ التنقل بين الأقسام ══════════════
function navigateTo(id) {
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-view="${id}"]`)?.classList.add('active');
    document.querySelectorAll('.view').forEach(v => { v.style.display = 'none'; v.classList.remove('active'); });
    const target = document.getElementById(id);
    if(target) { target.style.display = 'block'; target.classList.add('active'); }
}

// ══════════════ مراقبة البيانات لحظياً ══════════════

// مراقبة الوجبات
REFS.menu.on('value', snap => {
    menuItems = [];
    if(snap.val()) Object.entries(snap.val()).forEach(([k, v]) => menuItems.push({ key: k, ...v }));
    renderTable();
    updateStats();
});

// مراقبة الأقسام
REFS.cats.on('value', snap => {
    catItems = [];
    if(snap.val()) Object.entries(snap.val()).forEach(([k, v]) => catItems.push({ id: k, ...v }));
    catItems.sort((a,b) => (a.order||0) - (b.order||0));
    renderCatTable();
    rebuildSelects();
    updateStats();
});

// ══════════════ إدارة الوجبات (Menu) ══════════════

function renderTable() {
    const b = document.getElementById('menu-table-body');
    if(!b) return;
    const q = (document.getElementById('globalSearch')?.value || '').toLowerCase();
    const f = document.getElementById('filterCategory')?.value || 'all';
    const filtered = menuItems.filter(i => {
        const mt = !q || (i.name||'').toLowerCase().includes(q) || (i.nameEn||'').toLowerCase().includes(q);
        const mc = f === 'all' || i.category === f;
        return mt && mc;
    });
    b.innerHTML = '';
    filtered.forEach(i => {
        const active = i.status !== 'inactive';
        b.innerHTML += `<tr>
            <td><img src="${i.image||'images/tallo-logo.png'}" class="item-thumb"></td>
            <td><div class="item-name">${i.name}</div><div class="item-en">${i.nameEn||''}</div></td>
            <td>${i.category||'—'}</td>
            <td style="color:var(--gold); font-weight:bold;">${i.price} JD</td>
            <td><button onclick="toggleItem('${i.key}','${i.status}')" class="status-pill ${active?'status-active':'status-hidden'}">${active?'نشط':'مخفي'}</button></td>
            <td>
                <button class="btn-primary" onclick="editItem('${i.key}')">تعديل</button>
                <button class="btn-primary" style="background:#e74c3c;" onclick="deleteItem('${i.key}')">حذف</button>
            </td>
        </tr>`;
    });
}

function openItemModal() { editKey = null; document.getElementById('itemForm').reset(); document.getElementById('itemModal').classList.add('active'); }
function closeItemModal() { document.getElementById('itemModal').classList.remove('active'); }

function saveItem() {
    const name = document.getElementById('itemName').value.trim();
    if(!name) return alert('أدخل الاسم');
    const data = {
        name, nameEn: document.getElementById('itemNameEn').value,
        category: document.getElementById('itemCategory').value,
        price: document.getElementById('itemPrice').value,
        image: document.getElementById('itemImg').value,
        desc: document.getElementById('itemDesc').value,
        updatedAt: Date.now()
    };
    const ref = editKey ? REFS.menu.child(editKey) : REFS.menu.push();
    ref.set(data).then(() => { closeItemModal(); log('حفظ وجبة', name); });
}

function editItem(k) {
    const i = menuItems.find(x => x.key === k);
    if(!i) return; editKey = k;
    document.getElementById('itemName').value = i.name;
    document.getElementById('itemNameEn').value = i.nameEn||'';
    document.getElementById('itemCategory').value = i.category||'';
    document.getElementById('itemPrice').value = i.price||'';
    document.getElementById('itemImg').value = i.image||'';
    document.getElementById('itemDesc').value = i.desc||'';
    document.getElementById('itemModal').classList.add('active');
}

function toggleItem(k, s) { REFS.menu.child(k).update({ status: s === 'inactive' ? 'active' : 'inactive' }); }

function deleteItem(k) {
    if(!confirm('حذف الوجبة؟')) return;
    const i = menuItems.find(x => x.key === k);
    REFS.trash.push({...i, type:'item', deletedAt:Date.now()}).then(() => REFS.menu.child(k).remove());
}

// ══════════════ إدارة الأقسام (Categories) ══════════════

function renderCatTable() {
    const b = document.getElementById('cat-table-body');
    if(!b) return; b.innerHTML = '';
    catItems.forEach(c => {
        const active = c.status !== 'hidden';
        b.innerHTML += `<tr>
            <td>${c.nameAr}</td>
            <td>${c.nameEn||'—'}</td>
            <td>${c.section||'—'}</td>
            <td><button onclick="toggleCat('${c.id}','${c.status}')" class="status-pill ${active?'status-active':'status-hidden'}">${active?'ظاهر':'مخفي'}</button></td>
            <td>
                <button class="btn-primary" onclick="editCat('${c.id}')">تعديل</button>
                <button class="btn-primary" style="background:#e74c3c;" onclick="deleteCat('${c.id}')">حذف</button>
            </td>
        </tr>`;
    });
}

function openCatModal() { editCatKey = null; document.getElementById('catForm').reset(); document.getElementById('catModal').classList.add('active'); }
function closeCatModal() { document.getElementById('catModal').classList.remove('active'); }

function saveCategory() {
    const name = document.getElementById('catNameAr').value.trim();
    if(!name) return alert('أدخل اسم القسم');
    const data = {
        nameAr: name, nameEn: document.getElementById('catNameEn').value,
        section: document.getElementById('catSection').value,
        order: parseInt(document.getElementById('catOrder').value) || 0,
        icon: document.getElementById('catIcon').value,
        updatedAt: Date.now()
    };
    // إذا كان تعديلاً نستخدم المفتاح الحالي، إذا كان جديداً ننشئ كود فريد من الاسم
    const id = editCatKey || name.toLowerCase().replace(/\s+/g, '-');
    REFS.cats.child(id).update(data).then(() => { closeCatModal(); log('حفظ قسم', name); });
}

function editCat(id) {
    const c = catItems.find(x => x.id === id);
    if(!c) return; editCatKey = id;
    document.getElementById('catNameAr').value = c.nameAr;
    document.getElementById('catNameEn').value = c.nameEn||'';
    document.getElementById('catSection').value = c.section||'arabic';
    document.getElementById('catOrder').value = c.order||0;
    document.getElementById('catIcon').value = c.icon||'';
    document.getElementById('catModal').classList.add('active');
}

function toggleCat(id, s) { REFS.cats.child(id).update({ status: s === 'hidden' ? 'active' : 'hidden' }); }

function deleteCat(id) {
    if(!confirm('حذف القسم؟ سيختفي من المنيو تماماً!')) return;
    REFS.cats.child(id).remove().then(() => log('حذف قسم', id));
}

// ══════════════ وظائف عامة ══════════════

function rebuildSelects() {
    const s = document.getElementById('itemCategory'), f = document.getElementById('filterCategory');
    if(s) { s.innerHTML = '<option disabled selected>اختر...</option>'; catItems.forEach(c => s.innerHTML += `<option value="${c.id}">${c.nameAr}</option>`); }
    if(f) { f.innerHTML = '<option value="all">الكل</option>'; catItems.forEach(c => f.innerHTML += `<option value="${c.id}">${c.nameAr}</option>`); }
}

function updateStats() {
    if(document.getElementById('stat-total')) document.getElementById('stat-total').textContent = menuItems.length;
    if(document.getElementById('stat-cats')) document.getElementById('stat-cats').textContent = catItems.length;
}

function log(a, d) { REFS.logs.push({ action: a, details: d, user: localStorage.getItem('admin_user')||'المدير', timestamp: Date.now() }); }
function onGlobalSearch() { renderTable(); }
function logout() { localStorage.clear(); window.location.href='login.html'; }
document.addEventListener('DOMContentLoaded', () => { document.getElementById('current-user-display').textContent = localStorage.getItem('admin_user')||'المدير'; });
