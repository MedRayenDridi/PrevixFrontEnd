# PrevixFrontEnd

## 1. Project overview

- `PrevixFrontEnd` is a React SPA (Vite) that provides authenticated UI flows for Previx users (admin, staff/collaborator, client) and consumes backend APIs from `PrevixBackend`.
- The frontend covers:
  - Public pages: landing (`/`), login (`/login`), registration (`/register`)
  - Authenticated app shell with role-dependent navigation and dashboards
  - Project management, organization management, profile/settings, notifications
  - AI Assistant chat UI and Valuation IA report generation UI
- App goals inferable from code:
  - Manage projects and related assets/files
  - Expose organization/user admin operations
  - Provide analytics/dashboard visualizations
  - Trigger AI/classification/report workflows via backend endpoints
- What it does **not** appear to handle (verified by code absence):
  - SSR or multi-page server-rendering (SPA only)
  - Offline/PWA support (not found in code)
  - i18n framework integration (language preference is stored, but translation system not found)
  - End-to-end test suite in repo (not found in code)

## 2. Frontend architecture

### Overall structure

- Entry point: `src/main.jsx` mounts `App` under `BrowserRouter`.
- Root composition in `src/App.jsx`:
  - `AuthProvider`
  - `ToastProvider`
  - `ReportGenerationProvider`
  - `ProjectProvider`
  - `Routes`
- Shared layout in `src/components/layout/Layout.jsx`:
  - Admin users: `AdminAppBar` + `AdminSidebar`
  - Non-admin users: `ClientTopNav`

### Routing

- Route declarations are centralized in `src/App.jsx`.
- Private routes are protected via `PrivateRoute` (checks `useAuth().isAuthenticated`, shows loading while auth init is in progress, otherwise redirects to `/login`).
- Public routes:
  - `/`, `/login`, `/register`
- Authenticated routes:
  - `/dashboard`, `/profile`, `/admin`, `/organizations`, `/parameters`, `/settings`, `/aiAssistant`, `/manus`
  - `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit`, `/projects/:id/upload`
  - `/client/projects/:id`

### State management

- Local state: `useState` heavily used across pages/components.
- Global/context state:
  - `AuthContext`: user identity, roles, login/register/logout/profile update helpers
  - `ProjectContext`: project list/current project, CRUD wrappers, loading/error states
  - `ReportGenerationContext`: async status/result for Valuation IA report generation
  - `ToastContext`: global notification toasts
- No Redux/Zustand/Recoil found.

### Data fetching

- Primary HTTP client: Axios instance in `src/services/api.js`.
  - Base URL: `import.meta.env.VITE_API_BASE_URL || http://localhost:8000`
  - Request interceptor injects `Authorization: Bearer <access_token>` from `localStorage`
  - Response interceptor handles `401` by clearing auth storage and redirecting to `/login`
- Some modules use `fetch` directly (`src/services/organizationService.js`) in addition to Axios.
- Multiple components also call Axios directly (`Parameters`, `ExchangeRateTable`, `MarketTicker`).

### Component hierarchy and UI patterns

- Dashboard pages compose cards/charts/ticker/task/calendar subcomponents.
- Project views are split by role:
  - Admin/staff: `ProjectList` + admin project detail/form/upload components
  - Client: `ClientProjectList` + `ClientProjectDetail`
- Common UI patterns:
  - Collapsible/expandable panels (`AssetDisplay`, sidebars)
  - Modal overlays (`Organizations`, `OrgMembersModal`)
  - Toast notifications (`ToastProvider`)
  - Loading animations and skeletons for key pages

### Dependency flow

- Pages/components -> Context hooks (`useAuth`, `useProject`, `useReportGeneration`) and/or service modules.
- Service modules -> shared Axios API client.
- Contexts encapsulate a subset of service operations and expose derived UI flags.
- No reverse dependency (services importing UI) observed.

## 3. File-by-file map

### Root and config

- `package.json`: dependencies, scripts (`dev`, `build`, `lint`, `preview`).
- `vite.config.js`: React plugin with `babel-plugin-react-compiler`.
- `tailwind.config.js`: Tailwind content paths + color extension.
- `eslint.config.js`: ESLint flat config for JS/JSX with React hooks + refresh rules.
- `render.yaml`: Render Web Service blueprint (SPA fallback via `serve -s dist`).
- `Dockerfile`: multi-stage build (Node build stage -> Nginx runtime).
- `index.html`: root mount element `#root`, favicon, script entry to `src/main.jsx`.
- `README.md`: mostly template text plus Render SPA deployment notes.

### App entry and contexts

- `src/main.jsx`: wraps `App` in `BrowserRouter`.
- `src/App.jsx`: route table, private-route guard, home page rendering, provider stack.
- `src/context/AuthContext.jsx`: auth bootstrap from `localStorage`, role extraction and auth helpers.
- `src/context/ProjectContext.jsx`: projects/assets/report operations + shared loading/error state.
- `src/context/ReportGenerationContext.jsx`: Word/Excel generation orchestration and status flags.

### Services

- `src/services/api.js`: central Axios instance + exports for auth, projects, users/admin, client project upload, AI assistant, manus/report services.
- `src/services/projectService.js`: additional project/asset/PDF/AutoCAD/report helper service (also used directly by components).
- `src/services/organizationService.js`: org CRUD and org-member assignment/removal (mix of `api` and native `fetch`).
- `src/services/notificationService.js`: notifications API wrapper.

### Pages

- `src/pages/LoginPage.jsx`: login form + transition/loading animation.
- `src/pages/RegisterPage.jsx`: registration form with client-side validation.
- `src/pages/DashboardPage.jsx`: role-based dashboard (admin/staff/client switch).
- `src/pages/ProfilePage.jsx`: profile editing + role/org display.
- `src/pages/Admin/AdminPage.jsx`: admin user management (list, transfer org, delete user).
- `src/pages/Organizations.jsx`: organization list/create/delete + members modal.
- `src/pages/OrgMembersModal.jsx`: assign/remove/create client users in org.
- `src/pages/Parameters.jsx`: wear coefficients + construction costs CRUD and calculator.
- `src/pages/SettingsPage.jsx`: local preference toggles persisted in `localStorage`.
- `src/pages/ExchangeRateTable.jsx`: exchange-rate display widget.
- `src/pages/AIAssistant.jsx`: conversational UI with attachments/history/rename/delete conversations.
- `src/pages/ManusReport.jsx`: file upload + report generation + AutoCAD description/3D modal.
- `src/pages/Client/ClientDashboard.jsx`: client-specific dashboard.

### Layout and project modules

- `src/components/layout/*`: admin sidebar/appbar + client top navigation and shell container.
- `src/components/projects/ProjectList.jsx`: admin project listing (cards/table/filter/bulk delete) and client fallback.
- `src/components/projects/Admin/ProjectForm.jsx`: create/edit project form.
- `src/components/projects/Admin/ProjectDetail.jsx`: tabbed project detail (overview/assets/files/reports).
- `src/components/projects/Admin/ProjectUpload.jsx`: file upload to project.
- `src/components/projects/Clients/ClientProjectList.jsx`: client org-scoped projects, per-project file listing/upload.
- `src/components/projects/Clients/ClientProjectDetail.jsx`: client project details and download buttons (download handlers are placeholders).

### Assets/dashboard/common and visualization

- `src/components/assets/AssetDisplay.jsx`: asset groups with inline editing, PDF extracted-content and AutoCAD extracted-data views.
- `src/components/dashboard/*`: stats, graphs, tasks, calendar, ticker widgets.
- `src/components/common/NotificationDropdown.jsx`: notification bell/dropdown.
- `src/components/common/Toast.jsx`: global toast provider and hook.
- `src/components/PlanViewer3D.jsx`: three.js canvas viewer for AutoCAD scene lines.

### Tests and docs

- Dedicated frontend test files under `src` or `tests` directory: **not found in code**.
- Additional frontend architecture docs beyond `README.md`: **not found in code**.

## 4. Pages and flows

### Screen inventory

- Public:
  - Home/landing (`/`)
  - Login (`/login`)
  - Register (`/register`)
- Protected:
  - Dashboard (`/dashboard`)
  - Profile (`/profile`)
  - Admin user management (`/admin`)
  - Organizations (`/organizations`)
  - Parameters (`/parameters`)
  - Settings (`/settings`)
  - AI Assistant (`/aiAssistant`)
  - Valuation IA / Manus (`/manus`)
  - Project list/create/detail/edit/upload (`/projects*`)
  - Client project detail (`/client/projects/:id`)

### Navigation and route protection

- All protected screens are wrapped by `PrivateRoute`; unauthorized users are redirected to `/login`.
- `Layout` selects admin or client navigation shell based on `isAdmin()`.
- No explicit per-route role guard component beyond authentication; role-based gating is mostly done inside page/component logic (e.g., admin buttons hidden for non-admin).

### Main user flows (verified)

- Authentication flow:
  - Login form -> `AuthContext.login()` -> token/profile load -> dashboard navigation.
  - Auth init on app load reads token and profile; invalid token is cleared.
- Project management flow:
  - View project list -> create/edit/delete project -> open detail tabs -> upload files -> classification/report actions.
- Client flow:
  - Client dashboard -> project list scoped by org IDs from `user_roles` -> project detail.
  - Client per-project file upload via client endpoints.
- Organization flow:
  - List orgs -> create org -> open details -> open members modal -> assign/remove/create clients.
- AI flow:
  - AI assistant chat with optional attachments and conversation history controls.
  - Valuation IA report generation with uploaded files and downloadable blob result.

### Conditional rendering and protections

- Dashboard role split:
  - admin -> admin dashboard
  - staff -> staff dashboard
  - otherwise -> client dashboard
- Project list role split:
  - admin -> admin list view
  - non-admin -> `ClientProjectList`
- Admin-only action controls are conditionally shown (e.g., classification triggers, delete actions).

## 5. Components

### Reusable/common components

- `ToastProvider` + `useToast` for transient notifications.
- `NotificationDropdown` for live notifications with polling.
- `Button` / `TextField` wrappers under `src/components/common/` (used by profile and possibly others).

### Layout components

- `Layout`, `AdminSidebar`, `AdminAppBar`, `ClientTopNav` define app chrome.
- Admin sidebar includes report-generation status badge from `ReportGenerationContext`.

### Forms

- Login, Register, ProjectForm, Organization create form, Org member creation form, Profile update form, Parameters inline edit/add forms.

### Tables

- Admin project table mode (`ProjectList`).
- Admin user tables (`AdminPage`).
- Asset tables + CAD preview tables (`AssetDisplay`).
- Exchange rates table (`ExchangeRateTable`).
- Files table in project detail (`ProjectDetail`).

### Modals

- Organization create/detail/delete confirmation in `Organizations`.
- Members management modal in `OrgMembersModal`.
- AutoCAD description modal in `ManusReport`.

### Charts

- `DashboardStats` (recharts Pie/Bar charts).
- `DashboardGraphs` (recharts Bar/Area/Line charts).
- No dedicated chart library usage outside dashboard modules found.

### Domain-specific UI

- `AIAssistant` conversation UI with file attachments/history management.
- `ManusReport` upload+generation flow.
- `AssetDisplay` with PDF extraction review and AutoCAD extraction previews.
- `PlanViewer3D` for extracted CAD scene visualization.

## 6. API integration

### Client abstraction

- Primary abstraction in `src/services/api.js` (`api` Axios instance and service exports).
- Secondary service modules:
  - `projectService.js`
  - `organizationService.js`
  - `notificationService.js`
- Some pages/components use direct Axios calls, bypassing service wrappers (`Parameters`, `MarketTicker`, `ExchangeRateTable`).

### Backend endpoints consumed (as coded)

- Auth:
  - `POST /auth/token`
  - `POST /auth/register`
  - `GET /auth/users/me`
  - `PUT /auth/users/me`
  - `POST /auth/change-password`
- Projects/assets/evaluations/reports:
  - `/projects/*`, `/assets*`, `/evaluations*`, `/reports/projects/*`, `/report/{id}?format=...`
  - `/projects/{id}/assets`
  - `/projects/{id}/extracted-images`, `/projects/{id}/extracted-tables`, `/projects/{id}/tables/{filename}/preview`
- Upload/extraction:
  - `/excel/lire_excel/`, `/pdf/extract_pdf/`, `/upload`
  - `/pdf/projects/...` confirmation/delete/listing endpoints
  - `/ezdxf/projects/...` endpoints
- Admin/user/org:
  - `/admin/users`, `/admin/organizations`, `/admin/assign-role`, `/admin/user-roles/{id}`
  - `/admin/projects/{project_id}/files/...` and classification endpoints
  - `/organizations/*`, `/organizations/{orgId}/users*`
  - `/users*`, `/users/email/{email}`
- Client project:
  - `/client/projects/upload-and-create/`
  - `/client/projects/{projectId}/files/upload/`
  - `/client/projects/{projectId}/files/`
- Notifications:
  - `/notifications/*`
- AI assistant and manuscripts:
  - `/ai-assistant/chat`, `/ai-assistant/health`, `/ai-assistant/conversations*`, `/ai-assistant/report/{id}`
  - `/manus/report-from-files`, `/manus/from-files-pdf`, `/manus/health`, `/manus/autocad-describe`
- Market/exchange:
  - `/ex/rates/{baseCurrency}`
  - `/market-data/construction-prices`, `/market-data/material-prices`, `/market-data/land-prices`

### Token handling and auth propagation

- `access_token` stored in `localStorage`.
- Request interceptor attaches bearer token on every request if present.
- `401` response clears auth storage and forces redirect to login.

### Loading/error handling

- Per-page/component loading and error states are common (`useState` flags).
- Toast notifications used for many success/error paths.
- Some flows use alerts (`ProjectUpload`, file validation in some places).
- AI assistant sets user-friendly fallback error message for upstream 502/503/504.

### Could not fully verify

- Actual backend response schemas for every endpoint are not fully typed in frontend; many handlers include fallback parsing for multiple shapes (`data`, raw array, nested fields).

## 7. State and data models

### Local state

- Dominant pattern: component-scoped `useState` for forms, tables, filters, UI toggles, modal visibility, loading/errors.

### Global state

- `AuthContext` state:
  - `user`, `roles`, `loading`, auth helpers, role predicates (`isAdmin`, `isStaff`, `isClient`).
- `ProjectContext` state:
  - `projects`, `currentProject`, `loading`, `error`, CRUD/report methods.
- `ReportGenerationContext` state:
  - status enum (`idle`, loading/success/error variants), `result` blob+filename, `errorMessage`.
- `ToastContext` state:
  - active toasts array and helper methods.

### Data shape examples inferred from usage

- User object includes `user_id`, `email`, `full_name`, `status`, `created_at`, `user_roles`.
- `user_roles` entries include nested `role` and `org_id`.
- Project object includes `project_id`, `name`, `description`, `type_project`, `status`, `progress`, `due_date`, `org_id`, `created_by`, optional `assigned_to`.
- File objects include `file_id`, `original_filename`, `file_type`, `file_size`, `uploaded_at`, `uploaded_by_name`, `processing_status`.

### Derived state and memoization

- Filtering and grouping logic implemented via effects and array transforms in:
  - `ProjectList`, `ClientProjectList`, `Dashboard*`, `Parameters`, `AssetDisplay`.
- `PlanViewer3D` uses `useMemo` for geometry derivation.
- `ProjectContext` uses `useCallback` to stabilize action methods.

## 8. Styling and design system

- Styling approach is mixed:
  - Per-component/page CSS files (`*.css`) are the dominant pattern.
  - MUI components used in `ProfilePage`.
  - Tailwind classes appear in `RegisterPage`.
- Theme tokens:
  - Tailwind extended colors in `tailwind.config.js` (`primary`, `secondary`, `accent`, `background`).
  - CSS variables/design token system in global styles: **not clearly centralized; could not verify a single design-token source**.
- Reusable visual patterns:
  - Glassmorphism cards, gradient headers, icon badges, animated shapes, skeleton loaders, status badges.
- Responsive behavior:
  - Mobile menu toggles and sidebar collapse/expand logic in nav/layout components.
  - CSS-driven responsive behavior exists but exhaustive breakpoint matrix is **not fully verifiable without full CSS audit across all files**.

## 9. Configuration

### Environment variables used in code

- `VITE_API_BASE_URL` (base backend URL)
- `VITE_APP_RAGPREVIX_URL` (used in AI assistant report download fallback)
- `VITE_MANUS_REPORT_TIMEOUT_MS` (override long manus report timeout)

### Build/tooling

- Vite + React plugin + React Compiler Babel plugin (`vite.config.js`).
- ESLint with React hooks/refresh plugin config.
- Tailwind config present.

### Scripts

- `npm run dev` -> Vite dev server
- `npm run build` -> production build to `dist`
- `npm run preview` -> Vite preview server
- `npm run lint` -> ESLint

### Deployment assumptions visible in code

- Render deployment is expected as Node Web Service (not static), with SPA fallback command `serve -s dist`.
- Docker build produces static files and serves via Nginx.
- CI workflow in `.github/workflows/test.yaml` is a placeholder echo, not a real test suite.

## 10. Reliability and edge cases

- Loading/empty/error states are widely implemented in pages/components.
- Auth guard + token-expiry handling is present.
- Parameters page has client-side validation for numeric and required fields.
- Registration includes frontend validation (required fields, email format, password match, minimum length).
- AI and report flows include explicit timeout and service-unavailable messaging.
- Known limitations visible in code:
  - `ClientProjectDetail` download handlers are placeholders (no implemented API call).
  - Settings options explicitly marked as "coming soon" and persisted only locally.
  - Some service logic duplicates endpoints between `api.js` and `projectService.js`.
  - Some views use random trend rendering (`ExchangeRateTable`) rather than real trend data.
  - Error handling style is inconsistent (toast/alert/console).

## 11. How to run

- From repo root (`PrevixFrontEnd`):
  - Install: `npm install` (or `npm ci` in CI/deploy)
  - Dev: `npm run dev`
  - Build: `npm run build`
  - Preview build: `npm run preview`
- Required runtime env vars inferred from code/deploy docs:
  - `VITE_API_BASE_URL`
  - `VITE_APP_RAGPREVIX_URL`
  - optional `VITE_MANUS_REPORT_TIMEOUT_MS`
- Deployment:
  - Render Web Service config is provided in `render.yaml`.
  - Docker image can be built from `Dockerfile`.
- Backend availability requirement:
  - App behavior assumes backend endpoints are reachable at configured base URL.

## 12. Maintainer notes

- Central coupling with backend is strong and spread across multiple files:
  - `src/services/api.js`
  - `src/services/projectService.js`
  - direct Axios calls in several pages/components
- Important invariants to preserve:
  - `AuthContext` token/profile bootstrap and role extraction from `user_roles`
  - Axios interceptor behavior (bearer injection and 401 redirect)
  - Route protection (`PrivateRoute`) and role-based UI branching
  - Project/organization response-shape fallbacks (`data`, arrays, nested fields)
- Core files requiring careful changes:
  - `src/App.jsx` (routing and provider composition)
  - `src/context/AuthContext.jsx`
  - `src/context/ProjectContext.jsx`
  - `src/services/api.js`
  - `src/components/projects/Admin/ProjectDetail.jsx`
  - `src/components/assets/AssetDisplay.jsx`
  - `src/pages/AIAssistant.jsx`
  - `src/pages/ManusReport.jsx`
- Coupling with RAG/AI stack:
  - AI assistant and manus flows depend on backend proxy behavior and, indirectly, RAGPrevix service availability.
  - Frontend includes fallback direct download attempt to `VITE_APP_RAGPREVIX_URL` for assistant report download.
- Not found / could not verify:
  - A single canonical API schema contract file for frontend
  - frontend automated tests validating these flows
