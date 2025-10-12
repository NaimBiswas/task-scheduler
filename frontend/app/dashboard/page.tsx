import { FC } from 'react';

import MetricCard from '@/components/MetricCard';
import { fetchDashboardMetrics, fetchDashboardSchedules } from '@/lib/api';
import Link from 'next/link';
import ScheduleTable from '@/components/ScheduleTable';

interface DashboardMetrics {
  completed: number;
  in_progress: number;
  overdue: number;
  total_events: number;
}

const Dashboard: FC = async () => {
  let schedules: any[] = [];
  let metrics: DashboardMetrics = {
    completed: 0,
    in_progress: 0,
    overdue: 0,
    total_events: 0,
  };
  let error: string | null = null;

  try {
      metrics = await fetchDashboardMetrics();
      schedules = await fetchDashboardSchedules()
  } catch (err) {
    error = 'Failed to load dashboard metrics. Please try again later.';
    console.error(err);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Task Scheduler Dashboard</h1>
      {error && (
        <div className="bg-red-500/80 backdrop-blur-md text-white p-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Completed Tasks" value={metrics.completed} color="bg-green-500/80" />
        <MetricCard title="In Progress Tasks" value={metrics.in_progress} color="bg-blue-500/80" />
        <MetricCard title="Overdue Tasks" value={metrics.overdue} color="bg-red-500/80" />
        <MetricCard title="Total Events" value={metrics.total_events} color="bg-purple-500/80" />
      </div>
          

      <div className="flex justify-end mb-4 mt-10">
        <Link href="/create-schedule"  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
          Add New Task
        </Link>
      </div>
      <ScheduleTable schedules={schedules || []} />
          
    </div>
  );
};

export default Dashboard;