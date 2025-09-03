import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLogin } from '../context/LoginContext';
import './ReportIssue.css';

function ReportIssue() {
  const { lang } = useLanguage();
  const { isLoggedIn } = useLogin();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [issueType, setIssueType] = useState('');
  const [image, setImage] = useState(null);

  const [status, setStatus] = useState(null); // null | "success" | "fail" | "limit"

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setLocation(data.display_name || `Lat: ${latitude}, Lng: ${longitude}`);
        } catch {
          setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
        }
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setStatus("fail");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const body = {
        title,
        description,
        location,
        typeOfIssue: issueType,
        image: image ? image.name : "",
      };

      const response = await fetch("http://localhost:5000/api/users/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
      } else if (response.status === 429) {
        setStatus("limit");
      } else {
        setStatus("fail");
      }
    } catch (error) {
      console.error("🔥 Fetch failed:", error);
      setStatus("fail");
    }
  };

  return (
    <div className="report-background min-h-screen flex flex-col items-center p-4 pt-[100px]">
      {/* Agar status null hai toh form show karo */}
      {!status && (
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl relative z-10 h-[90vh] flex flex-col md:flex-row md:space-x-6 overflow-auto p-6">
          <div className="flex-1 space-y-5">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center md:text-left">
              {lang === 'en' ? 'Report an Issue' : 'समस्या दर्ज करें'}
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                placeholder={lang === 'en' ? 'Issue Title' : 'समस्या का शीर्षक'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 outline-none text-lg"
                required
              />
              <textarea
                placeholder={
                  lang === 'en'
                    ? 'Description (AI will write automatically)'
                    : 'विवरण (AI स्वचालित रूप से लिखेगा)'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 outline-none text-lg"
                rows={5}
                required
              />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Detected Issue Type (AI)' : 'पता चला समस्या प्रकार (AI)'}
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 outline-none text-lg"
              />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Enter or confirm location' : 'स्थान दर्ज करें या पुष्टि करें'}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 outline-none text-lg"
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full text-gray-800"
              />

              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-medium transition text-lg ${
                  isLoggedIn
                    ? 'bg-green-300 hover:bg-green-400 text-gray-900'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {lang === 'en' ? 'Submit' : 'जमा करें'}
              </button>
            </form>

            {/* Instructions */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-base p-4 overflow-auto max-h-[40vh]">
              <h3 className="font-bold text-lg mb-3">{lang === 'en' ? 'Instructions:' : 'निर्देश:'}</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>{lang === 'en' ? 'Enter the issue title.' : 'समस्या का शीर्षक दर्ज करें।'}</li>
                <li>{lang === 'en' ? 'Provide a detailed description.' : 'विवरण दर्ज करें।'}</li>
                <li>{lang === 'en' ? 'Confirm or edit the detected issue type (optional).' : 'पता चला समस्या प्रकार पुष्टि करें (वैकल्पिक)।'}</li>
                <li>{lang === 'en' ? 'Location will be auto-filled. You can edit if necessary.' : 'स्थान स्वतः भरा जाएगा। जरूरत होने पर संपादित करें।'}</li>
                <li>{lang === 'en' ? 'Attach an image using file input or camera (mobile).' : 'फ़ोटो अपलोड करें (फ़ाइल या मोबाइल कैमरा)।'}</li>
                <li>{lang === 'en' ? 'Click submit to report the issue.' : 'समस्या दर्ज करने के लिए जमा करें।'}</li>
              </ol>
            </div>

            {/* Image Preview */}
            {image && (
              <div className="mt-6">
                <p className="font-bold text-gray-800">{lang === 'en' ? 'Preview:' : 'पूर्वावलोकन:'}</p>
                <img src={URL.createObjectURL(image)} alt="Preview" className="w-full rounded-lg mt-2" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ Status Screen (after submit) */}
      {status && (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm">
            {status === "success" && (
              <>
                <div className="w-20 h-20 mx-auto flex items-center justify-center bg-green-100 text-green-600 rounded-full text-4xl">✔</div>
                <p className="mt-4 text-xl font-bold text-green-600">
                  {lang === 'en' ? "Issue reported successfully!" : "समस्या सफलतापूर्वक दर्ज हुई!"}
                </p>
              </>
            )}
            {status === "fail" && (
              <>
                <div className="w-20 h-20 mx-auto flex items-center justify-center bg-red-100 text-red-600 rounded-full text-4xl">✖</div>
                <p className="mt-4 text-xl font-bold text-red-600">
                  {lang === 'en' ? "Failed to report issue. Try again." : "समस्या दर्ज करने में विफल। पुनः प्रयास करें।"}
                </p>
              </>
            )}
            {status === "limit" && (
              <>
                <div className="w-20 h-20 mx-auto flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-full text-4xl">⚠</div>
                <p className="mt-4 text-xl font-bold text-yellow-600">
                  {lang === 'en' ? "Daily limit reached. Try after 24 hours." : "दैनिक सीमा पूरी हो गई। 24 घंटे बाद प्रयास करें।"}
                </p>
              </>
            )}
            <button
              onClick={() => setStatus(null)}
              className="mt-6 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              {lang === 'en' ? "Back" : "वापस"}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-6 mt-8 w-full">
        <p className="text-gray-500 text-sm">
          © 2025 | No Copyright | Made with ❤️ by LOOP - X Team
        </p>
      </footer>
    </div>
  );
}

export default ReportIssue;
