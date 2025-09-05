import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useLogin } from "../context/LoginContext";

function ReportIssue() {
  const { lang } = useLanguage();
  const { isLoggedIn } = useLogin();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [issueType, setIssueType] = useState("");
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setLocation(
              data.display_name || `Lat: ${latitude}, Lng: ${longitude}`
            );
          } catch {
            setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
          }
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }, []);

  const handleImageChange = async (e) => {
    try {
      const file = e?.target?.files?.[0];
      if (!file) return;

      // preview straight away
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));

      setIsDetecting(true);
      setDescription("");
      setIssueType("");

      const fd = new FormData();
      fd.append("image", file);

      // include the current location value (if any) so server can include it in fallback paragraph
      if (location) fd.append("location", location);

      const DETECT_URL = "http://localhost:5000/api/ai/detect"; // change port if needed

      console.log("Sending image to detect endpoint...", file.name);

      const res = await fetch(DETECT_URL, {
        method: "POST",
        body: fd,
      });

      console.log("Detect HTTP status:", res.status);

      let data;
      try {
        data = await res.json();
      } catch (err) {
        const t = await res.text();
        console.error("Detect response not JSON:", err, t);
        setIsDetecting(false);
        return;
      }

      console.log("Detect response:", data);

      // Always set description if server returned one (fallback or HF)
      if (data.description) {
        // keep it as paragraph (textarea supports newlines). If server gives multiple sentences, they'll be shown.
        setDescription(data.description);
      } else {
        // safety fallback
        setDescription("Please describe the issue briefly.");
      }

      // Use server-detected issue type if available and not empty
      if (data.typeOfIssue) {
        setIssueType(data.typeOfIssue);
      } else {
        setIssueType("other");
      }
    } catch (err) {
      console.error("Detection error:", err);
    } finally {
      setIsDetecting(false);
    }
  };

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
      if (response.ok) {
        setStatus("success");
        setTitle("");
        setDescription("");
        setLocation("");
        setIssueType("");
        setImage(null);
        setPreviewUrl("");
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
    <div className="min-h-screen flex flex-col items-center pt-[100px] bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {!status && (
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl relative z-10 flex flex-col p-8 md:p-10 border border-gray-200">
          <h2 className="text-4xl font-extrabold text-center md:text-left bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent drop-shadow-sm mb-8">
            {lang === "en" ? "Report an Issue" : "समस्या दर्ज करें"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="w-full text-gray-700"
                required
              />
              {isDetecting && (
                <p className="text-sm text-gray-500 mt-2">
                  {lang === "en"
                    ? "Detecting from image..."
                    : "छवि से पहचान की जा रही है..."}
                </p>
              )}
            </div>

            <input
              type="text"
              placeholder={lang === "en" ? "Issue Title" : "समस्या का शीर्षक"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-300 focus:ring-2 focus:ring-teal-400 outline-none"
              required
              disabled={isDetecting}
            />

            <textarea
              placeholder={
                lang === "en"
                  ? "Description (AI will write automatically after image)"
                  : "विवरण (छवि के बाद AI स्वचालित रूप से लिखेगा)"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-300 focus:ring-2 focus:ring-teal-400 outline-none"
              rows={5}
              required
              disabled={isDetecting}
            />

            <input
              type="text"
              placeholder={
                lang === "en"
                  ? "Detected Issue Type (AI)"
                  : "पता चला समस्या प्रकार (AI)"
              }
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-300 focus:ring-2 focus:ring-teal-400 outline-none"
              disabled={isDetecting}
            />

            <input
              type="text"
              placeholder={
                lang === "en"
                  ? "Enter or confirm location"
                  : "स्थान दर्ज करें या पुष्टि करें"
              }
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-300 focus:ring-2 focus:ring-teal-400 outline-none"
              disabled={isDetecting}
            />

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold transition text-lg shadow-md ${
                isLoggedIn
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-lg hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {lang === "en" ? "Submit" : "जमा करें"}
            </button>
          </form>

          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 p-6">
            <h3 className="font-bold text-lg mb-4">
              {lang === "en" ? "Instructions:" : "निर्देश:"}
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                {lang === "en" ? "Choose an image first." : "पहले छवि चुनें।"}
              </li>
              <li>
                {lang === "en"
                  ? "AI will try to auto-fill description and type from the image."
                  : "AI छवि से विवरण और प्रकार को स्वतः भरने का प्रयास करेगा।"}
              </li>
              <li>
                {lang === "en"
                  ? "Edit any field if required."
                  : "यदि आवश्यक हो तो किसी भी फ़ील्ड को संपादित करें।"}
              </li>
              <li>
                {lang === "en"
                  ? "Location may autofill from GPS."
                  : "स्थान GPS से स्वतः भरा जा सकता है।"}
              </li>
              <li>
                {lang === "en"
                  ? "Click submit to report."
                  : "रिपोर्ट करने के लिए जमा करें पर क्लिक करें।"}
              </li>
            </ol>
          </div>

          {previewUrl && (
            <div className="mt-6">
              <p className="font-bold text-gray-700">
                {lang === "en" ? "Preview:" : "पूर्वावलोकन:"}
              </p>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full rounded-xl mt-3 shadow-md border"
              />
            </div>
          )}
        </div>
      )}

      {status && (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-sm border border-gray-200">
            {status === "success" && (
              <>
                <div className="w-20 h-20 mx-auto flex items-center justify-center bg-green-100 text-green-600 rounded-full text-4xl shadow">
                  ✔
                </div>
                <p className="mt-6 text-xl font-bold text-green-600">
                  {lang === "en"
                    ? "Issue reported successfully!"
                    : "समस्या सफलतापूर्वक दर्ज हुई!"}
                </p>
              </>
            )}
            {status === "fail" && (
              <>
                <div className="w-20 h-20 mx-auto flex items-center justify-center bg-red-100 text-red-600 rounded-full text-4xl shadow">
                  ✖
                </div>
                <p className="mt-6 text-xl font-bold text-red-600">
                  {lang === "en"
                    ? "Failed to report issue. Try again."
                    : "समस्या दर्ज करने में विफल। पुनः प्रयास करें।"}
                </p>
              </>
            )}
            {status === "limit" && (
              <>
                <div className="w-20 h-20 mx-auto flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-full text-4xl shadow">
                  ⚠
                </div>
                <p className="mt-6 text-xl font-bold text-yellow-600">
                  {lang === "en"
                    ? "Daily limit reached. Try after 24 hours."
                    : "दैनिक सीमा पूरी हो गई। 24 घंटे बाद प्रयास करें।"}
                </p>
              </>
            )}
            <button
              onClick={() => setStatus(null)}
              className="mt-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl shadow hover:scale-105 transition"
            >
              {lang === "en" ? "Back" : "वापस"}
            </button>
          </div>
        </div>
      )}

      <footer className="bg-gray-100 text-center py-6 mt-10 w-full text-gray-500 text-sm border-t border-gray-200">
        © 2025 | Made with ❤️ by LOOP - X Team
      </footer>
    </div>
  );
}

export default ReportIssue;
