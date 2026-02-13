# KrishiYukti - Farmer's Digital Companion

A comprehensive digital platform for farmers providing AI-powered crop suggestions, real-time weather updates, government schemes, and a rewards marketplace.

## 🌟 Features

- **AI-Powered Insights**: Get crop recommendations and farming advice
- **Real-time Updates**: Weather forecasts, disaster alerts, and government schemes
- **Learning Modules**: Educational content on modern farming techniques
- **Rewards Marketplace**: Redeem points for farming supplies and services
- **Multi-language Support**: Available in multiple Indian languages

## 🚀 Prerequisites

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/downloads)
- **Pip** (Python package manager)

## 📁 Project Structure

```
SIH_project/
├── backend/             # Backend (Python/FastAPI)
│   ├── app/            # Main application code
│   ├── venv/           # Python virtual environment (created during setup)
│   ├── .env            # Environment variables (create this file)
│   └── requirements.txt # Python dependencies
└── frontend/           # Frontend (React)
    ├── node_modules/   # Node.js dependencies (created during setup)
    ├── public/         # Static assets
    └── src/            # React application code
```

## 🛠 Detailed Setup Guide

## Windows Setup

### 1. Install Prerequisites

#### Install Python 3.8+
1. Download Python installer from [python.org](https://www.python.org/downloads/windows/)
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Verify installation:
   ```powershell
   python --version
   pip --version
   ```

#### Install Node.js 16+
1. Download and run the LTS installer from [nodejs.org](https://nodejs.org/)
2. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

#### Install Git
1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Use default settings during installation
3. Verify installation:
   ```powershell
   git --version
   ```

### 2. Clone the Repository
```powershell
# Open PowerShell as Administrator
# Navigate to your projects directory
cd C:\Users\YourUsername\Projects

# Clone the repository
git clone <repository-url>
cd SIH_project
```

### 3. Backend Setup (in backend/ directory)

**Location:** `SIH_project/backend/`

```powershell
# Navigate to backend directory
cd backend

# Create a new virtual environment
# This will create a 'venv' folder in the backend directory
python -m venv venv

# Activate virtual environment
# For PowerShell:
.\venv\Scripts\Activate.ps1
# OR for CMD:
# .\venv\Scripts\activate.bat

# Upgrade pip and install dependencies
# These will be installed in the virtual environment
pip install --upgrade pip
pip install -r requirements.txt
```

**Expected Output:**
- A new `venv` folder will be created in the backend directory
- All Python packages will be installed in `backend/venv/Lib/site-packages/`

### 4. Frontend Setup (in frontend/ directory)

**Location:** `SIH_project/frontend/`

```powershell
# Navigate to frontend directory
cd ..\frontend

# Install Node.js dependencies
# This will create a 'node_modules' folder in the frontend directory
npm install
```

**Expected Output:**
- A `node_modules` folder will be created in the frontend directory
- All Node.js packages will be installed in `frontend/node_modules/`

## macOS Setup

### 1. Install Prerequisites

#### Install Homebrew (Package Manager)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Install Python and Node.js
```bash
brew update
brew install python@3.9 node@16
```

#### Install Git
```bash
brew install git
```

### 2. Clone the Repository
```bash
# Open Terminal
cd ~/Projects
git clone <repository-url>
cd SIH_project
```

### 3. Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Frontend Setup
```bash
# Navigate to frontend
cd ../frontend

# Install Node.js dependencies
npm install
```

## Linux (Ubuntu/Debian) Setup

### 1. Install Prerequisites
```bash
# Update package list
sudo apt update

# Install Python and pip
sudo apt install python3 python3-pip python3-venv

# Install Node.js 16.x
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install git

# Install build essentials (for some npm packages)
sudo apt install build-essential
```

### 2. Clone the Repository
```bash
cd ~
git clone <repository-url>
cd SIH_project
```

### 3. Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Frontend Setup
```bash
# Navigate to frontend
cd ../frontend

# Install Node.js dependencies
npm install
```

## 🚀 Running the Application

### 1. Start Backend Server (in backend/ directory)

**Location:** `SIH_project/backend/`

Make sure you're in the backend directory before running these commands.

#### Windows (PowerShell/CMD):
```powershell
# Activate virtual environment if not already activated
.\venv\Scripts\Activate.ps1  # PowerShell
# OR
.\venv\Scripts\activate.bat  # CMD

# Start the backend server
uvicorn app.main:app --reload
```

#### macOS/Linux (Terminal):
```bash
# Activate virtual environment if not already activated
source venv/bin/activate

# Start the backend server
uvicorn app.main:app --reload
```

The backend will be available at: `http://127.0.0.1:8000`

### 2. Start Frontend Development Server (in frontend/ directory)

**Location:** `SIH_project/frontend/`

Make sure you're in the frontend directory before running these commands.

#### All Operating Systems:
```bash
# Navigate to frontend directory if not already there
cd frontend

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## 🔄 Running Both Servers (Alternative Method)

### Windows (PowerShell):
```powershell
# In first terminal (backend)
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# In second terminal (frontend)
cd frontend
npm run dev
```

### macOS/Linux (Terminal):
```bash
# In first terminal (backend)
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# In second terminal (frontend)
cd frontend
npm run dev
```

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
DATABASE_URL=sqlite:///./sql_app.db

# JWT Settings
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Weather API (get your API key from openweathermap.org)
OPENWEATHER_API_KEY=your-api-key-here
```

## 🐛 Common Issues & Solutions

### 1. Python/Node.js Command Not Found
- **Windows**: Ensure Python and Node.js are added to PATH during installation
- **macOS/Linux**: Use `python3` and `node` commands instead of `python` and `nodejs`

### 2. Port Already in Use

If you encounter port conflicts:

```bash
# For backend (change 8000 to available port)
uvicorn app.main:app --reload --port 8001

# For frontend (edit vite.config.js)
# Update the proxy URL to match your backend port
```

### 2. Python Dependencies

If you get `ModuleNotFoundError`:

```bash
# Ensure virtual environment is activated
# Then reinstall requirements
pip install -r requirements.txt
```

### 3. Node.js Dependencies

If frontend fails to start:

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

## 📂 Project Structure

```
SIH_project/
├── backend/             # FastAPI backend
│   ├── app/             # Application code
│   ├── .env             # Environment variables
│   └── requirements.txt # Python dependencies
└── frontend/            # React frontend
    ├── src/             # Source code
    ├── public/          # Static files
    └── package.json     # Node.js dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for Indian Farmers
- Special thanks to the open-source community
- Icons by [Font Awesome](https://fontawesome.com/)

