# PrevixFrontEnd Deep Audit

Evidence is drawn from repository source at `/Users/rayendridi/Documents/GitHub/PrevixFrontEnd` unless noted. Backend contracts are cross-checked against `PrevixBackend` only where explicitly referenced in this audit. Runtime behavior (build output, production bundle) was not executed here.

---

## 1. Executive technical profile

- **Framework and tooling:** React `^19.1.1`, Vite `^7.1.7` (`vite.config.js`), React Router DOM `^7.9.4`. Entry: `src/main.jsx` wraps `App` in `BrowserRouter` + `StrictMode`.
- **Styling:** Tailwind CSS `^4.1.14` (`tailwind.config.js` extends primary/secondary/accent colors), extensive page-specific CSS files; MUI (`@mui/material`, `@mui/icons-material`) used on some pages (e.g. `ProfilePage.jsx`).
- **Role in Previx:** Browser SPA targeting PrevixBackend (`VITE_API_BASE_URL` or default `http://localhost:8000` in `src/services/api.js`) for auth, projects, orgs, admin, client uploads, notifications, AI assistant proxy routes, Manus proxy routes, parameters, and market data. Optional direct fetch to RAGPrevix for assistant report download (`VITE_APP_RAGPREVIX_URL` in `src/pages/AIAssistant.jsx`).
- **Domains implemented in UI:** Landing (`/` when logged out), login/register, dashboard (admin vs staff vs client via `DashboardPage.jsx`), projects list/detail/upload (admin), client project detail, organizations CRUD + members modal, parameters (wear + construction costs), settings (local preferences only), profile, admin user management (list + delete + org transfer), AI assistant chat, Manus/Valuation IA file flows + AutoCAD describe, notifications dropdown.
- **External services:** PrevixBackend API; RAGPrevix URL used for unauthenticated `fetch` report download attempt in `AIAssistant.jsx`; market data from `GET /market-data/*` on backend (`MarketTicker.jsx`).
- **Not found in code:** Dedicated evaluation or standalone asset pages as routes (`App.jsx` has no `/evaluations` or `/assets` routes). Dedicated notifications page (only `NotificationDropdown`). `react-hook-form` is in `package.json` but **not imported** anywhere under `src/`. No Redux/Zustand/Jotai. No PWA/service worker in repo.

---

## 2. Repository map

| Path | Purpose |
|------|---------|
| `package.json` | Dependencies: React 19, Vite, MUI, Mantine (listed), axios, framer-motion, gsap, three.js, react-router-dom, react-hook-form (unused in src), etc. |
| `vite.config.js` | `defineConfig` with `@vitejs/plugin-react` and `babel-plugin-react-compiler` only; **no** proxy, **no** path aliases. |
| `tailwind.config.js` | Content globs `./index.html`, `./src/**/*.{js,ts,jsx,tsx}`; theme color extensions. |
| `eslint.config.js` | ESLint config (not expanded in audit). |
| `index.html` | Vite entry HTML (referenced by Tailwind). |
| `src/main.jsx` | Mounts React root, `BrowserRouter`, imports `index.css`. |
| `src/App.jsx` | `AuthProvider` → `ToastProvider` → `ReportGenerationProvider` → `ProjectProvider` → `Routes`; defines `PrivateRoute`, `HomePage`, all route declarations. |
| `src/index.css` | Global styles (imported from `main.jsx`). |
| `src/App.css` | App-level CSS. |
| `src/services/api.js` | Axios instance, interceptors, `authService`, `projectService` (duplicate naming vs `projectService.js`), `organizationService` object, `userService`, `assetService`, `adminService`, `clientProjectService`, `aiAssistantService`, `manusService`, re-export `api`. |
| `src/services/projectService.js` | Primary project/asset/report/extractor helpers used by `ProjectContext` and pages; duplicates some endpoints with different paths than `api.js` `projectService`. |
| `src/services/organizationService.js` | Default export: org CRUD + members via `fetch` and `api` mix. |
| `src/services/notificationService.js` | Notification REST wrappers using shared `api`. |
| `src/context/AuthContext.jsx` | JWT bootstrap via `getProfile`, role string list in state, login/register/logout, `isAdmin`/`isStaff`/`isClient`. |
| `src/context/ProjectContext.jsx` | Projects list, CRUD, asset/report helpers calling `projectService` from `projectService.js`. |
| `src/context/ReportGenerationContext.jsx` | Manus Excel/Word generation state via `manusService` + toasts. |
| `src/components/layout/Layout.jsx` | Chooses `AdminAppBar`+`AdminSidebar` if `isAdmin()`, else `ClientTopNav`. |
| `src/components/layout/AdminSidebar.jsx` | Nav links including `/aiAssistant`, `/manus`, `/parameters`, `/settings`. |
| `src/components/layout/ClientTopNav.jsx` | Client nav: dashboard, projects, profile + `NotificationDropdown`. |
| `src/pages/*.jsx` | Top-level route views (see §5). |
| `src/components/projects/**` | Project list, admin detail/form/upload, client detail/upload. |
| `src/components/assets/**` | `AssetDisplay`, `AssetList`, `FileUploader`, asset `Toast` (separate from common Toast). |
| `src/components/common/**` | `Toast`, `TextField`, `Button`, `NotificationDropdown`. |
| `src/components/dashboard/**` | Stats, graphs, calendar, tasks, `MarketTicker`. |
| `src/components/animation/**` | Loading screens, GSAP/barba-related files; `BarbaProvider.jsx` **not** wired in `App.jsx`. |
| `src/components/PlanViewer3D.jsx` | 3D viewer; used from `ManusReport.jsx` when AutoCAD scene data exists. |
| `public/` | Static assets e.g. logos referenced as `/QuantoLogo.png` (`HomePage` in `App.jsx`). |
| `src/types/` | `projectTypes.js`, `parser.ts` (not traced in depth). |

---

## 3. Application entrypoint and router setup

**Entry:** `src/main.jsx` → `ReactDOM.createRoot` → `<BrowserRouter><App /></BrowserRouter>`.

**Provider tree (innermost first in JSX):** `AuthProvider` → `ToastProvider` → `ReportGenerationProvider` → `ProjectProvider` → `Routes`.

**`PrivateRoute` (`App.jsx`):** Uses `useAuth()`; while `loading`, shows loader; if `isAuthenticated` then `children`, else `<Navigate to="/login" />`. **Does not** check roles—only authentication.

**404:** No `path="*"` route in `App.jsx` — unknown paths **not** explicitly handled (React Router default: blank/no match dependent on version; **could not verify** without running the app).

**Full route table** (path → component, all wrapped as shown):

| Path | Element | Wrapper |
|------|---------|---------|
| `/` | `HomePage` (inline in `App.jsx`) | None |
| `/login` | `LoginPage` | None |
| `/register` | `RegisterPage` | None |
| `/dashboard` | `Layout` → `DashboardPage` | `PrivateRoute` |
| `/profile` | `Layout` → `ProfilePage` | `PrivateRoute` |
| `/admin` | `Layout` → `AdminPage` | `PrivateRoute` |
| `/organizations` | `Layout` → `Organizations` | `PrivateRoute` |
| `/parameters` | `Layout` → `Parameters` | `PrivateRoute` |
| `/settings` | `Layout` → `SettingsPage` | `PrivateRoute` |
| `/aiAssistant` | `Layout` → `AIAssistant` | `PrivateRoute` |
| `/manus` | `Layout` → `ManusReport` | `PrivateRoute` |
| `/projects` | `Layout` → `ProjectList` | `PrivateRoute` |
| `/projects/new` | `Layout` → `ProjectForm` | `PrivateRoute` |
| `/projects/:id` | `Layout` → `ProjectDetail` | `PrivateRoute` |
| `/client/projects/:id` | `Layout` → `ClientProjectDetail` | `PrivateRoute` |
| `/projects/:id/edit` | `Layout` → `ProjectForm` | `PrivateRoute` |
| `/projects/:id/upload` | `Layout` → `ProjectUpload` | `PrivateRoute` |

**Nested routes:** Flat list only—no `<Outlet>` nested route tree.

**Redirect logic:** `HomePage` redirects to `/dashboard` if `isAuthenticated` (`Navigate`). `LoginPage` `useEffect` navigates to `/dashboard` when authenticated.

**Fullscreen CSS:** `isFullScreenRoute` in `App.jsx` checks pathname list + `location.pathname.startsWith('/projects/')` to add `full-screen` class on `app-container`.

---

## 4. Authentication flow

- **Login:** `LoginPage.jsx` form submit → `login(email, password)` from `AuthContext` → `authService.login` posts `application/x-www-form-urlencoded` to `/auth/token` with `username`/`password` (`api.js`), stores `access_token` and `token_type` in `localStorage`, then `authService.getProfile()` → `GET /auth/users/me`, stores `user` JSON and derives `roles` from `user_roles[].role.role_identity`.
- **Token storage:** `localStorage` keys: `access_token`, `token_type`, `user`, `roles` (optional array JSON from auth init).
- **API usage:** Axios request interceptor (`api.js`) sets `Authorization: Bearer ${localStorage.getItem('access_token')}` when present.
- **401 handling:** Response interceptor clears `access_token` and `user`, sets `window.location.href = '/login'`.
- **Logout:** `AuthContext.logout` clears token/user/roles state and keys, then `authService.logout()` which removes items and redirects to `/login`.
- **Protected routes:** `PrivateRoute` gates on `isAuthenticated` (`!!user && !!localStorage.getItem('access_token')` in context value).
- **Role UI:** `Layout.jsx` uses only `isAdmin()` for shell (admin sidebar vs client top nav). `DashboardPage.jsx` branches `isAdmin()` / `isStaff()` / else `ClientDashboard`. `AdminPage.jsx` checks `isAdmin()` in `useEffect` and sets error if not admin. **No route-level** `RequireAdmin`—non-admin users can navigate to `/admin` URL and see error state after load.
- **Session refresh:** On app load, `AuthContext` `useEffect` calls `getProfile()` if token exists; failure clears storage.
- **Registration:** `RegisterPage.jsx` calls `authService.register` with `role_identity: 'client_previx'`, **`org_id: 1` hardcoded**; navigates to `/login` on success. Does not use `AuthContext.register`.

**Backend mismatch (canonical backend in PrevixBackend):** `authService.updateProfile` uses `PUT /auth/users/me` (`api.js`), but `PrevixBackend` `auth.py` only declares **`GET`** `/auth/users/me`. Profile save from `ProfilePage` via `updateProfile` is **not aligned** with verified backend routes unless another server implements PUT.

**Other:** `authService.changePassword` posts to `/auth/change-password` — **not found** in audited `PrevixBackend` `auth.py` (not verified beyond that file).

---

## 5. Full page and route inventory

### 5.1 Auth pages

| Route | File | Auth | Notes |
|-------|------|------|-------|
| `/login` | `pages/LoginPage.jsx` | Public | Redirects if already authenticated; uses `LoginLoadingAnimation` after submit. |
| `/register` | `pages/RegisterPage.jsx` | Public | Manual validation; `authService.register` directly; default `org_id: 1`. |

### 5.2 Dashboard / home

| Route | File | Auth | Notes |
|-------|------|------|-------|
| `/` | `HomePage` in `App.jsx` | Public | Landing; if authenticated → `Navigate` to `/dashboard`. |
| `/dashboard` | `pages/DashboardPage.jsx` | Private | Uses `useProject` for `projects`; if not admin and not staff → `ClientDashboard`; admin gets `MarketTicker`, `DashboardCalendar`, `DashboardTasks`, `DashboardStats`, `DashboardGraphs`; staff gets alternate layout. |

### 5.3 Project pages

| Route | File | Auth | Notes |
|-------|------|------|-------|
| `/projects` | `components/projects/ProjectList.jsx` | Private | Lists projects via context/API. |
| `/projects/new` | `components/projects/Admin/ProjectForm.jsx` | Private | Create project. |
| `/projects/:id` | `components/projects/Admin/ProjectDetail.jsx` | Private | Tabs, files, classification, reports; uses `projectService`, `adminService`, `clientProjectService`, org services. |
| `/projects/:id/edit` | `ProjectForm.jsx` | Private | Edit mode. |
| `/projects/:id/upload` | `components/projects/Admin/ProjectUpload.jsx` | Private | Upload flow. |
| `/client/projects/:id` | `components/projects/Clients/ClientProjectDetail.jsx` | Private | Simpler client view; `handleDownloadPdf` / `handleDownloadExcel` are **placeholders** (empty functions, comment “will be implemented later”). |

### 5.4 Asset pages

No dedicated `/assets` route. Asset UI is embedded via `AssetDisplay` inside `ProjectDetail.jsx` (and related components). Data via `projectService.getProjectAssets` etc.

### 5.5 Evaluation pages

**Not found in code** as a routed page.

### 5.6 Organization pages

| Route | File | Auth | Notes |
|-------|------|------|-------|
| `/organizations` | `pages/Organizations.jsx` | Private | CRUD modals, `organizationService`, `OrgMembersModal.jsx`, loading animation. |

### 5.7 Admin pages

| Route | File | Auth | Notes |
|-------|------|------|-------|
| `/admin` | `pages/Admin/AdminPage.jsx` | Private (UI enforces admin) | Loads `userService.getAllUsers`, `organizationService.getAllOrganizations`; delete via `userService.deleteUser` → `/admin/users/{id}`; transfer uses `organizationService.removeUserFromOrganization` + `assignUserToOrganization`. |

### 5.8 AI assistant pages

| Route | File | Auth | Notes |
|-------|------|------|-------|
| `/aiAssistant` | `pages/AIAssistant.jsx` | Private | Chat UI, history sidebar, attachments, `aiAssistantService`, report download logic. |

### 5.9 Reports pages

**No** dedicated `/reports` route. PDF/Excel generation invoked from `ProjectDetail` using `projectService.getProjectReport` (`projectService.js` → `/reports/projects/{id}/pdf` and `/excel`). `projectService.js` also has legacy `getReport` → `/report/${projectId}` — usage depends on call site.

### 5.10 Notifications

No full-page route. `NotificationDropdown` (`components/common/NotificationDropdown.jsx`) in `ClientTopNav.jsx`; uses `notificationService`.

### 5.11 Settings / profile

| Route | File | Auth | Notes |
|-------|------|------|-------|
| `/profile` | `pages/ProfilePage.jsx` | Private | MUI layout; `updateProfile` from context; org details via `organizationService.getOrganizationById`. |
| `/settings` | `pages/SettingsPage.jsx` | Private | **Local-only** preferences: `previx_theme`, `previx_language`, `previx_date_format`, `previx_notifications` in `localStorage`; no API calls in file. |

### 5.12 Any other pages

| File | In `App.jsx`? | Notes |
|------|----------------|-------|
| `pages/ExchangeRateTable.jsx` | **No** | **Present but not wired** into router. |
| `pages/Client/ClientDashboard.jsx` | Used as child of `DashboardPage` | Not a separate route. |

---

## 6. Component inventory

### 6.1 Layout components

| File | Purpose |
|------|---------|
| `Layout.jsx` | Admin vs client shell via `isAdmin()`. |
| `AdminAppBar.jsx` | Top bar for admin layout (props: sidebar state, user, logout). |
| `AdminSidebar.jsx` | Collapsible sidebar; `menuItems` paths; uses `useReportGeneration` for loading badges. |
| `ClientTopNav.jsx` | Client top navigation + `NotificationDropdown`. |

### 6.2 Auth components

No separate `LoginForm` component—logic is inline in `LoginPage.jsx` / `RegisterPage.jsx`.

### 6.3 Project components

| File | Purpose |
|------|---------|
| `ProjectList.jsx` | Project listing navigation. |
| `Admin/ProjectDetail.jsx` | Main admin project workspace (tabs, files, classification, reports). |
| `Admin/ProjectForm.jsx` | Create/edit project form. |
| `Admin/ProjectUpload.jsx` | File upload for projects. |
| `Clients/ClientProjectDetail.jsx` | Client-facing project summary; download stubs. |
| `Clients/ClientProjectList.jsx` | Client project list (imported where used—verify parent). |
| `ClientProjectUploadArea.jsx` | Upload area UI for client flows. |
| `ExtractedFiles.jsx` | Extracted files presentation. |

### 6.4 Asset components

| File | Purpose |
|------|---------|
| `AssetList.jsx` | List assets. |
| `AssetDisplay.jsx` | Display/edit assets in project context. |
| `FileUploader.jsx` | Generic file upload UI. |
| `assets/Toast.jsx` | Separate toast styling for assets subtree. |

### 6.5 Evaluation components

**Not found** as a dedicated folder beyond possible indirect use inside project detail—**could not verify** without full `ProjectDetail.jsx` read-through of every tab.

### 6.6 AI assistant components

`AIAssistant.jsx` is a single large page component (not split into `components/ai/*`).

### 6.7 Manus components

`ManusReport.jsx` page contains upload UI, `PlanViewer3D`, AutoCAD describe; generation delegated to `ReportGenerationContext`.

### 6.8 Notification components

`NotificationDropdown.jsx` — bell dropdown, list, mark read, delete, `notificationService` calls.

### 6.9 Form and input components

`components/common/TextField.jsx`, `Button.jsx` — reusable wrappers.

### 6.10 Shared / utility components

`Toast.jsx` + `useToast`; dashboard widgets; `PlanViewer3D.jsx` (Three.js / react-three-fiber likely—file not fully read); animation components for loading states.

---

## 7. API service layer

Shared axios instance: `src/services/api.js` — `baseURL` = `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'`, default timeout 30s, JSON content-type; Bearer from `localStorage`.

### 7.1 Auth service (`authService` in `api.js`)

| Function | Method | Endpoint | Auth header | Notes |
|----------|--------|----------|-------------|-------|
| `login` | POST | `/auth/token` | No (then stores token) | `x-www-form-urlencoded`, `username` + `password`. |
| `register` | POST | `/auth/register` | No | JSON body. |
| `getProfile` | GET | `/auth/users/me` | Yes | Saves `user` to localStorage. |
| `updateProfile` | PUT | `/auth/users/me` | Yes | **Backend route mismatch** vs audited PrevixBackend `auth.py` (GET only). |
| `getUserRoles` | — | — | — | Reads `user` from localStorage only. |
| `hasRole` / `isAdmin` | — | — | — | localStorage user_roles. |
| `changePassword` | POST | `/auth/change-password` | Yes | **Not verified** on PrevixBackend. |
| `logout` | — | — | — | Clears storage, redirect `/login`. |
| `getToken` / `isAuthenticated` | — | — | — | localStorage. |

### 7.2 Project service — two modules

**A. `api.js` `projectService`:** CRUD `/projects/`, assets under `/assets?project_id=`, `/assets`, `/report/{id}` — **may not match** backend paths (PrevixBackend uses `/assets/` prefix on router).

**B. `projectService.js` (used by `ProjectContext`):** CRUD `/projects/`, `getAssets` uses `/assets?project_id=`, assets `/assets`, `getProjectAssets` → `GET /projects/{id}/assets`, reports `getProjectReport` → `/reports/projects/{id}/pdf` | `/excel`, summary `/reports/projects/{id}/summary`, `uploadToProject` calls `/excel/lire_excel/`, `/pdf/extract_pdf/`, `/upload` fallback, then `POST /projects/{id}/assets`, PDF/CAD helper paths under `/pdf/`, `/ezdxf/`, evaluations `/projects/{id}/evaluations`, `/evaluations`, etc.

### 7.3 Asset service

`assetService.uploadFiles` → `POST /assets/upload` (`api.js`). **PrevixBackend** client upload is under `/client/projects/...` — alignment **not verified** as identical.

### 7.4 Evaluation service

Embedded in `projectService.js` (`getEvaluations`, `createEvaluation`, `updateEvaluation`, `deleteEvaluation`) — paths `/projects/{id}/evaluations` and `/evaluations/{id}`. **Not found** matching routes in `App.jsx` as pages.

### 7.5 Organization service

Default export `organizationService.js`: mix of `api.get('/organizations/')` and `fetch` to `/organizations/{id}`, POST/PUT/DELETE, members `GET /organizations/{orgId}/users`, assign POST `/organizations/{orgId}/users`, remove DELETE, plus `getOrganizationMembers` via `api.get`.

### 7.6 AI assistant service (`aiAssistantService` in `api.js`)

| Function | Method | Endpoint | Auth | Notes |
|----------|--------|----------|------|-------|
| `sendMessage` | POST | `/ai-assistant/chat` | Yes | `multipart/form-data`. |
| `checkHealth` | GET | `/ai-assistant/health` | Yes | |
| `getHistory` | GET | `/ai-assistant/conversations/{id}/messages` | Yes | |
| `getConversations` | GET | `/ai-assistant/conversations` | Yes | |
| `getConversationMessages` | GET | `/ai-assistant/conversations/{id}/messages` | Yes | |
| `updateConversation` | PATCH | `/ai-assistant/conversations/{id}` | Yes | JSON body `{ title }`. |
| `deleteConversation` | DELETE | `/ai-assistant/conversations/{id}` | Yes | |

### 7.7 Manus service (`manusService` in `api.js`)

| Function | Method | Endpoint | Auth | Notes |
|----------|--------|----------|------|-------|
| `generateReport` | POST | `/manus/report-from-files` | Yes (axios default) | `responseType: 'blob'`, timeout `VITE_MANUS_REPORT_TIMEOUT_MS` or 30 min. |
| `generatePdfReport` | POST | `/manus/from-files-pdf` | Yes | Blob; comment says Word/docx. |
| `checkHealth` | GET | `/manus/health` | Yes | **No** `/manus/health` route in audited `PrevixBackend/src/api/routes/manus.py`. |
| `describeAutocad` | POST | `/manus/autocad-describe` | Yes | 120s timeout. |

### 7.8 Report service

Implemented as methods on `projectService.js` (`getProjectReport`, `getProjectReportSummary`) and legacy `getReport` in `api.js`.

### 7.9 Notification service (`notificationService.js`)

| Function | Method | Endpoint |
|----------|--------|----------|
| `getNotifications` | GET | `/notifications/` |
| `getUnreadCount` | GET | `/notifications/unread-count` |
| `markAsRead` | POST | `/notifications/{id}/read` |
| `markAllAsRead` | POST | `/notifications/mark-all-read` |
| `deleteNotification` | DELETE | `/notifications/{id}` |
| `deleteAllNotifications` | DELETE | `/notifications/` |

### 7.10 Parameters / market data

- **`Parameters.jsx`:** Direct `axios` to `API_BASE_URL` + `/parameters/wear-coefficients`, `/parameters/construction-costs` with Bearer; mutating POST/PUT/DELETE for same.
- **`MarketTicker.jsx`:** `GET /market-data/construction-prices`, `/material-prices`, `/land-prices` with query `country=Tunisia`.

### 7.11 File upload service

`clientProjectService` in `api.js`: `POST /client/projects/{projectId}/files/upload/`, `POST /client/projects/upload-and-create/`, `GET /client/projects/{projectId}/files/`.

### 7.12 Other (`userService`, `adminService`)

| Module | Notable endpoints |
|--------|-------------------|
| `userService` | `GET /users`, `GET /users/{id}`, `GET /admin/users`, `PUT /users/{id}`, `DELETE /admin/users/{id}`, `GET /users/email/{email}` — several **not** present in audited PrevixBackend routes. |
| `adminService` | `GET /admin/users`, `GET /admin/organizations`, `POST /admin/assign-role`, `DELETE /admin/user-roles/{id}`, `GET /admin/projects/{projectId}/files/`, classification endpoints under `/admin/projects/...`. |

---

## 8. State management

- **React Context:** `AuthContext` (user, loading, roles, auth methods), `ProjectContext` (projects, currentProject, loading, error, CRUD + asset/report helpers), `ReportGenerationContext` (Manus job status, blob result, errors), `ToastContext` (`ToastProvider` / `useToast`).
- **No** Redux/Zustand/Jotai in `package.json` usage beyond dependencies—**no global store** found.
- **URL state:** `useParams` for `id` on project routes.
- **localStorage:** Tokens, user, roles, settings keys on `SettingsPage`, theme/language prefs.
- **Auth propagation:** Context `value` + `localStorage` reread on init.
- **Assistant state:** Local `useState` in `AIAssistant.jsx` for messages, conversations list, `currentConversationId`; server persistence via backend on chat POST.
- **Loading/error:** Per-page and per-context `loading`/`error` flags; axios interceptor for 401.

---

## 9. Custom hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAuth` | `AuthContext.jsx` | Returns auth context value. |
| `useProject` | `ProjectContext.jsx` | Returns project context value. |
| `useReportGeneration` | `ReportGenerationContext.jsx` | Manus generation status and `startExcelReport` / `startWordReport`. |
| `useToast` | `Toast.jsx` | Toast API (`success`, `error`, `info`). |

**No** `src/hooks/` directory in glob—no separate custom-hook files beyond context hooks.

---

## 10. AI assistant UI (`pages/AIAssistant.jsx`)

- **Send:** `sendMessageWithPayload` builds `conversationHistory` from local `messages`, calls `aiAssistantService.sendMessage(message, files, conversationHistory, currentConversationId)`; multipart with `conversation_id` string.
- **Display:** Message list in state; scroll to bottom on change; welcome + suggestion cards when appropriate.
- **Attachments:** File input + drag/drop on `dropZoneRef`; preview URLs for images.
- **Streaming:** **Not found** — single POST/response; no SSE/WebSocket in file.
- **History:** Sidebar loads `getConversations`; selecting loads `getConversationMessages`; rename `updateConversation`; delete `deleteConversation`; “new conversation” clears id and resets welcome message.
- **Health:** `useEffect` calls `checkHealth`; UI shows online if `health.status === 'ok'` — **exact response shape depends on RAGPrevix/backend** (not verified here).
- **Report download:** `handleDownloadReport` tries **first** unauthenticated `fetch` to `${VITE_APP_RAGPREVIX_URL}/ai/assistant/report/{reportId}`, then `api.get('/ai-assistant/report/{reportId}', { responseType: 'blob' })` with Bearer.
- **Errors:** Maps 502/503/504 to French user messages in `aiAssistantService.sendMessage` and in catch block.

---

## 11. Manus UI flow (`pages/ManusReport.jsx` + `ReportGenerationContext.jsx`)

- **Trigger:** User selects files, optional project name; buttons call `startExcelReport` / `startWordReport` from context (which call `manusService.generateReport` / `generatePdfReport`).
- **Upload:** Drag/drop + file input; extension allowlist `.pdf`, `.xlsx`, `.xls`, `.dwg`, `.dxf`.
- **Loading:** Context `status` drives `isLoadingExcel` / `isLoadingWord`; UI shows loading states (file continues past line 180 — pattern: context + local state).
- **Result:** Blob stored in context `result`; toast tells user to return to Valuation IA page for download; **actual download trigger** is via context consumer UI (full JSX not fully traced line-by-line).
- **AutoCAD describe:** `manusService.describeAutocad(file)`; displays description + `PlanViewer3D` if `scene_3d` returned.
- **Bug:** `handleFiles` calls `setError(null)` and `setSuccess(false)` but component state at line ~41–64 **does not** define `error`/`success` setters in the excerpt — **runtime ReferenceError risk** when adding files unless defined later in file. **Evidence:** grep shows only those two lines for `setError`/`setSuccess` in `ManusReport.jsx`.

---

## 12. Forms and validation

- **react-hook-form:** Listed in `package.json`; **no imports** under `src/` (grep).
- **Patterns:** Controlled `useState` forms (`LoginPage`, `RegisterPage`, `Organizations`, `Parameters`, etc.).
- **RegisterPage:** Manual validation (required fields, password match, length 6+, email regex).
- **Parameters:** Client-side filters/debounce for tables; server errors in `error` state.

---

## 13. Routing and navigation patterns

- **`useNavigate` / `useParams`:** Used in project pages, login, sidebars.
- **IDs:** Project routes use `:id` param (string); passed to `projectService.getProject(id)`.
- **Breadcrumbs:** **Not found** as a shared component.
- **Deep linking:** Standard path URLs; no hash-router.

---

## 14. Styling and UI library

- **Tailwind:** `tailwind.config.js` + usage in `RegisterPage` (utility classes) and likely others.
- **MUI:** `ProfilePage.jsx` imports `@mui/material` and icons.
- **Mantine:** In `package.json` — **not found** imported in audited files (may be unused).
- **Framer Motion / GSAP:** `Layout.jsx` uses `gsap` for route transition fade; `framer-motion` in dependencies—usage **not fully traced**.
- **Dark mode:** `SettingsPage` stores `previx_theme` but **no** global theme application verified in `App.jsx` (likely partial/preference-only).
- **Responsive:** Sidebar/mobile patterns in `AdminSidebar` / `ClientTopNav` (comments reference 768px in sidebar).

---

## 15. Build and config

- **`vite.config.js`:** No `server.proxy`, no `resolve.alias`.
- **Environment variables (from code):**
  - `VITE_API_BASE_URL` — axios base (`api.js`, `Parameters.jsx`, `MarketTicker.jsx`, etc.).
  - `VITE_MANUS_REPORT_TIMEOUT_MS` — Manus axios timeout (`api.js`).
  - `VITE_APP_RAGPREVIX_URL` — direct report fetch in `AIAssistant.jsx`.
- **`.env*` files:** **Not found** in repository (glob)—defaults apply in dev.
- **Public assets:** Referenced with absolute paths `/QuantoLogo.png`, `/PREVIX_homePage-Photoroom.png`, etc.
- **PWA / service worker:** **Not found**.

---

## 16. End-to-end user flow traces

### 16.1 User login

1. Open `/login` → `LoginPage` → submit → `AuthContext.login` → `POST /auth/token` → `GET /auth/users/me` → navigate `/dashboard`.

### 16.2 Creating a project

1. Navigate `/projects/new` → `ProjectForm` → `ProjectContext.createProject` → `projectService.createProject` → `POST /projects/`.

### 16.3 Uploading files to a project

1. Client: `ClientProjectUploadArea` / flows using `clientProjectService.uploadProjectFiles` → `POST /client/projects/{id}/files/upload/`.  
2. Admin: `ProjectUpload` / `ProjectDetail` patterns using `adminService` + `projectService` (multiple paths—see §7).

### 16.4 Triggering AI assistant chat

1. `/aiAssistant` → type message → `aiAssistantService.sendMessage` → `POST /ai-assistant/chat` → append assistant message; update `conversation_id` from response if present.

### 16.5 Viewing and downloading a report

1. From chat metadata: `handleDownloadReport` tries RAGPrevix URL then backend blob.  
2. From project detail: `projectService.getProjectReport` → `/reports/projects/{id}/pdf` or `/excel`.

### 16.6 Admin managing users

1. `/admin` → if `isAdmin()` load else error → `GET /admin/users` + org list → delete `DELETE /admin/users/{id}`; transfer via org assign/remove endpoints.

### 16.7 Manus file report generation

1. `/manus` → select files → `startExcelReport` / `startWordReport` → `manusService` POST with blob response → context `result` + toast.

### 16.8 Viewing notifications

1. `ClientTopNav` bell → `NotificationDropdown` → `notificationService.getNotifications` on open.

---

## 17. Active vs placeholder vs dead matrix

| Page / Component | Status | Evidence | Notes |
|--------------------|--------|----------|-------|
| `/dashboard` | Active | `App.jsx`, `DashboardPage.jsx` | Branches admin/staff/client. |
| `/projects/*` admin | Active | `ProjectDetail`, `ProjectForm`, etc. | |
| `/client/projects/:id` | Partial | `ClientProjectDetail.jsx` | Download handlers empty placeholders. |
| `/admin` | Active | `AdminPage.jsx` | Relies on backend admin endpoints. |
| `/parameters` | Active | `Parameters.jsx` | Uses axios + bearer. |
| `/settings` | Active (local only) | `SettingsPage.jsx` | No API. |
| `/aiAssistant` | Active | `AIAssistant.jsx` | |
| `/manus` | Active (with bug risk) | `ManusReport.jsx` | `setError`/`setSuccess` may be undefined. |
| `ExchangeRateTable.jsx` | Dead | Not in `Routes` | File exists, not routed. |
| `BarbaProvider.jsx` | Dead | Not imported in `App.jsx` | |
| `showEditModal` in `AdminPage` | Dead | State declared, never set | |
| `userService` PUT `/users/{id}` | Present but usage unclear | Defined in `api.js` | **Not** called from audited `AdminPage` flows. |
| `react-hook-form` | Unused in src | package.json only | |

---

## 18. Known limitations and technical debt visible in code

- Duplicate/overlapping `projectService` definitions in `api.js` vs `projectService.js` with different URL paths for assets/reports.
- `authService.updateProfile` / `changePassword` likely **not** implemented on audited PrevixBackend auth router.
- `userService` paths (`/users`, `/users/email/...`) may not exist on backend.
- `manusService.checkHealth` calls `/manus/health` — **no** such route in audited `manus.py`.
- `ManusReport.jsx` references `setError`/`setSuccess` without visible `useState` in audited sections — **likely bug**.
- Heavy `console.log` in `projectService.js` and elsewhere (noise in production if not stripped).
- `AdminPage` `isInternalUser` checks role strings like `admin`, `staff` that may not match backend `role_identity` values (`general_admin`, `user_previx`, `client_previx`).
- Staff users (`user_previx`) get **client** shell (`Layout.jsx`) because only `isAdmin()` selects admin layout—may be intentional or oversight; **evidence:** `Layout.jsx` branch.

---

## 19. Maintainer guidance

- **High-impact files:** `src/App.jsx` (all routes), `src/services/api.js` (base URL + interceptors), `src/context/AuthContext.jsx`, `src/services/projectService.js` (primary data layer for projects).
- **Backend alignment:** Prefer single source of truth for API paths; reconcile `api.js` embedded `projectService` with `projectService.js` or remove duplicate.
- **After backend changes:** Retest login, `GET /auth/users/me` shape (`user_roles` nesting), `/projects/`, `/admin/users`, `/ai-assistant/chat`, `/manus/report-from-files`, `/reports/projects/{id}/pdf|excel`.
- **Manus:** Keep `VITE_MANUS_REPORT_TIMEOUT_MS` aligned with backend `MANUS_REPORT_TIMEOUT_SECONDS` conceptually.
- **Profile save:** Verify backend implements `PUT /auth/users/me` before relying on `updateProfile`.

---

*End of audit document.*
