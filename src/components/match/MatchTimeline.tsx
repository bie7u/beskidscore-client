import React from 'react';
import type { MatchEvent } from '../../utils/types';
import { getEventIcon, sortEventsByMinute } from '../../utils/matchUtils';

interface MatchTimelineProps {
  events: MatchEvent[];
}

const MatchTimeline: React.FC<MatchTimelineProps> = ({ events }) => {
  const sortedEvents = sortEventsByMinute(events);

  if (events && events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Match Timeline
      </h3>
      
      <div className="space-y-3">
        {sortedEvents && sortedEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            {/* Minute */}
            <div className="flex-shrink-0 w-12 text-center">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {event.minute}'
              </span>
            </div>

            {/* Event Icon */}
            <div className="flex-shrink-0 text-lg">
              {getEventIcon(event.event_type)}
            </div>

            {/* Event Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {event.player_name}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  {event.event_type.replace('_', ' ')}
                </span>
              </div>
              {event.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchTimeline;