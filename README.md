# Government Polytechnic Awasari (Khurd)
## Student Feedback on Faculty Performance Module (MSBTE CIAAN-2023 K15)

<div align="center">
  <img src="client/public/logo.png" alt="Government Polytechnic Awasari (Kh) Logo" width="130" />
  <p><strong>Government Polytechnic Awasari (Khurd) · ESTD. 2008</strong><br>
  <em>तेजस्वि नावधीतमस्तु (Tejasvi Navadhitamastu)</em><br>
  Department of Computer Engineering</p>
</div>

---

## 👨‍💻 Developed By

| Field | Details |
|---|---|
| **Developer** | **Yash Vijay Date** |
| **Enrollment No.** | `24210270230` |
| **Branch** | Computer Engineering |
| **Batch** | 2024 – 2027 |
| **Institution** | Government Polytechnic Awasari (Khurd), Pune |
| **Email** | [yashdate31@gmail.com](mailto:yashdate31@gmail.com) |
| **GitHub** | [@YashDate31](https://github.com/YashDate31) |
| **Instagram** | [@_dy.patil_](https://instagram.com/_dy.patil_) |

---

## 📌 Project Overview

An automated, role-based student feedback module built specifically for **Government Polytechnic Awasari (Khurd)** adhering strictly to the **MSBTE CIAAN-2023 K15** guidelines.

### ✨ Key Features
1. **Class Teacher Management**:
   - Class Teachers manage their respective semesters (Semester 1 to Semester 6).
   - Create feedback sessions with academic year tagging (e.g. `2024-25`, `2025-26`) and status controls (`draft`, `active`, `closed`).
   - Assign Theory and Practical faculty to subjects with fine-grained mode toggles (`Theory`, `Practical`, or `Both`).
   - Assign faculty to specific practical batches (`B1`, `B2`, `B3`).
2. **Student Roster Verification & Access Control**:
   - Upload student roster directly via Excel or add students individually.
   - Individual student toggle switch: enable or disable student access individually or in bulk.
   - Prevents unverified or fraudulent submissions by validating student enrollment numbers against the semester roster.
   - One submission per student per session enforced strictly.
3. **Faculty-by-Faculty Evaluation**:
   - Google Forms-inspired, multi-step interface with mobile-optimized cards and inputs.
   - Evaluates each faculty member on all **16 MSBTE parameters** (scale 1–5: Very Poor to Excellent; parameter 16 optional).
   - Instant progress tracker showing real-time completion.
4. **Analytics & Excel Reports**:
   - Real-time submission counter and faculty rating averages.
   - Export official CIAAN-2023 evaluation reports directly to Microsoft Excel format (`.xlsx`).

---

## 📂 Project Structure

```
GPA Feedback Module/
├── client/                     # Frontend (React + Vite)
│   ├── public/
│   │   └── logo.png            # College Logo
│   ├── src/
│   │   ├── api/axios.js        # Centralized Axios client (with VITE_API_BASE_URL)
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx # Hero portal & modern institution footer
│   │   │   ├── LoginPage.jsx   # Class Teacher login
│   │   │   ├── AboutDeveloper.jsx # Developer Profile page
│   │   │   ├── StudentPage.jsx # Multi-step student evaluation
│   │   │   └── teacher/        # Class Teacher Dashboard & Modules
│   │   └── index.css           # Design system & styles
│   └── index.html              # App entry & favicon
│
└── server/                     # Backend (Node.js + Express + Supabase/MySQL)
    └── src/
        ├── controllers/        # Business logic & authentication
        ├── routes/             # API endpoints
        ├── db/
        │   ├── index.js        # Dual database adapter (Supabase PostgreSQL / MySQL)
        │   ├── supabase_schema.sql # Complete Supabase 1-click schema + seeds
        │   ├── reset_and_seed.js # Clean reset utility for local MySQL
        │   └── schema.sql      # MySQL schema
        └── index.js            # Server entry point
```

---

## ⚡ Deployment Guide (Render + Supabase)

### Step 1: Set Up Database on Supabase
1. Go to [Supabase](https://supabase.com) and create a free project (e.g. `gpa-feedback-module`).
2. Once the project is created, open the **SQL Editor** in the left sidebar.
3. Click **New Query**, copy the entire contents of [`server/src/db/supabase_schema.sql`](server/src/db/supabase_schema.sql), and paste it into the editor.
4. Click **Run**. This will create all tables and pre-populate the 6 Class Teacher accounts and all 42 MSBTE Computer Engineering subjects!
5. In Supabase, navigate to **Project Settings** > **Database** > **Connection string** > **URI** (choose "Session pooler" or direct connection string) and copy the URI.
   - Example: `postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`

---

### Step 2: Deploy Backend Web Service on Render
1. Go to [Render](https://render.com) and click **New +** > **Web Service**.
2. Connect your GitHub repository `dypatil31/GPA-Feedback-Module`.
3. Configure settings:
   - **Name**: `gpa-feedback-server`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Plan**: `Free`
4. Add **Environment Variables**:
   - `DATABASE_URL`: *(Paste your Supabase connection URI from Step 1)*
   - `JWT_SECRET`: *(Generate and set a strong, random 32+ character secret string)*
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
5. Click **Create Web Service**. Wait for the build to finish. Copy your backend service URL (e.g. `https://gpa-feedback-server.onrender.com`).

---

### Step 3: Deploy Frontend Static Site on Render
1. In Render, click **New +** > **Static Site**.
2. Select your GitHub repository `dypatil31/GPA-Feedback-Module`.
3. Configure settings:
   - **Name**: `gpa-feedback-portal`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variable**:
   - `VITE_API_BASE_URL`: `https://gpa-feedback-server.onrender.com/api` *(Your backend URL + `/api`)*
5. Configure **Redirects/Rewrites** (for single-page client routing):
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**. Your portal will be live!

---

## 🔑 Authentication & Access Control

Class Teacher and HOD accounts are managed securely:
- **Format**: Structured by department and semester (e.g., `computer@first`, `civil@second`, `mechanical@third`, `automobile@first`).
- **Security**: Passwords are encrypted with `bcrypt` (10 rounds). Passwords must be configured securely per institution deployment and should never be committed to public repositories.

---

## 💻 Local Development Guide

### 1. Configure Local Database
In `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=college_feedback
JWT_SECRET=msbte_feedback_jwt_secret_2025
```

### 2. Run Backend
```bash
cd server
npm install
npm run dev
```

### 3. Run Frontend
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173`.

---

## 📝 16 MSBTE CIAAN-2023 Parameters

1. Coverage of syllabus
2. Covering relevant topics beyond the syllabus
3. Effectiveness in terms of technical contents / course contents
4. Effectiveness in terms of communication skills
5. Effectiveness in terms of Teaching aids
6. Motivation and inspiration for students to learn in self-learning mode
7. Support for development of student skills: Practical Performance
8. Support for development of student skills: Project and Seminar preparation
9. Feedback provided on student progress
10. Punctuality and discipline
11. Domain Knowledge
12. Interaction with students
13. Ability to resolve difficulties
14. Encourage to participate in co-curricular activities
15. Encourage to participate in Extra-curricular activities
16. Guidance during Internship (Optional)

---

© 2025 Government Polytechnic Awasari (Khurd) · Department of Computer Engineering
#   G P A - F e e d b a c k - M o d u l e  
 