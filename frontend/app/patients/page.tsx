'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosClient from '@/lib/axios';
import { isAuthenticated, getUserInfo } from '@/lib/auth';
import ClientOnly from '@/components/ClientOnly';
import styles from './Patients.module.css';

interface Patient {
  id: string;
  name: string;
  email: string;
  address: string;
  dateOfBirth: string;
  registeredDate?: string;
  age?: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

interface PageResponse {
  content: Patient[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

type SortOption = 'name-asc' | 'name-desc' | 'email-asc' | 'email-desc' | 'dob-asc' | 'dob-desc' | 'registered-asc' | 'registered-desc';

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string>('RECEPTIONIST');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [restoringPatientId, setRestoringPatientId] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

    fetchPatients();
  }, [router, currentPage, sortOption, debouncedSearchQuery]);

  // Fetch patients with pagination and search
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Parse sort option
      const [sortBy, sortDirection] = sortOption.split('-');
      const sortField = sortBy === 'dob' ? 'dateOfBirth' : sortBy === 'registered' ? 'registeredDate' : sortBy;

      let response: { data: PageResponse };

      if (debouncedSearchQuery.trim()) {
        // Use search endpoint with sorting
        response = await axiosClient.get('/api/patients/search', {
          params: {
            query: debouncedSearchQuery.trim(),
            page: currentPage,
            size: pageSize,
            sortBy: sortField,
            sortDirection: sortDirection
          }
        });
      } else {
        // Use pagination endpoint with sorting
        response = await axiosClient.get('/api/patients', {
          params: {
            page: currentPage,
            size: pageSize,
            sortBy: sortField,
            sortDirection: sortDirection
          }
        });
      }

      setPatients(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortOption, debouncedSearchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to first page on search
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setCurrentPage(0); // Reset to first page on sort change
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRestorePatient = async (patientId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click navigation

    if (!confirm('Are you sure you want to restore this patient?')) {
      return;
    }

    setRestoringPatientId(patientId);

    try {
      await axiosClient.put(`/api/patients/${patientId}/restore`);

      // Refresh the patient list
      await fetchPatients();

      alert('Patient restored successfully!');
    } catch (err: any) {
      console.error('Failed to restore patient:', err);
      alert(err.response?.data?.message || 'Failed to restore patient');
    } finally {
      setRestoringPatientId(null);
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <ClientOnly>
      <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Patients</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/dashboard" className={styles.backLink}>
            ← Back to Dashboard
          </Link>
          {/* Only ADMIN and RECEPTIONIST can add patients */}
          {(userRole === 'ADMIN' || userRole === 'RECEPTIONIST') && (
            <Link href="/patients/new" className={styles.addButton}>
              + Add Patient
            </Link>
          )}
        </div>
      </div>

      {loading && <div className={styles.loading}>Loading patients...</div>}

      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && totalElements === 0 && !searchQuery && (
        <div className={styles.empty}>No patients found. Add your first patient!</div>
      )}

      {!loading && !error && (totalElements > 0 || searchQuery) && (
        <>
          {/* Search and Sort Bar */}
          <div className={styles.searchContainer}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={sortOption}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className={styles.sortSelect}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="email-asc">Email (A-Z)</option>
              <option value="email-desc">Email (Z-A)</option>
              <option value="dob-asc">Date of Birth (Oldest)</option>
              <option value="dob-desc">Date of Birth (Newest)</option>
              <option value="registered-asc">Registration (Oldest)</option>
              <option value="registered-desc">Registration (Newest)</option>
            </select>
          </div>

          {/* Results info */}
          <div className={styles.resultsInfo}>
            Showing {patients.length > 0 ? currentPage * pageSize + 1 : 0} - {currentPage * pageSize + patients.length} of {totalElements} patients
          </div>

          {/* Empty search state */}
          {patients.length === 0 && searchQuery && (
            <div className={styles.empty}>No patients match your search</div>
          )}

          {/* Patient Grid */}
          {patients.length > 0 && (
            <>
              <div className={styles.grid}>
                {patients.map((patient) => (
            <div
              key={patient.id}
              className={`${styles.card} ${patient.isDeleted ? styles.deletedCard : ''}`}
              onClick={() => router.push(`/patients/${patient.id}`)}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{patient.name}</h3>
                {patient.isDeleted && (
                  <span className={styles.deletedBadge}>Deleted</span>
                )}
              </div>
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
                {patient.age !== undefined && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Age:</span>
                    <span className={styles.infoValue}>{patient.age} years</span>
                  </div>
                )}
                {patient.isDeleted && patient.deletedAt && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Deleted At:</span>
                    <span className={styles.infoValue}>
                      {new Date(patient.deletedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Restore button - Only visible to ADMIN for deleted patients */}
              {userRole === 'ADMIN' && patient.isDeleted && (
                <button
                  onClick={(e) => handleRestorePatient(patient.id, e)}
                  disabled={restoringPatientId === patient.id}
                  className={styles.restoreButton}
                >
                  {restoringPatientId === patient.id ? 'Restoring...' : '↻ Restore Patient'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        )}
      </>
    )}
  </>
)}
      </div>
    </ClientOnly>
  );
}

