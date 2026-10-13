import "leaflet/dist/leaflet.css";

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Reports from './components/Reports';
import Settings from './components/Settings';
// import { useGoogleMaps } from './hooks/useGoogleMaps';
// console.log("ALL ENV:", import.meta.env);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  // const { isLoaded, loadError } = useGoogleMaps();

  // if (loadError) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //       <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
  //         <h2 className="text-xl font-bold text-red-600 mb-2">Map Loading Error</h2>
  //         <p className="text-gray-600">
  //           Failed to load Google Maps. Please check your API key configuration.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isLoaded) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //       <div className="flex flex-col items-center gap-4">
  //         <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
  //         <p className="text-gray-600 font-medium">Loading ROADIE System...</p>
  //       </div>
  //     </div>
  //   );
  // }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <History />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 lg:ml-0 overflow-auto">{renderContent()}</main>
    </div>
  );
}

export default App;
