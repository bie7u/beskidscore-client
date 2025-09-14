import React from 'react';
import type { Standing } from '../../utils/types';

interface StandingsTableProps {
  standing: Standing;
}

const StandingsTable: React.FC<StandingsTableProps> = ({ standing }) => {
  const getPositionType = (position: number) => {
    const promotionNumber = standing.promotion_number || 0;
    const playoffsNumber = standing.playoffs_number || 0;
    const relegationNumber = standing.relegation_number || 0;
    const totalTeams = standing.table.length;
    
    if (position <= promotionNumber) {
      return 'promotion';
    }
    if (position <= promotionNumber + playoffsNumber) {
      return 'playoffs';
    }
    if (position > totalTeams - relegationNumber) {
      return 'relegation';
    }
    return 'normal';
  };

  const getRowClasses = (position: number) => {
    const type = getPositionType(position);
    const baseClasses = "hover:bg-opacity-90 dark:hover:bg-opacity-90";
    
    switch (type) {
      case 'promotion':
        return `bg-yellow-100 dark:bg-yellow-900/30 ${baseClasses}`;
      case 'playoffs':
        return `bg-green-100 dark:bg-green-900/30 ${baseClasses}`;
      case 'relegation':
        return `bg-red-100 dark:bg-red-900/30 ${baseClasses}`;
      default:
        return `hover:bg-gray-50 dark:hover:bg-gray-700 ${baseClasses}`;
    }
  };

  const getPositionTextColor = (position: number) => {
    const type = getPositionType(position);
    
    switch (type) {
      case 'promotion':
        return 'text-yellow-700 dark:text-yellow-400';
      case 'playoffs':
        return 'text-green-700 dark:text-green-400';
      case 'relegation':
        return 'text-red-700 dark:text-red-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tabela ligi
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Poz
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Drużyna
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                M
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Z
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                R
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                P
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                BZ
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                BS
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                RB
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Pkt
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {standing.table.map((entry) => (
              <tr key={entry.team} className={getRowClasses(entry.position)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getPositionTextColor(entry.position)}`}>
                    {entry.position}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {entry.team_name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.team_name}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-center text-sm text-gray-700 dark:text-gray-300">
                  {entry.played}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-center text-sm text-gray-700 dark:text-gray-300">
                  {entry.won}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-center text-sm text-gray-700 dark:text-gray-300">
                  {entry.drawn}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-center text-sm text-gray-700 dark:text-gray-300">
                  {entry.lost}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-center text-sm text-gray-700 dark:text-gray-300">
                  {entry.goals_for}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-center text-sm text-gray-700 dark:text-gray-300">
                  {entry.goals_against}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-center text-sm">
                  <span className={entry.goal_difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {entry.goal_difference > 0 ? '+' : ''}{entry.goal_difference}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {entry.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex flex-wrap gap-4 text-xs">
          {standing.promotion_number && standing.promotion_number > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">Promotion</span>
            </div>
          )}
          {standing.playoffs_number && standing.playoffs_number > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">Playoffs</span>
            </div>
          )}
          {standing.relegation_number && standing.relegation_number > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-300">Relegation</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;