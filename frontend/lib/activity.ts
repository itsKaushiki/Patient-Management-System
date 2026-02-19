import axiosClient from './axios';

export interface Activity {
  eventType: string;
  patientName: string;
  patientEmail: string;
  timestamp: string; // ISO 8601 format from backend
}

// Fetch recent activities from backend
export async function getRecentActivities(limit: number = 10): Promise<Activity[]> {
  try {
    const response = await axiosClient.get(`/analytics/audit/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent activities:', error);
    return [];
  }
}

// Fetch all activities from backend
export async function getAllActivities(): Promise<Activity[]> {
  try {
    const response = await axiosClient.get('/analytics/audit/recent?limit=100');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return [];
  }
}

// Fetch patient-specific activities
export async function getPatientActivities(patientId: string): Promise<Activity[]> {
  try {
    const response = await axiosClient.get(`/analytics/audit/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch patient activities:', error);
    return [];
  }
}

// Format activity message based on event type
export function formatActivityMessage(activity: Activity): string {
  const eventType = activity.eventType.toLowerCase();

  if (eventType.includes('created')) {
    return `${activity.patientName} was registered`;
  } else if (eventType.includes('updated')) {
    return `${activity.patientName} was updated`;
  } else if (eventType.includes('deleted')) {
    return `${activity.patientName} was deleted`;
  }

  return `${activity.patientName}`;
}

// Get relative time from ISO timestamp
export function getRelativeTime(timestamp: string): string {
  const now = new Date().getTime();
  const eventTime = new Date(timestamp).getTime();
  const diff = now - eventTime;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// Get activity type for styling
export function getActivityType(activity: Activity): 'created' | 'updated' | 'deleted' {
  const eventType = activity.eventType.toLowerCase();

  if (eventType.includes('created')) return 'created';
  if (eventType.includes('updated')) return 'updated';
  if (eventType.includes('deleted')) return 'deleted';

  return 'created'; // default
}

