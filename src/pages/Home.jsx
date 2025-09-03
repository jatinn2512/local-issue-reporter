import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useLogin } from "../context/LoginContext";
import LoginModal from "./LoginModal";
import { motion } from "framer-motion";

function Home() {
  const { lang } = useLanguage();
  const isHindi = lang === "hi";
  const { isLoggedIn } = useLogin();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  const advantages = [
    {
      heading: isHindi ? "तेज़ और स्मार्ट रिपोर्टिंग" : "Fast & Smart Reporting",
      desc: isHindi
        ? "AI जल्दी से स्थानीय समस्याओं को पहचानता और वर्गीकृत करता है।"
        : "AI quickly identifies and categorizes local issues for faster, accurate reporting.",
      img: "/images/fast-report.png",
    },
    {
      heading: isHindi ? "यूज़र-फ्रेंडली इंटरफ़ेस" : "User-Friendly Interface",
      desc: isHindi
        ? "सरल और सहज फॉर्म से कोई भी आसानी से रिपोर्ट कर सकता है।"
        : "Simple and intuitive forms let anyone report issues easily.",
      img: "/images/user-friendly.png",
    },
    {
      heading: isHindi ? "स्थानीय स्तर पर प्रभावी" : "Effective at Local Level",
      desc: isHindi
        ? "रिपोर्ट सीधे स्थानीय अधिकारियों तक पहुँचती हैं।"
        : "Reports reach local authorities directly for prompt action.",
      img: "/images/local-effective.png",
    },
    {
      heading: isHindi ? "सुरक्षित और विश्वसनीय" : "Secure & Reliable",
      desc: isHindi
        ? "आपका डेटा सुरक्षित है और रिपोर्ट सुरक्षित रूप से स्टोर की जाती हैं।"
        : "Your data is protected and reports are stored securely.",
      img: "/images/secure-reliable.png",
    },
    {
      heading: isHindi ? "रीयल-टाइम अपडेट" : "Real-Time Updates",
      desc: isHindi
        ? "रिपोर्ट की स्थिति तुरंत ट्रैक करें और नोटिफ़िकेशन पाएं।"
        : "Track your report instantly with notifications on status changes.",
      img: "/images/real-time-update.png",
    },
    {
      heading: isHindi ? "सामुदायिक प्रभाव" : "Community Impact",
      desc: isHindi
        ? "अपनी समुदाय को सुधारने में योगदान दें और अन्य रिपोर्ट देखें।"
        : "Empower your community by sharing and viewing local reports.",
      img: "/images/community-impact.png",
    },
  ];

  const handleReportClick = () => {
    if (isLoggedIn) navigate("/report");
    else setShowLogin(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-12 bg-white rounded-3xl shadow-2xl p-12 hover:shadow-3xl transition">
          {/* Left Image */}
          <motion.div
            initial={{ x: -120, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 flex justify-center md:justify-start"
          >
            <img
              src="/images/report-issue.png"
              alt="Report Issue"
              className="w-80 md:w-[460px] drop-shadow-2xl"
            />
          </motion.div>

          {/* Right Text */}
          <motion.div
            initial={{ x: 120, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-snug bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isHindi
                ? "AI-सक्षम स्थानीय समस्या रिपोर्टर में आपका स्वागत है"
                : "Welcome to AI-Powered Local Issue Reporter"}
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
              {isHindi
                ? "तेज़, आसान और प्रभावी तरीका अपनी स्थानीय समस्याओं को दर्ज करने का। सड़क, पानी, बिजली या अन्य नागरिक समस्याएं — सब कुछ कुछ ही क्लिक में रिपोर्ट करें।"
                : "A fast, easy and effective way to report your local issues. From roads, water, electricity to any civic problem — report it in just a few clicks."}
            </p>
            <button
              onClick={handleReportClick}
              className={`px-10 py-4 rounded-xl text-lg font-semibold shadow-lg transition-transform transform hover:scale-105 ${
                isLoggedIn
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {isHindi ? "समस्या दर्ज करें" : "Report an Issue"}
            </button>
          </motion.div>
        </div>
      </div>

      {/* About Section */}
      <section
        id="about-section"
        className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20 px-6 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
          {isHindi ? "हमारे बारे में" : "About Us"}
        </h2>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 leading-relaxed">
          {isHindi
            ? "AI Local Issue Reporter का उद्देश्य नागरिकों को एक आसान और तेज़ प्लेटफ़ॉर्म प्रदान करना है, जिससे वे अपने क्षेत्र की समस्याओं को दर्ज कर सकें और उन्हें समय पर हल करवाया जा सके।"
            : "Our mission is to provide citizens with a fast and simple platform to report local issues and ensure timely resolution by authorities."}
        </p>
      </section>

      {/* Advantages Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {isHindi
            ? "क्यों चुनें AI-पावर्ड समस्या रिपोर्टर?"
            : "Why Choose AI-Powered Local Issue Reporter?"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {advantages.map((adv, i) => {
            const fromX = i % 2 === 0 ? -120 : 120; // alternate direction
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: fromX }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center text-center hover:shadow-2xl transform transition-transform hover:scale-105"
              >
                <img
                  src={adv.img}
                  alt={adv.heading}
                  className="w-24 h-24 mb-6"
                />
                <h3 className="font-bold text-2xl mb-4 text-gray-900">
                  {adv.heading}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {adv.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-8 mt-12">
        <p className="text-gray-500 text-sm">
          © 2025 | No Copyright | Made with ❤️ by LOOP - X Team
        </p>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}

export default Home;
