import React from 'react';
import type { Round, Match } from '../../utils/types';
import MatchList from '../match/MatchList';

interface RoundSelectorProps {
  rounds: Round[];
  selectedRound: string;
  onRoundSelect: (roundId: string) => void;
  matches: Match[];
  onMatchClick?: (match: Match) => void;
}

const RoundSelector: React.FC<RoundSelectorProps> = ({
  rounds,
  selectedRound,
  onRoundSelect,
  matches,
  onMatchClick
}) => {
  const selectedRoundData = rounds.find(round => round.id === parseInt(selectedRound));

  return (
    <div className="space-y-6">
      {/* Round Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Wybierz kolejkę
        </h3>
        <div className="flex flex-wrap gap-2">
          {rounds.map((round) => (
            <button
              key={round.id}
              onClick={() => onRoundSelect(round.id.toString())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRound === round.id.toString()
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {round.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Round Matches */}
      {selectedRoundData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedRoundData.name}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(selectedRoundData.start_date).toLocaleDateString()} - {new Date(selectedRoundData.end_date).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {matches.length > 0 ? (
              <MatchList matches={matches} onMatchClick={onMatchClick} />
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">⚽</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Brak zaplanowanych meczów w tej kolejce
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundSelector;