# Momentum AI Fitness Application

Momentum AI is a premium full-stack fitness application utilizing Google Gemini AI and MongoDB to provide intelligent workout planning, recovery tracking, nutritional planning, and performance metrics analysis.

## Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Gemini API Key** (from Google AI Studio)

---

### Step 1: Install Dependencies

To run the application, you need to install dependencies for both the backend and frontend.

#### Backend
Open a terminal in the `backend` directory and run:
```bash
cd backend
npm install
```

#### Frontend
Open a terminal in the `frontend` directory and run:
```bash
cd ../frontend
npm install
```

---

### Step 2: Start MongoDB

Make sure your MongoDB server is up and running.

#### Local MongoDB Service (Windows/macOS/Linux)
If running MongoDB locally, start the service:
- **Windows (PowerShell)**:
  ```powershell
  Start-Service MongoDB
  ```
- **macOS (Homebrew)**:
  ```bash
  brew services start mongodb-community
  ```
- **Linux (systemd)**:
  ```bash
  sudo systemctl start mongod
  ```

Alternatively, you can use a **MongoDB Atlas** connection string.

---

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` folder to configure required connections.

1. Navigate to the `backend` directory.
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file and populate it with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/momentum_ai
   JWT_SECRET=use_a_strong_random_secret_string
   JWT_EXPIRES_IN=1d
   GEMINI_API_KEY=AIzaSy... (Your real Gemini API key)
   ```

---

### Step 4: Obtain a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Log in with your Google account.
3. Click on **Get API Key** and create a new key.
4. Copy the generated key and assign it to `GEMINI_API_KEY` in `backend/.env`.

---

### Step 5: Start the Backend Server

Navigate to the `backend` directory and run:
```bash
# Build the TypeScript project
npm run build

# Start the dev server with nodemon
npm run dev
```

During startup, the server automatically validates:
1. Presence of required environment variables (`MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GEMINI_API_KEY`).
2. MongoDB connection status.
3. Gemini API accessibility and API key validity.

If any check fails, the server exits with a descriptive error. Once passed, the server will check for seeded exercise data in MongoDB and auto-seed the library if it is empty.

---

### Step 6: Start the Frontend Application

Navigate to the `frontend` directory and run:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Step 7: Verify Connectivity to Real Services

To ensure that the application is utilizing real backend services rather than mocks:

1. **Database Verification**:
   - Register a new account.
   - Connect to your MongoDB instance (e.g., using MongoDB Compass or shell) and check the `momentum_ai` database.
   - Confirm that the `users` and `exercises` collections contain your registered profile and the seeded exercise library.
2. **Gemini AI Verification**:
   - Navigate to the **Meal Planner** tab and click **Generate Meal Plan**.
   - Navigate to the **Diet Coach** Q&A tab and submit a recovery question (e.g., *"How do I recover from calf muscle soreness?"*).
   - Verify that you receive real-time generated responses from the Google Gemini API. If the API key is missing or invalid, the backend will return a 500 error instead of falling back to fake responses.
3. **Authentication Verification**:
   - Open your browser's Developer Tools (F12) -> **Application** -> **Local Storage**.
   - Verify that `momentum_token` contains a valid JWT signed by your secret key.
   - Log out and log back in, verifying that your JWT updates dynamically.
