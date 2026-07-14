# Architecture

This project follows a layered architecture to separate presentation, business logic, and data access.

```
Browser
    │
    ▼
React Application
    │
    ▼
React Router
    │
    ▼
Pages
    │
    ▼
Components
    │
    ▼
Services
    │
    ▼
API Layer
    │
    ▼
Backend API
    │
    ▼
Database
```

---

# Architecture Layers

## Browser

- User interacts with the application.
- Sends requests through the UI.

---

## React Application

- Entry point of the application.
- Initializes routing and global providers.

Files

```
main.tsx
App.tsx
```

---

## React Router

Responsible for

- page navigation
- protected routes
- role-based routes

Directory

```
routes/
```

---

## Pages

Responsibilities

- Fetch page data
- Call services
- Manage page state
- Compose reusable components

Example

```
pages/
    LoginPage.tsx
    DashboardPage.tsx
```

Pages should not contain reusable UI logic.

---

## Components

Reusable UI elements.

Examples

```
Button
Card
Table
Modal
Badge
```

Components should

- receive props
- emit events
- never call APIs directly

---

## Services

Business logic layer.

Responsibilities

- Process data
- Coordinate multiple API calls
- Validate business rules

Example

```
authService.ts
userService.ts
parkingService.ts
```

Pages should communicate with Services instead of APIs.

---

## API Layer

Handles HTTP communication.

Responsibilities

- GET
- POST
- PUT
- DELETE

Example

```
api/
    authApi.ts
    userApi.ts
```

API layer should not contain business logic.

---

## Backend

Spring Boot REST API.

Responsibilities

- Authentication
- Authorization
- Business processing
- Database access

---

## Database

Stores

- Users
- Roles
- Buildings
- Parking Slots
- Sessions
- Payments

---

# Data Flow

```
User

↓

Page

↓

Service

↓

API

↓

Backend

↓

Database
```

Response

```
Database

↑

Backend

↑

API

↑

Service

↑

Page

↑

User
```

---

# State Management

Global State

```
stores/
```

Examples

- Authentication
- Current User
- Theme

Local State

Use

```
useState()
```

for page-specific data.

---

# Shared Modules

```
components/
hooks/
utils/
constants/
types/
```

These modules should be reusable across the entire application.

---

# Dependency Rules

Allowed

```
Page
    ↓
Service
    ↓
API
```

Allowed

```
Page
    ↓
Component
```

Not Allowed

```
Component
      ↓
API
```

Not Allowed

```
Component
      ↓
Service
```

Not Allowed

```
API
    ↓
Store
```

---

# Folder Responsibility

```
pages
    Orchestrate features

components
    Render UI

services
    Business logic

api
    HTTP communication

stores
    Global state

utils
    Shared helper functions
```

---

# Design Principles

- Separation of Concerns
- Single Responsibility Principle
- Reusable Components
- Layered Architecture
- Centralized API Management
- Global State only when necessary
┌──────────────────────────────┐
│          main.jsx            │
│------------------------------│
│ - import ReactDOM            │
│ - import App                 │
│ - import index.css           │
│ - render <App />             │
└──────────────┬────────────── ┘
               │
               ▼
┌──────────────────────────────┐
│           App.jsx            │
│------------------------------│
│ - BrowserRouter              │
│ - Global Providers           │
│   (Redux/Auth/Theme...)      │
│ - Render AppRoutes           │
└──────────────┬────────────── ┘
               │
               ▼
┌──────────────────────────────┐
│      routes/AppRoutes        │
│------------------------------│
│ - Định nghĩa toàn bộ route   │
│ - Phân quyền route           │
│ - ProtectedRoute             │
└───────┬─────────┬─────────── ┘
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
