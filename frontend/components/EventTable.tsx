'use client';

import { FC, useState, useOptimistic, startTransition, useCallback } from 'react';

import { fetchEvents, updateEventStatus } from '@/lib/api';
import Pagination from '@/components/Pagination';

import { EventOverride } from '../../shared/types/types';
import { useToaster } from './Toaster';
import moment from 'moment';

interface EventTableProps {
  events: EventOverride[];
  scheduleId: string;
}

const ITEMS_PER_PAGE = 10;

const EventTable: FC<EventTableProps> = ({ events, scheduleId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(events);
  const { addToast } = useToaster();
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [optimisticEvents, addOptimisticEvent] = useOptimistic(
    data,
    (state, updatedEvent: EventOverride) => state.map((event) => event.event_datetime === updatedEvent.event_datetime ? updatedEvent : event)
  );

  const handleStatusUpdate = useCallback(
    async (event: EventOverride, newStatus: 'in-progress' | 'completed') => {
      const eventKey = event.event_datetime;
      setLoadingStates((prev) => ({ ...prev, [eventKey]: true }));

      const previousEvent = { ...event };
      const updatedEvent = { ...event, status: newStatus };
      startTransition(() => {
        addOptimisticEvent(updatedEvent);
      });
      try {
        await updateEventStatus(event.schedule_id, event.event_datetime, newStatus);
        startTransition(() => {
          addToast({
            message: `Event updated to ${newStatus.replace('-', ' ')}`,
            type: 'success',
          });
        });
        const ReFetchEvents = await fetchEvents(scheduleId);
        setData(ReFetchEvents)
      } catch (error) {
        startTransition(() => {
          addOptimisticEvent(previousEvent);
          addToast({
            message: 'Failed to update event status',
            type: 'error',
          });
        });
        console.error('Status update failed:', error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, [eventKey]: false }));
      }
    },
    [addOptimisticEvent, addToast]
  );

  const getActionButtons = (event: EventOverride) => {
    const isLoading = loadingStates[event.event_datetime] || false;
    switch (event.status) {
      case 'pending':
        return (
          <button
            onClick={() => handleStatusUpdate(event, 'in-progress')}
            disabled={isLoading}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Starting...' : 'Start'}
          </button>
        );
      case 'overdue':
          return (
            <button
              onClick={() => handleStatusUpdate(event, 'in-progress')}
              disabled={isLoading}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Starting...' : 'Start'}
            </button>
        );
      case 'in-progress':
        return (
          <button
            onClick={() => handleStatusUpdate(event, 'completed')}
            disabled={isLoading}
            className={`bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Completing...' : 'Complete'}
          </button>
        );
      case 'completed':
        return (
          <span className="bg-green-500/80 text-white px-3 py-1 rounded text-sm font-medium">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(optimisticEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEvents = optimisticEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Events</h2>
      {optimisticEvents.length === 0 ? (
        <p className="text-gray-400">No events found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-700/50">
                  <th className="px-4 py-2 text-left">Event Datetime</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEvents.map((event) => (
                  <tr key={event.event_datetime} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-4 py-2">{moment.parseZone(event?.event_datetime).format("MM/DD/YYYY HH:mm:ss A")}</td>
                    <td className="px-4 py-2 capitalize">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          event.status === 'completed'
                            ? 'bg-green-500/80 text-white'
                            : event.status === 'in-progress'
                            ? 'bg-blue-500/80 text-white'
                            : 'bg-yellow-500/80 text-white'
                        }`}
                      >
                        {event.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2">{getActionButtons(event)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default EventTable;