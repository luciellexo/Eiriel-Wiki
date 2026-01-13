import { useDoseStore } from '../store/useDoseStore';

export interface ThemeColors {
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentLight: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  inputBg: string;
  placeholder: string;
}

export const lightTheme: ThemeColors = {
  background: '#F8F5FA',
  card: '#FFFFFF',
  textPrimary: '#2D0C57',
  textSecondary: '#726285',
  accent: '#7B1FA2',
  accentLight: '#E1BEE7',
  border: '#E1D6EB',
  success: '#03DAC6',
  error: '#CF6679',
  warning: '#FFB74D',
  tabBar: '#FFFFFF',
  tabBarActive: '#7B1FA2',
  tabBarInactive: '#9586A8',
  inputBg: '#FFFFFF',
  placeholder: '#AQAQAQ'
};

export const darkTheme: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accent: '#BB86FC',
  accentLight: '#3700B3',
  border: '#333333',
  success: '#03DAC6',
  error: '#CF6679',
  warning: '#FFB74D',
  tabBar: '#1E1E1E',
  tabBarActive: '#BB86FC',
  tabBarInactive: '#888888',
  inputBg: '#2C2C2C',
  placeholder: '#666666'
};

export const useTheme = () => {
  const { themeMode, customTheme } = useDoseStore();

  if (themeMode === 'dark') return darkTheme;
  if (themeMode === 'custom') return { ...lightTheme, ...customTheme };
  return lightTheme;
};
