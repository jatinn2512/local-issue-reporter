import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useLogin } from "../context/LoginContext";
import { FaUserCircle } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";

function Navbar({ onLoginClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { lang, toggleLanguage } = useLanguage();
  const { isLoggedIn, logout } = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  // ----- Robust helper to read stored user info or derive from token/email -----
  const getLocalUser = () => {
    try {
      // direct keys
      let name =
        localStorage.getItem("userName") ||
        localStorage.getItem("name") ||
        null;
      let email =
        localStorage.getItem("userEmail") ||
        localStorage.getItem("email") ||
        null;
      let phone =
        localStorage.getItem("userPhone") ||
        localStorage.getItem("phone") ||
        null;

      // try JSON object
      if (!name) {
        const userJson = localStorage.getItem("user");
        if (userJson) {
          try {
            const parsed = JSON.parse(userJson);
            name = parsed.name || parsed.fullName || parsed.username || name;
            email = parsed.email || email;
            phone = parsed.phone || phone;
          } catch (e) {
            // ignore
          }
        }
      }

      // try decode JWT payload for name/email fallback
      if (!name && !email) {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const base64 = token.split(".")[1];
            const payload = JSON.parse(
              decodeURIComponent(
                atob(base64.replace(/-/g, "+").replace(/_/g, "/"))
                  .split("")
                  .map(function (c) {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                  })
                  .join("")
              )
            );
            name = name || payload.name || payload.fullName || null;
            email = email || payload.email || payload.emailAddress || null;
          } catch (e) {
            // ignore
          }
        }
      }

      // if still no name, derive from email username part
      if (!name && email) {
        const uname = email.split("@")[0];
        // beautify: replace dots/underscores with space and capitalize first letter
        const pretty = uname.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        name = pretty;
      }

      return { name, email, phone };
    } catch {
      return { name: null, email: null, phone: null };
    }
  };

  const localUser = getLocalUser();
  const userName = localUser?.name || null;
  const userEmail = localUser?.email || localUser?.phone || null;

  const scrollToAbout = () => {
    if (location.pathname === "/") {
      const aboutSection = document.getElementById("about-section");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const aboutSection = document.getElementById("about-section");
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
    setMenuOpen(false);
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
        {
          name: lang === "hi" ? "डैशबोर्ड" : "Dashboard",
          action: () => navigate("/dashboard"),
        },
        {
          name: lang === "hi" ? "लॉगआउट" : "Logout",
          action: () => {
            logout();
            navigate("/");
          },
        },
      ]
    : [];

  const mobileMenuItems = [...desktopMenuItems, ...profileItems];

  return (
    <nav className="sticky top-3 z-50 px-3">
      <div className="bg-white/85 backdrop-blur-md shadow-lg border border-gray-200/60 rounded-2xl max-w-7xl mx-auto flex items-center justify-between py-3 md:py-4 px-4 md:px-6">
        {/* Logo */}
        <h1
          className="text-2xl md:text-3xl font-extrabold cursor-pointer 
            bg-gradient-to-r from-blue-600 via-green-500 to-teal-500 bg-clip-text text-transparent
            tracking-wide drop-shadow-md select-none"
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
                className="relative px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 transition-all duration-200"
              >
                {item.name}
              </Link>
            ) : (
              <button
                key={idx}
                onClick={item.action}
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 transition-all duration-200"
              >
                {item.name}
              </button>
            )
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {isLoggedIn && (
            <div ref={profileRef} className="hidden md:block relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="text-gray-600 text-2xl hover:text-blue-600 transition"
                aria-label="Open profile menu"
              >
                <FaUserCircle />
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 top-14 w-64 bg-white/95 text-gray-800 rounded-2xl shadow-2xl border border-gray-200/60 flex flex-col py-3 z-50
                  transform transition-all duration-250
                  ${profileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"}`}
              >
                {/* Profile header (display only) */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-gray-900 font-semibold truncate">{userName || "User"}</p>
                  <p className="text-gray-500 text-sm truncate">{userEmail || ""}</p>
                </div>

                {profileItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      item.action();
                      setProfileOpen(false);
                    }}
                    className="px-4 py-3 hover:bg-gray-50 text-left transition"
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
              className="hidden md:block bg-[#0b63c6] text-white px-5 py-2 rounded-full font-semibold shadow-md hover:brightness-95 transition-all duration-300"
            >
              {lang === "hi" ? "लॉगिन" : "Login"}
            </button>
          )}

          <button
            onClick={toggleLanguage}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium shadow-sm hover:bg-gray-200 transition"
          >
            {label}
          </button>

          {/* Mobile Hamburger (transparent bg) */}
          <button
            className="md:hidden ml-2 text-3xl p-2 rounded-md bg-transparent transition-all duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <HiX className="text-white" /> : <HiMenu className="text-blue-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu with Overlay */}
      {menuOpen && (
        <>
          {/* Blurring overlay (stronger blur + slightly darker) */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-lg z-40"
            onClick={() => setMenuOpen(false)}
          ></div>

          <div className="absolute left-0 top-20 w-full bg-white/95 text-gray-800 rounded-b-2xl shadow-2xl flex flex-col py-4 z-50 animate-slideFadeDown backdrop-blur-sm">
            {/* Mobile profile header */}
            {isLoggedIn && (
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="text-2xl text-gray-700">
                  <FaUserCircle />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold truncate">{userName || "User"}</p>
                  <p className="text-gray-500 text-sm truncate">{userEmail || ""}</p>
                </div>
              </div>
            )}

            {mobileMenuItems.map((item, idx) =>
              item.path ? (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  style={{ transitionDelay: `${idx * 50}ms` }}
                  className="px-6 py-3 hover:bg-blue-50 transition transform duration-300 hover:scale-105 opacity-0 animate-slideFade"
                >
                  {item.name}
                </Link>
              ) : (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setMenuOpen(false);
                  }}
                  style={{ transitionDelay: `${idx * 50}ms` }}
                  className="px-6 py-3 hover:bg-blue-50 transition transform duration-300 hover:scale-105 text-left opacity-0 animate-slideFade"
                >
                  {item.name}
                </button>
              )
            )}

            {!isLoggedIn && (
              <button
                onClick={onLoginClick}
                className="mt-4 mx-6 bg-[#0b63c6] text-white py-2 rounded-full font-semibold shadow-md hover:brightness-95 transition transform duration-300 hover:scale-105"
              >
                {lang === "hi" ? "लॉगिन" : "Login"}
              </button>
            )}
          </div>
        </>
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

          @keyframes slideFadeDown {
            0% { opacity: 0; transform: translateY(-6px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-slideFadeDown {
            animation: slideFadeDown 0.28s ease-out forwards;
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar;
