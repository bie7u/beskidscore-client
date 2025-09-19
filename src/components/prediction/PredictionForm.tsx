import React, { useState, useEffect } from 'react';
import { Target, Check, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Match, Prediction } from '../../utils/types';

interface PredictionFormProps {
  match: Match;
  onPredictionSubmit?: (prediction: { homeScore: number; awayScore: number }) => void;
  existingPrediction?: Prediction;
  disabled?: boolean;
}

const PredictionForm: React.FC<PredictionFormProps> = ({
  match,
  onPredictionSubmit,
  existingPrediction,
  disabled = false
}) => {
  const { isAuthenticated } = useAuth();
  const [homeScore, setHomeScore] = useState(existingPrediction?.homeScore || 0);
  const [awayScore, setAwayScore] = useState(existingPrediction?.awayScore || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(!!existingPrediction);

  // Check if prediction window is closed (match started or finished)
  const isPredictionClosed = match.status !== 'SCHEDULED' || disabled;
  const matchDate = new Date(match.date);
  const now = new Date();
  const isPastDeadline = matchDate.getTime() - now.getTime() < 30 * 60 * 1000; // 30 minutes before match

  const canPredict = isAuthenticated && !isPredictionClosed && !isPastDeadline;

  useEffect(() => {
    if (existingPrediction) {
      setHomeScore(existingPrediction.homeScore);
      setAwayScore(existingPrediction.awayScore);
      setHasSubmitted(true);
    }
  }, [existingPrediction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canPredict || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onPredictionSubmit) {
        onPredictionSubmit({ homeScore, awayScore });
      }
      
      setHasSubmitted(true);
    } catch (error) {
      console.error('Failed to submit prediction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
        <Lock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Zaloguj się, aby przewidywać wyniki
        </p>
      </div>
    );
  }

  if (isPredictionClosed) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
        <Lock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {match.status === 'FINISHED' ? 'Mecz zakończony' : 'Prognoza zamknięta'}
        </p>
        {existingPrediction && (
          <div className="mt-2 text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Twoja prognoza: {existingPrediction.homeScore} - {existingPrediction.awayScore}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (isPastDeadline) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
        <Lock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Za późno na prognozy (deadline: 30 min przed meczem)
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="h-5 w-5 text-primary-600" />
        <span className="font-medium text-gray-900 dark:text-white">
          {hasSubmitted ? 'Twoja prognoza' : 'Przewiduj wynik'}
        </span>
        {hasSubmitted && (
          <Check className="h-4 w-4 text-green-600" />
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-center space-x-4 mb-4">
          {/* Home team score */}
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {match.home_team.name}
            </div>
            <input
              type="number"
              min="0"
              max="20"
              value={homeScore}
              onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
              disabled={hasSubmitted || isSubmitting}
              className="w-16 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
            />
          </div>

          <div className="text-2xl font-bold text-gray-400">
            -
          </div>

          {/* Away team score */}
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {match.away_team.name}
            </div>
            <input
              type="number"
              min="0"
              max="20"
              value={awayScore}
              onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
              disabled={hasSubmitted || isSubmitting}
              className="w-16 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
            />
          </div>
        </div>

        {!hasSubmitted && (
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Zapisuję...</span>
                </div>
              ) : (
                'Zapisz prognozę'
              )}
            </button>
          </div>
        )}

        {hasSubmitted && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-sm">
              <Check className="h-4 w-4" />
              <span>Prognoza zapisana</span>
            </div>
            {existingPrediction?.createdAt && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {new Date(existingPrediction.createdAt).toLocaleDateString('pl-PL', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default PredictionForm;