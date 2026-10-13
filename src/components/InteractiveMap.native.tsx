import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker as NativeMarker, Camera as NativeCamera, Region as NativeRegion } from 'react-native-maps';
import {
  Camera,
  FitToOptions,
  InteractiveMapProps,
  InteractiveMapRef,
  LatLng,
  MarkerProps,
  Region,
} from './InteractiveMap.types';

export const InteractiveMap = forwardRef<InteractiveMapRef, InteractiveMapProps>(
  ({ style, initialRegion, onMapPress, onRegionChangeComplete, children }, ref) => {
    const mapRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region, duration = 600) => {
        mapRef.current?.animateToRegion(region, duration);
      },
      animateCamera: (camera: Partial<Camera>, opts?: { duration?: number }) => {
        const nativeCam: Partial<NativeCamera> = {
          center: camera.center,
          heading: camera.heading ?? 0,
          pitch: camera.pitch ?? 0,
          zoom: camera.zoom,
          altitude: camera.altitude,
        };
        mapRef.current?.animateCamera(nativeCam, opts);
      },
      fitToCoordinates: (coordinates: LatLng[], options?: FitToOptions) => {
        mapRef.current?.fitToCoordinates(coordinates, options);
      },
    }));

    return (
      <MapView
        ref={mapRef}
        style={[StyleSheet.absoluteFill, style]}
        initialRegion={initialRegion as NativeRegion | undefined}
        onPress={() => onMapPress?.()}
        onRegionChangeComplete={(r) => onRegionChangeComplete?.(r)}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        mapType="standard"
      >
        {children}
      </MapView>
    );
  }
);

InteractiveMap.displayName = 'InteractiveMap';

export const Marker: React.FC<MarkerProps> = ({ coordinate, onPress, children, identifier, zIndex }) => {
  return (
    <NativeMarker
      coordinate={coordinate}
      onPress={(e) => {
        e.stopPropagation();
        onPress?.();
      }}
      identifier={identifier}
      zIndex={zIndex}
    >
      {children}
    </NativeMarker>
  );
};
