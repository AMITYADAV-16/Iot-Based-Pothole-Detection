import { X, MapPin, Calendar, Activity, Cpu } from 'lucide-react';
import { Pothole } from '../lib/supabase';

interface PotholeDetailsProps {
  pothole: Pothole;
  onClose: () => void;
}

const severityConfig = {
  high: { label: 'High', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' },
  medium: {
    label: 'Medium',
    color: 'bg-orange-100 text-orange-800',
    dotColor: 'bg-orange-500',
  },
  low: { label: 'Low', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-500' },
};

export default function PotholeDetails({ pothole, onClose }: PotholeDetailsProps) {
  const config = severityConfig[pothole.severity];
  const detectedDate = new Date(pothole.detected_at);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Pothole Details</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
            >
              <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
              {config.label} Severity
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-sm text-gray-600 mt-1">
                  Lat: {Number(pothole.latitude).toFixed(6)}
                  <br />
                  Lng: {Number(pothole.longitude).toFixed(6)}
                </p>
                {pothole.address && (
                  <p className="text-sm text-gray-500 mt-1">{pothole.address}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Detected At</p>
                <p className="text-sm text-gray-600 mt-1">
                  {detectedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {detectedDate.toLocaleTimeString('en-US')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">G-Force Reading</p>
                <p className="text-sm text-gray-600 mt-1">{pothole.g_force.toFixed(2)} G</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Cpu size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Device ID</p>
                <p className="text-sm text-gray-600 mt-1">{pothole.device_id}</p>
              </div>
            </div>
          </div>

          {pothole.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
              <p className="text-sm text-gray-600">{pothole.notes}</p>
            </div>
          )}

          {/* <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                window.open(
                  `https://www.google.com/maps?q=${pothole.latitude},${pothole.longitude}`,
                  '_blank'
                );
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View on Google Maps
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
