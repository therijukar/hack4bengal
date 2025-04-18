export interface User {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'citizen';
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isSuperAdmin: () => boolean;
  isAuthenticated: () => boolean;
} 