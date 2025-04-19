export interface User {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'agency_admin' | 'agency_staff' | 'citizen';
  agencyId?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isSuperAdmin: () => boolean;
  isAuthenticated: () => boolean;
  validateToken: () => Promise<User | null>;
} 