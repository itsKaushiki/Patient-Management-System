export interface UserInfo {
  email: string;
  name: string;
  role: string;
}

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  }
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const setUserInfo = (userInfo: UserInfo): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }
};

export const getUserInfo = (): UserInfo | null => {
  if (typeof window !== 'undefined') {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        return JSON.parse(userInfoStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

