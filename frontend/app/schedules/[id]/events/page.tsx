import { FC, startTransition, Suspense } from "react";
import Link from "next/link";
import { fetchEvents } from "@/lib/api";
import EventTable from "@/components/EventTable";
import { EventOverride } from '../../../../../shared/types/types';
import { ToasterProvider } from "@/components/Toaster";


interface EventsPageProps {
  params: { id: string };
}

const EventsPage: FC<EventsPageProps> = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  let events: EventOverride[] = [];
  let error: string | null = null;
  try {
    events = await fetchEvents(id);
  } catch (err) {
    error = "Failed to load events. Please try again later.";
    console.error(err);
  }


  return (
    <ToasterProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Events for Task ({events?.[0]?.task_name})
      </h1>
      {error && (
        <div className="bg-red-500/80 backdrop-blur-md text-white p-4 rounded-lg mb-6 text-center">
          {error}
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
        <Suspense fallback={<div className="text-center">Loading events...</div>}>
          <EventTable
            events={events}
            scheduleId={id}
          />
        </Suspense>
    </div>
    </ToasterProvider>
  );
};

export default EventsPage;
