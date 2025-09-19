import React, { useState, useEffect } from 'react';
import { Award, Trophy, Medal, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../utils/types';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Mock leaderboard data
const mockLeaderboard: User[] = [
  {
    id: '2',
    name: 'Anna Nowak',
    email: 'anna.nowak@facebook.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c4b7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    provider: 'facebook',
    totalPoints: 312,
    correctPredictions: 23,
    totalPredictions: 35,
    rank: 1,
    joinDate: '2024-12-15'
  },
  {
    id: '3',
    name: 'Piotr Kowalczyk',
    email: 'piotr.kowalczyk@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    provider: 'google',
    totalPoints: 287,
    correctPredictions: 21,
    totalPredictions: 30,
    rank: 2,
    joinDate: '2025-01-01'
  },
  {
    id: '1',
    name: 'Jan Kowalski',
    email: 'jan.kowalski@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    provider: 'google',
    totalPoints: 245,
    correctPredictions: 18,
    totalPredictions: 32,
    rank: 3,
    joinDate: '2025-01-01'
  },
  {
    id: '4',
    name: 'Maria Wiśniewska',
    email: 'maria.wisniewska@facebook.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    provider: 'facebook',
    totalPoints: 198,
    correctPredictions: 15,
    totalPredictions: 28,
    rank: 4,
    joinDate: '2024-12-20'
  },
  {
    id: '5',
    name: 'Tomasz Nowak',
    email: 'tomasz.nowak@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    provider: 'google',
    totalPoints: 167,
    correctPredictions: 12,
    totalPredictions: 25,
    rank: 5,
    joinDate: '2025-01-05'
  }
];

const Leaderboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="flex items-center justify-center w-6 h-6 text-sm font-bold text-gray-600 dark:text-gray-400">
            {rank}
          </div>
        );
    }
  };

  const getAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const currentUserRank = mockLeaderboard.find(u => u.id === user?.id)?.rank || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Award className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ranking użytkowników
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Najlepsi prognostycy meczów piłkarskich
        </p>
      </div>

      {/* Current user stats (if authenticated) */}
      {isAuthenticated && currentUserRank > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
              )}
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Twoja pozycja
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                #{currentUserRank}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {user?.totalPoints} punktów
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeframe selector */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
        {[
          { key: 'all', label: 'Wszystkie' },
          { key: 'month', label: 'Miesiąc' },
          { key: 'week', label: 'Tydzień' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTimeframe(key as 'all' | 'month' | 'week')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              timeframe === key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {mockLeaderboard.map((leaderUser) => (
          <div
            key={leaderUser.id}
            className={`bg-white dark:bg-gray-800 rounded-lg border p-4 transition-colors ${
              leaderUser.id === user?.id
                ? 'border-primary-300 dark:border-primary-700 ring-1 ring-primary-200 dark:ring-primary-800'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Rank */}
              <div className="flex-shrink-0">
                {getRankIcon(leaderUser.rank)}
              </div>

              {/* Avatar and name */}
              <div className="flex-shrink-0">
                {leaderUser.avatar ? (
                  <img
                    src={leaderUser.avatar}
                    alt={leaderUser.name}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {leaderUser.name}
                  </div>
                  {leaderUser.id === user?.id && (
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-medium rounded-full">
                      Ty
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Dołączył {new Date(leaderUser.joinDate).toLocaleDateString('pl-PL')}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {leaderUser.totalPoints}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Punkty
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {getAccuracy(leaderUser.correctPredictions, leaderUser.totalPredictions)}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Celność
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {leaderUser.correctPredictions}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Trafne
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                    {leaderUser.totalPredictions}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Łącznie
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state for unauthenticated users */}
      {!isAuthenticated && (
        <div className="mt-8 text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Zaloguj się, aby uczestniczyć
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Przewiduj wyniki meczów i rywalizuj z innymi użytkownikami!
          </p>
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Zaloguj się
          </button>
        </div>
      )}

      {/* Points explanation */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            System punktowy
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
            <div className="font-bold text-green-600 text-lg">5 pkt</div>
            <div className="text-gray-600 dark:text-gray-400">
              Dokładny wynik
            </div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
            <div className="font-bold text-blue-600 text-lg">3 pkt</div>
            <div className="text-gray-600 dark:text-gray-400">
              Poprawny rezultat
            </div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
            <div className="font-bold text-gray-600 text-lg">0 pkt</div>
            <div className="text-gray-600 dark:text-gray-400">
              Błędna prognoza
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;