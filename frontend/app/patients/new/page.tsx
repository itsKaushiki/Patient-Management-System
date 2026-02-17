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
    gender: '',
    bloodGroup: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await axiosClient.post('/api/patients', formData);
      const createdPatient = response.data;

      // Log activity with patient ID
      addActivity('created', formData.name, createdPatient.id);

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

          <div className={styles.formGroup}>
            <label htmlFor="gender" className={styles.label}>
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={styles.input}
              disabled={loading || success}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bloodGroup" className={styles.label}>
              Blood Group
            </label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className={styles.input}
              disabled={loading || success}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
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

