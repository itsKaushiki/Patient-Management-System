'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axios';
import { getUserInfo } from '@/lib/auth';
import styles from './UserManagement.module.css';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is ADMIN
    const userInfo = getUserInfo();
    if (!userInfo || userInfo.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosClient.get('/auth/users');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdating(userId);
      setError('');
      
      const response = await axiosClient.put(`/auth/users/${userId}/role`, {
        role: newRole
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? response.data : user
      ));

      // Show success message
      alert(`Role updated successfully to ${newRole}`);
    } catch (err: any) {
      console.error('Error updating role:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to update role');
      }
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return styles.badgeAdmin;
      case 'DOCTOR':
        return styles.badgeDoctor;
      case 'RECEPTIONIST':
        return styles.badgeReceptionist;
      default:
        return styles.badgeDefault;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading users...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Management</h1>
        <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name || <em>No name</em>}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.badge} ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className={styles.roleSelect}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                  </select>
                  {updating === user.id && <span className={styles.updating}>Updating...</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

