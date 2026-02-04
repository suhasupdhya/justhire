# CYGNUSA Elite-Hire 🚀

An AI-enabled HR Evaluation System focused on **Integrity, Transparency, and Explainability**.
Built for the Hackathon 2026.

## 📋 Prerequisites

*   **Node.js** (v18+)
*   **Docker** (for PostgreSQL database)
*   **npm**

## 🛠️ Setup & Installation

### 1. Database Setup (Docker)
Start the PostgreSQL container:
```bash
docker run -d --name elite-hire-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
```

### 2. Backend Server
Navigate to the server directory, install dependencies, and sync the database.

```bash
cd server
npm install

# Initialize Database Schema
npx prisma db push

# Start the Server
npm run dev
```
*The server will run on `http://localhost:3000`*

### 3. Frontend Client
Open a new terminal, navigate to the client directory, and start the UI.

```bash
cd client
npm install
npm run dev
```
*The client will run on `http://localhost:5173` (usually)*

---

## 🏃‍♂️ Quick Start Guide

1.  **Open the App**: Go to `http://localhost:5173`.
2.  **Recruiter Flow**:
    *   Register a new account (Select Role: **RECRUITER**).
    *   Post a Job (e.g., *Frontend Developer*).
    *   Wait for candidates.
3.  **Candidate Flow**:
    *   Open Incognito window or logout.
    *   Register a new account (Select Role: **CANDIDATE**).
    *   **Apply** to the job (Upload any dummy PDF as resume).
    *   **Take Assessment**: If the job is technical, click "Start Assessment".
    *   *Try switching tabs during the test to see the Integrity Shield in action!*
4.  **Review**:
    *   Log back in as Recruiter.
    *   View the Application to see the **Explainable AI Decision** and integrity logs.

## 🏗️ Architecture
*   **Frontend**: React, TypeScript, Tailwind CSS, Monaco Editor (Coding Sandbox).
*   **Backend**: Node.js, Express, Prisma ORM.
*   **Database**: PostgreSQL.
*   **AI/Integrity**: Custom rule-based inference engine for transparent "White-Box" decisions.

## 🧪 Features
*   **Gatekeeper**: Auto-shortlisting based on Resume Match.
*   **Integrity Shield**: Webcam & Tab-switch monitoring.
*   **Explainable AI**: No black-box decisions; see exactly *why* a candidate was hired or rejected.
