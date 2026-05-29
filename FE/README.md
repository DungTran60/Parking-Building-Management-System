# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

┌──────────────────────────────┐
│          main.jsx           │
│------------------------------│
│ - import ReactDOM           │
│ - import App                │
│ - import index.css          │
│ - render <App />            │
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────┐
│           App.jsx           │
│------------------------------│
│ - BrowserRouter             │
│ - Global Providers          │
│   (Redux/Auth/Theme...)     │
│ - Render AppRoutes          │
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────┐
│      routes/AppRoutes       │
│------------------------------│
│ - Định nghĩa toàn bộ route  │
│ - Phân quyền route          │
│ - ProtectedRoute            │
└───────┬─────────┬───────────┘
        │         │
        │         │
        │         │
        ▼         ▼
 ┌───────────┐ ┌───────────┐
 │   Admin   │ │   Staff   │
 │  Routes   │ │  Routes   │
 └─────┬─────┘ └─────┬─────┘
       │             │
       ▼             ▼

┌──────────────────┐   ┌──────────────────┐
│ AdminLayout.jsx  │   │ StaffLayout.jsx  │
│------------------│   │------------------│
│ Sidebar          │   │ Navbar           │
│ Header           │   │ Staff Menu       │
│ Outlet           │   │ Outlet           │
└────────┬─────────┘   └────────┬─────────┘
         │                      │
         ▼                      ▼

 ┌────────────────┐      ┌────────────────┐
 │ DashboardPage  │      │ CheckInPage    │
 │ UserManagement │      │ CheckOutPage   │
 │ PricingPage    │      │ IncidentPage   │
 │ ReportPage     │      └────────────────┘
 └────────────────┘


                USER FLOW
                =========

                       ▼
              ┌─────────────────┐
              │  UserLayout.jsx │
              │-----------------│
              │ Navbar          │
              │ Footer          │
              │ Outlet          │
              └────────┬────────┘
                       │
                       ▼

          ┌─────────────────────────┐
          │ HomePage                │
          │ ReservationPage         │
          │ MyParkingPage           │
          │ PaymentHistoryPage      │
          └─────────────────────────┘



AUTH FLOW
=========

┌────────────────────┐
│ LoginPage.jsx      │
│ RegisterPage.jsx   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ authApi.js         │
│ axiosClient.js     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Backend API        │
└────────────────────┘



DATA FLOW
==========

Pages
  │
  ▼
Components
  │
  ▼
Services
  │
  ▼
API Layer (axios)
  │
  ▼
Backend Server



SHARED MODULES
==============

components/
├── common     → Button, Input, Spinner...
├── forms      → Form components
├── modal      → Popup/Dialog
├── table      → Reusable tables
├── charts     → Charts thống kê
└── layout     → Header/Sidebar/Navbar

hooks/
└── custom hooks dùng chung

utils/
└── helper functions

constants/
└── role, status, config...

store/
└── Redux/Zustand state global