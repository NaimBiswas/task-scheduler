import { FC } from 'react';
import Link from 'next/link';

import moment from 'moment';
import { Schedule } from '@/shared/types/types';


interface ScheduleTableProps {
  schedules: Schedule[];
}

const ScheduleTable: FC<ScheduleTableProps> = ({ schedules }) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      {schedules && schedules?.length === 0 ? (
        <p className="text-gray-400">No schedules found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="px-4 py-2 text-left">Task Name</th>
                <th className="px-4 py-2 text-left">Start Date (MM/DD/YYYY)</th>
                <th className="px-4 py-2 text-left">End Date (MM/DD/YYYY)</th>
                <th className="px-4 py-2 text-left">Frequency</th>
                <th className="px-4 py-2 text-left">Total Events</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules?.map((schedule) => {
                const rrule = schedule.rrule;
                const startDate = moment.parseZone(schedule.start_date).format("MM/DD/YYYY") || 'N/A';
                const endDate = moment.parseZone(schedule.end_date).format("MM/DD/YYYY") || 'N/A';
                return (
                  <tr key={schedule.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-4 py-2">{schedule.task_name}</td>
                    <td className="px-4 py-2">{startDate}</td>
                    <td className="px-4 py-2">{endDate}</td>
                    <td className="px-4 py-2">{schedule?.frequency}</td>
                    <td className="px-4 py-2">{schedule.total_events.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/schedules/${schedule.id}/events`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition"
                      >
                        View Events
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;