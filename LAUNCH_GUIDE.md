# 🚀 Trinetra AI Launch Guide

This guide provides step-by-step instructions to launch the Trinetra AI platform locally. The platform consists of two main components:
1. **Flask Backend** (`Trinetra-AI-Server`): Serves REST API endpoints for crime data, ML predictions, and patrol routes.
2. **React Frontend** (`Trinetra-AI-Client`): Provides the interactive Mapbox map, crime analytics dashboard, and FIR reporting interface.

---

## 🛠️ Prerequisites

Before launching, make sure you have the following installed on your system:
- **Python 3.8+** (for the backend)
- **Node.js v14+ & npm** (for the frontend)

---

## 1. Backend Server Setup (`Trinetra-AI-Server`)

The backend is built with Python Flask and utilizes an ML model (`RandomForestClassifier`) for crime prediction.

### Step 1: Open a terminal & navigate to the server directory
Open **PowerShell** or **Command Prompt** and go to the server folder:
```powershell
cd "c:\Users\Acer\Desktop\TRINETRA AI\Trinetra-AI-Server"
```

### Step 2: Activate the Virtual Environment
A virtual environment (`venv`) is already present. Activate it using the appropriate command for your shell:

*   **PowerShell**:
    ```powershell
    .\venv\Scripts\Activate.ps1
    ```
    *(Note: If you encounter an execution policy restriction error, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and try again.)*
*   **Command Prompt (CMD)**:
    ```cmd
    venv\Scripts\activate.bat
    ```

### Step 3: Install Required Dependencies
Ensure all backend packages are installed:
```bash
pip install -r requirements.txt
```

### Step 4: Train the ML Model (Required)
The Flask server expects a trained ML model file at `models/crime_prediction_model.pkl`. **You must run the training script once before starting the server** to generate this file:
```bash
python train_model.py
```
*Expected Output: `Model training successfully completed!`*

### Step 5: Run the Flask Server
Start the development server:
```bash
python app.py
```
*The backend server will start running on **`http://localhost:5000`**.*

---

## 2. Frontend Client Setup (`Trinetra-AI-Client`)

The frontend is a React application configured to communicate with the Flask API at `http://localhost:5000/api`.

### Step 1: Open a new terminal & navigate to the client directory
Open a **new** terminal window and go to the client folder:
```powershell
cd "c:\Users\Acer\Desktop\TRINETRA AI\Trinetra-AI-Client"
```

### Step 2: Install Node Packages
Install all frontend dependencies:
```bash
npm install
```

### Step 3: Start the React App
Start the React development server:
```bash
npm start
```

*This will start the frontend app and automatically open it in your browser (usually at **`http://localhost:3000`**).*

---

## 🔍 Verification & Troubleshooting

- **Health Check:** You can verify that the backend is up and running by opening `http://localhost:5000/api/health` in your browser. It should return:
  ```json
  {
    "status": "healthy",
    "message": "Trinetra AI Backend is running"
  }
  ```
- **Map Loading:** The map view uses Mapbox GL. If the map fails to load or shows authorization errors, ensure that `REACT_APP_MAPBOX_ACCESS_TOKEN` is configured with a valid Mapbox token in `Trinetra-AI-Client/.env`.
- **CORS Errors:** If you see cross-origin requests blocked in the browser console, check the `CORS_ORIGINS` value in `Trinetra-AI-Server/.env`. It should match the URL of the React frontend (typically `http://localhost:3000`).
