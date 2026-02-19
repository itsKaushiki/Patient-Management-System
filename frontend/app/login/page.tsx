'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { setToken, setUserInfo } from '@/lib/auth';
import styles from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Login to get token
      const loginResponse = await axios.post('http://localhost:4004/auth/login', {
        email,
        password,
      });

      const token = loginResponse.data.token;
      setToken(token);

      // Validate token to get user info
      const validateResponse = await axios.get('http://localhost:4004/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Store user info
      setUserInfo({
        email: validateResponse.data.email,
        name: email.split('@')[0], // Temporary: use email prefix as name
        role: validateResponse.data.role,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Patient Management</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link href="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

