'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSchedule } from '@/lib/api';
import ScheduleForm from '@/components/ScheduleForm';


const CreateSchedule: FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (data: {
    task_name: string;
    start_date: string;
    end_date: string;
    frequency: string;
    interval: number;
    time_of_day: string;
  }) => {
    try {
      await createSchedule(data);
      setSuccess('Schedule created successfully!');
      setError(null);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setError('Failed to create schedule. Please try again.');
      setSuccess(null);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New Schedule</h1>
      {error && (
        <div className="bg-red-500/80 backdrop-blur-md text-white p-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/80 backdrop-blur-md text-white p-4 rounded-lg mb-6 text-center">
          {success}
        </div>
      )}
      <div className="flex justify-start mb-4">
        <Link
          href="/dashboard"
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Back to Dashboard
        </Link>
      </div>
      <ScheduleForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateSchedule;