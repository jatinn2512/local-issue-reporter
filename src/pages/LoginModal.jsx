import React, { useState } from "react";
import { useLogin } from "../context/LoginContext";
import API from "../api/api";

function LoginModal({ isOpen, onClose, lang }) {
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

  if (!isOpen) return null;

  // ✅ Email/Password login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/users/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email); // ✅ added line
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

  // ✅ Email signup
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

  // ✅ Phone signup
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

  // ✅ OTP system
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-96 p-8 relative border border-gray-700 
        transform transition-all duration-300 ease-out animate-modalOpen"
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl transition-transform duration-200 hover:scale-125"
          onClick={onClose}
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6 text-center animate-bounce">
          {isSignup
            ? lang === "hi"
              ? "साइन अप"
              : "Sign Up"
            : lang === "hi"
            ? "लॉगिन"
            : "Login"}
        </h2>

        {/* Email/Phone Toggle */}
        <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-700">
          <button
            className={`flex-1 py-2 transition-all duration-200 ${
              mode === "email"
                ? "bg-green-700 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
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
            className={`flex-1 py-2 transition-all duration-200 ${
              mode === "phone"
                ? "bg-green-700 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
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

        {/* --- LOGIN FORM --- */}
        {!isSignup ? (
          <>
            {mode === "email" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder={lang === "hi" ? "ईमेल" : "Email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  required
                />
                <input
                  type="password"
                  placeholder={lang === "hi" ? "पासवर्ड" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800"
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
                      className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                      pattern="[0-9]{10}"
                      required
                    />
                    <button
                      type="button"
                      onClick={sendOtp}
                      className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800"
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
                      className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setSuccess(true)}
                      className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800"
                    >
                      {lang === "hi" ? "सत्यापित करें और लॉगिन करें" : "Verify & Login"}
                    </button>
                  </>
                )}
              </div>
            )}

            <p
              onClick={() => setIsSignup(true)}
              className="mt-4 text-sm text-gray-400 hover:text-green-400 cursor-pointer text-center"
            >
              {lang === "hi" ? "नए उपयोगकर्ता? साइन अप करें" : "New user? Sign up"}
            </p>
          </>
        ) : (
          /* --- SIGNUP FORM --- */
          <>
            {mode === "email" ? (
              <form onSubmit={handleSignupEmail} className="space-y-4">
                <input
                  type="text"
                  placeholder={lang === "hi" ? "नाम" : "Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  required
                />
                <input
                  type="email"
                  placeholder={lang === "hi" ? "ईमेल" : "Email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  required
                />
                <input
                  type="password"
                  placeholder={lang === "hi" ? "पासवर्ड" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800"
                >
                  {lang === "hi" ? "साइन अप करें" : "Sign Up"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupPhone} className="space-y-4">
                <input
                  type="text"
                  placeholder={lang === "hi" ? "नाम" : "Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  required
                />
                <input
                  type="tel"
                  placeholder={lang === "hi" ? "फ़ोन नंबर" : "Phone Number"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  pattern="[0-9]{10}"
                  required
                />
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800"
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
                      className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                    />
                    <input
                      type="password"
                      placeholder={lang === "hi" ? "पासवर्ड" : "Password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800"
                    >
                      {lang === "hi" ? "साइन अप करें" : "Sign Up"}
                    </button>
                  </>
                )}
              </form>
            )}

            <p
              onClick={() => setIsSignup(false)}
              className="mt-4 text-sm text-gray-400 hover:text-green-400 cursor-pointer text-center"
            >
              {lang === "hi"
                ? "पहले से खाता है? लॉगिन करें"
                : "Already have an account? Login"}
            </p>
          </>
        )}

        {/* Success message */}
        {success && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-green-400 font-bold text-xl rounded-2xl animate-fadeIn">
            {lang === "hi"
              ? "सफलतापूर्वक लॉगिन हुआ!"
              : "Successfully logged in!"}
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
            animation: modalOpen 0.3s ease-out forwards;
          }
          @keyframes fadeIn {
            from {opacity: 0;}
            to {opacity: 1;}
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}

export default LoginModal;
