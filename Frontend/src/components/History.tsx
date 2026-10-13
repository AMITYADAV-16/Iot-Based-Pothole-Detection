import { useState, useEffect } from 'react';
import { Calendar, MapPin, TrendingUp } from 'lucide-react';
import { potholeService } from '../services/potholeService';
import { Pothole } from '../lib/supabase';
import PotholeDetails from './PotholeDetails';

export default function History() {
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadPotholes();
  }, [filter]);

  const loadPotholes = async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate: Date | undefined;

      switch (filter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const data = await potholeService.getPotholes({ startDate });
      setPotholes(data);
    } catch (error) {
      console.error('Error loading potholes:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (potholes: Pothole[]) => {
    const groups: { [key: string]: Pothole[] } = {};

    potholes.forEach((pothole) => {
      const date = new Date(pothole.detected_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(pothole);
    });

    return groups;
  };

  const groupedPotholes = groupByDate(potholes);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Detection History</h2>
          <div className="flex gap-2">
            {(['all', 'today', 'week', 'month'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Detections</p>
                <p className="text-2xl font-bold text-gray-900">{potholes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Severity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {potholes.filter((p) => p.severity === 'high').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <MapPin size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(potholes.map((p) => `${p.latitude},${p.longitude}`)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedPotholes).map(([date, datePotholes]) => (
          <div key={date} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{date}</h3>
            <div className="space-y-3">
              {datePotholes.map((pothole) => (
                <div
                  key={pothole.id}
                  onClick={() => setSelectedPothole(pothole)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        pothole.severity === 'high'
                          ? 'bg-red-500'
                          : pothole.severity === 'medium'
                            ? 'bg-orange-500'
                            : 'bg-yellow-500'
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {Number(pothole.latitude).toFixed(4)},{' '}
                        {Number(pothole.longitude).toFixed(4)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(pothole.detected_at).toLocaleTimeString()} •{' '}
                        {pothole.device_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        pothole.severity === 'high'
                          ? 'bg-red-100 text-red-800'
                          : pothole.severity === 'medium'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {pothole.severity.toUpperCase()}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {pothole.g_force.toFixed(2)} G
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
