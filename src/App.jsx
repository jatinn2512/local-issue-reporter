import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import Dashboard from './pages/Dashboard';
import YourArea from './pages/YourArea';
import LoginModal from './pages/LoginModal';
import { LanguageProvider } from './context/LanguageContext';
import { LoginProvider } from './context/LoginContext';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <LanguageProvider>
      <LoginProvider>
        <Router>
          <Navbar onLoginClick={() => setIsLoginOpen(true)} />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/your-area" element={<YourArea />} />
          </Routes>

          <LoginModal
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
          />
        </Router>
      </LoginProvider>
    </LanguageProvider>
  );
}

export default App;
