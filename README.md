
# 🌍 AI-Powered Local Issue Reporter  

An intelligent platform that empowers citizens to **report local civic issues** (potholes, electricity, sanitation, etc.) and allows authorities to manage, track, and resolve them efficiently. Built with a **modern full-stack architecture** and enhanced with **AI-powered features** for automatic issue detection and descriptions.  

---

## ✨ Features  
- 📝 **Report Issues Easily** – Citizens can submit reports with description, location, and images.  
- 🤖 **AI Auto-Detection** – Automatically detects issue type & generates captions from uploaded images.  
- 📍 **Smart Location Tagging** – Auto-fills issue location using geolocation.  
- 📊 **Interactive Dashboard** – Track issues with statuses: `Pending`, `In Progress`, `Resolved`.  
- 🏢 **Authority Portal** – Authorities get a dedicated dashboard to manage citizen reports.  
- 🌐 **Multi-language Support** – Toggle between **English & Hindi** for better accessibility.  
- 📱 **Responsive Design** – Works seamlessly across devices.  

---

## 🛠️ Tech Stack  
### **Frontend**  
- ⚛️ React.js (with Tailwind CSS & shadcn/ui for clean UI)  
- 🌐 Axios for API calls  
- 🌍 Context API (Language & Login Management)  

### **Backend**  
- 🟢 Node.js + Express.js  
- 🗄️ MongoDB (NoSQL Database)  
- 🔑 JWT Authentication  

### **AI Integration**  
- 🖼️ Image Classification for detecting issue type  
- ✍️ Auto-captioning for issue description  

---

## 📂 Project Structure  
```bash
AI-Powered-Local-Issue-Reporter/
├── backend/                  # Backend (Node.js + Express)
│   ├── config/               # DB and server configurations
│   ├── controllers/          # Controller logic for routes
│   ├── middleware/           # Middlewares (auth, error handling, etc.)
│   ├── models/               # MongoDB models (User, Issue, Authority)
│   ├── routes/               # API route definitions
│   ├── uploads/              # Uploaded issue images
│   ├── authorityServer.js    # Authority-specific server
│   └── server.js             # Main backend server
│
├── src/                      # Frontend (React.js)
│   ├── api/                  # API call utilities
│   ├── assets/               # Images, icons, and static files
│   ├── components/           # Reusable components (Navbar, Card, etc.)
│   ├── context/              # Context API (Login, Language, etc.)
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Application pages (Home, Dashboard, ReportIssue, etc.)
│   ├── routes/               # Frontend routes
│   ├── styles/               # CSS/Tailwind styles
│   ├── utils/                # Helper functions
│   ├── App.jsx               # Main React App
│   ├── index.css             # Global styles
│   └── index.jsx             # React entry point
│
├── uploads/                  # Frontend-related uploads (if any)
├── .env                      # Environment variables
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore file
├── package.json              # Dependencies and scripts
├── package-lock.json         # Dependency lockfile
├── postcss.config.js         # PostCSS configuration
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started  
### 1️⃣ Clone the Repo  
```bash
git clone https://github.com/jatinn2512/local-issue-reporter.git
cd local-issue-reporter
```

### 2️⃣ Backend Setup  
```bash
cd backend
npm install
npm start
```

### 3️⃣ Frontend Setup  
```bash
cd frontend
npm install
npm run dev
```

---

<!-- ## 📸 Screenshots  

--->

## 🤝 Contributing  
1. Fork the repo 🍴  
2. Create a new branch 🌱  
3. Make your changes ✨  
4. Submit a pull request 🔥  

---

## 👨‍💻 Team Roles  
- **Frontend Developers** – Built UI/UX with React & Tailwind  
- **Backend Developers** – API, Database, Authentication  
- **AI Integration** – Image classification & auto-caption  
- **Project Manager** – Coordination & Documentation  

---

## 📜 License  
This project is licensed under the **MIT License**.  

---

## 🌟 Show your support  
If you liked this project, give it a ⭐ on [GitHub](https://github.com/jatinn2512/local-issue-reporter)  
