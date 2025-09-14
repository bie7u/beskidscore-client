import React from 'react';
import type { MatchListProps } from '../../utils/types';
import MatchCard from './MatchCard';
import { getRelativeDate } from '../../utils/dateUtils';

const MatchList: React.FC<MatchListProps> = ({ matches, onMatchClick }) => {
  // Group matches by date
  const matchesByDate = matches.reduce((acc, match) => {
    const date = new Date(match.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(match);
    return acc;
  }, {} as Record<string, typeof matches>);

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">⚽</div>
        <p className="text-gray-600 dark:text-gray-400">Nie znaleziono meczów</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(matchesByDate).map(([date, dateMatches]) => (
        <div key={date} className="space-y-4">
          {/* Date Header */}
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getRelativeDate(new Date(date))}
            </h3>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dateMatches.length} mecz{dateMatches.length === 1 ? '' : 'y'}
            </span>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dateMatches
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={onMatchClick}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchList;