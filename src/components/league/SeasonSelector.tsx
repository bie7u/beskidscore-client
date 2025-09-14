import React from 'react';
import type { SeasonSelectorProps } from '../../utils/types';

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  seasons,
  selectedSeason,
  onSeasonSelect,
}) => {
  if (seasons.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sezon:
      </span>
      <select
        value={selectedSeason || ''}
        onChange={(e) => onSeasonSelect(e.target.value)}
        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="">Wszystkie sezony</option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id.toString()}>
            {season.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonSelector;