import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  state?: 'default' | 'loading' | 'disabled';
  showArrow?: boolean;
}

export const PeapodButton: React.FC<ButtonProps> = ({ 
  label, 
  onPress, 
  variant = 'primary', 
  state = 'default',
  showArrow = false
}) => {
  const isPrimary = variant === 'primary';
  const isDisabled = state === 'disabled';
  
  return (
    <TouchableOpacity 
      style={[
        styles.buttonBase,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        isDisabled && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={isDisabled || state === 'loading'}
      activeOpacity={0.8}
    >
      {state === 'loading' ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : Theme.colors.brand.primary} />
      ) : (
        <>
          <Text style={[
            Theme.typography.interface.button14, 
            { color: isPrimary ? '#FFF' : Theme.colors.text.primary }
          ]}>
            {label}
          </Text>
          {showArrow && (
            <Ionicons 
              name="arrow-forward" 
              size={16} 
              color={isPrimary ? '#FFF' : Theme.colors.text.primary} 
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export const PeapodFAB: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="add" size={24} color="#FFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  buttonPrimary: {
    backgroundColor: Theme.colors.brand.primary,
  },
  buttonSecondary: {
    backgroundColor: Theme.colors.brand.accentTint,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.effects.elevation.card,
  }
});
