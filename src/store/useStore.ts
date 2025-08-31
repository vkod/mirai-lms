import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Notification state
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
  }>;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  
  // Loading states
  loading: {
    [key: string]: boolean;
  };
  setLoading: (key: string, value: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // User state
  user: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Administrator'
  },
  setUser: (user) => set({ user }),
  
  // Theme state
  theme: 'light',
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  
  // Sidebar state
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  // Notification state
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      {
        ...notification,
        id: Date.now().toString(),
        timestamp: Date.now()
      }
    ]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  // Loading states
  loading: {},
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value }
  }))
}));