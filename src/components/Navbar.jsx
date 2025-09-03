import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useLogin } from "../context/LoginContext";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

function Navbar({ onLoginClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { lang, toggleLanguage } = useLanguage();
  const { isLoggedIn, logout } = useLogin();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about-section");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const label = lang === "hi" ? "Hi" : "Eng";

  const desktopMenuItems = [
    { name: lang === "hi" ? "मुख्य पृष्ठ" : "Home", path: "/" },
    { name: lang === "hi" ? "हमारे बारे में" : "About", action: scrollToAbout },
    {
      name: lang === "hi" ? "समस्या दर्ज करें" : "Report an Issue",
      action: () => {
        if (isLoggedIn) navigate("/report");
        else onLoginClick();
      },
    },
  ];

  const profileItems = isLoggedIn
    ? [
        { name: lang === "hi" ? "डैशबोर्ड" : "Dashboard", action: () => navigate("/dashboard") },
        { name: lang === "hi" ? "लॉगआउट" : "Logout", action: () => { logout(); navigate("/"); } },
      ]
    : [];

  // Mobile menu: Home + About + Report (once) + profileItems
  const mobileMenuItems = [
    ...desktopMenuItems, // already includes Report
    ...profileItems
  ];

  return (
    <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 md:p-6">
        <h1
          className="text-2xl md:text-3xl font-extrabold cursor-pointer text-gray-900"
          onClick={() => navigate("/")}
        >
          AI Local Issue Reporter
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 text-lg font-medium">
          {desktopMenuItems.map((item, idx) =>
            item.path ? (
              <Link
                key={idx}
                to={item.path}
                className="relative px-4 py-2 rounded-xl hover:text-blue-600 transition-all duration-200"
              >
                {item.name}
              </Link>
            ) : (
              <button
                key={idx}
                onClick={item.action}
                className="px-4 py-2 rounded-xl hover:text-blue-600 transition-all duration-200"
              >
                {item.name}
              </button>
            )
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Desktop Profile Icon */}
          {isLoggedIn && (
            <div ref={profileRef} className="hidden md:block relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="text-gray-800 text-2xl hover:text-blue-600 transition"
              >
                <FaUserCircle />
              </button>

              {/* Desktop dropdown */}
              <div
                className={`absolute right-0 top-14 w-56 bg-white text-gray-900 rounded-xl shadow-lg flex flex-col py-2 z-50
                  transform transition-all duration-300
                  ${profileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
              >
                {profileItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { item.action(); setProfileOpen(false); }}
                    className="px-4 py-2 hover:bg-gray-100 text-left transition transform hover:scale-105"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <button
              onClick={onLoginClick}
              className="hidden md:block bg-blue-600 text-white px-5 py-2 rounded-full font-semibold shadow-md hover:bg-blue-700 transition"
            >
              {lang === "hi" ? "लॉगिन" : "Login"}
            </button>
          )}

          <button
            onClick={toggleLanguage}
            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium shadow-sm hover:bg-gray-200 transition"
          >
            {label}
          </button>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden ml-2 text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute left-0 top-16 w-full bg-white text-gray-900 rounded-xl shadow-lg flex flex-col py-2 z-50 md:hidden">
          {mobileMenuItems.map((item, idx) =>
            item.path ? (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                style={{ transitionDelay: `${idx * 50}ms` }}
                className="px-4 py-2 hover:bg-gray-100 transition transform duration-300 hover:scale-105 opacity-0 animate-slideFade"
              >
                {item.name}
              </Link>
            ) : (
              <button
                key={idx}
                onClick={() => { item.action(); setMenuOpen(false); }}
                style={{ transitionDelay: `${idx * 50}ms` }}
                className="px-4 py-2 hover:bg-gray-100 transition transform duration-300 hover:scale-105 text-left opacity-0 animate-slideFade"
              >
                {item.name}
              </button>
            )
          )}

          {/* Mobile Login for not logged in */}
          {!isLoggedIn && (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 mt-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition transform duration-300 hover:scale-105"
            >
              {lang === "hi" ? "लॉगिन" : "Login"}
            </button>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes slideFade {
            0% { opacity: 0; transform: translateX(-20px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .animate-slideFade {
            animation: slideFade 0.3s forwards;
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar;
