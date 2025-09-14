import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Match, League } from '../utils/types';
import MatchList from '../components/match/MatchList';
import LeagueSelector from '../components/league/LeagueSelector';
import DatePicker from '../components/common/DatePicker';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../utils/apiService';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLeague, setSelectedLeague] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Format the date for API query
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        // Load matches and leagues with server-side filtering
        const [matchesResponse, leaguesResponse] = await Promise.all([
          apiService.getMatches({ 
            date: dateStr,
            ...(selectedLeague && { league_id: selectedLeague })
          }),
          apiService.getLeagues()
        ]);

        setMatches(matchesResponse);
        setLeagues(leaguesResponse);
      } catch (error) {
        console.error('Error loading home data:', error);
        // Fallback to empty arrays on error
        setMatches([]);
        setLeagues([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate, selectedLeague]); // Reload when date or league changes

  // Matches are already filtered by the server, no need for client-side filtering
  const filteredMatches = matches;

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Wyniki na żywo i terminarz
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Śledź swoje ulubione drużyny i ligi
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Date Picker */}
        <div className="flex justify-center">
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* League Selector */}
        <LeagueSelector
          leagues={leagues}
          selectedLeague={selectedLeague}
          onLeagueSelect={(leagueId) => setSelectedLeague(leagueId || undefined)}
        />
      </div>

      {/* Live Matches Banner */}
      {matches.some(match => match.status === 'LIVE') && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-green-800 dark:text-green-200 font-medium">
              {matches.filter(match => match.status === 'LIVE').length} mecz
              {matches.filter(match => match.status === 'LIVE').length === 1 ? '' : 'y'} na żywo!
            </span>
          </div>
        </div>
      )}

      {/* Matches */}
      <MatchList matches={filteredMatches} onMatchClick={handleMatchClick} />
    </div>
  );
};

export default Home;