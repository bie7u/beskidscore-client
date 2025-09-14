import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Match, League } from '../utils/types';
import MatchList from '../components/match/MatchList';
import LeagueSelector from '../components/league/LeagueSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../utils/apiService';

const Live: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load leagues first, then live matches filtered by selected league
        const [leaguesResponse, matchesResponse] = await Promise.all([
          apiService.getLeagues(),
          apiService.getMatches({ 
            status: 'LIVE',
            ...(selectedLeague && { league_id: selectedLeague })
          })
        ]);

        setLeagues(leaguesResponse);
        setMatches(matchesResponse);
      } catch (error) {
        console.error('Error loading live data:', error);
        // Fallback to empty arrays on error
        setMatches([]);
        setLeagues([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedLeague]); // Reload when selectedLeague changes

  // Auto-refresh live matches every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const matchesResponse = await apiService.getMatches({ 
          status: 'LIVE',
          ...(selectedLeague && { league_id: selectedLeague })
        });
        setMatches(matchesResponse);
      } catch (error) {
        console.error('Error refreshing live matches:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedLeague]);

  // Live matches are already filtered by the server, no need for client-side filtering
  const liveMatches = matches;

  const handleMatchClick = (match: Match) => {
    navigate(`/match/${match.id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mecze na żywo
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Śledź mecze odbywające się w tej chwili
        </p>
      </div>

      {/* League Filter */}
      <div className="mb-6">
        <LeagueSelector
          leagues={leagues}
          selectedLeague={selectedLeague}
          onLeagueSelect={(leagueId) => setSelectedLeague(leagueId || undefined)}
        />
      </div>

      {/* Live Matches Count */}
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-800 dark:text-red-200 font-medium">
            {liveMatches.length} mecz{liveMatches.length === 1 ? '' : 'y'} na żywo
          </span>
        </div>
      </div>

      {/* Live Matches */}
      {liveMatches.length > 0 ? (
        <MatchList matches={liveMatches} onMatchClick={handleMatchClick} />
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📺</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Brak meczów na żywo
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedLeague ? 'Brak meczów na żywo w wybranej lidze' : 'Obecnie nie odbywają się żadne mecze'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Live;