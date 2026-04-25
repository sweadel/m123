/**
 * js/admin.js v7.5 — النسخة النهائية "الخارقة" والمراجعة بالكامل
 * مطعم طلوا حبابنا | Tallo Ahbabna
 * مراجعة شاملة لضمان استقرار النظام 100%
 */

// 1. الأمان والتحقق من الهوية
if (localStorage.getItem('admin_auth') !== 'true') window.location.href = 'login.html';

// 2. إعدادات Firebase لضمان الربط الصحيح
const firebaseConfig = {
    apiKey: "AIzaSyCwMxgmrfnsme4pgLx00tgjGCo-gQBMUo8",
    authDomain: "tallow-ahbabna.firebaseapp.com",
    projectId: "tallow-ahbabna",
    storageBucket: "tallow-ahbabna.firebasestorage.app",
    messagingSenderId: "1025966646494",
    appId: "1:1025966646494:web:f89373fad63d988f298e4f",
    databaseURL: "https://tallow-ahbabna-default-rtdb.firebaseio.com"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// مراجع الجداول بأسماء ثابتة لضمان سلامة الداتا
const REFS = {
    menu: db.ref('menu_items'),
    cats: db.ref('categories_meta'),
    logs: db.ref('audit_logs'),
    trash: db.ref('deleted_items'),
    design: db.ref('settings/design'),
    home: db.ref('settings/home')
};

// متغيرات الحالة (State Management)
let menuItems = [], catItems = [], editKey = null, editCatKey = null, isSaving = false;

// ══════════════ نظام التنقل السلس ══════════════
function navigateTo(id) {
    // تحديث شكل الأزرار
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-view="${id}"]`)?.classList.add('active');
    
    // إخفاء الصفحات السابقة وإظهار المطلوبة
    document.querySelectorAll('.view').forEach(v => { 
        v.style.display = 'none'; 
        v.classList.remove('active'); 
    });
    
    const target = document.getElementById(id);
    if(target) { 
        target.style.display = 'block'; 
        setTimeout(() => target.classList.add('active'), 10); 
    }
    
    // إغلاق المنيو في الموبايل عند التنقل
    document.getElementById('sidebar')?.classList.remove('open');
}

// ══════════════ مراقبة البيانات لحظياً (Live Listeners) ══════════════

// 1. مراقبة الوجبات
REFS.menu.on('value', snap => {
    menuItems = [];
    if(snap.val()) {
        Object.entries(snap.val()).forEach(([k, v]) => menuItems.push({ key: k, ...v }));
    }
    renderTable(); // رسم الجدول
    updateStats(); // تحديث الأرقام
});

// 2. مراقبة الأقسام
REFS.cats.on('value', snap => {
    catItems = [];
    if(snap.val()) {
        Object.entries(snap.val()).forEach(([k, v]) => catItems.push({ id: k, ...v }));
    }
    // ترتيب الأقسام حسب الرقم المدخل
    catItems.sort((a,b) => (a.order || 0) - (b.order || 0));
    renderCatTable(); // رسم جدول الأقسام
    rebuildSelects(); // تحديث القوائم المنسدلة
    updateStats();
});

// 3. مراقبة المحذوفات
REFS.trash.on('value', snap => {
    const b = document.getElementById('trash-table-body');
    if(!b) return; b.innerHTML = '';
    const data = snap.val();
    if(data) {
        Object.entries(data).forEach(([k, v]) => {
            const date = new Date(v.deletedAt).toLocaleString('ar-EG');
            b.innerHTML += `<tr>
                <td>${v.name}</td>
                <td>${date}</td>
                <td>
                    <button class="btn-primary" style="background:#2ecc71; color:#fff; padding:5px 10px;" onclick="restoreItem('${k}')">استعادة</button>
                    <button class="btn-primary" style="background:#e74c3c; color:#fff; padding:5px 10px;" onclick="permanentlyDelete('${k}')">حذف نهائي</button>
                </td>
            </tr>`;
        });
    }
});

// ══════════════ إدارة الوجبات (Menu Logic) ══════════════

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
            <td><img src="${i.image||'images/tallo-logo.png'}" class="item-thumb" onerror="this.src='images/tallo-logo.png'"></td>
            <td><div class="item-name">${i.name}</div><div class="item-en">${i.nameEn||''}</div></td>
            <td><span class="badge-cat">${i.category||'—'}</span></td>
            <td style="color:var(--gold); font-weight:bold;">${i.price} JD</td>
            <td><button onclick="toggleItem('${i.key}','${i.status}')" class="status-pill ${active?'status-active':'status-hidden'}">${active?'نشط':'مخفي'}</button></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="btn-primary" style="padding:6px 10px;" onclick="editItem('${i.key}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-primary" style="background:rgba(231,76,60,0.1); color:#e74c3c; padding:6px 10px;" onclick="deleteItem('${i.key}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    });
}

function saveItem() {
    if(isSaving) return;
    const name = document.getElementById('itemName').value.trim();
    if(!name) return alert('يرجى إدخال اسم الوجبة');

    const data = {
        name,
        nameEn:   document.getElementById('itemNameEn').value.trim(),
        category: document.getElementById('itemCategory').value,
        price:    document.getElementById('itemPrice').value.trim(),
        image:    document.getElementById('itemImg').value.trim(),
        desc:     document.getElementById('itemDesc').value.trim(),
        updatedAt: Date.now()
    };

    isSaving = true;
    const ref = editKey ? REFS.menu.child(editKey) : REFS.menu.push();
    ref.set(data).then(() => {
        closeItemModal();
        log(editKey?'تعديل وجبة':'إضافة وجبة', name);
        alert('تم الحفظ بنجاح ✓');
    }).finally(() => isSaving = false);
}

function deleteItem(k) {
    if(!confirm('هل أنت متأكد من نقل هذا الصنف لسلة المحذوفات؟')) return;
    const i = menuItems.find(x => x.key === k);
    REFS.trash.push({...i, deletedAt: Date.now()}).then(() => {
        REFS.menu.child(k).remove();
        log('حذف وجبة', i.name);
    });
}

// ══════════════ إدارة الأقسام (Category Logic) ══════════════

function renderCatTable() {
    const b = document.getElementById('cat-table-body');
    if(!b) return; b.innerHTML = '';
    catItems.forEach(c => {
        const active = c.status !== 'hidden';
        b.innerHTML += `<tr>
            <td><b>${c.nameAr}</b></td>
            <td>${c.nameEn||'—'}</td>
            <td>${c.section||'arabic'}</td>
            <td><button onclick="toggleCat('${c.id}','${c.status}')" class="status-pill ${active?'status-active':'status-hidden'}">${active?'ظاهر':'مخفي'}</button></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="btn-primary" onclick="editCat('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-primary" style="background:rgba(231,76,60,0.1); color:#e74c3c;" onclick="deleteCat('${c.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    });
}

function saveCategory() {
    const name = document.getElementById('catNameAr').value.trim();
    if(!name) return alert('يرجى إدخال اسم القسم');
    
    const data = {
        nameAr: name,
        nameEn:  document.getElementById('catNameEn').value.trim(),
        section: document.getElementById('catSection').value,
        order:   parseInt(document.getElementById('catOrder').value) || 0,
        icon:    document.getElementById('catIcon').value.trim(),
        updatedAt: Date.now()
    };

    // نستخدم الاسم كـ ID في حال الإضافة لضمان سهولة التعرف عليه
    const id = editCatKey || name.toLowerCase().replace(/\s+/g, '-');
    REFS.cats.child(id).update(data).then(() => {
        closeCatModal();
        log('حفظ قسم', name);
        alert('تم حفظ القسم بنجاح ✓');
    });
}

// ══════════════ وظائف الاستعادة والحذف النهائي ══════════════

function restoreItem(k) {
    REFS.trash.child(k).once('value', snap => {
        const data = snap.val();
        const { deletedAt, ...rest } = data;
        REFS.menu.push(rest).then(() => REFS.trash.child(k).remove());
    });
}

function permanentlyDelete(k) {
    if(!confirm('سيتم الحذف نهائياً، هل أنت متأكد؟')) return;
    REFS.trash.child(k).remove();
}

// ══════════════ وظائف مساعدة ══════════════

function rebuildSelects() {
    const s = document.getElementById('itemCategory'), f = document.getElementById('filterCategory');
    const options = catItems.map(c => `<option value="${c.id}">${c.nameAr}</option>`).join('');
    if(s) s.innerHTML = '<option disabled selected>اختر القسم...</option>' + options;
    if(f) f.innerHTML = '<option value="all">كل الأقسام</option>' + options;
}

function updateStats() {
    const t = document.getElementById('stat-total'), c = document.getElementById('stat-cats');
    if(t) t.textContent = menuItems.length;
    if(c) c.textContent = catItems.length;
}

function log(a, d) {
    const user = localStorage.getItem('admin_user') || 'المدير';
    REFS.logs.push({ action: a, details: d, user, timestamp: Date.now() });
}

// وظائف فتح وإغلاق النوافذ (Modals)
function openItemModal() { editKey = null; document.getElementById('itemForm').reset(); document.getElementById('itemModal').classList.add('active'); }
function closeItemModal() { document.getElementById('itemModal').classList.remove('active'); }
function openCatModal() { editCatKey = null; document.getElementById('catForm').reset(); document.getElementById('catModal').classList.add('active'); }
function closeCatModal() { document.getElementById('catModal').classList.remove('active'); }

// وظائف التعديل السريع
function editItem(k) {
    const i = menuItems.find(x => x.key === k);
    if(!i) return; editKey = k;
    document.getElementById('itemName').value = i.name;
    document.getElementById('itemNameEn').value = i.nameEn||'';
    document.getElementById('itemCategory').value = i.category||'';
    document.getElementById('itemPrice').value = i.price;
    document.getElementById('itemImg').value = i.image||'';
    document.getElementById('itemDesc').value = i.desc||'';
    document.getElementById('itemModal').classList.add('active');
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

function toggleItem(k, s) { REFS.menu.child(k).update({ status: s === 'inactive' ? 'active' : 'inactive' }); }
function toggleCat(id, s) { REFS.cats.child(id).update({ status: s === 'hidden' ? 'active' : 'hidden' }); }
function onGlobalSearch() { renderTable(); }
function logout() { localStorage.clear(); window.location.href='login.html'; }

// عند التشغيل
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-user-display').textContent = localStorage.getItem('admin_user') || 'المدير';
});
