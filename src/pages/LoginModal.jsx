import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useLogin } from "../context/LoginContext";
import API from "../api/api";

function LoginModal({ isOpen, onClose, lang }) {
  // --- all hooks MUST be declared unconditionally at top
  const { login } = useLogin();
  const [mode, setMode] = useState("email"); // email / phone
  const [isSignup, setIsSignup] = useState(false); // login / signup toggle

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [success, setSuccess] = useState(false);

  // Prevent background scroll while modal open (restore on unmount)
    useEffect(() => {
    if (!isOpen) return;

    // --- prevent body scroll AND avoid layout shift by reserving scrollbar width ---
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight || "";

    // compute scrollbar width (difference between window innerWidth and doc clientWidth)
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    // also prevent touchmove on background for mobile (optional, safe)
    const preventTouch = (e) => {
      // allow inside-modal scrolling, block outside
      if (!e.target.closest("[role='dialog']")) e.preventDefault();
    };
    document.addEventListener("touchmove", preventTouch, { passive: false });

    return () => {
      // restore
      document.body.style.overflow = prevOverflow || "";
      document.body.style.paddingRight = prevPaddingRight;
      document.removeEventListener("touchmove", preventTouch, { passive: false });
    };
  }, [isOpen]);


  // keep original behavior: if not open, render nothing (after hooks)
  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/users/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        login();
        resetFields();
      }, 1200);
    } catch (error) {
      alert("Login failed: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSignupEmail = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users/register", { name, email, password });
      alert("Signup successful, now login!");
      setIsSignup(false);
      resetFields();
    } catch (error) {
      alert("Signup failed: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSignupPhone = async (e) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      alert("Incorrect OTP");
      return;
    }
    try {
      await API.post("/users/register", { name, phone, password });
      alert("Signup successful, now login!");
      setIsSignup(false);
      resetFields();
    } catch (error) {
      alert("Signup failed: " + (error.response?.data?.message || error.message));
    }
  };

  const sendOtp = () => {
    if (phone.length !== 10) {
      alert(lang === "hi" ? "सही फ़ोन नंबर दर्ज करें" : "Enter valid phone number");
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    alert(lang === "hi" ? `आपका OTP: ${code}` : `Your OTP: ${code}`);
  };

  const resetFields = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setOtp("");
    setOtpSent(false);
    setGeneratedOtp("");
  };

  const modalContent = (
    <div className="fixed inset-0 flex items-start sm:items-center justify-center p-4 sm:p-0 bg-black/60 z-50 backdrop-blur-sm">
      <div
        className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-md md:w-96 p-6 sm:p-8 pt-6 sm:pt-0 relative border border-gray-300
        transform transition-all duration-300 ease-out animate-modalOpen max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl transition-transform duration-200 hover:scale-125"
          onClick={onClose}
          aria-label="Close login modal"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isSignup
            ? lang === "hi"
              ? "साइन अप"
              : "Sign Up"
            : lang === "hi"
            ? "लॉगिन"
            : "Login"}
        </h2>

        {/* Email/Phone Toggle */}
        <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-300">
          <button
            className={`flex-1 py-2 transition-all duration-200 text-sm sm:text-base ${
              mode === "email"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setMode("email")}
          >
            {lang === "hi"
              ? isSignup
                ? "ईमेल से साइन अप"
                : "ईमेल लॉगिन"
              : isSignup
              ? "Email Sign Up"
              : "Email Login"}
          </button>
          <button
            className={`flex-1 py-2 transition-all duration-200 text-sm sm:text-base ${
              mode === "phone"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setMode("phone")}
          >
            {lang === "hi"
              ? isSignup
                ? "फ़ोन से साइन अप"
                : "फ़ोन लॉगिन"
              : isSignup
              ? "Phone Sign Up"
              : "Phone Login"}
          </button>
        </div>

        {/* --- LOGIN / SIGNUP UI (unchanged) --- */}
        {!isSignup ? (
          <>
            {mode === "email" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder={lang === "hi" ? "ईमेल" : "Email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="password"
                  placeholder={lang === "hi" ? "पासवर्ड" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600"
                >
                  {lang === "hi" ? "लॉगिन करें" : "Login"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {!otpSent ? (
                  <>
                    <input
                      type="tel"
                      placeholder={lang === "hi" ? "फ़ोन नंबर" : "Phone Number"}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg"
                      pattern="[0-9]{10}"
                      required
                    />
                    <button
                      type="button"
                      onClick={sendOtp}
                      className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600"
                    >
                      {lang === "hi" ? "OTP भेजें" : "Send OTP"}
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder={lang === "hi" ? "OTP दर्ज करें" : "Enter OTP"}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setSuccess(true)}
                      className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600"
                    >
                      {lang === "hi" ? "सत्यापित करें और लॉगिन करें" : "Verify & Login"}
                    </button>
                  </>
                )}
              </div>
            )}

            <p
              onClick={() => setIsSignup(true)}
              className="mt-4 text-sm text-gray-500 hover:text-green-600 cursor-pointer text-center"
            >
              {lang === "hi" ? "नए उपयोगकर्ता? साइन अप करें" : "New user? Sign up"}
            </p>
          </>
        ) : (
          <>
            {mode === "email" ? (
              <form onSubmit={handleSignupEmail} className="space-y-4">
                <input
                  type="text"
                  placeholder={lang === "hi" ? "नाम" : "Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="email"
                  placeholder={lang === "hi" ? "ईमेल" : "Email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="password"
                  placeholder={lang === "hi" ? "पासवर्ड" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600"
                >
                  {lang === "hi" ? "साइन up करें" : "Sign Up"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupPhone} className="space-y-4">
                <input
                  type="text"
                  placeholder={lang === "hi" ? "नाम" : "Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="tel"
                  placeholder={lang === "hi" ? "फ़ोन नंबर" : "Phone Number"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg"
                  pattern="[0-9]{10}"
                  required
                />
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600"
                  >
                    {lang === "hi" ? "OTP भेजें" : "Send OTP"}
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder={lang === "hi" ? "OTP दर्ज करें" : "Enter OTP"}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="password"
                      placeholder={lang === "hi" ? "पासवर्ड" : "Password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 bg-white text-gray-800 border border-gray-300 rounded-lg"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600"
                    >
                      {lang === "hi" ? "साइन अप करें" : "Sign Up"}
                    </button>
                  </>
                )}
              </form>
            )}

            <p
              onClick={() => setIsSignup(false)}
              className="mt-4 text-sm text-gray-500 hover:text-green-600 cursor-pointer text-center"
            >
              {lang === "hi"
                ? "पहले से खाता है? लॉगिन करें"
                : "Already have an account? Login"}
            </p>
          </>
        )}

        {/* Success message */}
        {success && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-green-600 font-bold text-xl rounded-2xl animate-fadeIn">
            {lang === "hi" ? "सफलतापूर्वक लॉगिन हुआ!" : "Successfully logged in!"}
          </div>
        )}
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes modalOpen {
            0% {opacity: 0; transform: translateY(50px) scale(0.95);}
            100% {opacity: 1; transform: translateY(0) scale(1);}
          }
          .animate-modalOpen {
            animation: modalOpen 0.28s ease-out forwards;
          }
          @keyframes fadeIn {
            from {opacity: 0;}
            to {opacity: 1;}
          }
          .animate-fadeIn {
            animation: fadeIn 0.45s ease-out forwards;
          }
        `}
      </style>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default LoginModal;
