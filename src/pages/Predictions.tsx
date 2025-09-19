import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Match, Prediction } from '../utils/types';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Mock predictions data
const mockPredictions: Prediction[] = [
  {
    id: '1',
    userId: '1',
    matchId: 1,
    homeScore: 2,
    awayScore: 1,
    points: 3,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T18:30:00Z'
  },
  {
    id: '2', 
    userId: '1',
    matchId: 2,
    homeScore: 1,
    awayScore: 0,
    points: 1,
    createdAt: '2025-01-15T11:00:00Z',
    updatedAt: '2025-01-15T20:00:00Z'
  },
  {
    id: '3',
    userId: '1', 
    matchId: 3,
    homeScore: 3,
    awayScore: 1,
    createdAt: '2025-01-16T14:30:00Z'
  }
];

// Mock matches data - in real app this would come from API
const mockMatches: Match[] = [
  {
    id: 1,
    league: 1,
    league_read: 'Premier League',
    season: 2025,
    round: 1,
    round_number_read: '1',
    home_team: { id: 1, name: 'Manchester United' },
    away_team: { id: 2, name: 'Liverpool' },
    home_score: 2,
    away_score: 1,
    status: 'FINISHED',
    date: '2025-01-15T15:00:00Z',
    venue: 'Old Trafford'
  },
  {
    id: 2,
    league: 1,
    league_read: 'Premier League', 
    season: 2025,
    round: 1,
    round_number_read: '1',
    home_team: { id: 3, name: 'Manchester City' },
    away_team: { id: 4, name: 'Chelsea' },
    home_score: 3,
    away_score: 0,
    status: 'FINISHED',
    date: '2025-01-15T17:00:00Z',
    venue: 'Etihad Stadium'
  },
  {
    id: 3,
    league: 1,
    league_read: 'Premier League',
    season: 2025, 
    round: 2,
    round_number_read: '2',
    home_team: { id: 5, name: 'Arsenal' },
    away_team: { id: 6, name: 'Tottenham' },
    home_score: null,
    away_score: null,
    status: 'SCHEDULED',
    date: '2025-01-18T15:00:00Z',
    venue: 'Emirates Stadium'
  }
];

const Predictions: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'finished'>('pending');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const userPredictions = mockPredictions.filter(p => p.userId === user?.id);
  const predictionsWithMatches = userPredictions.map(prediction => {
    const match = mockMatches.find(m => m.id === prediction.matchId);
    return { prediction, match };
  }).filter(item => item.match);

  const pendingPredictions = predictionsWithMatches.filter(item => 
    item.match!.status === 'SCHEDULED'
  );
  const finishedPredictions = predictionsWithMatches.filter(item => 
    item.match!.status === 'FINISHED'
  );

  const getPredictionResult = (prediction: Prediction, match: Match) => {
    if (match.status !== 'FINISHED' || match.home_score === null || match.away_score === null) {
      return 'pending';
    }

    if (prediction.homeScore === match.home_score && prediction.awayScore === match.away_score) {
      return 'exact';
    }

    const predictionResult = prediction.homeScore > prediction.awayScore ? 'home' : 
                           prediction.homeScore < prediction.awayScore ? 'away' : 'draw';
    const actualResult = match.home_score > match.away_score ? 'home' : 
                        match.home_score < match.away_score ? 'away' : 'draw';

    return predictionResult === actualResult ? 'correct' : 'wrong';
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'exact':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'correct':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'wrong':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'exact':
        return 'Dokładny wynik';
      case 'correct':
        return 'Poprawny rezultat';
      case 'wrong':
        return 'Błędna prognoza';
      default:
        return 'Oczekuje na wynik';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Moje prognozy
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Zarządzaj swoimi prognozami i śledź wyniki
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {finishedPredictions.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Zakończone prognozy
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">
            {finishedPredictions.filter(item => 
              getPredictionResult(item.prediction, item.match!) === 'exact'
            ).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Dokładne wyniki
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-primary-600">
            {user?.totalPoints || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Łączne punkty
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Oczekujące ({pendingPredictions.length})
          </button>
          <button
            onClick={() => setActiveTab('finished')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'finished'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Zakończone ({finishedPredictions.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {(activeTab === 'pending' ? pendingPredictions : finishedPredictions).map(({ prediction, match }) => {
          if (!match) return null;
          
          const result = getPredictionResult(prediction, match);
          
          return (
            <div
              key={prediction.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(match.date).toLocaleDateString('pl-PL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getResultIcon(result)}
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {getResultText(result)}
                  </span>
                  {prediction.points && (
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-medium rounded-full">
                      +{prediction.points} pkt
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {match.home_team.name}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Twoja prognoza
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {prediction.homeScore} - {prediction.awayScore}
                    </div>
                  </div>

                  {match.status === 'FINISHED' && (
                    <div className="text-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Rzeczywisty wynik
                      </div>
                      <div className="text-xl font-bold text-primary-600">
                        {match.home_score} - {match.away_score}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {match.away_team.name}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {match.league_read}
                </span>
              </div>
            </div>
          );
        })}

        {(activeTab === 'pending' ? pendingPredictions : finishedPredictions).length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
              {activeTab === 'pending' ? '⏰' : '📊'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {activeTab === 'pending' ? 'Brak oczekujących prognoz' : 'Brak zakończonych prognoz'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'pending' 
                ? 'Dodaj prognozy na nadchodzące mecze' 
                : 'Twoje prognozy pojawią się tutaj po zakończeniu meczów'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions;