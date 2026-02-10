import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Leaf, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile } from '../lib/supabase';

export default function Leaderboard() {
  const { profile } = useAuth();
  const [topUsers, setTopUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'points' | 'co2' | 'distance'>('points');

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    try {
      const orderBy =
        filter === 'points'
          ? 'total_points'
          : filter === 'co2'
          ? 'co2_saved'
          : 'total_distance';

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(orderBy, { ascending: false })
        .limit(50);

      if (error) throw error;
      setTopUsers(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return <span className="text-gray-600 font-semibold">{rank}</span>;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getValue = (user: Profile) => {
    switch (filter) {
      case 'points':
        return `${user.total_points} pts`;
      case 'co2':
        return `${user.co2_saved.toFixed(2)} kg`;
      case 'distance':
        return `${user.total_distance.toFixed(2)} km`;
    }
  };

  const getVisualization = (user: Profile) => {
    if (filter === 'co2') {
      const co2Saved = user.co2_saved;
      const percentCircumference = Math.min((co2Saved / 1000) * 100, 100);
      return {
        value: co2Saved,
        max: 1000,
        unit: 'kg CO₂ saved',
        percent: percentCircumference,
        label: `${((co2Saved / 1000) * 100).toFixed(0)}% of 1 ton goal`,
      };
    } else if (filter === 'distance') {
      const distance = user.total_distance;
      const earthCircumference = 40075;
      const percentAround = (distance / earthCircumference) * 100;
      return {
        value: distance,
        max: earthCircumference,
        unit: 'km traveled',
        percent: percentAround,
        label: `${percentAround.toFixed(4)}% around Earth`,
      };
    }
    return null;
  };

  const userRank = topUsers.findIndex((u) => u.id === profile?.id) + 1;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank against other eco-warriors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userRank > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Your Rank</p>
                <p className="text-4xl font-bold">#{userRank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Your Stats</p>
                <div className="space-y-1">
                  <p className="font-semibold">{profile?.total_points} points</p>
                  <p className="text-sm">{profile?.co2_saved.toFixed(2)} kg CO₂ saved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Community Impact</p>
              <p className="text-xl font-bold">Global Journey</p>
            </div>
            <Globe className="w-8 h-8 opacity-80" />
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs opacity-75 mb-1">Total Distance Traveled</p>
              <p className="text-2xl font-bold">
                {(topUsers.reduce((sum, u) => sum + u.total_distance, 0) / 40075 * 100).toFixed(2)}%
              </p>
              <p className="text-xs opacity-75">around Earth</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('points')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              filter === 'points'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Points
          </button>
          <button
            onClick={() => setFilter('co2')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              filter === 'co2'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Leaf className="w-4 h-4 inline mr-2" />
            CO₂ Saved
          </button>
          <button
            onClick={() => setFilter('distance')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              filter === 'distance'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Distance
          </button>
        </div>

        <div className="space-y-4">
          {topUsers.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user.id === profile?.id;
            const viz = getVisualization(user);

            return (
              <div
                key={user.id}
                className={`border-2 rounded-lg p-5 transition-all ${getRankClass(
                  rank
                )} ${isCurrentUser ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(rank)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {user.full_name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">{getValue(user)}</p>
                    {filter === 'points' && (
                      <p className="text-xs text-gray-600">
                        {user.co2_saved.toFixed(1)} kg CO₂
                      </p>
                    )}
                  </div>
                </div>

                {viz && (
                  <div className="space-y-2">
                    {filter === 'co2' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">CO₂ Savings Progress</span>
                          <span className="text-xs font-semibold text-green-600">{viz.label}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(viz.percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {filter === 'distance' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-medium text-gray-600">Journey Around Earth</span>
                          </div>
                          <span className="text-xs font-semibold text-blue-600">{viz.label}</span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(viz.percent, 100)}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          {viz.value.toFixed(0)} km of {viz.max.toLocaleString()} km
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
