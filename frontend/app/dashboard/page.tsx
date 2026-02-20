'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, getUserInfo } from '@/lib/auth';
import axiosClient from '@/lib/axios';
import { getRecentActivities, formatActivityMessage, getRelativeTime, getActivityType, Activity } from '@/lib/activity';
import ClientOnly from '@/components/ClientOnly';
import ThemeToggle from '@/components/ThemeToggle';
import UserProfile from '@/components/UserProfile';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import styles from './Dashboard.module.css';

interface PatientStatistics {
  byGender: Record<string, number>;
  byBloodGroup: Record<string, number>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [totalPatients, setTotalPatients] = useState(0);
  const [statistics, setStatistics] = useState<PatientStatistics | null>(null);
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
        const response = await axiosClient.get('/api/patients/all');
        setTotalPatients(response.data.length);
      } catch (err) {
        console.error('Failed to load patients:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchStatistics = async () => {
      try {
        const response = await axiosClient.get('/api/patients/statistics');
        setStatistics(response.data);
      } catch (err) {
        console.error('Failed to load statistics:', err);
      }
    };

    const fetchActivities = async () => {
      const activities = await getRecentActivities(3);
      setActivities(activities);
    };

    fetchPatients();
    fetchStatistics();
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
    return formatActivityMessage(activity);
  };

  // Prepare data for pie charts
  const genderData = statistics?.byGender
    ? Object.entries(statistics.byGender).map(([name, value]) => ({ name, value }))
    : [];

  const bloodGroupData = statistics?.byBloodGroup
    ? Object.entries(statistics.byBloodGroup).map(([name, value]) => ({ name, value }))
    : [];

  // Colors for pie charts
  const GENDER_COLORS = ['#2563EB', '#EC4899', '#10B981', '#F59E0B'];
  const BLOOD_GROUP_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316'];

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

          {/* Gender Distribution Card */}
          <div className={styles.dashboardCard}>
            <h3 className={styles.cardLabel}>Gender Distribution</h3>
            {loading || !statistics ? (
              <div className={styles.cardLoading}>Loading...</div>
            ) : genderData.length === 0 ? (
              <div className={styles.emptyActivity}>No gender data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Blood Group Distribution Card */}
          <div className={styles.dashboardCard}>
            <h3 className={styles.cardLabel}>Blood Group Distribution</h3>
            {loading || !statistics ? (
              <div className={styles.cardLoading}>Loading...</div>
            ) : bloodGroupData.length === 0 ? (
              <div className={styles.emptyActivity}>No blood group data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={bloodGroupData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bloodGroupData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BLOOD_GROUP_COLORS[index % BLOOD_GROUP_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
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

