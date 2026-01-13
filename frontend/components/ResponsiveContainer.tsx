import React from 'react';
import { View, StyleSheet, Platform, ViewProps } from 'react-native';
import { useTheme } from '../constants/theme';

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ children, style, ...props }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.innerContainer, style]} {...props}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center', // Center content on large screens
    width: '100%',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 800, // Limit width on web/desktop
    // On web, we might want to add shadow or border if centered, but let's keep it simple for now
  }
});
