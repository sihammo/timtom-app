# نظام إدارة توزيع السلع

## نظرة عامة

نظام متكامل لإدارة توزيع السلع يشمل لوحة تحكم للأدمن (Web Dashboard) وتطبيق للموزعين، بواجهة عربية RTL كاملة.

## Stack التقني

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **TypeScript**: 5.9
- **API Framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API Codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + TailwindCSS
- **Charts**: Recharts
- **Maps**: Leaflet / react-leaflet
- **Auth**: Session-based (express-session)
- **Build**: esbuild

## البنية

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── admin-dashboard/    # React + Vite dashboard (Arabic RTL)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (seed data)
└── ...
```

## قاعدة البيانات - الجداول

- `users` - المستخدمون (أدمن + موزعون)
- `distributors` - معلومات الموزعين + الموقع
- `products` - السلع والمخزون
- `stores` - المحلات والمواقع
- `tasks` - المهام (إسناد توزيع)
- `deliveries` - تأكيدات التوصيل
- `store_suggestions` - اقتراحات محلات جديدة
- `settlements` - تصفية حسابات الموزعين

## بيانات الدخول التجريبية

- **الأدمن**: admin / admin123
- **موزع 1**: ali / ali123
- **موزع 2**: omar / omar123
- **موزع 3**: hassan / hassan123

## الصفحات - لوحة الأدمن

- `/` - لوحة التحكم (الأرباح، الإحصائيات، الرسوم البيانية)
- `/distributors` - إدارة الموزعين
- `/products` - إدارة السلع
- `/stores` - إدارة المحلات
- `/tasks` - إدارة المهام
- `/deliveries` - مراجعة التوصيلات
- `/accounting` - المحاسبة والديون
- `/map` - الخريطة الشاملة
- `/suggestions` - اقتراحات المحلات

## صفحات الموزع

- `/distributor` - لوحة الموزع
- `/distributor/tasks` - المهام
- `/distributor/map` - الخريطة
- `/distributor/suggest` - اقتراح محل

## API Routes

- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - المستخدم الحالي
- `GET/POST /api/distributors` - إدارة الموزعين
- `GET/POST /api/products` - إدارة السلع
- `GET/POST /api/stores` - إدارة المحلات
- `GET/POST /api/tasks` - إدارة المهام
- `GET/POST /api/deliveries` - التوصيلات
- `GET /api/accounting/summary` - ملخص المحاسبة
- `GET /api/accounting/debts/stores` - ديون المحلات
- `GET /api/accounting/debts/distributors` - ديون الموزعين
- `POST /api/accounting/settle/:id` - تصفية حساب
- `GET /api/map/locations` - مواقع الخريطة
- `GET/POST /api/suggestions` - اقتراحات المحلات
- `GET /api/dashboard/stats` - إحصائيات لوحة التحكم

## Root Scripts

- `pnpm run build` — بناء المشروع
- `pnpm run typecheck` — فحص الأنواع
- `pnpm --filter @workspace/db run push` — ترحيل قاعدة البيانات
- `pnpm --filter @workspace/scripts run seed` — إضافة بيانات تجريبية
- `pnpm --filter @workspace/api-spec run codegen` — توليد الكود
