'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosClient from '@/lib/axios';
import { isAuthenticated } from '@/lib/auth';
import styles from './Patients.module.css';

interface Patient {
  id: string;
  name: string;
  email: string;
  address: string;
  dateOfBirth: string;
  registeredDate?: string;
}

export default function PatientsPage() {
  const router = useRouter();
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchPatients = async () => {
      try {
        const response = await axiosClient.get('/api/patients');
        setAllPatients(response.data);
        setFilteredPatients(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [router]);

  // Handle search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(allPatients);
      setDisplayCount(5);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allPatients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query)
    );
    setFilteredPatients(filtered);
    setDisplayCount(5); // Reset pagination when searching
  }, [searchQuery, allPatients]);

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 5);
  };

  const patientsToDisplay = filteredPatients.slice(0, displayCount);
  const hasMore = displayCount < filteredPatients.length;

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Patients</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/dashboard" className={styles.backLink}>
            ← Back to Dashboard
          </Link>
          <Link href="/patients/new" className={styles.addButton}>
            + Add Patient
          </Link>
        </div>
      </div>

      {loading && <div className={styles.loading}>Loading patients...</div>}

      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && allPatients.length === 0 && (
        <div className={styles.empty}>No patients found. Add your first patient!</div>
      )}

      {!loading && !error && allPatients.length > 0 && (
        <>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Empty search state */}
          {filteredPatients.length === 0 && (
            <div className={styles.empty}>No patients match your search</div>
          )}

          {/* Patient Grid */}
          {filteredPatients.length > 0 && (
            <>
              <div className={styles.grid}>
                {patientsToDisplay.map((patient) => (
            <div
              key={patient.id}
              className={styles.card}
              onClick={() => router.push(`/patients/${patient.id}`)}
            >
              <h3 className={styles.cardTitle}>{patient.name}</h3>
              <div className={styles.cardInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email:</span>
                  <span className={styles.infoValue}>{patient.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Address:</span>
                  <span className={styles.infoValue}>{patient.address}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Date of Birth:</span>
                  <span className={styles.infoValue}>{patient.dateOfBirth}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className={styles.loadMoreContainer}>
            <button onClick={handleLoadMore} className={styles.loadMoreButton}>
              Load More
            </button>
          </div>
        )}
      </>
    )}
  </>
)}
    </div>
  );
}

