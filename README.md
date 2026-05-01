# Project Management System

A robust and secure Project Management application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

- **Secure Authentication**: User registration with email-based OTP verification.
- **Project Management**: Create, manage, and track projects effectively.
- **Task Assignment**: Assign tasks to team members with role-based access control.
- **Unified Messaging System**: Centralized inbox for project invites and task assignment alerts.
- **Role-Based Access Control**: Precise permissions (e.g., status updates restricted to assigned members).
- **Responsive Dashboard**: Professional, task-centric UI for seamless user experience.
- **Email Notifications**: Automated notifications for booking, invites, and reminders.

## 🛠️ Tech Stack

### Backend
- **Node.js & Express.js**: Server-side framework.
- **MongoDB & Mongoose**: Database and ODM.
- **JWT & Bcryptjs**: Secure authentication and password hashing.
- **Nodemailer**: Email services for OTP and notifications.

### Frontend
- **React**: UI library.
- **Vite**: Fast build tool and dev server.
- **React Router Dom**: Client-side routing.
- **Axios**: HTTP client for API requests.
- **Lucide React**: Icon library.

---

## 🏃 Getting Started

### Prerequisites
- Node.js installed on your machine.
- MongoDB database (local or Atlas).

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project_management
```

### 2. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add the following configurations:
   ```env
   PORT=5000
   DATABSE_URL=your_mongodb_connection_string
   ```
   *(Note: Ensure `DATABSE_URL` is spelled as per your configuration in `server.js`)*.

4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
project_management/
├── backend/            # Express.js server, models, routes, and controllers
├── frontend/           # React application (Vite)
│   ├── src/            # Components, pages, and logic
│   └── public/         # Static assets
└── README.md           # Project documentation
```

## 📜 License
This project is licensed under the ISC License.

---

**Developed by [Kishore Kumar](https://github.com/kaushal-kumar-2109)**
