export interface Activity {
  type: 'created' | 'updated' | 'deleted';
  name: string;
  timestamp: number;
  patientId?: string; // Optional for backward compatibility
}

const ACTIVITY_KEY = 'patient_activities';
const MAX_ACTIVITIES = 50; // Keep last 50 activities

export function addActivity(type: Activity['type'], name: string, patientId?: string): void {
  if (typeof window === 'undefined') return;

  const activity: Activity = {
    type,
    name,
    timestamp: Date.now(),
    ...(patientId && { patientId }), // Only add patientId if provided
  };

  const activities = getActivities();
  activities.unshift(activity); // Add to beginning

  // Keep only last MAX_ACTIVITIES
  const trimmed = activities.slice(0, MAX_ACTIVITIES);

  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(trimmed));
}

export function getActivities(): Activity[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(ACTIVITY_KEY);
    if (!stored) return [];

    const activities = JSON.parse(stored);
    return Array.isArray(activities) ? activities : [];
  } catch (error) {
    console.error('Failed to load activities:', error);
    return [];
  }
}

export function clearActivities(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVITY_KEY);
}

export function getRecentActivities(limit: number = 10): Activity[] {
  return getActivities().slice(0, limit);
}

export function formatActivityMessage(activity: Activity): string {
  switch (activity.type) {
    case 'created':
      return `Patient ${activity.name} registered`;
    case 'updated':
      return `Patient ${activity.name} updated`;
    case 'deleted':
      return `Patient ${activity.name} deleted`;
    default:
      return `Patient ${activity.name}`;
  }
}

export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

