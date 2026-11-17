# Doctor Tracker — Frontend Web Application

## Description
Doctor Tracker Frontend is an editorial, minimalist clinical SaaS application built with Next.js (App Router), TypeScript, and Tailwind CSS. Designed around principles of typographic discipline, intentional whitespace, and restrained aesthetics inspired by modern editorial portfolios, it equips healthcare supervisors and clinical managers with real-time analytics, responsive practitioner allocations, multi-attribute patient filtering, and streamlined medical record management across desktop, tablet, and mobile devices.

---

## Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Backend API**: The Doctor Tracker backend running locally on `http://localhost:5000` or deployed on Vercel.
- **npm** or **pnpm** / **yarn**

### 1. Installation
Navigate to the `frontend` directory and install project dependencies:
```bash
cd frontend
npm install
```

### 2. Environment Variables Configuration
Copy the provided `.env.example` file to create your local `.env.local`:
```bash
cp .env.example .env.local
```

Ensure your `.env.local` points to your backend REST API:
```env
# Backend RESTful API Endpoint
# Local Development:
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Production Deployment (e.g., on Vercel):
# NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app/api
```

### 3. Running in Development
Start the Next.js development server:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Building for Production
Verify production builds and optimizations:
```bash
npm run build
npm start
```

### 5. Deployment to Vercel
This repository is zero-config ready for Vercel deployment:
1. Import the `frontend` repository on [Vercel](https://vercel.com).
2. Set Framework Preset to **Next.js**.
3. Under Environment Variables, add:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend API URL (e.g., `https://doctor-tracker-api.vercel.app/api`).
4. Click **Deploy**.

---

## System Architecture

```
                      [ User Browser / Client View ]
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
[ Desktop Viewport ]                              [ Mobile / Tablet Viewport ]
 (Permanent Minimalist Sidebar)                    (Collapsible Off-Canvas Sheet)
           │                                                 │
           └────────────────────────┬────────────────────────┘
                                    │
                       [ AppShell / Layout Guard ]
                 (Enforces Session & JWT Verification)
                                    │
     ┌──────────────────────────────┼──────────────────────────────┐
     ▼                              ▼                              ▼
[ / Dashboard Page ]       [ /doctors Directory ]        [ /patients Directory ]
 ├── StatCard KPIs          ├── Filter Controls           ├── Filter Controls
 ├── Patient Load (Bar)     ├── Debounced Search          ├── Debounced Search
 ├── 30-Day Trend (Area)    ├── Doctor Table              ├── Patient Table
 ├── Condition Donut        ├── Create/Edit Doctor Modal  ├── Register/Edit Modal
 └── Status Progress Bars   └── Assigned Patients Drawer  └── Attendance Lookup
                                    │
                                    ▼
                      [ Centralized API Layer (lib/api.ts) ]
                    (Bearer JWT Injection, Error Normalization)
                                    │
                                    ▼
                      [ Node.js / Express REST API ]
```

### Service Interactions & Data Flow
1. **Authentication Handshake**: The user authenticates through `/login`. On success, the JWT token and user profile are persisted to `localStorage` and managed globally via `AuthContext`.
2. **Protected Route Shield**: `AppShell` evaluates authentication status before rendering clinical data. Unauthorized visits immediately redirect to `/login`.
3. **Debounced Query Execution**: Search and filter inputs execute debounced queries (350ms window) against the Express backend, minimizing extraneous HTTP requests while delivering instant UI feedback.
4. **Optimistic & Synchronized State**: Drawer interactions (such as adding or removing a patient directly under a doctor) immediately trigger parent refetches to keep patient count pills and analytics synchronized.

---

## Technical Decisions

### Decision 1: Next.js App Router with Client-Side Hydration Boundaries over Pages Router
- **Context**: The application combines data-heavy analytical dashboards with highly interactive drawers, modals, debounced search filters, and form dialogs.
- **Why App Router with Focused Client Boundaries**: App Router offers clean layouts (`layout.tsx`), modern file-based routing, and granular control over client-side interactivity (`'use client'`). By isolating interactive components (such as drawers and charts) from layout wrappers, we achieve optimal initial page load speeds and prevent unnecessary full-page re-renders.
- **Outcome**: Fluid user experience, fast page transitions, and effortless deployment to Vercel's Edge Network.

### Decision 2: Recharts SVG Analytics with Restrained Color Schemes over Canvas Libraries
- **Context**: Visualizing clinical statistics (patient load per practitioner, 30-day registration timelines, and diagnosis distributions) requires high legibility, responsive scaling, and adherence to editorial design aesthetics.
- **Why Recharts**: Unlike canvas-based chart libraries (such as Chart.js) which can blur on high-DPI retina screens and complicate custom HTML tooltips, Recharts renders crisp vector SVGs directly into the React DOM. This allowed custom styling with deep navy hues (`#0F172A`), subtle grid lines (`#F1F5F9`), and typography matching the application's minimalist identity.
- **Outcome**: Flawless responsive scaling on mobile and desktop, zero canvas blur, and custom interactive tooltips highlighting doctor credentials and percentages.

---

## Visual Evidence & UI Documentation

### Desktop Views
- **Clinical Dashboard (`/`)**: Displays 4 top-tier KPI cards (Total Doctors, Total Patients, Patients Per Doctor, Critical Cases), Recharts Patient Load Bar Chart, 30-day Admission Area Chart, Diagnosis Donut Chart, and Recent Admissions Table.
- **Practitioners Directory (`/doctors`)**: Searchable table with specialization and hospital filters, patient count pills, "+ Add Doctor" modal, and dedicated "Doctor Patients Drawer" showing assigned patients with instant allocation controls.
- **Patient Management (`/patients`)**: Medical records portal with condition and doctor filtering, care status tags (Critical, Under Observation, Stable, Recovering), and comprehensive patient editing dialogs.

### Mobile & Tablet Views
- **Responsive Layout**: Minimalist hamburger navigation drawer seamlessly collapses on mobile viewports.
- **Touch-Friendly Controls**: Tables feature smooth horizontal scrolling with sticky headers and responsive pagination bars.

---

## Default Administrator Credentials

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@doctortracker.com` | `Password@123` |

*(A one-click "Autofill Demo Credentials" button is also provided directly on the `/login` page for fast reviewer access).*
