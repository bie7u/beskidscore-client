import React from 'react';
import type { LeagueSelectorProps } from '../../utils/types';

const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  leagues,
  selectedLeague,
  onLeagueSelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={() => onLeagueSelect(null)}
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
          onClick={() => onLeagueSelect(league.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedLeague === league.id
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <span>{league.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LeagueSelector;