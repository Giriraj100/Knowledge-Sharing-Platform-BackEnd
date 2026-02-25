# Knowledge Sharing Platform - Backend

This repository contains the backend for the Knowledge Sharing Platform, built using Node.js, Express, and MySQL.

## 1. Approach

### Architecture Overview

The backend follows a standard MVC (Model-View-Controller) pattern adapted for an Express API without an ORM.

- **Controllers:** Handle incoming requests, apply business logic, and send HTTP responses.
- **Routes:** Map HTTP verbs and paths to the correct controller actions.
- **Middleware:** Manages JWT-based authentication to protect secure routes.
- **Config (Database):** Uses `mysql2/promise` to connect to a MySQL database and automatically creates the database schema and tables upon initialization, removing the need for manual SQL script execution.
- **AI Layer:** Uses Groq API.

### Folder Structure

```
backend/
├── config/
│   └── db.js            # Database connection & auto-initialization
├── controllers/
│   ├── authController.js    # Registration and Login logic
│   └── articleController.js # Article CRUD and AI Mock logic
├── middleware/
│   └── authMiddleware.js    # JWT verification
├── routes/
│   ├── authRoutes.js
│   └── articleRoutes.js
├── .env                 # Environment variables
└── server.js            # Main application entry point
```

### Key Design Decisions

- **Auto-database initialization:** To simplify setup, the server checks for the database and tables on startup and creates them if they don't exist.
- **Raw SQL queries:** Chosen over an ORM (like Sequelize) for a lightweight implementation and direct control over queries.
- **Bcrypt & JWT:** Used for secure password hashing and stateless session management.
- **Mocked AI Endpoint:** The backend exposes a `/api/articles/ai` route designed to simulate an external API call to OpenAI or Claude.

---

## 2. AI Usage

### Which AI tools you used

- **Gemini CLI / Gemini:** Used as an interactive pair-programmer to plan the architecture, scaffold the application, and write the boilerplate code.

### Where AI helped

- **Architecture & Setup:** Outlined the Phase 1-4 approach to separating the React frontend from the Express backend.
- **Code Generation (SQL):** Generated the MySQL schema (`CREATE TABLE`) for users and articles within the initialization script.
- **Code Generation (API):** Generated the RESTful Express routes and controllers, including authentication (JWT/bcrypt) and CRUD operations.
- **Refactoring / Optimization:** Organized the server logic into clear `routes`, `controllers`, and `config` folders instead of a monolithic `server.js`.

### What you reviewed or corrected manually

- "Used AI to generate the initial Express boilerplate and SQL connection pool, then manually verified the database initialization logic to ensure it correctly falls back to creating the schema if it doesn't exist."

---

## 3. Setup Instructions

### Prerequisites

- Node.js (v18+)
- MySQL Server running locally or remotely.

### Environment variables

Create a `.env` file in the root of the `backend` folder:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=knowledge_platform
JWT_SECRET=supersecretkey_change_in_production
```

### Backend setup

1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Update `.env` with your MySQL credentials.
4. Start the server (this will auto-create the database): `npm run dev` (if nodemon installed) or `node server.js`
5. The API will be available at `http://localhost:5000`
