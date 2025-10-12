'use client';

import { FC, FormEvent, useState } from 'react';

interface ScheduleFormProps {
  onSubmit: (data: {
    task_name: string;
    start_date: string;
    end_date: string;
    frequency: string;
    interval: number;
    time_of_day: string;
  }) => void;
}

const ScheduleForm: FC<ScheduleFormProps> = ({ onSubmit }) => {
  const [taskName, setTaskName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState('HOURLY');
  const [interval, setInterval] = useState('1');
  const [timeOfDay, setTimeOfDay] = useState('00:00');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      task_name: taskName,
      start_date: startDate,
      end_date: endDate,
      frequency,
      interval: parseInt(interval),
      time_of_day: timeOfDay,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-md rounded-lg p-6 max-w-lg mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Task Name</label>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          required
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          <option value="HOURLY">Hourly</option>
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Interval</label>
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          min="1"
          required
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Time of Day</label>
        <input
          type="time"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          required
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        Create Schedule
      </button>
    </form>
  );
};

export default ScheduleForm;