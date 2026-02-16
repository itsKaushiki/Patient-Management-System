'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosClient from '@/lib/axios';
import { isAuthenticated } from '@/lib/auth';
import { addActivity } from '@/lib/activity';
import styles from './NewPatient.module.css';

export default function NewPatientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    dateOfBirth: '',
    registeredDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await axiosClient.post('/api/patients', formData);

      // Log activity
      addActivity('created', formData.name);

      setSuccess(true);
      setTimeout(() => {
        router.push('/patients');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Patient</h1>
        <Link href="/patients" className={styles.backLink}>
          ← Back to Patients
        </Link>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>Patient created successfully! Redirecting...</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              required
              disabled={loading || success}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              required
              disabled={loading || success}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              Address *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className={styles.input}
              required
              disabled={loading || success}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dateOfBirth" className={styles.label}>
              Date of Birth *
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={styles.input}
              required
              disabled={loading || success}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="registeredDate" className={styles.label}>
              Registration Date *
            </label>
            <input
              id="registeredDate"
              name="registeredDate"
              type="date"
              value={formData.registeredDate}
              onChange={handleChange}
              className={styles.input}
              required
              disabled={loading || success}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => router.push('/patients')}
              className={styles.cancelButton}
              disabled={loading || success}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading || success}>
              {loading ? 'Creating...' : 'Create Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

