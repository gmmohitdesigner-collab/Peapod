import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Region extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface Camera {
  center: LatLng;
  pitch: number;
  heading: number;
  altitude?: number;
  zoom?: number;
}

export interface EdgePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface FitToOptions {
  edgePadding?: EdgePadding;
  animated?: boolean;
}

export interface InteractiveMapRef {
  animateToRegion: (region: Region, duration?: number) => void;
  animateCamera: (camera: Partial<Camera>, opts?: { duration?: number }) => void;
  fitToCoordinates: (coordinates: LatLng[], options?: FitToOptions) => void;
}

export interface MarkerProps {
  coordinate: LatLng;
  onPress?: () => void;
  children?: React.ReactNode;
  identifier?: string;
  zIndex?: number;
}

export interface InteractiveMapProps {
  style?: StyleProp<ViewStyle>;
  initialRegion?: Region;
  region?: Region;
  onMapPress?: () => void;
  onRegionChangeComplete?: (region: Region) => void;
  children?: React.ReactNode;
}
