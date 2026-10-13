import {
  BottomTabBar,
  CreatePodModal,
  JoinPodModal,
  MemberDetailSheet,
  MOCK_MEMBERS_BY_POD,
  MOCK_PODS,
  PaginationDots,
  PeaCard,
  PeaData,
  PodOverviewSheet,
  PodSelector,
  UpNextCard,
} from '@/components/PeapodHomeComponents';
import { HomeNotificationsOverlay, MOCK_NOTIFICATIONS } from '@/components/NotificationsComponents';
import { LocateMe, Peamarker, ShowAll } from '@/components/PeapodMapComponents';
import { InteractiveMap, InteractiveMapRef, Marker } from '@/components/InteractiveMap';
import { getPeaCoordinate, getPodInitialRegion } from '@/constants/mockLocations';
import { Theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  LayoutAnimation,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useResponsiveDimensions } from '@/context/ResponsiveDimensionsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const { width: windowWidth, height: windowHeight } = useResponsiveDimensions();
  const insets = useSafeAreaInsets();
  const cardWidth = Math.min(320, Math.max(260, windowWidth - 44));
  const cardInterval = cardWidth + 8;

  const [pods, setPods] = useState(MOCK_PODS);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activePod, setActivePod] = useState(MOCK_PODS[0]);
  const [membersByPod, setMembersByPod] = useState(MOCK_MEMBERS_BY_POD);
  const [isCreatePodVisible, setIsCreatePodVisible] = useState(false);
  const [isJoinPodVisible, setIsJoinPodVisible] = useState(false);

  const currentPodPeas = membersByPod[activePod.id] || [];
  const hasUnreadNotifications = notifications.some(n => !n.isRead);

  // Single source of truth for the currently selected Pea
  const [selectedPeaId, setSelectedPeaId] = useState<string | null>(
    () => currentPodPeas[0]?.id || null
  );
  // Separate boolean for whether the full MemberDetailSheet is expanded
  const [isDetailSheetExpanded, setIsDetailSheetExpanded] = useState(false);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  const [isPodOverviewVisible, setIsPodOverviewVisible] = useState(false);
  const [isPodSelectorOpen, setIsPodSelectorOpen] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isShowAllActive, setIsShowAllActive] = useState(false);

  const mapRef = useRef<InteractiveMapRef>(null);
  const flatListRef = useRef<FlatList<PeaData>>(null);
  const locateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showAllTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedPeaIdRef = useRef<string | null>(selectedPeaId);
  const isDetailSheetExpandedRef = useRef(isDetailSheetExpanded);
  const isProgrammaticScrollRef = useRef(false);

  useEffect(() => {
    selectedPeaIdRef.current = selectedPeaId;
  }, [selectedPeaId]);

  useEffect(() => {
    isDetailSheetExpandedRef.current = isDetailSheetExpanded;
  }, [isDetailSheetExpanded]);

  useEffect(() => {
    return () => {
      if (locateTimeoutRef.current) clearTimeout(locateTimeoutRef.current);
      if (showAllTimeoutRef.current) clearTimeout(showAllTimeoutRef.current);
      if (programmaticScrollTimeoutRef.current) clearTimeout(programmaticScrollTimeoutRef.current);
    };
  }, []);

  const handleTogglePodSelector = (open: boolean) => {
    if (open) {
      LayoutAnimation.configureNext({
        duration: 500,
        update: { type: 'spring', springDamping: 0.8 }
      });
      setIsPodSelectorOpen(true);
    } else {
      LayoutAnimation.configureNext({
        duration: 600,
        update: { type: 'spring', springDamping: 0.8 },
        delete: { type: 'easeInEaseOut', property: 'opacity' }
      });
      setIsPodSelectorOpen(false);
      setIsDropdownVisible(false);
    }
  };

  const handleSelectPod = (pod: typeof MOCK_PODS[0], explicitPeas?: PeaData[]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActivePod(pod);

    const newPodPeas = explicitPeas || membersByPod[pod.id] || [];
    // Safely reassign selection: if previous selected member belongs to new pod, keep it; otherwise pick first
    const prevSelectedId = selectedPeaIdRef.current;
    const stillExists = newPodPeas.find(p => p.id === prevSelectedId);
    const nextSelected = stillExists || newPodPeas[0] || null;

    setSelectedPeaId(nextSelected ? nextSelected.id : null);
    const nextIndex = nextSelected ? newPodPeas.findIndex(p => p.id === nextSelected.id) : 0;
    const safeIndex = Math.max(0, nextIndex);
    setActiveCarouselIndex(safeIndex);
    setIsDetailSheetExpanded(false);
    slideAnim.setValue(0);

    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimeoutRef.current) clearTimeout(programmaticScrollTimeoutRef.current);
    programmaticScrollTimeoutRef.current = setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: safeIndex * cardInterval, animated: false });
      isProgrammaticScrollRef.current = false;
    }, 50);

    const targetRegion = getPodInitialRegion(pod.id);
    mapRef.current?.animateToRegion(targetRegion, 700);
  };

  const handleCreatePod = (newPod: typeof MOCK_PODS[0]) => {
    const initialPeas: PeaData[] = [
      {
        id: '1',
        name: 'Le Wen',
        role: 'Admin',
        activity: 'Active now',
        status: 'Active',
        eta: 'Now',
        battery: '90%',
        network: '5G',
        distance: '0 km',
        locationName: 'Current Location',
        locationAddress: 'Singapore',
        coords: { top: '35%', left: '48%' },
        isCurrentUser: true,
        avatar: require('../../assets/avatars/le_wen.png'),
      },
    ];
    setPods(prev => [...prev, newPod]);
    setMembersByPod(prev => ({
      ...prev,
      [newPod.id]: initialPeas,
    }));
    handleSelectPod(newPod, initialPeas);
    setIsCreatePodVisible(false);
    setIsPodSelectorOpen(false);
    setIsDropdownVisible(false);
  };

  const podJoinCounterRef = useRef(1);

  const handleJoinPod = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    const joinedPod: typeof MOCK_PODS[0] = {
      id: `pod_joined_${cleanCode}_${podJoinCounterRef.current++}`,
      name: `Pod #${cleanCode}`,
      type: 'Friends',
      members: 2,
      avatarColor: '#E8F6EE',
      iconColor: '#259E56',
    };
    const initialPeas: PeaData[] = [
      {
        id: '1',
        name: 'Le Wen',
        role: 'Member',
        activity: 'Active now',
        status: 'Active',
        eta: 'Now',
        battery: '90%',
        network: '5G',
        distance: '0 km',
        locationName: 'Current Location',
        locationAddress: 'Singapore',
        coords: { top: '35%', left: '48%' },
        isCurrentUser: true,
        avatar: require('../../assets/avatars/le_wen.png'),
      },
      {
        id: '2',
        name: 'Srishti',
        role: 'Admin',
        activity: 'Active now',
        status: 'Active',
        eta: 'Now',
        battery: '85%',
        network: '5G',
        distance: '1.2 km',
        locationName: 'Orchard Rd',
        locationAddress: 'Singapore',
        coords: { top: '28%', left: '30%' },
        isCurrentUser: false,
        avatar: require('../../assets/avatars/srishti.png'),
      },
    ];
    setPods(prev => [...prev, joinedPod]);
    setMembersByPod(prev => ({
      ...prev,
      [joinedPod.id]: initialPeas,
    }));
    handleSelectPod(joinedPod, initialPeas);
    setIsJoinPodVisible(false);
    setIsPodSelectorOpen(false);
    setIsDropdownVisible(false);
  };

  const handleRemovePea = (peaId: string) => {
    // Current user cannot be removed
    const target = (membersByPod[activePod.id] || []).find(p => p.id === peaId);
    if (!target || target.isCurrentUser) return;

    const remaining = (membersByPod[activePod.id] || []).filter(p => p.id !== peaId);

    setMembersByPod(prev => ({
      ...prev,
      [activePod.id]: remaining,
    }));

    setPods(prev => prev.map(p => p.id === activePod.id ? { ...p, members: remaining.length } : p));
    setActivePod(prev => ({ ...prev, members: remaining.length }));

    if (selectedPeaId === peaId) {
      const fallbackPea = remaining[0] || null;
      setSelectedPeaId(fallbackPea ? fallbackPea.id : null);
      setIsDetailSheetExpanded(false);
      slideAnim.setValue(0);
      if (fallbackPea) {
        const coord = fallbackPea.coordinate || getPeaCoordinate(activePod.id, fallbackPea.id);
        mapRef.current?.animateToRegion(
          {
            latitude: coord.latitude,
            longitude: coord.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.016,
          },
          600
        );
      }
    }
    setActiveCarouselIndex(0);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const handleMarkerPress = (pea: PeaData, index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPeaId(pea.id);
    setActiveCarouselIndex(index);
    setIsDetailSheetExpanded(true); // Open detail sheet
    slideAnim.setValue(0);

    isProgrammaticScrollRef.current = true;
    flatListRef.current?.scrollToOffset({ offset: index * cardInterval, animated: true });
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 400);

    const coord = pea.coordinate || getPeaCoordinate(activePod.id, pea.id);
    mapRef.current?.animateToRegion(
      {
        latitude: coord.latitude,
        longitude: coord.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.016,
      },
      600
    );
  };

  const handleCardPress = (pea: PeaData, index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPeaId(pea.id);
    setActiveCarouselIndex(index);
    setIsDetailSheetExpanded(true); // Open detail sheet
    slideAnim.setValue(0);

    const coord = pea.coordinate || getPeaCoordinate(activePod.id, pea.id);
    mapRef.current?.animateToRegion(
      {
        latitude: coord.latitude,
        longitude: coord.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.016,
      },
      600
    );
  };

  const handleSelectMemberFromOverview = (pea: PeaData) => {
    setIsPodOverviewVisible(false);
    setSelectedPeaId(pea.id);
    const idx = currentPodPeas.findIndex(p => p.id === pea.id);
    if (idx !== -1) {
      setActiveCarouselIndex(idx);
      isProgrammaticScrollRef.current = true;
      flatListRef.current?.scrollToOffset({ offset: idx * cardInterval, animated: false });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 400);
    }
    setIsDetailSheetExpanded(true); // Open detail sheet
    const coord = pea.coordinate || getPeaCoordinate(activePod.id, pea.id);
    mapRef.current?.animateToRegion(
      {
        latitude: coord.latitude,
        longitude: coord.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.016,
      },
      600
    );
  };

  useEffect(() => {
    if (!isPodSelectorOpen) return;

    const timer = setTimeout(() => {
      LayoutAnimation.configureNext({
        duration: 600,
        update: { type: 'spring', springDamping: 0.8 },
        create: { type: 'spring', property: 'opacity', springDamping: 0.8 }
      });
      setIsDropdownVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isPodSelectorOpen]);

  const [slideAnim] = useState(() => new Animated.Value(0));

  const handleExpandDetailSheet = () => {
    if (currentPodPeas.length === 0) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const targetPea =
      (selectedPeaId && currentPodPeas.find(p => p.id === selectedPeaId)) ||
      currentPodPeas[activeCarouselIndex] ||
      currentPodPeas[0];
    if (targetPea) {
      setSelectedPeaId(targetPea.id);
      const coord = targetPea.coordinate || getPeaCoordinate(activePod.id, targetPea.id);
      mapRef.current?.animateToRegion(
        {
          latitude: coord.latitude,
          longitude: coord.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.016,
        },
        500
      );
    }
    setIsDetailSheetExpanded(true);
    slideAnim.setValue(0);
  };

  const handleCollapseDetailSheet = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDetailSheetExpanded(false);
    slideAnim.setValue(0);
    // Dismissing detail sheet intentionally preserves selectedPeaId in the carousel & map!
  };

  const handleLocateMe = () => {
    const currentUser = currentPodPeas.find(p => p.isCurrentUser);
    if (!currentUser) return;

    setIsLocating(true);
    if (locateTimeoutRef.current) clearTimeout(locateTimeoutRef.current);

    const userCoord = currentUser.coordinate || getPeaCoordinate(activePod.id, currentUser.id);
    mapRef.current?.animateToRegion(
      {
        latitude: userCoord.latitude,
        longitude: userCoord.longitude,
        latitudeDelta: 0.010,
        longitudeDelta: 0.014,
      },
      700
    );

    // Preserve selection! If another Pea was selected, return camera to that Pea after temporary focus
    const currentlySelectedId = selectedPeaIdRef.current;
    const selectedPea = currentlySelectedId
      ? currentPodPeas.find(p => p.id === currentlySelectedId)
      : null;

    locateTimeoutRef.current = setTimeout(() => {
      setIsLocating(false);
      if (selectedPea && !selectedPea.isCurrentUser) {
        const selCoord = selectedPea.coordinate || getPeaCoordinate(activePod.id, selectedPea.id);
        mapRef.current?.animateToRegion(
          {
            latitude: selCoord.latitude,
            longitude: selCoord.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.016,
          },
          700
        );
      }
    }, 2200);
  };

  const handleShowAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDetailSheetExpanded(false);
    setSelectedPeaId(null); // Clear selected Pea
    slideAnim.setValue(0);

    setIsShowAllActive(true);
    if (showAllTimeoutRef.current) clearTimeout(showAllTimeoutRef.current);
    showAllTimeoutRef.current = setTimeout(() => {
      setIsShowAllActive(false);
    }, 1200);

    const coords = currentPodPeas
      .map(p => p.coordinate || getPeaCoordinate(activePod.id, p.id))
      .filter(Boolean);

    if (coords.length === 0) return;

    if (coords.length === 1) {
      mapRef.current?.animateToRegion(
        {
          latitude: coords[0].latitude,
          longitude: coords[0].longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.020,
        },
        700
      );
    } else {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 140, right: 60, bottom: 280, left: 60 },
        animated: true,
      });
    }
  };

  const handleCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScrollRef.current) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / cardInterval);
    const boundedIndex = Math.max(0, Math.min(index, currentPodPeas.length - 1));
    if (currentPodPeas.length > 0 && (boundedIndex !== activeCarouselIndex || selectedPeaId === null)) {
      setActiveCarouselIndex(boundedIndex);
      const pea = currentPodPeas[boundedIndex];
      if (pea && pea.id !== selectedPeaId) {
        setSelectedPeaId(pea.id);
        const coord = pea.coordinate || getPeaCoordinate(activePod.id, pea.id);
        mapRef.current?.animateToRegion(
          {
            latitude: coord.latitude,
            longitude: coord.longitude,
            latitudeDelta: 0.014,
            longitudeDelta: 0.018,
          },
          500
        );
      }
    }
  };

  // Drag handle responder on the sheet
  // eslint-disable-next-line react-hooks/refs
  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const isExpanded = isDetailSheetExpandedRef.current;
        if (isExpanded && gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        } else if (!isExpanded && gestureState.dy < 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const isExpanded = isDetailSheetExpandedRef.current;
        if (isExpanded) {
          if (gestureState.dy > 50) {
            handleCollapseDetailSheet();
          } else {
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
          }
        } else {
          if (gestureState.dy < -50) {
            handleExpandDetailSheet();
          } else {
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
          }
        }
      }
    })
  );

  const selectedPea = currentPodPeas.find(p => p.id === selectedPeaId) || null;

  return (
    <View style={styles.container}>
      {/* Interactive Map */}
      <View style={styles.mapPlaceholder}>
        <InteractiveMap
          ref={mapRef}
          initialRegion={getPodInitialRegion(activePod.id)}
          onMapPress={() => {
            if (isDetailSheetExpanded) {
              handleCollapseDetailSheet();
            }
          }}
        >
          {currentPodPeas.map((pea, index) => {
            const coord = pea.coordinate || getPeaCoordinate(activePod.id, pea.id);
            const isSelected = selectedPeaId === pea.id;
            return (
              <Marker
                key={pea.id}
                coordinate={coord}
                identifier={pea.id}
                zIndex={isSelected ? 30 : 10}
                onPress={() => handleMarkerPress(pea, index)}
              >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  {pea.isCurrentUser && isLocating && (
                    <View style={styles.locatingBeaconRing} pointerEvents="none" />
                  )}
                  <Peamarker
                    state={isSelected ? "Selected" : "Default"}
                    avatar={pea.avatar}
                    icon="person"
                    color="#999"
                  />
                </View>
              </Marker>
            );
          })}
        </InteractiveMap>
      </View>

      {/* Unified Overlay for Controls and Sheets (hidden when PodSelector is open) */}
      {!isPodSelectorOpen && (
        <View style={[styles.bottomOverlay, { bottom: 84 + Math.max(insets.bottom - 18, 0) }]}>
          {/* Map Controls - hidden when detail sheet is expanded to prevent overlap */}
          {!isDetailSheetExpanded && (
            <View style={styles.mapControls}>
              <LocateMe state={isLocating ? 'Pressed' : 'Default'} onPress={handleLocateMe} />
              <View style={{ height: 16 }} />
              <ShowAll state={isShowAllActive ? 'Pressed' : 'Default'} onPress={handleShowAll} />
            </View>
          )}

          {/* Bottom Sheet Area */}
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            {isDetailSheetExpanded && selectedPea ? (
              <MemberDetailSheet pea={selectedPea} onClose={handleCollapseDetailSheet} panHandlers={panResponder.panHandlers} />
            ) : (
              <View style={styles.peopleSheet}>
                <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
                  <View style={styles.dragHandle} />
                </View>

                <View style={styles.cardContainer}>
                  <UpNextCard
                    onPress={() => {
                      mapRef.current?.animateToRegion({
                        latitude: 1.3010,
                        longitude: 103.8384,
                        latitudeDelta: 0.012,
                        longitudeDelta: 0.016,
                      }, 600);
                    }}
                  />

                  <View>
                    <FlatList
                      ref={flatListRef}
                      data={currentPodPeas}
                      keyExtractor={(item) => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      snapToInterval={cardInterval}
                      snapToAlignment="start"
                      decelerationRate="fast"
                      getItemLayout={(_, index) => ({
                        length: cardInterval,
                        offset: cardInterval * index,
                        index,
                      })}
                      onMomentumScrollEnd={handleCarouselScroll}
                      onScrollEndDrag={handleCarouselScroll}
                      onScroll={handleCarouselScroll}
                      scrollEventThrottle={32}
                      renderItem={({ item, index }) => (
                        <PeaCard
                          key={item.id}
                          pea={item}
                          style={{ width: cardWidth }}
                          isSelected={selectedPeaId === item.id}
                          onPress={() => handleCardPress(item, index)}
                        />
                      )}
                      ListEmptyComponent={
                        <View style={[styles.emptyCardContainer, { width: cardWidth }]}>
                          <Ionicons name="people-outline" size={24} color="#8A8884" />
                          <Text style={styles.emptyCardText}>No members in this Pod</Text>
                        </View>
                      }
                    />
                    <PaginationDots total={currentPodPeas.length} currentIndex={activeCarouselIndex} />
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      )}

      {/* Persistent Bottom Tab Bar */}
      <View style={styles.bottomNavContainer}>
        <BottomTabBar activeTab="Home" />
      </View>

      {/* Full-screen blur overlay when PodSelector is open */}
      {isPodSelectorOpen && (
        <BlurView
          intensity={20}
          style={StyleSheet.absoluteFill}
          tint="light"
        />
      )}

      {/* Top Navigation */}
      <View style={[
        styles.safeArea, 
        { paddingTop: Platform.OS === 'web' ? (windowHeight >= 800 ? 68 : 28) : Math.max(insets.top, 16) },
        isPodSelectorOpen && { zIndex: 30 }
      ]}>
        <View style={styles.topNav}>
          <PodSelector
            activePod={{
              ...activePod,
              members: currentPodPeas.length,
            }}
            pods={pods}
            onSelectPod={handleSelectPod}
            onViewPodOverview={() => setIsPodOverviewVisible(true)}
            onCreatePodPress={() => setIsCreatePodVisible(true)}
            onJoinPodPress={() => setIsJoinPodVisible(true)}
            onSelectSavedPlace={(place) => {
              if (place.coordinate) {
                mapRef.current?.animateToRegion({
                  latitude: place.coordinate.latitude,
                  longitude: place.coordinate.longitude,
                  latitudeDelta: 0.012,
                  longitudeDelta: 0.016,
                }, 600);
              }
            }}
            isOpen={isPodSelectorOpen}
            onToggle={handleTogglePodSelector}
            showDropdown={isDropdownVisible || (!isPodSelectorOpen && false)}
          />

          {!isPodSelectorOpen && (
            <TouchableOpacity 
              style={styles.notificationButton} 
              activeOpacity={0.8}
              onPress={() => setIsNotificationsVisible(true)}
            >
              <Ionicons name="notifications-outline" size={24} color={Theme.colors.text.primary} />
              {hasUnreadNotifications && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Pod Overview Modal Sheet */}
      {isPodOverviewVisible && (
        <PodOverviewSheet
          activePod={{
            ...activePod,
            members: currentPodPeas.length,
          }}
          members={currentPodPeas}
          onSelectMember={handleSelectMemberFromOverview}
          onRemovePea={handleRemovePea}
          onUpdatePodName={(newName: string) => {
            setActivePod(prev => ({ ...prev, name: newName }));
            setPods(prev => prev.map(p => p.id === activePod.id ? { ...p, name: newName } : p));
          }}
          onUpdatePodType={(newType: string) => {
            setActivePod(prev => ({ ...prev, type: newType }));
            setPods(prev => prev.map(p => p.id === activePod.id ? { ...p, type: newType } : p));
          }}
          onLeavePod={() => {
            setIsPodOverviewVisible(false);
            const remainingPods = pods.filter(p => p.id !== activePod.id);
            if (remainingPods.length > 0) {
              setPods(remainingPods);
              handleSelectPod(remainingPods[0]);
            } else {
              const defaultFallback: typeof MOCK_PODS[0] = {
                id: 'pod_default',
                name: 'My Pod',
                type: 'Friends',
                members: 1,
                avatarColor: '#E8F6EE',
                iconColor: '#259E56',
              };
              const defaultMembers: PeaData[] = [
                {
                  id: '1',
                  name: 'Le Wen',
                  role: 'Admin',
                  activity: 'Active now',
                  status: 'Active',
                  eta: 'Now',
                  battery: '90%',
                  network: '5G',
                  distance: '0 km',
                  locationName: 'Current Location',
                  locationAddress: 'Singapore',
                  coords: { top: '35%', left: '48%' },
                  isCurrentUser: true,
                  avatar: require('../../assets/avatars/le_wen.png'),
                },
              ];
              setPods([defaultFallback]);
              setMembersByPod({ [defaultFallback.id]: defaultMembers });
              handleSelectPod(defaultFallback, defaultMembers);
            }
          }}
          onDeletePod={() => {
            setIsPodOverviewVisible(false);
            const remainingPods = pods.filter(p => p.id !== activePod.id);
            if (remainingPods.length > 0) {
              setPods(remainingPods);
              handleSelectPod(remainingPods[0]);
            } else {
              const defaultFallback: typeof MOCK_PODS[0] = {
                id: 'pod_default',
                name: 'My Pod',
                type: 'Friends',
                members: 1,
                avatarColor: '#E8F6EE',
                iconColor: '#259E56',
              };
              const defaultMembers: PeaData[] = [
                {
                  id: '1',
                  name: 'Le Wen',
                  role: 'Admin',
                  activity: 'Active now',
                  status: 'Active',
                  eta: 'Now',
                  battery: '90%',
                  network: '5G',
                  distance: '0 km',
                  locationName: 'Current Location',
                  locationAddress: 'Singapore',
                  coords: { top: '35%', left: '48%' },
                  isCurrentUser: true,
                  avatar: require('../../assets/avatars/le_wen.png'),
                },
              ];
              setPods([defaultFallback]);
              setMembersByPod({ [defaultFallback.id]: defaultMembers });
              handleSelectPod(defaultFallback, defaultMembers);
            }
          }}
          onOpenNotifications={() => setIsNotificationsVisible(true)}
          onClose={() => setIsPodOverviewVisible(false)}
        />
      )}

      {/* Create Pod Modal */}
      <CreatePodModal
        visible={isCreatePodVisible}
        onClose={() => setIsCreatePodVisible(false)}
        onCreatePod={handleCreatePod}
      />

      {/* Join Pod Modal */}
      <JoinPodModal
        visible={isJoinPodVisible}
        onClose={() => setIsJoinPodVisible(false)}
        onJoinPod={handleJoinPod}
      />

      {/* Notifications Screen Overlay (Figma Node: 603-7782) */}
      <HomeNotificationsOverlay
        visible={isNotificationsVisible}
        notificationsList={notifications}
        onNotificationsChange={setNotifications}
        onClose={() => setIsNotificationsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface.panelBg,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    paddingTop: Platform.OS === 'web' ? 70 : 10,
  },
  mapPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.surface.glass90,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.effects.elevation.card,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.brand.primary,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 82, // Sit above bottom nav
    left: 0,
    right: 0,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  mapControls: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  peopleSheet: {
    width: '100%',
    backgroundColor: Theme.colors.surface.panelBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 14,
    paddingTop: 10,
    paddingHorizontal: 14,
    ...Theme.effects.elevation.card,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 50,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 0,
    marginBottom: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d6dcd8',
  },
  cardContainer: {
    width: '100%',
  },
  locatingBeaconRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Theme.colors.brand.primary,
    backgroundColor: 'rgba(37, 158, 86, 0.25)',
    zIndex: 1,
  },
  emptyCardContainer: {
    width: 320,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e8ece9',
    gap: 8,
  },
  emptyCardText: {
    ...Theme.typography.body.large16,
    color: '#8A8884',
  },
});
