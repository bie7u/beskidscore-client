import React from 'react';
import type { MatchCardProps } from '../../utils/types';
import { getMatchStatusColor, getMatchStatusText } from '../../utils/matchUtils';
import { formatTime } from '../../utils/dateUtils';

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(match);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
        match.status === 'LIVE' ? 'ring-2 ring-green-500 ring-opacity-50' : ''
      }`}
    >
      {/* Match Time/Status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTime(match.date)}
        </span>
        <span className={`text-xs font-semibold ${getMatchStatusColor(match.status)}`}>
          {getMatchStatusText(match)}
        </span>
      </div>

      {/* Teams and Score */}
      <div className="space-y-2">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                {match.home_team.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {match.home_team.name}
            </span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {match.home_score ?? '-'}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                {match.away_team.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {match.away_team.name}
            </span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {match.away_score ?? '-'}
          </span>
        </div>
      </div>

      {/* Venue */}
      {match.venue && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            📍 {match.venue}
          </span>
        </div>
      )}
    </div>
  );
};

export default MatchCard;