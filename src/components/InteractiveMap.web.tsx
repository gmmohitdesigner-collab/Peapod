import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import {
  Camera,
  FitToOptions,
  InteractiveMapProps,
  InteractiveMapRef,
  LatLng,
  MarkerProps,
  Region,
} from './InteractiveMap.types';

// Web Mercator projection helpers
function latLngToWorldPixel(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const scale = 256 * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.min(Math.max(sinLat, -0.9999), 0.9999);
  const y = (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function worldPixelToLatLng(x: number, y: number, zoom: number): { latitude: number; longitude: number } {
  const scale = 256 * Math.pow(2, zoom);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { latitude: lat, longitude: lng };
}

export const InteractiveMap = forwardRef<InteractiveMapRef, InteractiveMapProps>(
  ({ style, initialRegion, onMapPress, children }, ref) => {
    const [viewport, setViewport] = useState({ width: 400, height: 700 });
    const [center, setCenter] = useState<LatLng>(() => ({
      latitude: initialRegion?.latitude ?? 1.3026,
      longitude: initialRegion?.longitude ?? 103.8382,
    }));
    const [zoom, setZoom] = useState<number>(() => {
      if (initialRegion?.latitudeDelta) {
        const z = Math.round(Math.log2(360 / Math.max(initialRegion.latitudeDelta, 0.001)));
        return Math.max(12, Math.min(z, 16));
      }
      return 15;
    });

    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<{ clientX: number; clientY: number; center: LatLng }>({
      clientX: 0,
      clientY: 0,
      center: { latitude: 1.3026, longitude: 103.8382 },
    });
    const hasMovedRef = useRef(false);
    const animFrameRef = useRef<number | null>(null);

    const onLayout = useCallback((e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      if (width > 0 && height > 0) {
        setViewport({ width, height });
      }
    }, []);

    // Smooth camera animation helper
    const animateCameraTo = useCallback(
      (targetLat: number, targetLng: number, targetZoom: number, duration = 600) => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        const startLat = center.latitude;
        const startLng = center.longitude;
        const startZoom = zoom;
        const startTime = performance.now();

        const step = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          // Ease-out cubic
          const ease = 1 - Math.pow(1 - progress, 3);

          const curLat = startLat + (targetLat - startLat) * ease;
          const curLng = startLng + (targetLng - startLng) * ease;
          const curZoom = startZoom + (targetZoom - startZoom) * ease;

          setCenter({ latitude: curLat, longitude: curLng });
          setZoom(Math.round(curZoom * 10) / 10);

          if (progress < 1) {
            animFrameRef.current = requestAnimationFrame(step);
          } else {
            animFrameRef.current = null;
          }
        };

        animFrameRef.current = requestAnimationFrame(step);
      },
      [center, zoom]
    );

    useImperativeHandle(
      ref,
      () => ({
        animateToRegion: (region: Region, duration = 600) => {
          const z = Math.max(
            12,
            Math.min(16.5, Math.round(Math.log2(360 / Math.max(region.latitudeDelta, 0.001))))
          );
          animateCameraTo(region.latitude, region.longitude, z, duration);
        },
        animateCamera: (camera: Partial<Camera>, opts?: { duration?: number }) => {
          const targetLat = camera.center?.latitude ?? center.latitude;
          const targetLng = camera.center?.longitude ?? center.longitude;
          const targetZoom = camera.zoom ?? zoom;
          animateCameraTo(targetLat, targetLng, targetZoom, opts?.duration ?? 600);
        },
        fitToCoordinates: (coordinates: LatLng[], options?: FitToOptions) => {
          if (!coordinates || coordinates.length === 0) return;

          const padding = {
            top: options?.edgePadding?.top ?? 120,
            right: options?.edgePadding?.right ?? 50,
            bottom: options?.edgePadding?.bottom ?? 260,
            left: options?.edgePadding?.left ?? 50,
          };

          if (coordinates.length === 1) {
            animateCameraTo(coordinates[0].latitude, coordinates[0].longitude, 15.5, 600);
            return;
          }

          let minLat = 90;
          let maxLat = -90;
          let minLng = 180;
          let maxLng = -180;

          coordinates.forEach((c) => {
            minLat = Math.min(minLat, c.latitude);
            maxLat = Math.max(maxLat, c.latitude);
            minLng = Math.min(minLng, c.longitude);
            maxLng = Math.max(maxLng, c.longitude);
          });

          const availW = Math.max(100, viewport.width - padding.left - padding.right);
          const availH = Math.max(100, viewport.height - padding.top - padding.bottom);

          let bestZoom = 15;
          for (let z = 16.5; z >= 11; z -= 0.5) {
            const p1 = latLngToWorldPixel(minLat, minLng, z);
            const p2 = latLngToWorldPixel(maxLat, maxLng, z);
            const w = Math.abs(p2.x - p1.x);
            const h = Math.abs(p2.y - p1.y);
            if (w <= availW && h <= availH) {
              bestZoom = z;
              break;
            }
          }

          // Offset center according to asymmetric padding
          const rawCenterLat = (minLat + maxLat) / 2;
          const rawCenterLng = (minLng + maxLng) / 2;
          const centerPixel = latLngToWorldPixel(rawCenterLat, rawCenterLng, bestZoom);

          const offsetX = (padding.left - padding.right) / 2;
          const offsetY = (padding.top - padding.bottom) / 2;

          const adjustedPixel = {
            x: centerPixel.x - offsetX,
            y: centerPixel.y - offsetY,
          };

          const adjustedCenter = worldPixelToLatLng(adjustedPixel.x, adjustedPixel.y, bestZoom);
          animateCameraTo(adjustedCenter.latitude, adjustedCenter.longitude, bestZoom, 600);
        },
      }),
      [animateCameraTo, center, viewport, zoom]
    );

    useEffect(() => {
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }, []);

    // Pointer event handlers for web pan dragging
    const handlePointerDown = (e: any) => {
      isDraggingRef.current = true;
      hasMovedRef.current = false;
      dragStartRef.current = {
        clientX: e.clientX ?? e.nativeEvent?.clientX ?? 0,
        clientY: e.clientY ?? e.nativeEvent?.clientY ?? 0,
        center: { ...center },
      };
      if (e.currentTarget?.setPointerCapture && e.pointerId !== undefined) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    };

    const handlePointerMove = (e: any) => {
      if (!isDraggingRef.current) return;
      const clientX = e.clientX ?? e.nativeEvent?.clientX ?? 0;
      const clientY = e.clientY ?? e.nativeEvent?.clientY ?? 0;
      const dx = clientX - dragStartRef.current.clientX;
      const dy = clientY - dragStartRef.current.clientY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true;
      }

      const startCenter = dragStartRef.current.center;
      const startPixel = latLngToWorldPixel(startCenter.latitude, startCenter.longitude, zoom);
      const newPixel = {
        x: startPixel.x - dx,
        y: startPixel.y - dy,
      };
      const newCenter = worldPixelToLatLng(newPixel.x, newPixel.y, zoom);
      setCenter(newCenter);
    };

    const handlePointerUp = () => {
      if (!hasMovedRef.current) {
        onMapPress?.();
      }
      isDraggingRef.current = false;
    };

    // Wheel zoom
    const handleWheel = (e: any) => {
      e.preventDefault?.();
      const deltaY = e.deltaY ?? 0;
      const delta = deltaY < 0 ? 0.4 : -0.4;
      setZoom((prev) => Math.max(12, Math.min(17, Math.round((prev + delta) * 10) / 10)));
    };

    // Compute visible map tiles
    const baseZoom = Math.floor(zoom);
    const tileZoom = Math.max(0, Math.min(18, baseZoom));
    const centerPixel = latLngToWorldPixel(center.latitude, center.longitude, tileZoom);
    const scaleFactor = Math.pow(2, zoom - tileZoom);

    const leftX = centerPixel.x - (viewport.width / (2 * scaleFactor));
    const topY = centerPixel.y - (viewport.height / (2 * scaleFactor));

    const minTileX = Math.floor(leftX / 256);
    const maxTileX = Math.floor((leftX + viewport.width / scaleFactor) / 256);
    const minTileY = Math.floor(topY / 256);
    const maxTileY = Math.floor((topY + viewport.height / scaleFactor) / 256);

    const tiles: { key: string; x: number; y: number; url: string }[] = [];
    const maxTileIndex = Math.pow(2, tileZoom) - 1;

    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        if (ty >= 0 && ty <= maxTileIndex) {
          const wrappedX = ((tx % (maxTileIndex + 1)) + (maxTileIndex + 1)) % (maxTileIndex + 1);
          // CartoDB Voyager Retina Tiles
          const url = `https://basemaps.cartocdn.com/rastertiles/voyager/${tileZoom}/${wrappedX}/${ty}@2x.png`;
          tiles.push({
            key: `${tileZoom}_${tx}_${ty}`,
            x: (tx * 256 - leftX) * scaleFactor,
            y: (ty * 256 - topY) * scaleFactor,
            url,
          });
        }
      }
    }

    const ContainerView = View as React.ComponentType<any>;

    return (
      <ContainerView
        style={[styles.container, style]}
        onLayout={onLayout}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* Map Tile Canvas */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {tiles.map((t) => (
            <Image
              key={t.key}
              source={{ uri: t.url }}
              style={[
                styles.tile,
                {
                  left: t.x,
                  top: t.y,
                  width: 256 * scaleFactor,
                  height: 256 * scaleFactor,
                },
              ]}
              resizeMode="cover"
            />
          ))}
        </View>

        {/* Soft aesthetic map tint to blend with Peapod design system */}
        <View style={styles.aestheticTint} pointerEvents="none" />

        {/* Marker Layer */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {Children.map(children, (child) => {
            if (!isValidElement(child)) return null;
            const markerProps = child.props as MarkerProps;
            if (!markerProps?.coordinate) return child;

            const mPixel = latLngToWorldPixel(
              markerProps.coordinate.latitude,
              markerProps.coordinate.longitude,
              zoom
            );
            const curCenterPixel = latLngToWorldPixel(center.latitude, center.longitude, zoom);
            const screenX = viewport.width / 2 + (mPixel.x - curCenterPixel.x);
            const screenY = viewport.height / 2 + (mPixel.y - curCenterPixel.y);

            return (
              <View
                key={markerProps.identifier || `${markerProps.coordinate.latitude}_${markerProps.coordinate.longitude}`}
                style={[
                  styles.markerContainer,
                  {
                    left: screenX,
                    top: screenY,
                    zIndex: markerProps.zIndex ?? 10,
                  },
                ]}
                pointerEvents="box-none"
              >
                {cloneElement(child, {
                  ...markerProps,
                })}
              </View>
            );
          })}
        </View>
      </ContainerView>
    );
  }
);

InteractiveMap.displayName = 'InteractiveMap';

export const Marker: React.FC<MarkerProps> = ({ onPress, children }) => {
  return (
    <View
      // @ts-ignore
      onPointerDown={(e: any) => {
        e.stopPropagation?.();
      }}
      // @ts-ignore
      onClick={(e: any) => {
        e.stopPropagation?.();
        onPress?.();
      }}
      style={styles.markerInner}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F3EFEA',
    overflow: 'hidden',
    userSelect: 'none',
  } as any,
  tile: {
    position: 'absolute',
  },
  aestheticTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(250, 248, 245, 0.12)',
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -27 }, { translateY: -27 }],
  },
  markerInner: {
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  } as any,
});
