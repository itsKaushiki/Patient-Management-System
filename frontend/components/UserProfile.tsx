'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo, removeToken } from '@/lib/auth';
import styles from './UserProfile.module.css';

export default function UserProfile() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ email: string; name: string; role: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const info = getUserInfo();
    setUserInfo(info);
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  if (!userInfo) {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '#dc3545';
      case 'DOCTOR':
        return '#0d6efd';
      case 'RECEPTIONIST':
        return '#198754';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className={styles.userProfile}>
      <div className={styles.userInfo}>
        <div className={styles.userName}>{userInfo.name}</div>
        <div 
          className={styles.userRole} 
          style={{ backgroundColor: getRoleBadgeColor(userInfo.role) }}
        >
          {userInfo.role}
        </div>
      </div>
      
      <div className={styles.dropdownContainer}>
        <button 
          className={styles.avatarButton}
          onClick={() => setShowDropdown(!showDropdown)}
          aria-label="User menu"
        >
          {userInfo.name.charAt(0).toUpperCase()}
        </button>
        
        {showDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <div className={styles.dropdownName}>{userInfo.name}</div>
              <div className={styles.dropdownEmail}>{userInfo.email}</div>
            </div>
            <div className={styles.dropdownDivider}></div>
            <button className={styles.dropdownItem} onClick={handleLogout}>
              <span>🚪</span> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

