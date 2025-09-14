import React from 'react';
import type { Match, MatchEvent } from '../../utils/types';
import { getMatchStatusColor, getMatchStatusText } from '../../utils/matchUtils';
import { formatDateTime } from '../../utils/dateUtils';
import MatchTimeline from './MatchTimeline';

interface MatchDetailsProps {
  match: Match;
  events: MatchEvent[];
}

const MatchDetails: React.FC<MatchDetailsProps> = ({ match, events }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
      {/* Match Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {formatDateTime(match.date)}
          </span>
          <span className={`text-xs sm:text-sm font-semibold ${getMatchStatusColor(match.status)}`}>
            {getMatchStatusText(match)}
          </span>
        </div>
        
        {match.venue && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
            📍 {match.venue}
          </p>
        )}
      </div>

      {/* Teams and Score */}
      <div className="mb-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
          {/* Home Team */}
          <div className="flex flex-col items-center space-y-2 sm:flex-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-400">
                {match.home_team.name.charAt(0)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-center">
              {match.home_team.name}
            </h3>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center space-y-2 sm:px-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {match.home_score ?? '-'}
              </span>
              <span className="text-xl sm:text-2xl text-gray-400">:</span>
              <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {match.away_score ?? '-'}
              </span>
            </div>
            {match.status === 'LIVE' && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-500">LIVE</span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center space-y-2 sm:flex-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-gray-600 dark:text-gray-400">
                {match.away_team.name.charAt(0)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-center">
              {match.away_team.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Match Timeline */}
      <MatchTimeline events={events} />
    </div>
  );
};

export default MatchDetails;