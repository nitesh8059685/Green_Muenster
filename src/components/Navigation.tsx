import { Leaf, LogOut, Map, Trophy, Users, MessageSquare, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavigationProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { profile, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Leaf },
    { id: 'trip-planner', label: 'Trip Planner', icon: Map },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'forum', label: 'Forum', icon: MessageSquare },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="bg-green-600 rounded-full p-2">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Green Muenster</span>
            </div>

            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{profile?.username}</p>
              <p className="text-xs text-green-600">{profile?.total_points} points</p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        <div className="md:hidden flex space-x-2 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  currentPage === item.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
