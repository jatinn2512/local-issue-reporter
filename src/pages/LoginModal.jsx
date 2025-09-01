import React, { useState } from "react";
import { useLogin } from "../context/LoginContext";

function LoginModal({ isOpen, onClose, lang }) {
  const { login } = useLogin(); // context se login function
  const [mode, setMode] = useState("email"); // 'email' or 'phone'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onClose();
      login(); // ← login successful
      setName(""); setEmail(""); setPassword(""); setPhone(""); setOtp(""); setOtpSent(false); setGeneratedOtp("");
    }, 1200);
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

  const verifyOtp = () => {
    if (otp === generatedOtp) handleLogin(new Event("submit"));
    else alert(lang === "hi" ? "गलत OTP" : "Incorrect OTP");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-96 p-8 relative border border-gray-700
        transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modalOpen"
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl transition-transform duration-200 hover:scale-125"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center animate-bounce">
          {lang === "hi" ? "लॉगिन" : "Login"}
        </h2>

        <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-700">
          <button
            className={`flex-1 py-2 transition-all duration-200 ${mode === "email" ? "bg-green-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            onClick={() => setMode("email")}
          >
            {lang === "hi" ? "ईमेल लॉगिन" : "Email Login"}
          </button>
          <button
            className={`flex-1 py-2 transition-all duration-200 ${mode === "phone" ? "bg-green-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            onClick={() => setMode("phone")}
          >
            {lang === "hi" ? "फ़ोन लॉगिन" : "Phone Login"}
          </button>
        </div>

        {mode === "email" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder={lang === "hi" ? "नाम" : "Name"} value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition-all duration-200" required />
            <input type="email" placeholder={lang === "hi" ? "ईमेल" : "Email"} value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition-all duration-200" required />
            <input type="password" placeholder={lang === "hi" ? "पासवर्ड" : "Password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition-all duration-200" required />
            <button type="submit" className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800 transition-transform transform hover:scale-105 duration-200">
              {lang === "hi" ? "लॉगिन करें" : "Login"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {!otpSent ? (
              <>
                <input type="text" placeholder={lang === "hi" ? "नाम" : "Name"} value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition-all duration-200" required />
                <input type="tel" placeholder={lang === "hi" ? "फ़ोन नंबर" : "Phone Number"} value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition-all duration-200" pattern="[0-9]{10}" required />
                <button type="button" onClick={sendOtp} className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800 transition-transform transform hover:scale-105 duration-200">
                  {lang === "hi" ? "OTP भेजें" : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <input type="text" placeholder={lang === "hi" ? "OTP दर्ज करें" : "Enter OTP"} value={otp} onChange={e => setOtp(e.target.value)} className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition-all duration-200" />
                <button type="button" onClick={verifyOtp} className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800 transition-transform transform hover:scale-105 duration-200">
                  {lang === "hi" ? "सत्यापित करें और लॉगिन करें" : "Verify & Login"}
                </button>
              </>
            )}
          </div>
        )}

        {success && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-green-400 font-bold text-xl rounded-2xl animate-fadeIn">
            {lang === "hi" ? "सफलतापूर्वक लॉगिन हुआ!" : "Successfully logged in!"}
          </div>
        )}
      </div>

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
