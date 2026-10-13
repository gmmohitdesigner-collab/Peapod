import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';

interface PeamarkerProps {
  state?: 'Default' | 'Selected';
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  avatar?: any;
}

export const Peamarker: React.FC<PeamarkerProps> = ({ 
  state = 'Default', 
  icon = 'person',
  color = '#999',
  avatar
}) => {
  const isSelected = state === 'Selected';
  
  return (
    <View style={[styles.peamarkerBase, isSelected && styles.peamarkerSelected]}>
      {isSelected && <View style={styles.peamarkerGlowRing} />}
      {avatar ? (
        <Image 
          source={avatar} 
          style={{ 
            width: isSelected ? 46 : 38, 
            height: isSelected ? 46 : 38, 
            borderRadius: isSelected ? 23 : 19 
          }} 
        />
      ) : (
        <Ionicons name={icon} size={isSelected ? 24 : 20} color={isSelected ? '#FFF' : color} />
      )}
    </View>
  );
};

export const MyLocation: React.FC = () => (
  <View style={styles.myLocationBeacon}>
    <View style={styles.myLocationCore}>
      <Ionicons name="navigate" size={18} color="#FFF" />
    </View>
  </View>
);

interface ActionButtonProps {
  state?: 'Default' | 'Pressed' | 'Disabled';
  onPress?: () => void;
}

export const LocateMe: React.FC<ActionButtonProps> = ({ state = 'Default', onPress }) => {
  const isDisabled = state === 'Disabled';
  const isPressed = state === 'Pressed';
  return (
    <TouchableOpacity 
      style={[
        styles.mapActionButton, 
        isPressed && styles.mapActionButtonPressed,
        isDisabled && styles.actionDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons 
        name="location-outline" 
        size={22} 
        color={isPressed ? Theme.colors.brand.primary : (isDisabled ? Theme.colors.text.muted : '#1A1A1A')} 
      />
    </TouchableOpacity>
  );
};

export const ShowAll: React.FC<ActionButtonProps> = ({ state = 'Default', onPress }) => {
  const isDisabled = state === 'Disabled';
  const isPressed = state === 'Pressed';
  
  return (
    <TouchableOpacity 
      style={[
        styles.showAllButton,
        isPressed && styles.showAllButtonPressed,
        isDisabled && styles.showAllButtonDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={[
        Theme.typography.interface.button14, 
        { 
          color: isDisabled 
            ? Theme.colors.text.muted 
            : isPressed 
            ? '#FFFFFF' 
            : Theme.colors.text.primary 
        }
      ]}>
        Show all
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  peamarkerBase: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    ...Theme.effects.elevation.card,
  },
  peamarkerSelected: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: Theme.colors.brand.primary,
  },
  peamarkerGlowRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 33,
    backgroundColor: 'rgba(37, 158, 86, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(37, 158, 86, 0.3)',
    zIndex: -1,
  },
  myLocationBeacon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.brand.accentTint,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 158, 86, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.effects.elevation.card,
  },
  myLocationCore: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Theme.colors.brand.primary,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.effects.elevation.card,
  },
  mapActionButtonPressed: {
    backgroundColor: '#F4F9F5',
    borderColor: Theme.colors.brand.primary,
  },
  showAllButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    paddingHorizontal: 16,
    paddingVertical: 9,
    minHeight: 38,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.effects.elevation.card,
  },
  showAllButtonPressed: {
    backgroundColor: Theme.colors.brand.primary,
    borderColor: Theme.colors.brand.primary,
  },
  showAllButtonDisabled: {
    backgroundColor: '#FAF8F5',
    borderColor: '#EAE7E0',
    opacity: 0.6,
  },
  actionDisabled: {
    opacity: 0.5,
  }
});
