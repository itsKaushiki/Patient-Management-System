'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import { getAllActivities, getRelativeTime, getActivityType, Activity } from '@/lib/activity';
import ClientOnly from '@/components/ClientOnly';
import styles from './Activity.module.css';

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchActivities = async () => {
      const activities = await getAllActivities();
      setActivities(activities);
    };

    // Load all activities
    fetchActivities();

    // Auto-refresh activities every 5 seconds
    const interval = setInterval(() => {
      fetchActivities();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

  const getActivityDotClass = (type: 'created' | 'updated' | 'deleted') => {
    switch (type) {
      case 'created':
        return styles.dotGreen;
      case 'updated':
        return styles.dotBlue;
      case 'deleted':
        return styles.dotRed;
      default:
        return styles.dotGreen;
    }
  };

  const formatActivityText = (activity: Activity) => {
    const eventType = activity.eventType.toLowerCase();

    if (eventType.includes('created')) {
      return `${activity.patientName} was registered`;
    } else if (eventType.includes('updated')) {
      return `${activity.patientName} was updated`;
    } else if (eventType.includes('deleted')) {
      return `${activity.patientName} was deleted`;
    }

    return activity.patientName;
  };

  // Note: Backend doesn't return patientId yet, so click navigation is disabled for now
  const handleActivityClick = (activity: Activity) => {
    // Future: Navigate to patient details when patientId is available
    // if (activity.patientId) {
    //   router.push(`/patients/${activity.patientId}`);
    // }
  };

  return (
    <ClientOnly>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/dashboard" className={styles.backLink}>
            ← Back to Dashboard
          </Link>
          <h1 className={styles.title}>Activity Timeline</h1>
          <p className={styles.subtitle}>Complete system activity history</p>
        </div>

        <div className={styles.timelineContainer}>
          {activities.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <h2 className={styles.emptyTitle}>No activity recorded yet</h2>
              <p className={styles.emptyText}>
                Activity will appear here as you create, update, or delete patients
              </p>
            </div>
          ) : (
            <div className={styles.timeline}>
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className={styles.timelineItem}
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className={`${styles.timelineDot} ${getActivityDotClass(getActivityType(activity))}`}></div>
                  <div className={styles.timelineContent}>
                    <div className={styles.activityText}>
                      {formatActivityText(activity)}
                    </div>
                    <div className={styles.activityTime}>
                      {getRelativeTime(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}

