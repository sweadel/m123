/**
 * js/admin.js v5.6 — النسخة الاحترافية الكاملة الموثقة سطر بسطر
 * مطعم طلوا حبابنا | Tallo Ahbabna
 */

// التأكد من أن المدير قام بتسجيل الدخول، وإلا يتم تحويله لصفحة الدخول فوراً
if (localStorage.getItem('admin_auth') !== 'true') {
    window.location.href = 'login.html'; // التحويل لصفحة login.html
}

// تعريف إعدادات الربط مع قاعدة بيانات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCwMxgmrfnsme4pgLx00tgjGCo-gQBMUo8", // مفتاح الوصول
    authDomain: "tallow-ahbabna.firebaseapp.com", // النطاق الخاص بالمشروع
    projectId: "tallow-ahbabna", // معرف المشروع
    storageBucket: "tallow-ahbabna.firebasestorage.app", // مخزن الصور والملفات
    messagingSenderId: "1025966646494", // معرف المراسلات
    appId: "1:1025966646494:web:f89373fad63d988f298e4f", // معرف التطبيق
    databaseURL: "https://tallow-ahbabna-default-rtdb.firebaseio.com" // رابط قاعدة البيانات اللحظية
};

// بدء تشغيل خدمات Firebase في المتصفح إذا لم تكن تعمل
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database(); // الحصول على نسخة من قاعدة البيانات للتعامل معها

// تعريف مراجع الجداول (المسارات) في قاعدة البيانات لتسهيل الوصول إليها
const REFS = {
    menu:       db.ref('menu_items'),       // جدول الأصناف والوجبات
    categories: db.ref('categories_meta'),  // جدول الأقسام (تصنيفات المنيو)
    design:     db.ref('settings/design'),  // جدول ألوان وخطوط المنيو
    home:       db.ref('settings/home'),    // جدول إعدادات الصفحة الرئيسية (فيديو، روابط)
    feedback:   db.ref('feedback'),         // جدول آراء الزبائن الواصلة
    logs:       db.ref('audit_logs'),       // جدول سجل النشاطات (المراقبة)
};

// تعريف متغيرات لتخزين البيانات مؤقتاً داخل المتصفح لزيادة السرعة
let menuItems      = []; // مصفوفة لتخزين الوجبات
let categoryItems  = []; // مصفوفة لتخزين الأقسام
let editingKey     = null; // كود الصنف الذي نعدله حالياً (يكون null عند الإضافة)
let isSaving       = false; // متغير لمنع النقر المزدوج على زر الحفظ

/**
 * وظيفة التنقل بين تابات لوحة التحكم بدون تحميل الصفحة (SPA)
 */
function navigateTo(viewId) {
    // إزالة الحالة النشطة من كل أزرار القائمة الجانبية
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    
    // تفعيل الزر المختار بإضافة كلاس active له
    const activeBtn = document.querySelector(`[data-view="${viewId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // إخفاء كافة الأقسام (Views) أولاً
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none'; // إخفاء
        view.classList.remove('active');
    });

    // إظهار القسم المطلوب فقط وبشكل انسيابي
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block'; // إظهار
        targetView.classList.add('active'); // تفعيل الأنيميشن
    }
}

/**
 * الاستماع اللحظي للتغييرات في جدول الوجبات
 */
REFS.menu.on('value', snapshot => {
    const data = snapshot.val(); // الحصول على البيانات من السناب شوت
    menuItems = []; // تصفير المصفوفة المحلية
    if (data) {
        // تحويل الكائنات إلى مصفوفة وإضافة مفتاح Firebase لكل صنف
        Object.entries(data).forEach(([key, val]) => {
            menuItems.push({ firebaseKey: key, ...val });
        });
    }
    renderTable(); // إعادة رسم الجدول بناءً على البيانات الجديدة
    updateStats(); // تحديث أرقام الإحصائيات في الصفحة الرئيسية للوحة
});

/**
 * الاستماع اللحظي للتغييرات في جدول الأقسام
 */
REFS.categories.on('value', snapshot => {
    const data = snapshot.val(); // جلب البيانات
    categoryItems = []; // تصفير المصفوفة
    if (data) {
        // تحويل البيانات وترتيبها حسب حقل "الترتيب" (order)
        Object.entries(data).forEach(([key, val]) => {
            categoryItems.push({ id: key, ...val });
        });
        categoryItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    rebuildCategorySelects(); // تحديث قائمة الاختيار (dropdown) في المودال
});

/**
 * تحديث عدادات الإحصائيات (الأرقام) المعروضة في اللوحة
 */
function updateStats() {
    const total  = menuItems.length; // إجمالي الأصناف
    const active = menuItems.filter(i => i.status !== 'inactive').length; // النشطة فقط
    const hidden = total - active; // المخفية
    const cats   = categoryItems.length; // عدد الأقسام

    // وضع القيم في عناصر HTML المخصصة لها
    if (document.getElementById('stat-total'))  document.getElementById('stat-total').textContent = total;
    if (document.getElementById('stat-active')) document.getElementById('stat-active').textContent = active;
    if (document.getElementById('stat-hidden')) document.getElementById('stat-hidden').textContent = hidden;
    if (document.getElementById('stat-cats'))   document.getElementById('stat-cats').textContent = cats;
}

/**
 * وظيفة رسم جدول الوجبات في صفحة "قائمة الطعام"
 */
function renderTable() {
    const tbody = document.getElementById('menu-table-body'); // مكان حقن الصفوف
    if (!tbody) return; // الخروج إذا لم يكن العنصر موجوداً

    // الحصول على نص البحث المكتوب والفلتر المختار
    const q    = (document.getElementById('globalSearch')?.value || '').toLowerCase();
    const catF = document.getElementById('filterCategory')?.value || 'all';

    // فلترة الأصناف بناءً على البحث والقسم
    const filtered = menuItems.filter(item => {
        const matchText = !q || (item.name||'').toLowerCase().includes(q) || (item.nameEn||'').toLowerCase().includes(q);
        const matchCat  = catF === 'all' || item.category === catF;
        return matchText && matchCat;
    });

    tbody.innerHTML = ''; // مسح محتوى الجدول الحالي

    // بناء كل صف (tr) لكل وجبة
    filtered.forEach(item => {
        const isActive = item.status !== 'inactive'; // فحص إذا كان الصنف نشطاً أم لا
        const tr = document.createElement('tr'); // إنشاء عنصر صف جديد
        tr.innerHTML = `
            <td><img src="${item.image || 'images/tallo-logo.png'}" class="item-thumb"></td> <!-- صورة مصغرة -->
            <td>
                <div class="item-name">${item.name || '—'}</div> <!-- الاسم بالعربي -->
                <div class="item-en">${item.nameEn || ''}</div> <!-- الاسم بالإنجليزي -->
            </td>
            <td><span style="font-size:0.8rem; color:var(--text-dim);">${item.category || '—'}</span></td> <!-- اسم القسم -->
            <td style="font-weight:bold; color:var(--gold);">${item.price || '—'} JD</td> <!-- السعر بالدينار -->
            <td>
                <!-- زر تبديل الحالة من نشط لمخفي بضغطة واحدة -->
                <button onclick="toggleStatus('${item.firebaseKey}', '${item.status}')" class="status-pill ${isActive ? 'status-active' : 'status-hidden'}" style="border:none; cursor:pointer;">
                    ${isActive ? 'نشط' : 'مخفي'}
                </button>
            </td>
            <td>
                <!-- زر فتح نافذة التعديل لهذا الصنف -->
                <button class="btn-primary" style="padding:6px 12px; font-size:0.8rem; background:rgba(255,255,255,0.05); color:#fff;" onclick="editItem('${item.firebaseKey}')">
                    <i class="fa-solid fa-pen-to-square"></i> تعديل
                </button>
            </td>
        `;
        tbody.appendChild(tr); // إضافة الصف للجدول
    });
}

/**
 * وظيفة فتح نافذة إضافة صنف جديد
 */
function openItemModal() {
    editingKey = null; // تعيين المفتاح لـ null ليعرف النظام أنها إضافة جديدة
    document.getElementById('itemForm').reset(); // تصفير الحقول
    document.getElementById('modalTitle').textContent = 'إضافة صنف جديد'; // تغيير عنوان النافذة
    document.getElementById('itemModal').classList.add('active'); // إظهار النافذة
}

/**
 * وظيفة إغلاق النافذة المنبثقة
 */
function closeItemModal() {
    document.getElementById('itemModal').classList.remove('active'); // إخفاء النافذة
}

/**
 * وظيفة حفظ البيانات (إضافة أو تعديل) في Firebase
 */
function saveItem() {
    if (isSaving) return; // منع الحفظ المزدوج إذا كان هناك عملية جارية
    const name = document.getElementById('itemName').value.trim(); // قراءة الاسم
    if (!name) return alert('يرجى إدخال اسم الوجبة'); // التحقق من وجود اسم

    // تجميع البيانات في كائن واحد (Object)
    const itemData = {
        name:     name,
        nameEn:   document.getElementById('itemNameEn').value.trim(),
        category: document.getElementById('itemCategory').value,
        price:    document.getElementById('itemPrice').value.trim(),
        image:    document.getElementById('itemImg').value.trim(),
        desc:     document.getElementById('itemDesc').value.trim(),
        updatedAt: Date.now() // تسجيل وقت التحديث
    };

    isSaving = true; // بدء عملية الحفظ
    // إذا كان لدينا editingKey يعني سنقوم بتعديل (update)، وإذا لم يوجد سنقوم بإضافة (push)
    const saveRef = editingKey ? REFS.menu.child(editingKey) : REFS.menu.push();
    
    saveRef.set(itemData) // إرسال البيانات لـ Firebase
        .then(() => {
            closeItemModal(); // إغلاق النافذة عند النجاح
            alert('تم الحفظ بنجاح ✓'); // رسالة تأكيد
            logActivity(editingKey ? 'تعديل صنف' : 'إضافة صنف', `الصنف: ${name}`); // تسجيل الحركة في السجل
        })
        .catch(err => alert('خطأ: ' + err.message)) // عرض الخطأ إن وجد
        .finally(() => { isSaving = false; }); // إنهاء حالة الحفظ
}

/**
 * وظيفة جلب بيانات الصنف لغرض التعديل
 */
function editItem(key) {
    const item = menuItems.find(i => i.firebaseKey === key); // البحث عن الوجبة في المصفوفة
    if (!item) return;

    editingKey = key; // تعيين المفتاح ليتم استخدامه في وظيفة الحفظ
    document.getElementById('modalTitle').textContent = 'تعديل وجبة: ' + item.name; // عنوان النافذة
    document.getElementById('itemName').value     = item.name || ''; // تعبئة الاسم بالعربي
    document.getElementById('itemNameEn').value   = item.nameEn || ''; // تعبئة الاسم بالإنجليزي
    document.getElementById('itemCategory').value = item.category || ''; // اختيار القسم
    document.getElementById('itemPrice').value    = item.price || ''; // تعبئة السعر
    document.getElementById('itemImg').value      = item.image || ''; // تعبئة رابط الصورة
    document.getElementById('itemDesc').value     = item.desc || ''; // تعبئة الوصف

    document.getElementById('itemModal').classList.add('active'); // فتح النافذة
}

/**
 * وظيفة سريعة لتبديل حالة الصنف (إخفاء/إظهار)
 */
function toggleStatus(key, currentStatus) {
    const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive'; // عكس الحالة الحالية
    REFS.menu.child(key).update({ status: newStatus }) // تحديث في Firebase
        .then(() => logActivity('تغيير حالة', `تحويل حالة صنف إلى ${newStatus}`)); // تسجيل الحركة
}

/**
 * وظيفة تسجيل الحركات الإدارية للمراقبة (Audit Log)
 */
function logActivity(action, details) {
    const user = localStorage.getItem('admin_user') || 'المدير'; // من قام بالحركة؟
    REFS.logs.push({
        action: action, // ما هو الفعل؟
        details: details, // تفاصيل الفعل
        user: user, // المستخدم
        timestamp: Date.now() // الوقت
    });
}

/**
 * وظيفة تحديث قائمة الأقسام المنسدلة في المودال والفلتر
 */
function rebuildCategorySelects() {
    const sel = document.getElementById('itemCategory'); // قائمة المودال
    const fillCat = document.getElementById('filterCategory'); // قائمة الفلترة
    if (sel) {
        sel.innerHTML = '<option value="" disabled selected>اختر القسم...</option>';
        categoryItems.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.nameAr}</option>`);
    }
    if (fillCat) {
        fillCat.innerHTML = '<option value="all">كل الأقسام</option>';
        categoryItems.forEach(c => fillCat.innerHTML += `<option value="${c.id}">${c.nameAr}</option>`);
    }
}

/**
 * وظيفة حفظ إعدادات الصفحة الرئيسية (فيديو، روابط)
 */
function saveHomeSettings() {
    const data = {
        homeVideo:   document.getElementById('h_video').value,
        homeTagline: document.getElementById('h_tagline').value,
        whatsapp:    document.getElementById('h_whatsapp').value,
        instagram:   document.getElementById('h_instagram').value,
        updatedAt:   Date.now()
    };
    REFS.home.update(data).then(() => alert('تم حفظ إعدادات الصفحة الرئيسية ✓'));
}

/**
 * عند تحميل الصفحة بالكامل
 */
document.addEventListener('DOMContentLoaded', () => {
    // عرض اسم المستخدم المسجل في الجزء العلوي من اللوحة
    const user = localStorage.getItem('admin_user') || 'المدير العام';
    if (document.getElementById('current-user-display')) {
        document.getElementById('current-user-display').textContent = user;
    }
});

/**
 * وظيفة البحث السريع مع تأخير بسيط للأداء (Debounce)
 */
let searchTimeout;
function onGlobalSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        renderTable();
    }, 250); // البحث يتم بعد 250 جزء من الثانية من التوقف عن الكتابة
}

/**
 * وظيفة تسجيل الخروج
 */
function logout() {
    localStorage.removeItem('admin_auth'); // مسح رمز الدخول
    localStorage.removeItem('admin_user'); // مسح اسم المستخدم
    window.location.href = 'login.html'; // العودة لصفحة تسجيل الدخول
}
