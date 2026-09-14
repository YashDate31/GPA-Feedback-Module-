<div align="center">

  <img src="client/public/logo.png" alt="Government Polytechnic Awasari (Kh) Logo" width="130" style="border-radius: 50%; box-shadow: 0 8px 24px rgba(0,0,0,0.12);" />

  # 🎓 Government Polytechnic Awasari (Khurd)
  ### **Faculty Performance Evaluation & Student Feedback System**
  #### *Adhering to MSBTE CIAAN-2023 K-Scheme Guidelines*

  <p>
    <em>तेजस्वि नावधीतमस्तु (Tejasvi Navadhitamastu) — "Let our learning be radiant and purposeful"</em>
  </p>

  [![MSBTE K-Scheme](https://img.shields.io/badge/MSBTE-K--Scheme%20CIAAN--2023-blue.svg?style=for-the-badge&logo=googlescholar)](https://msbte.org.in/)
  [![React 19](https://img.shields.io/badge/React-19.2-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
  [![Vite](https://img.shields.io/badge/Vite-8.2-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

  <p>
    <a href="#-key-features">Key Features</a> •
    <a href="#-supported-departments">Departments</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-msbte-16-parameters">MSBTE Parameters</a> •
    <a href="#-deployment-guide">Deployment</a> •
    <a href="#-developer-profile">Developer</a>
  </p>

</div>

---

## 📌 About The Project

The **GPA Faculty Feedback Portal** is an institutional web platform designed specifically for **Government Polytechnic Awasari (Khurd)**. It automates and digitizes the mandatory **MSBTE CIAAN-2023 K15** faculty performance evaluation process across all engineering branches.

Students securely submit anonymous feedback on their respective course instructors across 16 MSBTE parameters, while Class Teachers and Heads of Departments manage course allocations, monitor real-time submissions, and instantly export official **Excel (`.xlsx`)** and **Printable PDF** reports.

---

## ✨ Key Features

| Category | Capabilities & Highlights |
|---|---|
| 📋 **Student Feedback** | • Enrollment-verified student access against verified semester rosters.<br>• Clean, step-by-step mobile-responsive evaluation cards.<br>• Automated 16-parameter scoring (1–5 scale) converted to MSBTE marks out of 25.<br>• Strict one-time submission protection per session. |
| 👨‍🏫 **Class Teacher Suite** | • Semester-scoped administration (Semester 1 to Semester 6).<br>• Theory, Practical, and Batch-wise (`B1`, `B2`, `B3`) faculty allocations.<br>• Real-time submission counter with progress tracking. |
| 🛡️ **Roster Access Control** | • Upload student rosters via Excel (`.xlsx`) or individual manual entry.<br>• Individual toggle switch to enable/disable student evaluation access instantly.<br>• Prevents duplicate, fake, or unauthorized submissions. |
| 📊 **Institutional Reports** | • **Excel Export**: Formatted spreadsheet with college headers, faculty summary, theory/practical breakdown.<br>• **Official PDF Report**: Beautifully styled MSBTE report card with institution seal and signature rows. |
| 💬 **Community Feedback** | • Interactive landing page feedback button with quick modal.<br>• Direct feedback dispatch to portal developers (`dypatil311@gmail.com`). |

---

## 🏢 Supported Departments

The module comes pre-configured with full MSBTE K-Scheme curriculum subjects for all 7 engineering departments:

| Branch Code | Department Name | Subjects Seeded |
|:---:|---|:---:|
| **CO** | Computer Engineering | Sem 1 – Sem 6 |
| **CE** | Civil Engineering | Sem 1 – Sem 6 |
| **ME** | Mechanical Engineering | Sem 1 – Sem 6 |
| **EE** | Electrical Engineering | Sem 1 – Sem 6 |
| **ETC / EJ** | Electronics & Telecommunication Engineering | Sem 1 – Sem 6 |
| **IT / IF** | Information Technology | Sem 1 – Sem 6 |
| **AE** | Automobile Engineering | Sem 1 – Sem 6 |

---

## 🔄 System Workflow

```mermaid
flowchart TD
    subgraph Student["🎓 Student Workflow"]
        A[Visit Portal] --> B[Enter Enrollment Number & Select Branch]
        B --> C{Roster Check}
        C -- Not Active / Unlisted --> D[Access Denied Error]
        C -- Verified & Active --> E[Load Assigned Semester Faculty]
        E --> F[Score 16 MSBTE Parameters per Teacher]
        F --> G[Submit Feedback]
        G --> H[Unique Submission Lock Enforced]
    end

    subgraph Teacher["👨‍🏫 Class Teacher Workflow"]
        I[Teacher Login] --> J[Teacher Dashboard]
        J --> K[Create / Activate Feedback Session]
        J --> L[Manage Faculty & Batch Allocations]
        J --> M[Upload / Toggle Student Roster]
        J --> N[View Live Submission Statistics]
        N --> O[Download Official Excel & PDF Reports]
    end
```

---

## 📝 16 MSBTE CIAAN-2023 Evaluation Parameters

Evaluations are conducted on a 5-point rating scale (*1: Very Poor, 2: Poor, 3: Good, 4: Very Good, 5: Excellent*) and normalized out of **25 marks**:

```
 1. Coverage of syllabus according to teaching plan
 2. Covering relevant topics beyond the syllabus
 3. Effectiveness in terms of technical contents / subject matter
 4. Effectiveness in terms of communication skills & clarity
 5. Effectiveness in terms of teaching aids & ICT tools
 6. Motivation and inspiration for self-learning mode
 7. Support for development of practical skills & hands-on work
 8. Support for project, seminar, and technical paper preparation
 9. Timely and constructive feedback on student academic progress
10. Punctuality, discipline, and attendance in classes/labs
11. Domain knowledge, depth, and command over the subject
12. Interaction, accessibility, and approachability towards students
13. Ability to resolve difficulties, doubts, and academic problems
14. Encouragement to participate in co-curricular activities
15. Encouragement to participate in extra-curricular & sports activities
16. Guidance during Industrial Training / Internship (Optional for Sem 1-4, Compulsory for Sem 5-6)
```

---

## 🛠️ Technology Stack

<div align="center">

| Frontend | Backend | Database & Storage | Tooling & Deployment |
|:---:|:---:|:---:|:---:|
| **React 19** | **Node.js** | **PostgreSQL (Supabase)** | **Vite** |
| **Vanilla CSS3** | **Express 4** | **MySQL 8 (Local fallback)** | **Render Cloud** |
| **Lucide React** | **JWT Authentication** | **Connection Pooling** | **Git / GitHub** |
| **jsPDF & AutoTable** | **Bcrypt.js** | **Relational Foreign Keys** | **XLSX SheetJS** |

</div>

---

## 📂 Project Structure

```text
GPA-Feedback-Module/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/
│   │   ├── logo.png            # Institution Emblem
│   │   └── favicon.svg         # Favicon
│   ├── src/
│   │   ├── api/                # Axios HTTP client with auto JWT attachment
│   │   ├── context/            # Authentication & session states
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx # Public home page with feedback modal
│   │   │   ├── LoginPage.jsx   # Role-based faculty authentication
│   │   │   ├── StudentPage.jsx # Multi-step student evaluation interface
│   │   │   ├── AboutPage.jsx   # Institutional and developer profile
│   │   │   └── teacher/        # Teacher allocations, roster, sessions & reports
│   │   ├── utils/              # PDF report generator (jsPDF-AutoTable)
│   │   └── index.css           # Premium glassmorphism UI & responsive styles
│   └── vite.config.js          # Vite configuration
│
└── server/                     # Backend Application (Express + Node.js)
    ├── src/
    │   ├── controllers/        # Business logic (Auth, Sessions, Feedback, Reports)
    │   ├── routes/             # REST API endpoints with JWT guards
    │   ├── db/
    │   │   ├── index.js        # Dual database connector (Supabase / MySQL)
    │   │   ├── supabase_schema.sql # Complete 1-click database schema & seed data
    │   │   └── schema.sql      # MySQL schema definition
    │   └── index.js            # Express server initialization
    └── package.json
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [Git](https://git-scm.com/)
- A free [Supabase](https://supabase.com) account or local MySQL instance

### 1. Clone the Repository
```bash
git clone https://github.com/dypatil31/GPA-Feedback-Module.git
cd GPA-Feedback-Module
```

### 2. Configure Backend
```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your database credentials:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_random_key_min_32_chars
DATABASE_URL=postgresql://postgres.your-project:your-password@your-pooler.supabase.com:6543/postgres
```

Run database migration & seeds:
```bash
npm run dev
```

### 3. Configure Frontend
```bash
cd ../client
npm install
cp .env.example .env
```

Start the Vite development server:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🌐 Production Deployment Guide

### Database (Supabase)
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** ➔ Paste contents of [`server/src/db/supabase_schema.sql`](server/src/db/supabase_schema.sql) ➔ Click **Run**.
3. Copy the **Connection String (URI)** under **Project Settings ➔ Database**.

### Backend (Render Web Service)
1. In [Render](https://render.com), click **New Web Service** and connect this repository.
2. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
3. Environment Variables:
   - `DATABASE_URL` = *(Your Supabase connection URI)*
   - `JWT_SECRET` = *(A secure random 32+ character key)*
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = `https://your-frontend.onrender.com`

### Frontend (Render Static Site)
1. In Render, click **New Static Site** and connect this repository.
2. Settings:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
4. Add Rewrite Rule:
   - `/*` ➔ `/index.html` (Rewrite)

---

## 👨‍💻 Developer Profile

<div align="center">

| Detail | Information |
|---|---|
| **Developer** | **Yash Vijay Date** |
| **Enrollment No.** | `24210270230` |
| **Department** | Computer Engineering (Batch 2024 – 2027) |
| **Institute** | Government Polytechnic Awasari (Khurd), Ambegaon, Pune |
| **GitHub** | [@YashDate31](https://github.com/YashDate31) |
| **Feedback Email** | [dypatil311@gmail.com](mailto:dypatil311@gmail.com) |
| **Instagram** | [@_dy.patil_](https://instagram.com/_dy.patil_) |

</div>

---




## 📄 License & Attribution

This project is developed for educational and institutional evaluation use at **Government Polytechnic Awasari (Khurd)**.

```
Copyright (c) 2025-2026 Government Polytechnic Awasari (Khurd)
All Engineering Departments · MSBTE K-Scheme Curriculum
```

<div align="center">
  <sub>Built with ❤️ by Yash Vijay Date for GPA students and faculty.</sub>
</div>
