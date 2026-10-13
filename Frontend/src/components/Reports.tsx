import { useState, useEffect } from 'react';
import { BarChart3, PieChart, Download } from 'lucide-react';
import { potholeService } from '../services/potholeService';
import { Pothole } from '../lib/supabase';

export default function Reports() {
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await potholeService.getPotholes();
      setPotholes(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const severityCount = {
      high: potholes.filter((p) => p.severity === 'high').length,
      medium: potholes.filter((p) => p.severity === 'medium').length,
      low: potholes.filter((p) => p.severity === 'low').length,
    };

    const deviceStats = potholes.reduce(
      (acc, p) => {
        acc[p.device_id] = (acc[p.device_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const avgGForce =
      potholes.reduce((sum, p) => sum + p.g_force, 0) / potholes.length || 0;

    return { severityCount, deviceStats, avgGForce };
  };

  const { severityCount, deviceStats, avgGForce } = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Reports</h2>
        <p className="text-gray-600">Comprehensive analysis of pothole detection data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChart size={20} className="text-blue-600" />
              Severity Distribution
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">High Severity</span>
                <span className="text-sm font-bold text-gray-900">
                  {severityCount.high}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(severityCount.high / potholes.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Medium Severity
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {severityCount.medium}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(severityCount.medium / potholes.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Low Severity</span>
                <span className="text-sm font-bold text-gray-900">
                  {severityCount.low}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(severityCount.low / potholes.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" />
              Device Performance
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(deviceStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([device, count]) => (
                <div key={device}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{device}</span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${(count / potholes.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Total Detections
              </span>
              <span className="text-2xl font-bold text-blue-600">{potholes.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Average G-Force
              </span>
              <span className="text-2xl font-bold text-green-600">
                {avgGForce.toFixed(2)} G
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Active Devices</span>
              <span className="text-2xl font-bold text-orange-600">
                {Object.keys(deviceStats).length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Export Full Report
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Download comprehensive reports in various formats for further analysis
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                const csv = potholeService.exportToCSV(potholes);
                potholeService.downloadFile(
                  csv,
                  `pothole-report-${new Date().toISOString().split('T')[0]}.csv`,
                  'text/csv'
                );
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={18} />
              Export as CSV
            </button>
            <button
              onClick={() => {
                const json = potholeService.exportToJSON(potholes);
                potholeService.downloadFile(
                  json,
                  `pothole-report-${new Date().toISOString().split('T')[0]}.json`,
                  'application/json'
                );
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Download size={18} />
              Export as JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
