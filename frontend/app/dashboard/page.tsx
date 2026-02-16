'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, removeToken } from '@/lib/auth';
import styles from './Dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome to Patient Management System</h1>
        <p className={styles.subtitle}>Manage patient records and healthcare data</p>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div className={styles.nav}>
        <Link href="/patients" className={styles.navCard}>
          <h2 className={styles.navTitle}>View Patients</h2>
          <p className={styles.navDescription}>
            Browse and search through all registered patients
          </p>
        </Link>

        <Link href="/patients/new" className={styles.navCard}>
          <h2 className={styles.navTitle}>Add New Patient</h2>
          <p className={styles.navDescription}>
            Register a new patient in the system
          </p>
        </Link>
      </div>
    </div>
  );
}

