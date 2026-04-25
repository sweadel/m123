/**
 * js/admin.js v6.0 — النسخة الكاملة الفخمة (Luxury Pro)
 * مطعم طلوا حبابنا | Tallo Ahbabna
 * شرح تفصيلي سطر بسطر لكافة وظائف اللوحة.
 */

// التحقق من صلاحية دخول المستخدم (الأمان)
if (localStorage.getItem('admin_auth') !== 'true') {
    window.location.href = 'login.html'; // العودة لصفحة الدخول إذا لم يكن مرخصاً
}

// مفاتيح الربط مع قاعدة بيانات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCwMxgmrfnsme4pgLx00tgjGCo-gQBMUo8",
    authDomain: "tallow-ahbabna.firebaseapp.com",
    projectId: "tallow-ahbabna",
    storageBucket: "tallow-ahbabna.firebasestorage.app",
    messagingSenderId: "1025966646494",
    appId: "1:1025966646494:web:f89373fad63d988f298e4f",
    databaseURL: "https://tallow-ahbabna-default-rtdb.firebaseio.com"
};

// تهيئة خدمات Firebase في المتصفح
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// مراجع قاعدة البيانات لكافة أقسام اللوحة
const REFS = {
    menu:       db.ref('menu_items'),       // الوجبات
    categories: db.ref('categories_meta'),  // الأقسام
    design:     db.ref('settings/design'),  // التصميم
    home:       db.ref('settings/home'),    // الرئيسية
    feedback:   db.ref('feedback'),         // الآراء
    logs:       db.ref('audit_logs'),       // السجل
    trash:      db.ref('deleted_items'),    // المحذوفات
    users:      db.ref('users'),            // الحسابات
};

// المتغيرات المحلية لتخزين البيانات والتحكم في الحالة
let menuItems      = []; // مصفوفة الوجبات
let categoryItems  = []; // مصفوفة الأقسام
let editingKey     = null; // كود الصنف قيد التعديل
let isSaving       = false; // حالة الحفظ (لمنع التكرار)

/**
 * وظيفة التنقل السلس بين الأقسام (Views) في اللوحة
 */
function navigateTo(viewId) {
    // تحديث شكل الأزرار في القائمة الجانبية
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-view="${viewId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // إخفاء الأقسام غير المطلوبة وإظهار القسم المحدد
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active');
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block';
        targetView.classList.add('active');
    }
}

// ══════════════ مراقبة البيانات (Live Listeners) ══════════════

// مراقبة الوجبات وتحديث الجدول والإحصائيات
REFS.menu.on('value', snapshot => {
    const data = snapshot.val();
    menuItems = [];
    if (data) {
        Object.entries(data).forEach(([key, val]) => {
            menuItems.push({ firebaseKey: key, ...val });
        });
    }
    renderTable();
    updateStats();
});

// مراقبة الأقسام وتحديث القوائم
REFS.categories.on('value', snapshot => {
    const data = snapshot.val();
    categoryItems = [];
    if (data) {
        Object.entries(data).forEach(([key, val]) => {
            categoryItems.push({ id: key, ...val });
        });
        categoryItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    rebuildCategorySelects();
});

// مراقبة السجل (Audit Logs) وعرض آخر 50 حركة
REFS.logs.limitToLast(50).on('value', snapshot => {
    const tbody = document.getElementById('logs-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    const logs = [];
    snapshot.forEach(child => { logs.push(child.val()); });
    logs.reverse().forEach(log => {
        const date = new Date(log.timestamp).toLocaleString('ar-EG');
        tbody.innerHTML += `<tr><td>${date}</td><td>${log.user}</td><td>${log.action}</td><td>${log.details}</td></tr>`;
    });
});

/**
 * تحديث عدادات الإحصائيات في الصفحة الرئيسية للوحة
 */
function updateStats() {
    const total  = menuItems.length;
    const active = menuItems.filter(i => i.status !== 'inactive').length;
    const hidden = total - active;
    const cats   = categoryItems.length;

    if (document.getElementById('stat-total'))  document.getElementById('stat-total').textContent = total;
    if (document.getElementById('stat-active')) document.getElementById('stat-active').textContent = active;
    if (document.getElementById('stat-hidden')) document.getElementById('stat-hidden').textContent = hidden;
    if (document.getElementById('stat-cats'))   document.getElementById('stat-cats').textContent = cats;
}

// ══════════════ إدارة الوجبات (CRUD) ══════════════

function renderTable() {
    const tbody = document.getElementById('menu-table-body');
    if (!tbody) return;
    const q    = (document.getElementById('globalSearch')?.value || '').toLowerCase();
    const catF = document.getElementById('filterCategory')?.value || 'all';

    const filtered = menuItems.filter(item => {
        const matchText = !q || (item.name||'').toLowerCase().includes(q) || (item.nameEn||'').toLowerCase().includes(q);
        const matchCat  = catF === 'all' || item.category === catF;
        return matchText && matchCat;
    });

    tbody.innerHTML = '';
    filtered.forEach(item => {
        const isActive = item.status !== 'inactive';
        tbody.innerHTML += `
            <tr>
                <td><img src="${item.image || 'images/tallo-logo.png'}" class="item-thumb"></td>
                <td>
                    <div class="item-name">${item.name || '—'}</div>
                    <div class="item-en">${item.nameEn || ''}</div>
                </td>
                <td>${item.category || '—'}</td>
                <td style="color:var(--gold); font-weight:bold;">${item.price || '0'} JD</td>
                <td>
                    <button onclick="toggleStatus('${item.firebaseKey}', '${item.status}')" class="status-pill ${isActive ? 'status-active' : 'status-hidden'}">
                        ${isActive ? 'نشط' : 'مخفي'}
                    </button>
                </td>
                <td>
                    <button class="btn-primary" style="padding:6px 12px;" onclick="editItem('${item.firebaseKey}')">تعديل</button>
                </td>
            </tr>
        `;
    });
}

function openItemModal() {
    editingKey = null;
    document.getElementById('itemForm').reset();
    document.getElementById('modalTitle').textContent = 'إضافة صنف جديد';
    document.getElementById('itemModal').classList.add('active');
}

function closeItemModal() {
    document.getElementById('itemModal').classList.remove('active');
}

function saveItem() {
    if (isSaving) return;
    const name = document.getElementById('itemName').value.trim();
    if (!name) return alert('يرجى إدخال اسم الوجبة');

    const itemData = {
        name:     name,
        nameEn:   document.getElementById('itemNameEn').value.trim(),
        category: document.getElementById('itemCategory').value,
        price:    document.getElementById('itemPrice').value.trim(),
        image:    document.getElementById('itemImg').value.trim(),
        desc:     document.getElementById('itemDesc').value.trim(),
        updatedAt: Date.now()
    };

    isSaving = true;
    const saveRef = editingKey ? REFS.menu.child(editingKey) : REFS.menu.push();
    
    saveRef.set(itemData)
        .then(() => {
            closeItemModal();
            logActivity(editingKey ? 'تعديل صنف' : 'إضافة صنف', `الصنف: ${name}`);
            alert('تم الحفظ بنجاح ✓');
        })
        .finally(() => { isSaving = false; });
}

function editItem(key) {
    const item = menuItems.find(i => i.firebaseKey === key);
    if (!item) return;
    editingKey = key;
    document.getElementById('modalTitle').textContent = 'تعديل وجبة: ' + item.name;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemNameEn').value = item.nameEn || '';
    document.getElementById('itemCategory').value = item.category || '';
    document.getElementById('itemPrice').value = item.price || '';
    document.getElementById('itemImg').value = item.image || '';
    document.getElementById('itemDesc').value = item.desc || '';
    document.getElementById('itemModal').classList.add('active');
}

function toggleStatus(key, current) {
    const next = current === 'inactive' ? 'active' : 'inactive';
    REFS.menu.child(key).update({ status: next })
        .then(() => logActivity('تبديل حالة', `صنف ${key} صار ${next}`));
}

// ══════════════ إدارة التصميم (Design Settings) ══════════════

REFS.design.on('value', snap => {
    const d = snap.val();
    if (!d) return;
    if (document.getElementById('d_primaryColor')) document.getElementById('d_primaryColor').value = d.primaryColor || '#C5A022';
    if (document.getElementById('d_pageBg')) document.getElementById('d_pageBg').value = d.pageBg || '#0a0a0a';
    if (document.getElementById('d_logoUrl')) document.getElementById('d_logoUrl').value = d.logoUrl || '';
    if (document.getElementById('d_logoHeight')) document.getElementById('d_logoHeight').value = d.logoHeight || '100';
});

function saveDesign() {
    const data = {
        primaryColor: document.getElementById('d_primaryColor').value,
        pageBg: document.getElementById('d_pageBg').value,
        logoUrl: document.getElementById('d_logoUrl').value,
        logoHeight: document.getElementById('d_logoHeight').value,
        updatedAt: Date.now()
    };
    REFS.design.update(data).then(() => {
        logActivity('تحديث التصميم', 'تغيير ألوان أو شعار المنيو');
        alert('تم حفظ التصميم بنجاح ✓');
    });
}

// ══════════════ وظائف السجل والخروج ══════════════

function logActivity(action, details) {
    const user = localStorage.getItem('admin_user') || 'المدير';
    REFS.logs.push({ action, details, user, timestamp: Date.now() });
}

function onGlobalSearch() { renderTable(); }

function rebuildCategorySelects() {
    const sel = document.getElementById('itemCategory');
    const fill = document.getElementById('filterCategory');
    if (sel) {
        sel.innerHTML = '<option value="" disabled selected>اختر القسم...</option>';
        categoryItems.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.nameAr}</option>`);
    }
    if (fill) {
        fill.innerHTML = '<option value="all">كل الأقسام</option>';
        categoryItems.forEach(c => fill.innerHTML += `<option value="${c.id}">${c.nameAr}</option>`);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-user-display').textContent = localStorage.getItem('admin_user') || 'المدير العام';
});
