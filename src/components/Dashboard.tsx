import { useEffect, useState } from 'react';
import { Leaf, TrendingUp, Award, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Trip } from '../lib/supabase';
import WeatherWidget from './WeatherWidget';

export default function Dashboard() {
  const { profile } = useAuth();
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentTrips();
  }, []);

  const loadRecentTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentTrips(data || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Points',
      value: profile?.total_points || 0,
      icon: Award,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      label: 'CO₂ Saved',
      value: `${(profile?.co2_saved || 0).toFixed(2)} kg`,
      icon: Leaf,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Distance',
      value: `${(profile?.total_distance || 0).toFixed(2)} km`,
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-gray-600">Track your eco-friendly journey in Muenster</p>
      </div>

      <WeatherWidget />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-full p-3`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-green-600" />
          Recent Trips
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading trips...</p>
        ) : recentTrips.length === 0 ? (
          <p className="text-gray-500">No trips yet. Start planning your first eco-friendly trip!</p>
        ) : (
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <div
                key={trip.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {trip.from_location} → {trip.to_location}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="capitalize bg-green-100 text-green-700 px-2 py-1 rounded">
                        {trip.transport_mode}
                      </span>
                      <span>{trip.distance.toFixed(2)} km</span>
                      <span className="text-green-600 font-medium">
                        {trip.co2_saved.toFixed(2)} kg CO₂ saved
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(trip.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-semibold text-yellow-600">
                      +{trip.points_earned} pts
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
