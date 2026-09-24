# نظام إدارة محل الخياطة (Tailor Shop Management System)
### مخيطة حضرموت - نظام سحابي متكامل لتفصيل الأثواب والمقاسات والعملاء

نظام ويب متطور وسريع، مصمم خصيصاً لأصحاب وموظفي محلات الخياطة الرجالية وتفصيل الدشاديش والأثواب. يركز التطبيق على السهولة الفائقة، دعم اللغة العربية بالكامل (RTL)، والتوافق التام مع الهواتف الذكية والأجهزة اللوحية دون الحاجة لخادم تقليدي (Serverless).

---

## 🚀 التقنيات المستخدمة (Tech Stack)

### الواجهة الأمامية (Frontend)
- **React 19** مع **Vite 8**
- **TypeScript** لضمان دقة الأنواع واستقرار الكود
- **Tailwind CSS v4** لتصميم عصري وسريع ومخصص للعربية
- **React Router v7** للتنقل بين الصفحات وحماية المسارات
- **TanStack Query (React Query v5)** لإدارة التخزين المؤقت وحالة الخادم
- **React Hook Form** + **Zod** للتحقق من صحة المدخلات باللغة العربية
- **Lucide React** لأيقونات واضحة وسريعة التفاعل

### الواجهة الخلفية وقاعدة البيانات (Backend & Database)
- **Supabase** (PostgreSQL + Auth + Row Level Security)
- **معمارية متعددة المتاجر (Multi-Tenant)** بعزل كامل لكل متجر
- **سياسات أمان صارمة (RLS)** تمنع الوصول للبيانات إلا للمتجر المصرح له
- نظام ترقيم تسلسلي تلقائي للطلبات `ORD-YYYY-XXXX`

### الاستضافة والنشر (Deployment)
- **Cloudflare Pages** (أداء فائق واستضافة مجانية حول العالم بدون VPS)
- **GitHub Repository** لإدارة الإصدارات والـ CI/CD التلقائي

---

## 📁 هيكلية المشروع (Project Architecture)

```
tailor-shop/
├── public/                 # الملفات الثابتة والأيقونات
├── src/
│   ├── components/         # المكونات المشتركة
│   │   └── ui/             # مكونات واجهة المستخدم (Button, Input, Card, Badge, Modal, Alert)
│   ├── layouts/            # تخطيط الصفحات (AppLayout, AuthLayout)
│   ├── hooks/              # خطافات React المخصصة (useAuth, ...)
│   ├── lib/                # عميل Supabase وإدارة المصادقة
│   ├── pages/              # صفحات التطبيق الرئيسية
│   │   ├── auth/           # تسجيل الدخول، استعادة كلمة المرور
│   │   ├── customers/      # إدارة العملاء
│   │   ├── orders/         # الطلبات والمتابعة
│   │   ├── measurements/   # بطاقات المقاسات
│   │   └── settings/       # الإعدادات وتخصيص اسم المحل
│   ├── routes/             # مسارات التطبيق المحمية والمسارات العامة
│   ├── schemas/            # مخططات التحقق من Zod
│   ├── types/              # تعريفات الأنواع وقواعد البيانات (TypeScript)
│   └── utils/              # الدوال المساعدة (cn, formatters)
└── supabase/
    └── migrations/         # ملفات ترحيل قاعدة البيانات SQL الموثقة
        ├── 001_initial_schema.sql  # المخطط العام وسياسات RLS والدوال
        └── 002_seed_data.sql       # بيانات تجريبية للتطوير باللغة العربية
```

---

## 🛠️ التشغيل والتطوير المحلي (Local Development)

### 1. المتطلبات الأساسية
- تثبيت **Node.js** (الإصدار 18 أو أحدث)
- مدير الحزم **npm**

### 2. تثبيت الحزم
```bash
git clone <repository-url>
cd tailor-shop
npm install
```

### 3. إعداد المتغيرات البيئية (Environment Variables)
قم بنسخ ملف المتغيرات البيئية:
```bash
cp .env.example .env
```
وقم بتعبئة بيانات مشروع Supabase الخاص بك:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```
> **ملاحظة:** إذا تركت المتغيرات فارغة، سيعمل النظام تلقائياً في **"الوضع التجريبي المحلي"** لتسهيل تجربة الواجهات والخصائص مباشرة من المتصفح بدون إعداد مسبق.

### 4. تشغيل خادم التطوير
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:5173`

---

## 🗄️ إعداد قاعدة بيانات Supabase (Supabase Setup)

1. أنشئ مشروعاً جديداً في [Supabase](https://supabase.com).
2. افتح قسم **SQL Editor** في لوحة تحكم Supabase.
3. قم بنسخ محتوى ملف الترحيل الأول:
   `supabase/migrations/001_initial_schema.sql`
   ثم اضغط على **Run**.
4. (اختياري) لتعبئة بيانات تجريبية عربية واقعية، قم بتشغيل:
   `supabase/migrations/002_seed_data.sql`
5. اذهب إلى **Project Settings -> API** وانسخ:
   - `Project URL` وضعه في `VITE_SUPABASE_URL`
   - `anon / public key` وضعه في `VITE_SUPABASE_ANON_KEY`

---

## 🔐 نظام الأمان وسياسات RLS (Security & RLS)

- كل جدول من الجداول (`shops`, `profiles`, `customers`, `orders`, `measurements`) مفعل عليه **Row Level Security**.
- يعتمد الأمان على دالة `get_current_user_shop_id()` في PostgreSQL، بحيث لا يمكن للمستخدم استعلام أو تعديل أي سجل لا ينتمي للمتجر المرتبط بحسابه.
- مفتاح `service_role` السري محمي وممنوع استخدامه في كود الواجهة الأمامية؛ يتم الاعتماد حصراً على المفتاح العام `anon key`.

---

## 🧪 الفحص والاختبار (Testing)

- **فحص الأنواع وتجميع الإنتاج:**
  ```bash
  npm run build
  ```
- **فحص الكود (Linter):**
  ```bash
  npm run lint
  ```

---

## ☁️ النشر على Cloudflare Pages (Deployment)

1. ارفع المشروع إلى حسابك على GitHub.
2. توجه إلى [Cloudflare Dashboard](https://dash.cloudflare.com) ثم اختر **Workers & Pages**.
3. اختر **Create application** -> **Pages** -> **Connect to Git**.
4. حدد المستودع واضبط إعدادات البناء:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. أضف المتغيرات البيئية في إعدادات Cloudflare Pages:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. اضغط **Save and Deploy**.
