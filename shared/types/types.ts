export interface DashboardMetrics {
    completed: number;
    in_progress: number;
    overdue: number;
    total_events: number;
  }
  
  export interface Schedule {
    id: string;
    task_name: string;
    rrule: string;
    total_events: number;
    created_at: string;
    start_date: string | null;
    end_date: string | null;
    frequency: string;
  }
  
  export interface EventOverride {
    id?: string;
    schedule_id: string;
    event_datetime: string;
    status: 'pending' | 'overdue' | 'in-progress' | 'completed';
    task_name?: string;
  }