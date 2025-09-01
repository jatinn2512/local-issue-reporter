import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/Card';

const authoritiesData = [
  { id: 1, city: 'Bijnor', office: 'Municipal Corporation', official: 'Rajesh Kumar', position: 'Mayor', contact: 'mayor@bijnor.gov.in' },
  { id: 2, city: 'Bijnor', office: 'Water Department', official: 'Sunita Sharma', position: 'Head Engineer', contact: 'water@bijnor.gov.in' },
  { id: 3, city: 'Bijnor', office: 'Electricity Board', official: 'Anil Gupta', position: 'Chief Officer', contact: 'electricity@bijnor.gov.in' },
];

function YourArea() {
  const { lang } = useLanguage();
  const [cityAuthorities, setCityAuthorities] = useState([]);
  const [userCity, setUserCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            const detectedCity = data.address.city || data.address.town || data.address.village || 'Unknown';
            setUserCity(detectedCity);
            const filtered = authoritiesData.filter(auth => auth.city.toLowerCase() === detectedCity.toLowerCase());
            setCityAuthorities(filtered);
          } catch {
            const detectedCity = 'Bijnor';
            setUserCity(detectedCity);
            const filtered = authoritiesData.filter(auth => auth.city.toLowerCase() === detectedCity.toLowerCase());
            setCityAuthorities(filtered);
          } finally {
            setLoading(false);
          }
        },
        () => {
          const detectedCity = 'Bijnor';
          setUserCity(detectedCity);
          const filtered = authoritiesData.filter(auth => auth.city.toLowerCase() === detectedCity.toLowerCase());
          setCityAuthorities(filtered);
          setLoading(false);
        }
      );
    } else {
      const detectedCity = 'Bijnor';
      setUserCity(detectedCity);
      const filtered = authoritiesData.filter(auth => auth.city.toLowerCase() === detectedCity.toLowerCase());
      setCityAuthorities(filtered);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <p className="p-8">{lang === 'en' ? 'Detecting your city...' : 'आपके शहर का पता लगाया जा रहा है...'}</p>;
  }

  return (
    <div className="p-8 report-background min-h-screen flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 w-full max-w-4xl text-left">
        {lang === 'en' ? `City Authorities for ${userCity}` : `${userCity} के अधिकारी`}
      </h2>

      {cityAuthorities.length === 0 ? (
        <p className="w-full max-w-4xl">{lang === 'en' ? 'No authority info available for your city.' : 'आपके शहर के लिए कोई अधिकारी जानकारी उपलब्ध नहीं है।'}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 w-full max-w-4xl">
          {cityAuthorities.map(auth => (
            <div key={auth.id} className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col">
              <Card
                title={lang === 'en' ? auth.office : `अनुवाद: ${auth.office}`}
                description={`${lang === 'en' ? auth.official : `अनुवाद: ${auth.official}`} - ${auth.position}`}
                location={auth.contact}
                status=""
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default YourArea;
