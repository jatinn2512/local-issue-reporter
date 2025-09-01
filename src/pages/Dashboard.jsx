import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/Card';

const dummyReports = [
  { id: 1, title: 'Pothole on Main Street', description: 'Large pothole near the market', status: 'Pending', location: 'Bijnor' },
  { id: 2, title: 'Street Light Not Working', description: 'No light near the park', status: 'Complete', location: 'Bijnor' },
];

function Dashboard() {
  const { lang } = useLanguage();

  return (
    <div className="p-8 report-background min-h-screen flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 w-full max-w-4xl text-left">{lang === 'en' ? 'Dashboard' : 'डैशबोर्ड'}</h2>
      
      <div className="grid gap-6 md:grid-cols-2 w-full max-w-4xl">
        {dummyReports.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col">
            <Card
              title={lang === 'en' ? report.title : `अनुवाद: ${report.title}`}
              description={lang === 'en' ? report.description : `अनुवाद: ${report.description}`}
              location={report.location}
              status={report.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
