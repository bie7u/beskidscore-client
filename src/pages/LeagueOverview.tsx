import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { League, Season, Match, Round, Standing } from '../utils/types';
import SeasonSelector from '../components/league/SeasonSelector';
import RoundSelector from '../components/league/RoundSelector';
import StandingsTable from '../components/league/StandingsTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../utils/apiService';

type TabType = 'fixtures' | 'standings';

const LeagueOverview: React.FC = () => {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('fixtures');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load only leagues initially
        const leaguesResponse = await apiService.getLeagues();
        setLeagues(leaguesResponse || []);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setLeagues([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load league-specific data when league is selected
  useEffect(() => {
    if (!selectedLeague) {
      setSeasons([]);
      setRounds([]);
      setStandings([]);
      return;
    }

    const loadLeagueData = async () => {
      try {
        const [seasonsResponse, standingsResponse] = await Promise.all([
          apiService.getSeasons(parseInt(selectedLeague)),
          apiService.getStandings(parseInt(selectedLeague))
        ]);

        setSeasons(seasonsResponse || []);
        setStandings(standingsResponse || []);
      } catch (error) {
        console.error('Error loading league data:', error);
        setSeasons([]);
        setStandings([]);
      }
    };

    loadLeagueData();
  }, [selectedLeague]);

  // Load season-specific data when season is selected
  useEffect(() => {
    if (!selectedLeague || !selectedSeason) {
      setRounds([]);
      return;
    }

    const loadSeasonData = async () => {
      try {
        const seasonData = seasons.find(s => s.id === parseInt(selectedSeason));
        if (!seasonData) return;

        const roundsResponse = await apiService.getRounds(parseInt(selectedLeague), seasonData.year);
        setRounds(roundsResponse || []);
      } catch (error) {
        console.error('Error loading season data:', error);
        setRounds([]);
      }
    };

    loadSeasonData();
  }, [selectedLeague, selectedSeason, seasons]);

  // Auto-select the current season (2025) when a league is selected
  useEffect(() => {
    if (selectedLeague && seasons.length > 0) {
      const currentSeasons = seasons.filter(season => 
        season.year.toString() === '2025'
      );
      if (currentSeasons.length > 0 && !selectedSeason) {
        setSelectedSeason(currentSeasons[0].id.toString());
      }
    }
  }, [selectedLeague, seasons, selectedSeason]);

  // Auto-select first round when season is selected
  useEffect(() => {
    if (selectedSeason && rounds.length > 0) {
      if (rounds.length > 0 && !selectedRound) {
        setSelectedRound(rounds[0].id.toString());
      }
    }
  }, [selectedSeason, rounds, selectedRound]);

  // Filter seasons based on selected league (now all seasons are for selected league)
  const filteredSeasons = seasons;

  // Filter rounds based on selected season (now all rounds are for selected season)
  const filteredRounds = rounds;

  // Get matches from selected round (rounds now include matches from API)
  const roundMatches = React.useMemo(() => {
    if (!selectedRound) return [];
    const round = rounds.find(r => r.id === parseInt(selectedRound));
    return round?.matches || [];
  }, [rounds, selectedRound]);

  // Get standings for selected league and season (now filtered by server)
  const currentStanding = React.useMemo(() => {
    if (!selectedLeague || !selectedSeason) return null;
    return standings.find(standing => standing.season === parseInt(selectedSeason));
  }, [standings, selectedSeason]);

  const selectedLeagueData = leagues?.find(league => league.id === parseInt(selectedLeague));

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
          {selectedLeagueData ? selectedLeagueData.name : 'Ligi'}
        </h1>
        {selectedLeagueData && (
          <p className="text-gray-600 dark:text-gray-400">
            {selectedLeagueData.country}
          </p>
        )}
      </div>

      {/* League Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              setSelectedLeague('');
              setSelectedSeason('');
              setSelectedRound('');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !selectedLeague
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Wszystkie ligi
          </button>
          
          {leagues.map((league) => (
            <button
              key={league.id}
              onClick={() => {
                setSelectedLeague(league.id.toString());
                setSelectedSeason('');
                setSelectedRound('');
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLeague === league.id.toString()
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{league.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {league.country}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Season Selector */}
      {selectedLeague && (
        <div className="mb-6">
          <SeasonSelector
            seasons={filteredSeasons}
            selectedSeason={selectedSeason}
            onSeasonSelect={(seasonId) => {
              setSelectedSeason(seasonId);
              setSelectedRound(''); // Reset round when season changes
            }}
          />
        </div>
      )}

      {/* Content */}
      {selectedLeague && selectedSeason ? (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('fixtures')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'fixtures'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Terminarz i wyniki
              </button>
              <button
                onClick={() => setActiveTab('standings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'standings'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Tabela
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'fixtures' && (
            <RoundSelector
              rounds={filteredRounds}
              selectedRound={selectedRound}
              onRoundSelect={setSelectedRound}
              matches={roundMatches}
              onMatchClick={handleMatchClick}
            />
          )}

          {activeTab === 'standings' && currentStanding && (
            <StandingsTable standing={currentStanding} />
          )}

          {activeTab === 'standings' && !currentStanding && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No standings available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Standings data is not available for this league and season
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <div
              key={league.id}
              onClick={() => setSelectedLeague(league.id.toString())}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                    🏆
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {league.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {league.country}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeagueOverview;