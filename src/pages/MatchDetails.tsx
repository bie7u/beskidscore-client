import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Match, MatchEvent } from '../utils/types';
import MatchDetails from '../components/match/MatchDetails';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { apiService } from '../utils/apiService';

const MatchDetailsPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) {
      setError('Nie podano identyfikatora meczu');
      setLoading(false);
      return;
    }

    const loadMatchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load match and events in parallel
        const [matchData, eventsData] = await Promise.all([
          apiService.getMatch(parseInt(matchId)),
          apiService.getMatchEvents(parseInt(matchId))
        ]);

        setMatch(matchData);
        setEvents(eventsData.events);
      } catch (error) {
        console.error('Error loading match data:', error);
        setError('Nie udało się załadować danych meczu. Spróbuj ponownie.');
      } finally {
        setLoading(false);
      }
    };

    loadMatchData();
  }, [matchId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !match) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorMessage message={error || 'Nie znaleziono meczu'} onRetry={handleBack} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 sm:mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm sm:text-base">Powrót do meczów</span>
      </button>

      {/* Match Details */}
      <MatchDetails match={match} events={events} />
    </div>
  );
};

export default MatchDetailsPage;