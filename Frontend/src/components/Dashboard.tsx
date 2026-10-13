import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Activity, Clock, Wifi } from 'lucide-react';
import Map from './Map';
import StatCard from './StatCard';
import PotholeDetails from './PotholeDetails';
import FilterPanel from './FilterPanel';
import { potholeService } from '../services/potholeService';
import { Pothole } from '../lib/supabase';

export default function Dashboard() {
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [filteredPotholes, setFilteredPotholes] = useState<Pothole[]>([]);
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    last24Hours: 0,
  });
  const [activeDevices, setActiveDevices] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [potholesData, statsData, devicesCount] = await Promise.all([
        potholeService.getPotholes(),
        potholeService.getStatistics(),
        potholeService.getActiveDevicesCount(),
      ]);

      setPotholes(potholesData);
      setFilteredPotholes(potholesData);
      setStats(statsData);
      setActiveDevices(devicesCount);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const subscription = potholeService.subscribeToNewPotholes((newPothole) => {
      setPotholes((prev) => [newPothole, ...prev]);
      setFilteredPotholes((prev) => [newPothole, ...prev]);
      loadData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadData]);

  const handleFilterChange = async (filters: {
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }) => {
    try {
      let filtered = await potholeService.getPotholes({
        severity: filters.severity,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      if (filters.search) {
        filtered = filtered.filter(
          (p) =>
            p.device_id.toLowerCase().includes(filters.search!.toLowerCase()) ||
            p.address?.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      setFilteredPotholes(filtered);
    } catch (error) {
      console.error('Error filtering potholes:', error);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const timestamp = new Date().toISOString().split('T')[0];
    if (format === 'csv') {
      const csv = potholeService.exportToCSV(filteredPotholes);
      potholeService.downloadFile(csv, `potholes-${timestamp}.csv`, 'text/csv');
    } else {
      const json = potholeService.exportToJSON(filteredPotholes);
      potholeService.downloadFile(
        json,
        `potholes-${timestamp}.json`,
        'application/json'
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Potholes"
          value={stats.total}
          icon={<AlertTriangle size={24} className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="High Severity"
          value={stats.high}
          icon={<AlertTriangle size={24} className="text-white" />}
          color="bg-red-500"
        />
        <StatCard
          title="Last 24 Hours"
          value={stats.last24Hours}
          icon={<Clock size={24} className="text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Active Devices"
          value={activeDevices}
          icon={<Wifi size={24} className="text-white" />}
          color="bg-orange-500"
        />
      </div>

      <FilterPanel onFilterChange={handleFilterChange} onExport={handleExport} />

      <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden min-h-[500px]">
        <Map
          potholes={filteredPotholes}
          onMarkerClick={setSelectedPothole}
          center={{ lat: 22.7196, lng: 75.8577 }}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Detections</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Time
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Location
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Severity
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  G-Force
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Device
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPotholes.slice(0, 5).map((pothole) => (
                <tr
                  key={pothole.id}
                  onClick={() => setSelectedPothole(pothole)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(pothole.detected_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {Number(pothole.latitude).toFixed(4)},{' '}
                    {Number(pothole.longitude).toFixed(4)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        pothole.severity === 'high'
                          ? 'bg-red-100 text-red-800'
                          : pothole.severity === 'medium'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {pothole.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {pothole.g_force.toFixed(2)} G
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {pothole.device_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPothole && (
        <PotholeDetails
          pothole={selectedPothole}
          onClose={() => setSelectedPothole(null)}
        />
      )}
    </div>
  );
}
