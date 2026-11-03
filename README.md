# Product Management System - Frontend Client

A modern, responsive Single Page Application (SPA) designed for an enterprise Product Management ERP system. Features real-time inventory tracking, interactive visual analytics, server-side data tables, and dynamic form workflows.

---

## Default Admin Credentials

Use these credentials to log in to the application:

- **Email:** `admin@gmail.com`
- **Password:** `123456`

---

## Tech Stack

- **Framework & Language:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 + Sass (SCSS modules)
- **State Management:** Redux Toolkit + Redux Persist (localStorage session persistence)
- **Routing:** React Router DOM v7 (Public & Protected Auth Guards)
- **Forms & Validation:** Formik + Yup schema validation
- **Data Visualization:** Recharts (Product status donut chart & top 4 categories bar chart)
- **UI Components & Icons:** Headless UI, React Icons (Feather & FontAwesome)
- **Notifications:** Sonner

---

## Core Features

- **Authentication & Protected Routes:** Secure session authentication with JWT access/refresh token handling and automatic route guards redirecting to `/login`.
- **Interactive Dashboard:**
  - 5 vibrant KPI summary cards (Total Products, Active Products, Total Categories, Low Stock Alerts, Out of Stock).
  - Status breakdown donut chart with high-contrast percentage tags.
  - Top 4 categories volume bar chart with clean horizontal labels.
  - Fully responsive, scrollable low-stock replenishment alert table.
- **Product Management:**
  - Server-side paginated data table with column-level search filters and sorting.
  - In-row interactive product status dropdown with automatic viewport detection (opens upward when screen space below is limited).
  - Cloudinary image previews with a modal viewer.
  - Dynamic Formik Add/Update product modal using JSON-driven field definitions and image upload.
- **Category Management:**
  - Complete category listing, creation, editing, and deletion.
  - Powers category selection dropdowns across product creation forms.
- **Modular Theme System:**
  - Reusable, accessible UI components (`Table`, `SelectBase`, `Modal`, `RenderField`, `Spinner`, `Breadcrumb`).

---

## Environment Variables

Create a `.env` file in the `frontend/` root directory:

```env
# Local Development
VITE_GATEWAY="http://localhost:5000/api/v1/"
VITE_ENV="dev"
```

For production deployment (e.g. Vercel), set:

```env
VITE_GATEWAY="https://your-backend-service.onrender.com/api/v1/"
VITE_ENV="production"
```

---

## Getting Started

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will start at `http://localhost:5173` (or the next available port).

4. **Build for production:**
   ```bash
   npm run build
   ```
   Compiled static assets will be output to the `dist/` directory.

5. **Lint and code quality checks:**
   ```bash
   npm run lint
   ```

