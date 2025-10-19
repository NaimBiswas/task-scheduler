import { EventOverride } from "@/shared/types/types";

export interface DashboardMetrics {
    completed: number;
    in_progress: number;
    overdue: number;
    total_events: number;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, {
        cache: 'no-store', // Ensure fresh data
    });
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
    }
    return response.json();
}


export async function fetchDashboardSchedules() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedules`, {
        cache: 'no-store', // Ensure fresh data
    });
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
    }
    return response.json();
}

export async function createSchedule(data: {
    task_name: string;
    start_date: string;
    end_date: string;
    frequency: string;
    interval: number;
    time_of_day: string;
}) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedules`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to create schedule');
    }
    return response.json();
}

export async function fetchEvents(scheduleId: string): Promise<EventOverride[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/tasks`,
      { cache: 'no-store' }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    const data = await response.json();
    return data.events;
}
  

export async function updateEventStatus(
    scheduleId: string,
    eventDatetime: string,
    status: 'in-progress' | 'completed'
): Promise<EventOverride> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/schedules/${scheduleId}/tasks`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, event_datetime: eventDatetime, schedule_id: scheduleId }),
        }
    );
    if (!response.ok) {
        throw new Error('Failed to update event status');
    }
    return response.json();
}