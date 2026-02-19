'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, removeToken, getUserInfo } from '@/lib/auth';
import axiosClient from '@/lib/axios';
import { getRecentActivities, formatActivityMessage, getRelativeTime, getActivityType, Activity } from '@/lib/activity';
import ClientOnly from '@/components/ClientOnly';
import ThemeToggle from '@/components/ThemeToggle';
import UserProfile from '@/components/UserProfile';
import styles from './Dashboard.module.css';

interface Patient {
  id: string;
  name: string;
  email: string;
  address: string;
  dateOfBirth: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [totalPatients, setTotalPatients] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('RECEPTIONIST');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Get user role
    const userInfo = getUserInfo();
    if (userInfo) {
      setUserRole(userInfo.role);
    }

    const fetchPatients = async () => {
      try {
        const response = await axiosClient.get('/api/patients');
        setTotalPatients(response.data.length);
      } catch (err) {
        console.error('Failed to load patients:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchActivities = async () => {
      const activities = await getRecentActivities(3);
      setActivities(activities);
    };

    fetchPatients();
    fetchActivities();

    // Auto-refresh activities every 5 seconds
    const interval = setInterval(() => {
      fetchActivities();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

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
    return formatActivityMessage(activity);
  };

  return (
    <ClientOnly>
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Patient Management System</h1>
              <p className={styles.subtitle}>System monitoring console</p>
            </div>
            <div className={styles.headerActions}>
              <ThemeToggle />
              <ClientOnly>
                <UserProfile />
              </ClientOnly>
            </div>
          </div>
        </div>

        {/* Dashboard Stats Grid */}
        <div className={styles.dashboardGrid}>
          {/* Total Patients Card */}
          <div className={styles.dashboardCard}>
            <h3 className={styles.cardLabel}>Total Patients</h3>
            <div className={styles.statValueContainer}>
              {loading ? (
                <div className={styles.cardLoading}>Loading...</div>
              ) : (
                <div className={styles.cardNumber}>{totalPatients}</div>
              )}
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className={styles.dashboardCard}>
            <h3 className={styles.cardLabel}>Recent Activity</h3>
            {activities.length === 0 ? (
              <div className={styles.emptyActivity}>No system activity yet</div>
            ) : (
              <div className={styles.activityContent}>
                <div className={styles.activityPreview}>
                  {activities.slice(0, 3).map((activity, index) => (
                    <div key={index} className={styles.activityRow}>
                      <div className={`${styles.activityDot} ${getActivityDotClass(getActivityType(activity))}`}></div>
                      <div className={styles.activityDetails}>
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
                <Link href="/activity" className={styles.viewTimelineLink}>
                  View full timeline →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className={styles.navSection}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.quickActionsGrid}>
            <Link href="/patients" className={styles.navCard}>
              <h2 className={styles.navTitle}>View Patients</h2>
              <p className={styles.navDescription}>
                Browse and search through all registered patients
              </p>
            </Link>

            {/* Only ADMIN and RECEPTIONIST can add new patients */}
            {(userRole === 'ADMIN' || userRole === 'RECEPTIONIST') && (
              <Link href="/patients/new" className={styles.navCard}>
                <h2 className={styles.navTitle}>Add New Patient</h2>
                <p className={styles.navDescription}>
                  Register a new patient in the system
                </p>
              </Link>
            )}

            {/* Show a different card for DOCTOR role */}
            {userRole === 'DOCTOR' && (
              <div className={styles.navCard} style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                <h2 className={styles.navTitle}>Add New Patient</h2>
                <p className={styles.navDescription}>
                  ⚠️ Only ADMIN and RECEPTIONIST can register patients
                </p>
              </div>
            )}

            {/* Only ADMIN can access User Management */}
            {userRole === 'ADMIN' && (
              <Link href="/admin/users" className={styles.navCard}>
                <h2 className={styles.navTitle}>User Management</h2>
                <p className={styles.navDescription}>
                  Manage user roles and permissions (ADMIN only)
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}

