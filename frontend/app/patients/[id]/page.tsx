'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosClient from '@/lib/axios';
import { getUserInfo } from '@/lib/auth';
import DeleteModal from '@/components/DeleteModal';
import styles from './PatientDetails.module.css';

interface Patient {
  id: string;
  name: string;
  email: string;
  address: string;
  dateOfBirth: string;
  gender?: string;
  bloodGroup?: string;
  age?: number;
}

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [userRole, setUserRole] = useState<string>('RECEPTIONIST');

  useEffect(() => {
    // Get user role
    const userInfo = getUserInfo();
    if (userInfo) {
      setUserRole(userInfo.role);
    }

    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axiosClient.get(`/api/patients/${patientId}`);
        setPatient(response.data);
      } catch (err: any) {
        console.error('Error fetching patient:', err);
        if (err.response?.status === 404) {
          setError('Patient not found');
        } else {
          setError('Failed to load patient details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading patient details...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/patients" className={styles.backLink}>
            ← Back to Patients
          </Link>
        </div>
        <div className={styles.error}>{error || 'Patient not found'}</div>
      </div>
    );
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!patient) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await axiosClient.delete(`/api/patients/${patientId}`);

      // Activity is automatically logged via Kafka

      // Close modal and redirect
      setShowDeleteModal(false);
      router.push('/patients');
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      setDeleteError('Failed to delete patient. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteError('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/patients" className={styles.backLink}>
          ← Back to Patients
        </Link>
        <div className={styles.actions}>
          {/* ADMIN and DOCTOR can edit patients */}
          {(userRole === 'ADMIN' || userRole === 'DOCTOR') && (
            <Link href={`/patients/${patientId}/edit`} className={styles.editButton}>
              Edit Patient
            </Link>
          )}
          {/* Only ADMIN can delete patients */}
          {userRole === 'ADMIN' && (
            <button onClick={handleDeleteClick} className={styles.deleteButton}>
              Delete Patient
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Patient Profile Card */}
        <div className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>{getInitials(patient.name)}</div>
            <div className={styles.profileInfo}>
              <h1 className={styles.patientName}>{patient.name}</h1>
              <p className={styles.patientId}>ID: {patient.id}</p>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{patient.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Address</span>
              <span className={styles.infoValue}>{patient.address}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date of Birth</span>
              <span className={styles.infoValue}>{patient.dateOfBirth}</span>
            </div>
            {patient.age !== undefined && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Age</span>
                <span className={styles.infoValue}>{patient.age} years</span>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Gender</span>
              <span className={styles.infoValue}>{patient.gender || 'Not specified'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Blood Group</span>
              <span className={styles.infoValue}>{patient.bloodGroup || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Billing Section Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Billing Information</h2>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Billing Account Status</span>
            <span className={styles.billingStatus}>Created</span>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748B' }}>
            Billing account was automatically created via gRPC when this patient was registered.
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && patient && (
        <DeleteModal
          patientName={patient.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          loading={deleting}
          error={deleteError}
        />
      )}
    </div>
  );
}

