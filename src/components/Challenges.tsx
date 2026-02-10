import { useEffect, useState, useCallback } from 'react';
import { Target, Trophy, Medal, Award, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Challenge, UserChallenge } from '../lib/supabase';

type ChallengeWithProgress = Challenge & {
  userChallenge?: UserChallenge;
  progress: number;
};

export default function Challenges() {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load challenges + user progress
  const loadChallenges = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    setError('');

    try {
      const [challengesRes, userChallengesRes] = await Promise.all([
        supabase.from('challenges').select('*').eq('is_active', true),
        supabase.from('user_challenges').select('*').eq('user_id', profile.id),
      ]);

      if (challengesRes.error) throw challengesRes.error;
      if (userChallengesRes.error) throw userChallengesRes.error;

      const challengesData = challengesRes.data || [];
      const userChallengesData = userChallengesRes.data || [];

      const challengesWithProgress = challengesData.map((challenge) => {
        const userChallenge = userChallengesData.find(
          (uc) => uc.challenge_id === challenge.id
        );
        const progress = userChallenge
          ? (userChallenge.current_progress / challenge.target_value) * 100
          : 0;

        return {
          ...challenge,
          userChallenge,
          progress,
        };
      });

      setChallenges(challengesWithProgress);
    } catch (err) {
      setError('Failed to load challenges');
      console.error('Error loading challenges:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  // 1. Initial load
  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  // 2. REAL-TIME: Reload when ANY user_challenges row updates (from TripPlanner)
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('challenges-reload')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', 
          schema: 'public',
          table: 'user_challenges',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          console.log('🎯 Challenge progress updated!', payload);
          loadChallenges(); // ← THIS RELOADS progress bars instantly
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, loadChallenges]);

  const startChallenge = async (challengeId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase.from('user_challenges').insert({
        user_id: profile.id,
        challenge_id: challengeId,
        current_progress: 0,
        status: 'in_progress',
      });

      if (error) throw error;
      await loadChallenges();
    } catch (error) {
      console.error('Error starting challenge:', error);
      alert('Failed to start challenge');
    }
  };

  const handleRefresh = () => {
    loadChallenges();
  };

  const getAchievementLevel = (progress: number) => {
    if (progress >= 100) return 'gold';
    if (progress >= 66) return 'silver';
    if (progress >= 33) return 'bronze';
    return 'none';
  };

  const getAchievementColor = (level: string) => {
    switch (level) {
      case 'gold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'silver':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'bronze':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getAchievementIcon = (level: string) => {
    switch (level) {
      case 'gold':
        return Trophy;
      case 'silver':
        return Medal;
      case 'bronze':
        return Award;
      default:
        return Target;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading challenges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Challenges</h1>
          <p className="text-gray-600">
            Complete challenges to earn points and unlock achievements
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Rest of your JSX stays exactly the same */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-md p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Achievement System</h2>
            <p className="text-sm opacity-90">
              Earn Bronze (33%), Silver (66%), and Gold (100%) medals
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Award className="w-8 h-8 text-orange-200" />
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Medal className="w-8 h-8 text-gray-200" />
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Trophy className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => {
          const level = getAchievementLevel(challenge.progress);
          const AchievementIcon = getAchievementIcon(level);
          const colorClass = getAchievementColor(level);

          return (
            <div key={challenge.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded capitalize">
                      {challenge.type}
                    </span>
                    <span className="text-gray-600">
                      Target: {challenge.target_value} {challenge.target_unit}
                    </span>
                  </div>
                </div>
                <div className={`${colorClass} border-2 rounded-lg p-3`}>
                  <AchievementIcon className="w-8 h-8" />
                </div>
              </div>

              {challenge.userChallenge ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>
                        {challenge.userChallenge.current_progress.toFixed(1)} /{' '}
                        {challenge.target_value} {challenge.target_unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(challenge.progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Bronze 33%</span>
                      <span>Silver 66%</span>
                      <span>Gold 100%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="text-sm">
                      <p className="text-gray-600">Points Available</p>
                      <p className="font-semibold text-gray-800">
                        {challenge.progress >= 100
                          ? challenge.points_gold
                          : challenge.progress >= 66
                          ? challenge.points_silver
                          : challenge.points_bronze}{' '}
                        pts
                      </p>
                    </div>
                    {challenge.progress >= 100 && (
                      <div className="flex items-center text-yellow-600 font-semibold">
                        <Trophy className="w-5 h-5 mr-1" />
                        Completed!
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => startChallenge(challenge.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Start Challenge
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
