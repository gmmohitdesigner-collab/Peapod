import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated, Image, TextInput, Modal, KeyboardAvoidingView } from 'react-native';
import { useResponsiveDimensions } from '@/context/ResponsiveDimensionsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';




import { Coordinate } from '@/constants/mockLocations';

// ----------------------------------------------------
// MOCK DATA
// ----------------------------------------------------
export interface PeaData {
  id: string;
  name: string;
  role?: string;
  activity: string;
  status: 'Active' | 'Inactive';
  eta?: string;
  battery: string;
  network: string;
  distance: string;
  locationName: string;
  locationAddress: string;
  coords: { top: string; left: string };
  coordinate?: Coordinate;
  isCurrentUser: boolean;
  avatar: any;
}

export const MOCK_PODS = [
  { id: 'pod1', name: 'The Weekend Crew', type: 'Friends', members: 4, avatarColor: '#E8F6EE', iconColor: '#259E56' },
  { id: 'pod2', name: 'Family', type: 'Family', members: 3, avatarColor: '#FDF1E8', iconColor: '#E99B78' },
  { id: 'pod3', name: 'Design Buddies', type: 'Friends', members: 3, avatarColor: '#EBF3F8', iconColor: '#6B90B2' }
];

export const MOCK_MEMBERS_BY_POD: Record<string, PeaData[]> = {
  pod1: [
    { 
      id: '1', name: 'Le Wen', 
      role: 'Admin',
      activity: 'Heading to Dinner', status: 'Active', 
      eta: '7:42 PM',
      battery: '78%', network: 'Wi-Fi', distance: '2.4 km', 
      locationName: 'Home', locationAddress: '123 Orchard Rd, Singapore',
      coords: { top: '28%', left: '48%' },
      isCurrentUser: true,
      avatar: require('../../assets/avatars/le_wen.png'),
    },
    { 
      id: '2', name: 'Srishti', 
      activity: 'At Home', status: 'Active', 
      eta: '8:10 PM',
      battery: '73%', network: '5G', distance: '1.8 km', 
      locationName: 'Home', locationAddress: '45 Claymore Rd, Singapore',
      coords: { top: '22%', left: '15%' },
      isCurrentUser: false,
      avatar: require('../../assets/avatars/srishti.png'),
    },
    { 
      id: '3', name: 'Edwin', 
      activity: 'Studying', status: 'Active', 
      eta: '8:30 PM',
      battery: '100%', network: '5G', distance: '3.4 km', 
      locationName: 'Library', locationAddress: 'National Library Board',
      coords: { top: '38%', left: '52%' },
      isCurrentUser: false,
      avatar: require('../../assets/avatars/edwin.png'),
    },
    { 
      id: '4', name: 'Nikkee', 
      activity: 'Heading over', status: 'Active', 
      eta: '7:55 PM',
      battery: '40%', network: '4G', distance: '0.9 km', 
      locationName: 'Somerset', locationAddress: '313 Somerset, Singapore',
      coords: { top: '33%', left: '82%' },
      isCurrentUser: false,
      avatar: require('../../assets/avatars/nikkee.png'),
    },
  ],
  pod2: [
    { 
      id: '1', name: 'Le Wen', 
      role: 'Admin',
      activity: 'Heading Home', status: 'Active', 
      eta: '6:30 PM',
      battery: '78%', network: 'Wi-Fi', distance: '1.2 km', 
      locationName: 'Home', locationAddress: '123 Orchard Rd, Singapore',
      coords: { top: '32%', left: '46%' },
      isCurrentUser: true,
      avatar: require('../../assets/avatars/le_wen.png'),
    },
    { 
      id: '2', name: 'Srishti', 
      role: 'Mom',
      activity: 'At Supermarket', status: 'Active', 
      eta: '6:45 PM',
      battery: '85%', network: '5G', distance: '0.8 km', 
      locationName: 'Market', locationAddress: '88 Market St, Singapore',
      coords: { top: '25%', left: '26%' },
      isCurrentUser: false,
      avatar: require('../../assets/avatars/srishti.png'),
    },
    { 
      id: '3', name: 'Edwin', 
      role: 'Brother',
      activity: 'At Football Practice', status: 'Active', 
      eta: '7:15 PM',
      battery: '62%', network: '4G', distance: '3.1 km', 
      locationName: 'Sports Hub', locationAddress: 'Stadium Walk, Singapore',
      coords: { top: '40%', left: '68%' },
      isCurrentUser: false,
      avatar: require('../../assets/avatars/edwin.png'),
    },
  ],
  pod3: [
    { 
      id: '1', name: 'Le Wen', 
      role: 'Admin',
      activity: 'In Studio', status: 'Active', 
      eta: '5:00 PM',
      battery: '78%', network: 'Wi-Fi', distance: '0.5 km', 
      locationName: 'Design Lab', locationAddress: '71 Ayer Rajah Crescent',
      coords: { top: '30%', left: '50%' },
      isCurrentUser: true,
      avatar: require('../../assets/avatars/le_wen.png'),
    },
    { 
      id: '4', name: 'Nikkee', 
      role: 'Lead Designer',
      activity: 'Reviewing Prototypes', status: 'Active', 
      eta: '5:30 PM',
      battery: '55%', network: '5G', distance: '1.6 km', 
      locationName: 'Agency Office', locationAddress: '10 Anson Rd, Singapore',
      coords: { top: '22%', left: '72%' },
      isCurrentUser: false,
      avatar: require('../../assets/avatars/nikkee.png'),
    },
    { 
      id: '3', name: 'Edwin', 
      role: 'UI Designer',
      activity: 'Coffee Shop Work', status: 'Active', 
      eta: '6:00 PM',
      battery: '91%', network: 'Wi-Fi', distance: '2.0 km', 
      locationName: 'Common Man Coffee', locationAddress: '22 Martin Rd, Singapore',
      coords: { top: '36%', left: '32%' },
      isCurrentUser: false,
      avatar: require('../../assets/avatars/edwin.png'),
    },
  ],
};

export const MOCK_PEAS = MOCK_MEMBERS_BY_POD['pod1'];

// ----------------------------------------------------
// POD SELECTOR
// ----------------------------------------------------
export const PodSelector = ({ 
  activePod, 
  pods = MOCK_PODS,
  onSelectPod, 
  onViewPodOverview, 
  isOpen, 
  onToggle, 
  showDropdown,
  onCreatePodPress,
  onJoinPodPress,
  onSelectSavedPlace,
  onManageSavedPlaces,
}: { 
  activePod: typeof MOCK_PODS[0]; 
  pods?: typeof MOCK_PODS;
  onSelectPod: (pod: any) => void; 
  onViewPodOverview: () => void; 
  isOpen: boolean; 
  onToggle: (isOpen: boolean) => void; 
  showDropdown?: boolean;
  onCreatePodPress?: () => void;
  onJoinPodPress?: () => void;
  onSelectSavedPlace?: (place: { name: string; address: string; coordinate?: Coordinate }) => void;
  onManageSavedPlaces?: () => void;
}) => {
  const { width: screenWidth, height: screenHeight } = useResponsiveDimensions();
  const insets = useSafeAreaInsets();
  const dropdownWidth = Math.min(352, Math.max(280, screenWidth - 32));
  const topPadding = Platform.OS === 'web' ? (screenHeight >= 800 ? 68 : 28) : Math.max(insets.top, 16);
  const topOffset = topPadding + 73;
  const bottomBarHeight = 82;
  const bottomMargin = 16;
  const maxDropdownHeight = Math.max(220, screenHeight - topOffset - bottomBarHeight - bottomMargin);
  const dropAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (showDropdown) {
      Animated.spring(dropAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(dropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showDropdown, dropAnim]);

  return (
    <View style={[styles.podSelectorContainer, isOpen && [styles.podSelectorContainerExpanded, { top: topPadding }]]}>
      {isOpen && (
        <TouchableOpacity 
          style={styles.podSelectorBackdrop} 
          activeOpacity={1} 
          onPress={() => onToggle(false)}
        />
      )}
      
      <TouchableOpacity 
        style={[
          isOpen ? styles.podSelectorButtonExpanded : styles.podSelectorButton,
          isOpen && { width: dropdownWidth }
        ]} 
        onPress={() => onToggle(!isOpen)}
        activeOpacity={0.8}
      >
        {isOpen ? (
          <>
            <View style={[styles.podTitleColExpanded, { flex: 1, marginRight: 8 }]}>
              <Text style={[Theme.typography.cardTitle.title20, { color: '#1A1A1A', fontSize: 18 }]} numberOfLines={1}>
                {activePod.name}
              </Text>
              <Text style={[Theme.typography.interface.label12, { color: '#6F6A63' }]} numberOfLines={1}>
                {activePod.type} · {activePod.members} Peas
              </Text>
            </View>
            <Ionicons name="chevron-up" size={18} color="#1A1A1A" />
          </>
        ) : (
          <>
            <View style={styles.podTitleRow}>
              <Text 
                style={[
                  Theme.typography.section.section24, 
                  { color: Theme.colors.text.primaryAlt, marginRight: 4, maxWidth: screenWidth - 120 }
                ]}
                numberOfLines={1}
              >
                {activePod.name}
              </Text>
              <Ionicons name="chevron-down" size={14} color={Theme.colors.text.primaryAlt} />
            </View>
            <Text style={[Theme.typography.interface.label14, { color: Theme.colors.text.muted, marginTop: 2 }]} numberOfLines={1}>
              {activePod.type} · {activePod.members} Peas
            </Text>
          </>
        )}
      </TouchableOpacity>

      {showDropdown && (
        <View style={[styles.podDropdownContainer, { width: dropdownWidth, zIndex: 50 }]}>
          <View style={{ 
            overflow: 'hidden', 
            paddingBottom: 50, 
            marginBottom: -50, 
            paddingHorizontal: 40, 
            marginHorizontal: -40 
          }}>
            <Animated.View style={{
              opacity: dropAnim,
              transform: [{
                translateY: dropAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-400, 0]
                })
              }]
            }}>
              <ScrollView
                style={{ maxHeight: maxDropdownHeight }}
                contentContainerStyle={{ flexGrow: 0, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                <View style={[styles.podDropdown, { width: dropdownWidth }]}>
                  <View style={styles.podDropdownActiveCard}>
                    <View style={styles.podDropdownActiveIndicator} />
                    <Text style={[Theme.typography.interface.eyebrow11, { color: '#666', letterSpacing: 1 }]}>CURRENT POD</Text>
                    <Text style={[Theme.typography.cardTitle.title20, { color: '#1A1A1A', marginTop: 12 }]} numberOfLines={1}>{activePod.name}</Text>
                    <Text style={[Theme.typography.interface.label14, { color: '#666', marginTop: 4 }]} numberOfLines={1}>{activePod.type} · {activePod.members} Peas</Text>
                    
                    <View style={styles.podDropdownAvatarCluster}>
                      {Array.from({length: activePod.members > 4 ? 4 : activePod.members}).map((_, i) => (
                        <View key={i} style={[styles.podDropdownAvatar, { marginLeft: i === 0 ? 0 : -12, zIndex: 10 - i }]}>
                           <Ionicons name="person" size={18} color="#FFF" />
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.podDropdownLocationSharing}>
                       <View style={styles.podDropdownLocationDot} />
                       <Text style={[Theme.typography.interface.label14, { color: '#666' }]}>3 sharing location</Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.podDropdownViewButton}
                      onPress={() => { onToggle(false); onViewPodOverview(); }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[Theme.typography.interface.label14, { color: '#259E56', fontFamily: 'PlusJakartaSans_600SemiBold' }]}>View Pod</Text>
                      <Ionicons name="arrow-forward" size={14} color="#259E56" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.podDropdownList}>
                    {pods.filter(p => p.id !== activePod.id).map(pod => (
                      <TouchableOpacity 
                        key={pod.id} 
                        style={styles.podDropdownListItem}
                        onPress={() => { onSelectPod(pod); onToggle(false); }}
                      >
                        <View style={[styles.podDropdownListAvatar, { backgroundColor: pod.avatarColor }]}>
                          <Ionicons name="people" size={20} color={pod.iconColor} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[Theme.typography.body.large16, { color: '#1A1A1A', fontFamily: 'PlusJakartaSans_600SemiBold' }]} numberOfLines={1}>{pod.name}</Text>
                          <Text style={[Theme.typography.interface.label14, { color: '#666' }]} numberOfLines={1}>{pod.type} · {pod.members} Peas</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#999" />
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <View style={styles.podDropdownDivider} />

                  <View style={styles.podDropdownActions}>
                    <TouchableOpacity 
                      style={styles.podDropdownActionBtn}
                      onPress={() => { onToggle(false); onCreatePodPress?.(); }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={16} color="#1A1A1A" style={{ marginRight: 4 }} />
                      <Text style={styles.podDropdownActionText}>Create Pod</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.podDropdownActionBtn}
                      onPress={() => { onToggle(false); onJoinPodPress?.(); }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="enter-outline" size={15} color="#1A1A1A" style={{ marginRight: 4 }} />
                      <Text style={styles.podDropdownActionText}>Join Pod</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.podDropdownSavedPlaces, { width: dropdownWidth }]}>
                  <View style={styles.podDropdownSavedPlacesHeader}>
                    <Text style={[Theme.typography.interface.eyebrow11, { color: '#666', letterSpacing: 0, fontFamily: 'PlusJakartaSans_700Bold' }]}>SAVED PLACES</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => onManageSavedPlaces?.()}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[Theme.typography.interface.label12, { color: '#259E56', fontFamily: 'PlusJakartaSans_600SemiBold' }]}>Manage</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.podDropdownSavedPlaceCard}
                    activeOpacity={0.8}
                    onPress={() => {
                      onToggle(false);
                      onSelectSavedPlace?.({
                        name: 'Home',
                        address: '123 Orchard Rd, Singapore',
                        coordinate: { latitude: 1.3048, longitude: 103.8318 },
                      });
                    }}
                  >
                    <View style={styles.podDropdownSavedPlaceIconBox}>
                      <Ionicons name="home-outline" size={18} color="#259E56" />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[Theme.typography.interface.label14, { color: '#1A1A1A', fontFamily: 'PlusJakartaSans_600SemiBold' }]} numberOfLines={1}>Home</Text>
                      <Text style={[Theme.typography.interface.label12, { color: '#666' }]} numberOfLines={1}>123 Orchard Rd, Singapore</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        </View>
      )}
    </View>
  );
};

// ----------------------------------------------------
// UP NEXT CARD
// ----------------------------------------------------
export const UpNextCard = ({ onPress }: { onPress?: () => void }) => (
  <TouchableOpacity style={styles.upNextCard} activeOpacity={0.8} onPress={onPress}>
    <View style={styles.upNextIconBox}>
      <Ionicons name="calendar-outline" size={20} color={Theme.colors.brand.primary} />
    </View>
    <View style={styles.upNextContent}>
      <Text style={[Theme.typography.interface.eyebrow11, { color: '#1e8447' }]}>
        UP NEXT
      </Text>
      <Text style={[Theme.typography.cardTitle.title20, { color: '#1a1a1a', marginVertical: 2 }]} numberOfLines={1}>
        Dinner at The Table
      </Text>
      <Text style={[Theme.typography.interface.label12, { color: Theme.colors.text.muted }]} numberOfLines={1}>
        Today · 7:30 PM · 3 of 4 going
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color={Theme.colors.text.muted} />
  </TouchableOpacity>
);

// ----------------------------------------------------
// PEA CARD
// ----------------------------------------------------
export const PeaCard = ({ 
  pea, 
  isSelected, 
  onPress,
  style,
}: { 
  pea: typeof MOCK_PEAS[0]; 
  isSelected: boolean; 
  onPress: () => void;
  style?: any;
}) => {
  return (
    <TouchableOpacity 
      style={[styles.peaCard, isSelected && styles.peaCardSelected, style]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.peaCardAvatar}>
        {pea.avatar ? (
          <Image source={pea.avatar} style={{ width: 50, height: 50, borderRadius: 25 }} />
        ) : (
          <Ionicons name="person" size={24} color="#FFF" />
        )}
      </View>
      <View style={styles.peaCardContent}>
        <Text style={[Theme.typography.body.large16, { color: '#303633' }]} numberOfLines={1}>
          {pea.name}
        </Text>
        <Text style={[Theme.typography.interface.label12, { color: Theme.colors.text.muted, marginTop: 2 }]} numberOfLines={1}>
          {pea.activity} · ETA {pea.eta || 'N/A'}
        </Text>
        <View style={styles.liveInfoRow}>
          {/* Battery */}
          <View style={styles.liveInfoItem}>
            <Ionicons name="battery-half" size={12} color="#ff8d28" />
            <Text style={[Theme.typography.interface.label14, { color: '#ff8d28', marginLeft: 4 }]}>{pea.battery}</Text>
          </View>
          {/* Network */}
          <View style={styles.liveInfoItem}>
            <Ionicons name="cellular" size={12} color="#303633" />
            <Text style={[Theme.typography.interface.label14, { color: '#303633', marginLeft: 4 }]}>{pea.network}</Text>
          </View>
          {/* Distance */}
          <View style={styles.liveInfoItem}>
            <Ionicons name="navigate-outline" size={12} color="#303633" />
            <Text style={[Theme.typography.interface.label14, { color: '#303633', marginLeft: 4 }]}>{pea.distance}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ----------------------------------------------------
// PEA CARD PAGINATION
// ----------------------------------------------------
export const PaginationDots = ({ total, currentIndex }: { total: number, currentIndex: number }) => {
  if (total <= 1) return null;
  return (
    <View style={styles.paginationDotsContainer}>
      {Array.from({ length: total }).map((_, idx) => (
        <View 
          key={idx} 
          style={[
            styles.paginationDot, 
            idx === currentIndex && styles.paginationDotActive
          ]} 
        />
      ))}
    </View>
  );
};

// ----------------------------------------------------
// POD OVERVIEW VARIANT 2 (Figma Node: 600-6180)
// ----------------------------------------------------
export const PodOverviewVariant2 = (
  props: React.ComponentProps<typeof PodOverviewSheet>
) => <PodOverviewSheet {...props} variant="collapsed" />;

// ----------------------------------------------------
// BOTTOM TAB BAR
// ----------------------------------------------------
export const BottomTabBar = ({ activeTab = 'Home' }: { activeTab?: string }) => {
  const tabs = [
    { id: 'Home', icon: 'home-outline', iconActive: 'home' },
    { id: 'Plans', icon: 'calendar-outline', iconActive: 'calendar' },
    { id: 'World', icon: 'navigate-outline', iconActive: 'navigate' },
    { id: 'You', icon: 'person-outline', iconActive: 'person' },
  ];

  return (
    <View style={styles.bottomTabBarContainer}>
      <View style={styles.bottomTabBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity key={tab.id} style={styles.tabItem} activeOpacity={0.7}>
              <View style={isActive ? styles.tabIconActiveContainer : styles.tabIconContainer}>
                <Ionicons 
                  name={isActive ? tab.iconActive : tab.icon as any} 
                  size={19} // Exact from Figma
                  color={isActive ? '#222' : '#929B96'} 
                />
              </View>
              <Text style={[
                Theme.typography.interface.label12, 
                { 
                  color: isActive ? '#222' : '#929B96',
                  marginTop: 3,
                  fontSize: 11,
                  fontFamily: isActive ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_500Medium' // Closest to Inter SemiBold/Medium
                }
              ]}>
                {tab.id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.safeAreaIndicator}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

// ----------------------------------------------------
// MEMBER DETAIL SHEET
// ----------------------------------------------------
export const MemberDetailSheet = ({ pea, onClose, panHandlers }: { pea: typeof MOCK_PEAS[0] | null, onClose: () => void, panHandlers?: any }) => {
  const { height: screenHeight } = useResponsiveDimensions();
  const responsiveMaxHeight = Math.min(576, Math.max(300, screenHeight - 140));

  if (!pea) return null;

  return (
    <ScrollView 
      style={[styles.detailSheet, { maxHeight: responsiveMaxHeight }]} 
      contentContainerStyle={styles.detailSheetContent} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.dragHandleContainer} {...panHandlers}>
        <View style={styles.dragHandle} />
      </View>

      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={onClose}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={18} color="#1A1A1A" />
      </TouchableOpacity>

      <View style={styles.detailHeader}>
        <View style={styles.detailAvatarOuter}>
          <View style={styles.detailAvatarInner}>
            {pea.avatar ? (
              <Image source={pea.avatar} style={{ width: 56, height: 56, borderRadius: 28 }} />
            ) : (
              <Ionicons name="person" size={32} color="#FFF" />
            )}
          </View>
        </View>
        <View style={styles.detailTitleArea}>
          <View style={styles.statusRow}>
            <Text style={[Theme.typography.cardTitle.title20, { color: '#1A1A1A', flexShrink: 1 }]} numberOfLines={1}>{pea.name}</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: pea.status === 'Active' ? '#259E56' : Theme.colors.text.muted }]} />
              <Text style={[Theme.typography.interface.label12, { color: pea.status === 'Active' ? '#259E56' : Theme.colors.text.secondary, fontSize: 11, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>{pea.status}</Text>
            </View>
          </View>
          <Text style={[Theme.typography.body.large16, { color: '#666', marginTop: 2, fontSize: 14, fontFamily: 'PlusJakartaSans_500Medium' }]}>{pea.activity}</Text>
        </View>
      </View>

      {pea.eta && (
        <View style={styles.etaBanner}>
          <View style={styles.etaBannerTextCol}>
            <Text style={[Theme.typography.interface.eyebrow11, { color: '#259E56', fontSize: 12, letterSpacing: 0 }]}>ESTIMATED ARRIVAL</Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: '#1A1A1A', marginTop: 2 }}>{pea.eta}</Text>
          </View>
          <Ionicons name="car-outline" size={32} color="#1A1A1A" />
        </View>
      )}

      <View style={styles.travelInfoRow}>
        <View style={styles.travelIconContainer}>
          <Ionicons name="location-outline" size={18} color="#1A1A1A" />
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={[Theme.typography.body.large16, { color: '#1A1A1A', fontSize: 14 }]}>En route to The Table</Text>
          <Text style={[Theme.typography.interface.label12, { color: '#666' }]}>Updated 2 min ago</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={[Theme.typography.interface.eyebrow11, { color: '#666', letterSpacing: 0, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>BATTERY</Text>
          <View style={styles.metaValueRow}>
            <Ionicons name="battery-half" size={14} color="#1A1A1A" />
            <Text style={[Theme.typography.interface.label14, { color: '#1A1A1A', marginLeft: 4, fontFamily: 'PlusJakartaSans_700Bold' }]}>{pea.battery}</Text>
          </View>
        </View>
        <View style={styles.metaItem}>
          <Text style={[Theme.typography.interface.eyebrow11, { color: '#666', letterSpacing: 0, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>NETWORK</Text>
          <View style={styles.metaValueRow}>
            <Ionicons name="cellular-outline" size={14} color="#1A1A1A" />
            <Text style={[Theme.typography.interface.label14, { color: '#1A1A1A', marginLeft: 4, fontFamily: 'PlusJakartaSans_700Bold' }]}>{pea.network}</Text>
          </View>
        </View>
        <View style={styles.metaItem}>
          <Text style={[Theme.typography.interface.eyebrow11, { color: '#666', letterSpacing: 0, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>DISTANCE</Text>
          <View style={styles.metaValueRow}>
            <Ionicons name="navigate-outline" size={14} color="#1A1A1A" />
            <Text style={[Theme.typography.interface.label14, { color: '#1A1A1A', marginLeft: 4, fontFamily: 'PlusJakartaSans_700Bold' }]}>{pea.distance}</Text>
          </View>
        </View>
      </View>

      {pea.isCurrentUser && (
        <>
          <View style={styles.divider} />
          
          <UpNextCard />

          <View style={styles.divider} />

          <View style={styles.savedPlaces}>
            <Text style={[Theme.typography.interface.eyebrow11, { color: '#666', letterSpacing: 0 }]}>SAVED PLACES</Text>
            <View style={styles.savedPlaceItem}>
              <View style={styles.savedPlaceIcon}>
                <Ionicons name="home-outline" size={16} color="#1A1A1A" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[Theme.typography.interface.label14, { color: '#1A1A1A', fontFamily: 'PlusJakartaSans_600SemiBold' }]}>{pea.locationName}</Text>
                <Text style={[Theme.typography.interface.label12, { color: '#666' }]}>{pea.locationAddress}</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// ----------------------------------------------------
// RENAME POD MODAL (Figma Nodes: 515-3869 & 537-1592)
// ----------------------------------------------------
export const RenamePodModal = ({
  visible,
  currentName,
  onSave,
  onClose,
}: {
  visible: boolean;
  currentName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}) => {
  const [podName, setPodName] = useState(currentName);
  const [prevCurrentName, setPrevCurrentName] = useState(currentName);
  const { height: screenHeight } = useResponsiveDimensions();

  if (currentName !== prevCurrentName) {
    setPrevCurrentName(currentName);
    setPodName(currentName);
  }

  if (!visible) return null;

  const isSaveEnabled = podName.trim().length > 0;

  const handleSave = () => {
    if (isSaveEnabled) {
      onSave(podName.trim());
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.renameModalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.renameModalKeyboardAvoid}
        >
          <View style={styles.renameModalCard}>
            {/* Header (#FAF8F5) */}
            <View style={styles.renameModalHeader}>
              <Text style={styles.renameModalTitle}>Rename Pod</Text>
              <TouchableOpacity
                style={styles.renameModalDismissBtn}
                onPress={onClose}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {/* Body (#FFFFFF) */}
            <ScrollView
              style={{ maxHeight: Math.min(460, screenHeight * 0.72) }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.renameModalBody}>
                <View style={styles.renameModalField}>
                  <Text style={styles.renameModalLabel}>Pod name</Text>
                  <TextInput
                    style={styles.renameModalInput}
                    value={podName}
                    onChangeText={setPodName}
                    placeholder="Enter Pod name"
                    placeholderTextColor="#96938F"
                    autoFocus
                    selectTextOnFocus
                    maxLength={32}
                  />
                </View>

                <View style={styles.renameModalActions}>
                  <TouchableOpacity
                    style={styles.renameModalCancelBtn}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.renameModalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.renameModalSaveBtn,
                      isSaveEnabled
                        ? styles.renameModalSaveBtnEnabled
                        : styles.renameModalSaveBtnDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!isSaveEnabled}
                    activeOpacity={isSaveEnabled ? 0.8 : 1}
                  >
                    <Text
                      style={[
                        styles.renameModalSaveText,
                        isSaveEnabled
                          ? styles.renameModalSaveTextEnabled
                          : styles.renameModalSaveTextDisabled,
                      ]}
                    >
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------
// CHANGE POD TYPE MODAL (Figma Node: 537-1953)
// ----------------------------------------------------
export const ChangePodTypeModal = ({
  visible,
  currentType,
  onSelectType,
  onClose,
}: {
  visible: boolean;
  currentType: string;
  onSelectType: (newType: string) => void;
  onClose: () => void;
}) => {
  const { height: screenHeight } = useResponsiveDimensions();
  if (!visible) return null;

  const podTypeOptions = [
    { label: 'Couple', icon: 'heart-outline' as const },
    { label: 'Family', icon: 'people-outline' as const },
    { label: 'Friends', icon: 'people-outline' as const },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.renameModalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.renameModalKeyboardAvoid}
        >
          <View style={styles.renameModalCard}>
            {/* Header (#FAF8F5) */}
            <View style={styles.renameModalHeader}>
              <Text style={styles.renameModalTitle}>Change Pod Type</Text>
              <TouchableOpacity
                style={styles.renameModalDismissBtn}
                onPress={onClose}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {/* Body (#FFFFFF) */}
            <ScrollView
              style={{ maxHeight: Math.min(460, screenHeight * 0.72) }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.changeTypeModalBody}>
                {podTypeOptions.map((opt) => {
                  const isSelected = opt.label.toLowerCase() === currentType.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      style={[
                        styles.podTypeOption,
                        isSelected && styles.podTypeOptionSelected,
                      ]}
                      onPress={() => {
                        onSelectType(opt.label);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.podTypeIconBox}>
                        <Ionicons
                          name={opt.icon}
                          size={22}
                          color={isSelected ? '#259E56' : '#1A1A1A'}
                        />
                      </View>
                      <Text style={styles.podTypeOptionLabel}>{opt.label}</Text>
                      {isSelected && (
                        <Text style={styles.podTypeSelectedBadge}>Selected</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------
// REMOVE PEA MODAL (Figma Node: 595-3333)
// ----------------------------------------------------
export const RemovePeaModal = ({
  visible,
  pea,
  podName,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  pea: { name: string; avatar?: any } | null;
  podName: string;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const { height: screenHeight } = useResponsiveDimensions();
  if (!visible || !pea) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.renameModalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.renameModalKeyboardAvoid}
        >
          <View style={styles.renameModalCard}>
            {/* Header (#FAF8F5) */}
            <View style={styles.renameModalHeader}>
              <Text style={styles.renameModalTitle}>Remove Pea?</Text>
              <TouchableOpacity
                style={styles.renameModalDismissBtn}
                onPress={onClose}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {/* Body (#FFFFFF) */}
            <ScrollView
              style={{ maxHeight: Math.min(460, screenHeight * 0.72) }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.confirmModalBody}>
                {/* Pea Identity */}
                <View style={styles.confirmModalIdentityRow}>
                  <View style={styles.confirmModalAvatarOuter}>
                    {pea.avatar ? (
                      <Image source={pea.avatar} style={styles.confirmModalAvatarImg} />
                    ) : (
                      <Ionicons name="person" size={24} color="#259E56" />
                    )}
                  </View>
                  <Text style={styles.confirmModalIdentityName}>{pea.name}</Text>
                </View>

                {/* Warning description */}
                <Text style={styles.confirmModalDescription}>
                  {`Remove ${pea.name} from ${podName}? They will no longer be a Pea in this Pod.`}
                </Text>

                {/* Actions */}
                <View style={styles.renameModalActions}>
                  <TouchableOpacity
                    style={styles.confirmModalCancelBtn}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmModalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmModalDangerBtn}
                    onPress={() => {
                      onConfirm();
                      onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmModalDangerText}>Remove Pea</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------
// LEAVE POD MODAL (Figma Node: 595-3591)
// ----------------------------------------------------
export const LeavePodModal = ({
  visible,
  podName,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  podName: string;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const { height: screenHeight } = useResponsiveDimensions();
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.renameModalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.renameModalKeyboardAvoid}
        >
          <View style={styles.renameModalCard}>
            {/* Header (#FAF8F5) */}
            <View style={styles.renameModalHeader}>
              <Text style={styles.renameModalTitle}>Leave Pod?</Text>
              <TouchableOpacity
                style={styles.renameModalDismissBtn}
                onPress={onClose}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {/* Body (#FFFFFF) */}
            <ScrollView
              style={{ maxHeight: Math.min(460, screenHeight * 0.72) }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.confirmModalBody}>
                {/* Warning description */}
                <Text style={styles.confirmModalDescription}>
                  {`Leave ${podName}? You will no longer be a Pea in this Pod.`}
                </Text>

                {/* Actions */}
                <View style={styles.renameModalActions}>
                  <TouchableOpacity
                    style={styles.confirmModalCancelBtn}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmModalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmModalDangerBtn}
                    onPress={() => {
                      onConfirm();
                      onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmModalDangerText}>Leave Pod</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------
// DELETE POD MODAL (Figma Node: 595-3849)
// ----------------------------------------------------
export const DeletePodModal = ({
  visible,
  podName,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  podName: string;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const { height: screenHeight } = useResponsiveDimensions();
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.renameModalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.renameModalKeyboardAvoid}
        >
          <View style={styles.renameModalCard}>
            {/* Header (#FAF8F5) */}
            <View style={styles.renameModalHeader}>
              <Text style={styles.renameModalTitle}>Delete Pod?</Text>
              <TouchableOpacity
                style={styles.renameModalDismissBtn}
                onPress={onClose}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {/* Body (#FFFFFF) */}
            <ScrollView
              style={{ maxHeight: Math.min(460, screenHeight * 0.72) }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.confirmModalBody}>
                {/* Warning description */}
                <Text style={styles.confirmModalDescription}>
                  {`Permanently delete ${podName}? This will delete the Pod for all Peas and cannot be undone.`}
                </Text>

                {/* Actions */}
                <View style={styles.renameModalActions}>
                  <TouchableOpacity
                    style={styles.confirmModalCancelBtn}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmModalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmModalDangerBtn}
                    onPress={() => {
                      onConfirm();
                      onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmModalDangerText}>Delete Pod</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------
// CREATE POD MODAL
// ----------------------------------------------------
export const CreatePodModal = ({
  visible,
  onCreatePod,
  onClose,
}: {
  visible: boolean;
  onCreatePod: (newPod: typeof MOCK_PODS[0]) => void;
  onClose: () => void;
}) => {
  const [podName, setPodName] = useState('');
  const [podType, setPodType] = useState('Friends');
  const { height: screenHeight } = useResponsiveDimensions();

  if (!visible) return null;

  const podTypeOptions = ['Friends', 'Family', 'Couple'];
  const isEnabled = podName.trim().length > 0;

  const handleClose = () => {
    setPodName('');
    setPodType('Friends');
    onClose();
  };

  const handleCreate = () => {
    if (!isEnabled) return;
    const newPod: typeof MOCK_PODS[0] = {
      id: `pod_${Date.now()}`,
      name: podName.trim(),
      type: podType,
      members: 1,
      avatarColor: '#E8F6EE',
      iconColor: '#259E56',
    };
    onCreatePod(newPod);
    handleClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.renameModalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.renameModalKeyboardAvoid}
        >
          <View style={styles.renameModalCard}>
            <View style={styles.renameModalHeader}>
              <Text style={styles.renameModalTitle}>Create Pod</Text>
              <TouchableOpacity
                style={styles.renameModalDismissBtn}
                onPress={handleClose}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: Math.min(480, screenHeight * 0.72) }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.renameModalBody}>
                <View style={styles.renameModalField}>
                  <Text style={styles.renameModalLabel}>Pod name</Text>
                  <TextInput
                    style={styles.renameModalInput}
                    value={podName}
                    onChangeText={setPodName}
                    placeholder="e.g. Vacation Crew"
                    placeholderTextColor="#96938F"
                    autoFocus
                    maxLength={32}
                  />
                </View>

                <View style={styles.renameModalField}>
                  <Text style={styles.renameModalLabel}>Pod type</Text>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {podTypeOptions.map((type) => {
                      const isSel = podType === type;
                      return (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typePill,
                            isSel && styles.typePillSelected,
                          ]}
                          onPress={() => setPodType(type)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.typePillText,
                              isSel && styles.typePillTextSelected,
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.renameModalActions}>
                  <TouchableOpacity
                    style={styles.renameModalCancelBtn}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.renameModalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.renameModalSaveBtn,
                      isEnabled
                        ? styles.renameModalSaveBtnEnabled
                        : styles.renameModalSaveBtnDisabled,
                    ]}
                    onPress={handleCreate}
                    disabled={!isEnabled}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.renameModalSaveText,
                        isEnabled
                          ? styles.renameModalSaveTextEnabled
                          : styles.renameModalSaveTextDisabled,
                      ]}
                    >
                      Create Pod
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------
// JOIN POD MODAL
// ----------------------------------------------------
export const JoinPodModal = ({
  visible,
  onJoinPod,
  onClose,
}: {
  visible: boolean;
  onJoinPod?: (code: string) => void;
  onClose: () => void;
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const { height: screenHeight } = useResponsiveDimensions();

  if (!visible) return null;

  const isEnabled = inviteCode.trim().length >= 4;

  const handleClose = () => {
    setInviteCode('');
    onClose();
  };

  const handleJoin = () => {
    if (!isEnabled) return;
    onJoinPod?.(inviteCode.trim());
    handleClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.renameModalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.renameModalKeyboardAvoid}
        >
          <View style={styles.renameModalCard}>
            <View style={styles.renameModalHeader}>
              <Text style={styles.renameModalTitle}>Join Pod</Text>
              <TouchableOpacity
                style={styles.renameModalDismissBtn}
                onPress={handleClose}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: Math.min(480, screenHeight * 0.72) }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.renameModalBody}>
                <Text style={styles.confirmModalDescription}>
                  Enter the invite code shared with you to join an existing Pod.
                </Text>

                <View style={styles.renameModalField}>
                  <Text style={styles.renameModalLabel}>Invite code</Text>
                  <TextInput
                    style={[styles.renameModalInput, { textTransform: 'uppercase', letterSpacing: 2 }]}
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    placeholder="e.g. PEA-789X"
                    placeholderTextColor="#96938F"
                    autoFocus
                    autoCapitalize="characters"
                    maxLength={16}
                  />
                </View>

                <View style={styles.renameModalActions}>
                  <TouchableOpacity
                    style={styles.renameModalCancelBtn}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.renameModalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.renameModalSaveBtn,
                      isEnabled
                        ? styles.renameModalSaveBtnEnabled
                        : styles.renameModalSaveBtnDisabled,
                    ]}
                    onPress={handleJoin}
                    disabled={!isEnabled}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.renameModalSaveText,
                        isEnabled
                          ? styles.renameModalSaveTextEnabled
                          : styles.renameModalSaveTextDisabled,
                      ]}
                    >
                      Join Pod
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------
// INVITE PEA MODAL
// ----------------------------------------------------
export const InvitePeaModal = ({
  visible,
  podName,
  onClose,
}: {
  visible: boolean;
  podName: string;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const { height: screenHeight } = useResponsiveDimensions();

  if (!visible) return null;

  const mockCode = `PEA-${podName.substring(0, 3).toUpperCase()}-4821`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.renameModalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.renameModalKeyboardAvoid}
        >
          <View style={styles.renameModalCard}>
            <View style={styles.renameModalHeader}>
              <Text style={styles.renameModalTitle}>Invite Peas</Text>
              <TouchableOpacity
                style={styles.renameModalDismissBtn}
                onPress={onClose}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: Math.min(480, screenHeight * 0.72) }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.renameModalBody}>
                <Text style={styles.confirmModalDescription}>
                  Share this invite code with friends to let them join {podName}.
                </Text>

                <TouchableOpacity
                  style={styles.inviteCodeCard}
                  onPress={handleCopy}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[Theme.typography.interface.eyebrow11, { color: '#666', letterSpacing: 0.5 }]}>INVITE CODE</Text>
                    <Text style={styles.inviteCodeText}>{mockCode}</Text>
                  </View>
                  <View style={styles.inviteCopyBadge}>
                    <Ionicons
                      name={copied ? 'checkmark' : 'copy-outline'}
                      size={18}
                      color={copied ? '#259E56' : '#1A1A1A'}
                    />
                    <Text style={[styles.inviteCopyText, copied && { color: '#259E56' }]}>
                      {copied ? 'Copied!' : 'Copy'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.renameModalActions}>
                  <TouchableOpacity
                    style={[styles.renameModalSaveBtn, styles.renameModalSaveBtnEnabled]}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.renameModalSaveText, styles.renameModalSaveTextEnabled]}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------
// POD OVERVIEW SHEET (Figma Node: 515-3628 / 515-3749)
// ----------------------------------------------------
export const PodOverviewSheet = ({ 
  activePod, 
  members,
  onClose,
  onSelectMember,
  onUpdatePodName,
  onUpdatePodType,
  onRemovePea,
  onLeavePod,
  onDeletePod,
  onOpenNotifications,
  variant = 'auto',
}: { 
  activePod: typeof MOCK_PODS[0], 
  members?: PeaData[],
  onClose: () => void,
  onSelectMember?: (pea: PeaData) => void,
  onUpdatePodName?: (newName: string) => void,
  onUpdatePodType?: (newType: string) => void,
  onRemovePea?: (peaId: string) => void,
  onLeavePod?: () => void,
  onDeletePod?: () => void,
  onOpenNotifications?: () => void,
  variant?: 'auto' | 'expanded' | 'collapsed';
}) => {
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isChangeTypeModalOpen, setIsChangeTypeModalOpen] = useState(false);
  const [peaToRemove, setPeaToRemove] = useState<PeaData | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [removedState, setRemovedState] = useState<{ podId: string; ids: string[] }>({
    podId: activePod.id,
    ids: [],
  });

  const effectiveRemovedIds = removedState.podId === activePod.id ? removedState.ids : [];
  const baseMembers = members || MOCK_MEMBERS_BY_POD[activePod.id] || MOCK_PEAS;
  const peasList = baseMembers.filter(p => !effectiveRemovedIds.includes(p.id));

  const scrollYAnim = useMemo(() => new Animated.Value(variant === 'collapsed' ? 100 : 0), [variant]);

  // 1. Avatar moves to the top first (scroll range 20 - 65)
  const compactAvatarOpacity = variant === 'collapsed'
    ? 1
    : variant === 'expanded'
    ? 0
    : scrollYAnim.interpolate({
        inputRange: [20, 65],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      });

  const compactAvatarTranslateY = variant === 'collapsed'
    ? 0
    : variant === 'expanded'
    ? 18
    : scrollYAnim.interpolate({
        inputRange: [20, 65],
        outputRange: [18, 0],
        extrapolate: 'clamp',
      });

  const compactAvatarScale = variant === 'collapsed'
    ? 1
    : variant === 'expanded'
    ? 0.75
    : scrollYAnim.interpolate({
        inputRange: [20, 65],
        outputRange: [0.75, 1],
        extrapolate: 'clamp',
      });

  // 2. Followed by the name (scroll range 60 - 110)
  const compactNameOpacity = variant === 'collapsed'
    ? 1
    : variant === 'expanded'
    ? 0
    : scrollYAnim.interpolate({
        inputRange: [60, 110],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      });

  const compactNameTranslateY = variant === 'collapsed'
    ? 0
    : variant === 'expanded'
    ? 14
    : scrollYAnim.interpolate({
        inputRange: [60, 110],
        outputRange: [14, 0],
        extrapolate: 'clamp',
      });

  // 3. Hero elements in scroll body
  const heroAvatarOpacity = variant === 'collapsed'
    ? 0
    : variant === 'expanded'
    ? 1
    : scrollYAnim.interpolate({
        inputRange: [0, 55],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

  const heroAvatarScale = variant === 'collapsed'
    ? 0.7
    : variant === 'expanded'
    ? 1
    : scrollYAnim.interpolate({
        inputRange: [0, 55],
        outputRange: [1, 0.7],
        extrapolate: 'clamp',
      });

  const heroAvatarTranslateY = variant === 'collapsed'
    ? -12
    : variant === 'expanded'
    ? 0
    : scrollYAnim.interpolate({
        inputRange: [0, 55],
        outputRange: [0, -12],
        extrapolate: 'clamp',
      });

  const heroTextOpacity = variant === 'collapsed'
    ? 0
    : variant === 'expanded'
    ? 1
    : scrollYAnim.interpolate({
        inputRange: [25, 80],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

  const heroTextTranslateY = variant === 'collapsed'
    ? -8
    : variant === 'expanded'
    ? 0
    : scrollYAnim.interpolate({
        inputRange: [25, 80],
        outputRange: [0, -8],
        extrapolate: 'clamp',
      });

  const headerBorderOpacity = variant === 'collapsed'
    ? 1
    : variant === 'expanded'
    ? 0
    : scrollYAnim.interpolate({
        inputRange: [70, 110],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      });

  return (
    <View style={styles.podOverviewContainer}>
      {/* Fixed Sticky Top Bar (WhatsApp Group Info style) */}
      <View style={styles.podOverviewStickyHeader}>
        <TouchableOpacity 
          style={styles.podOverviewBackButton} 
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.podOverviewStickyHeaderInfo} pointerEvents="box-none">
          {/* Avatar moves up to the top first */}
          <Animated.View 
            style={[
              styles.podOverviewCollapsedAvatar, 
              { 
                backgroundColor: activePod.avatarColor || '#E8F6EE',
                opacity: compactAvatarOpacity,
                transform: [
                  { translateY: compactAvatarTranslateY },
                  { scale: compactAvatarScale },
                ],
              }
            ]}
          >
            <Ionicons name="people" size={22} color={activePod.iconColor || '#259E56'} />
          </Animated.View>

          {/* Followed by the name */}
          <Animated.View 
            style={[
              styles.podOverviewCollapsedTextCol,
              {
                opacity: compactNameOpacity,
                transform: [
                  { translateY: compactNameTranslateY },
                ],
              }
            ]}
          >
            <Text style={styles.podOverviewCollapsedTitle} numberOfLines={1}>{activePod.name}</Text>
            <Text style={styles.podOverviewCollapsedSubtitle}>{activePod.type}</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.podOverviewStickyHeaderBorder, { opacity: headerBorderOpacity }]} />
      </View>

      {/* Main Unified Scroll View */}
      <Animated.ScrollView 
        style={styles.podOverviewContentScroll} 
        contentContainerStyle={styles.podOverviewContentInner}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollYAnim } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Pod Identity (Variant 1: expanded hero inside scroll flow) */}
        {variant !== 'collapsed' && (
          <View style={styles.podOverviewHeroArea}>
            <Animated.View 
              style={[
                styles.podOverviewHeroAvatar, 
                { 
                  backgroundColor: activePod.avatarColor || '#E8F6EE',
                  opacity: heroAvatarOpacity,
                  transform: [
                    { scale: heroAvatarScale },
                    { translateY: heroAvatarTranslateY },
                  ],
                }
              ]}
            >
              <Ionicons name="people" size={32} color={activePod.iconColor || '#259E56'} />
            </Animated.View>
            <Animated.View 
              style={[
                styles.podOverviewHeroTextCol,
                {
                  opacity: heroTextOpacity,
                  transform: [
                    { translateY: heroTextTranslateY },
                  ],
                }
              ]}
            >
              <Text style={styles.podOverviewHeroTitle}>{activePod.name}</Text>
              <Text style={styles.podOverviewHeroSubtitle}>{activePod.type} · {peasList.length} Peas</Text>
            </Animated.View>
          </View>
        )}

        {/* Content Area: #FFFFFF Card */}
        <View style={styles.podOverviewBodyCard}>
          {/* Peas Section */}
          <View style={styles.podOverviewSectionHeadingRow}>
            <Text style={styles.podOverviewSectionTitle}>Peas</Text>
            <Text style={styles.podOverviewMemberCount}>{peasList.length} members</Text>
          </View>

          <View style={styles.podOverviewMemberList}>
            {peasList.map((pea) => (
              <TouchableOpacity 
                key={pea.id} 
                style={styles.podOverviewMemberItem}
                activeOpacity={0.7}
                onPress={() => onSelectMember?.(pea)}
              >
                <Image source={pea.avatar} style={styles.podOverviewMemberAvatarImg} />
                <View style={styles.podOverviewMemberDetails}>
                  <Text style={styles.podOverviewMemberName}>{pea.name}</Text>
                  {pea.role && (
                    <Text style={styles.podOverviewMemberRole}>{pea.role}</Text>
                  )}
                </View>

                {/* Contextual remove action button (NOT for current user) */}
                {!pea.isCurrentUser && (
                  <TouchableOpacity
                    style={styles.podOverviewRemoveMemberBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                    onPress={(e) => {
                      e.stopPropagation();
                      setPeaToRemove(pea);
                    }}
                    accessibilityLabel={`Remove ${pea.name}`}
                  >
                    <Ionicons name="trash-outline" size={18} color="#D94A4A" />
                  </TouchableOpacity>
                )}

                <Ionicons name="chevron-forward" size={16} color="#B8B5B0" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.podOverviewInviteBtn} 
            activeOpacity={0.7}
            onPress={() => setIsInviteModalOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.podOverviewInviteText}>+ Invite Peas</Text>
          </TouchableOpacity>

          <View style={styles.podOverviewDivider} />

          {/* Manage Pod Section */}
          <Text style={styles.podOverviewManageTitle}>Manage Pod</Text>

          <View style={styles.podOverviewActionList}>
            {/* Rename Pod */}
            <TouchableOpacity 
              style={styles.podOverviewActionItem} 
              activeOpacity={0.7}
              onPress={() => setIsRenameModalOpen(true)}
            >
              <View style={styles.podOverviewActionIconBox}>
                <Ionicons name="settings-outline" size={22} color="#259E56" />
              </View>
              <Text style={styles.podOverviewActionLabel}>Rename Pod</Text>
              <Ionicons name="chevron-forward" size={16} color="#B8B5B0" />
            </TouchableOpacity>

            {/* Change Pod Type */}
            <TouchableOpacity 
              style={styles.podOverviewActionItem} 
              activeOpacity={0.7}
              onPress={() => setIsChangeTypeModalOpen(true)}
            >
              <View style={styles.podOverviewActionIconBox}>
                <Ionicons name="people-outline" size={22} color="#1A1A1A" />
              </View>
              <View style={styles.podOverviewActionTextCol}>
                <Text style={styles.podOverviewActionColLabel}>Change Pod Type</Text>
                <Text style={styles.podOverviewActionSubtext}>{activePod.type}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#B8B5B0" />
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity 
              style={styles.podOverviewActionItem} 
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onOpenNotifications?.();
              }}
            >
              <View style={styles.podOverviewActionIconBox}>
                <Ionicons name="notifications-outline" size={22} color="#1A1A1A" />
              </View>
              <Text style={styles.podOverviewActionLabel}>Notifications</Text>
              <Ionicons name="chevron-forward" size={16} color="#B8B5B0" />
            </TouchableOpacity>

            <View style={styles.podOverviewDivider} />

            {/* Leave Pod */}
            <TouchableOpacity 
              style={styles.podOverviewActionItem} 
              activeOpacity={0.7}
              onPress={() => setIsLeaveModalOpen(true)}
            >
              <View style={styles.podOverviewActionIconBox}>
                <Ionicons name="share-outline" size={22} color="#C0473B" />
              </View>
              <Text style={[styles.podOverviewActionLabel, { color: '#C0473B' }]}>Leave Pod</Text>
            </TouchableOpacity>

            {/* Delete Pod */}
            <TouchableOpacity 
              style={styles.podOverviewActionItem} 
              activeOpacity={0.7}
              onPress={() => setIsDeleteModalOpen(true)}
            >
              <View style={styles.podOverviewActionIconBox}>
                <Ionicons name="close-outline" size={24} color="#C0473B" />
              </View>
              <Text style={[styles.podOverviewActionLabel, { color: '#C0473B' }]}>Delete Pod</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Rename Pod Modal */}
      {isRenameModalOpen && (
        <RenamePodModal
          visible={isRenameModalOpen}
          currentName={activePod.name}
          onSave={(newName) => onUpdatePodName?.(newName)}
          onClose={() => setIsRenameModalOpen(false)}
        />
      )}

      {/* Change Pod Type Modal (Node: 537-1953) */}
      {isChangeTypeModalOpen && (
        <ChangePodTypeModal
          visible={isChangeTypeModalOpen}
          currentType={activePod.type}
          onSelectType={(newType) => onUpdatePodType?.(newType)}
          onClose={() => setIsChangeTypeModalOpen(false)}
        />
      )}

      {/* Remove Pea Modal (Node: 595-3333) */}
      {peaToRemove && (
        <RemovePeaModal
          visible={!!peaToRemove}
          pea={peaToRemove}
          podName={activePod.name}
          onConfirm={() => {
            if (peaToRemove) {
              setRemovedState(prev => ({
                podId: activePod.id,
                ids: prev.podId === activePod.id ? [...prev.ids, peaToRemove.id] : [peaToRemove.id],
              }));
              onRemovePea?.(peaToRemove.id);
            }
          }}
          onClose={() => setPeaToRemove(null)}
        />
      )}

      {/* Leave Pod Modal (Node: 595-3591) */}
      {isLeaveModalOpen && (
        <LeavePodModal
          visible={isLeaveModalOpen}
          podName={activePod.name}
          onConfirm={() => {
            onLeavePod?.();
            onClose();
          }}
          onClose={() => setIsLeaveModalOpen(false)}
        />
      )}

      {/* Delete Pod Modal (Node: 595-3849) */}
      {isDeleteModalOpen && (
        <DeletePodModal
          visible={isDeleteModalOpen}
          podName={activePod.name}
          onConfirm={() => {
            onDeletePod?.();
            onClose();
          }}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}

      {/* Invite Pea Modal */}
      {isInviteModalOpen && (
        <InvitePeaModal
          visible={isInviteModalOpen}
          podName={activePod.name}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  podSelectorContainer: {
    zIndex: 100,
  },
  podSelectorContainerExpanded: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  podSelectorButton: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Theme.colors.surface.glass90,
    borderRadius: 16,
    minWidth: 135,
    height: 70,
  },
  podSelectorButtonExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EAE7E0',
    width: 352,
    height: 65,
    ...Theme.effects.elevation.card,
  },
  podTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podTitleColExpanded: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  podSelectorBackdrop: {
    position: 'absolute',
    top: -1000, left: -1000, right: -1000, bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  podDropdownContainer: {
    position: 'absolute',
    top: 73,
    width: '100%',
    alignItems: 'center',
  },
  podDropdown: {
    backgroundColor: '#FAFAF5',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 5,
  },
  podDropdownActiveCard: {
    backgroundColor: '#E8F6EE',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  podDropdownActiveIndicator: {
    position: 'absolute',
    top: 16,
    left: 0,
    width: 4,
    height: 16,
    backgroundColor: '#259E56',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  podDropdownAvatarCluster: {
    flexDirection: 'row',
    marginTop: 12,
  },
  podDropdownAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#999',
    borderWidth: 2,
    borderColor: '#E8F6EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podDropdownLocationSharing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  podDropdownLocationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#259E56',
    marginRight: 6,
  },
  podDropdownViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  podDropdownList: {
    marginTop: 8,
  },
  podDropdownListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  podDropdownListAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podDropdownDivider: {
    height: 1,
    backgroundColor: '#EAEBEA',
    marginVertical: 8,
  },
  podDropdownActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 12,
  },
  podDropdownActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  podDropdownActionText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: '#1A1A1A',
  },
  podDropdownSavedPlaces: {
    width: '100%',
    marginTop: 16,
  },
  podDropdownSavedPlacesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  podDropdownSavedPlaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6EE',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(37, 158, 86, 0.15)',
  },
  podDropdownSavedPlaceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.effects.elevation.card,
  },
  podOverviewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAF8F5',
    zIndex: 200,
  },
  podOverviewStickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#FAF8F5',
    paddingTop: Platform.OS === 'web' ? 44 : 44,
    height: Platform.OS === 'web' ? 96 : 96,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  podOverviewStickyHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  podOverviewStickyHeaderBorder: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#EAE7E0',
  },
  podOverviewBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C3820',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  podOverviewCollapsedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: '#E8F6EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podOverviewCollapsedTextCol: {
    flex: 1,
    gap: 2,
  },
  podOverviewCollapsedTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  podOverviewCollapsedSubtitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#5C5A56',
    letterSpacing: -0.24,
  },
  podOverviewHeroArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 16,
    backgroundColor: '#FAF8F5',
  },
  podOverviewHeroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#E8F6EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podOverviewHeroTextCol: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  podOverviewHeroTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    lineHeight: 32,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  podOverviewHeroSubtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#5C5A56',
    textAlign: 'center',
  },
  podOverviewContentScroll: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  podOverviewContentInner: {
    paddingTop: Platform.OS === 'web' ? 96 : 96,
    paddingBottom: 60,
  },
  podOverviewBodyCard: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 650,
  },
  podOverviewSectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  podOverviewSectionTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: '#1A1A1A',
  },
  podOverviewMemberCount: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: '#96938F',
    letterSpacing: -0.24,
  },
  podOverviewMemberList: {
    gap: 8,
  },
  podOverviewMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  podOverviewRemoveMemberBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF2F2',
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podOverviewMemberAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0ECE4',
  },
  podOverviewMemberDetails: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  podOverviewMemberName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  podOverviewMemberRole: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#96938F',
    letterSpacing: -0.24,
  },
  podOverviewInviteBtn: {
    paddingVertical: 12,
    marginTop: 4,
  },
  podOverviewInviteText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: '#259E56',
  },
  podOverviewDivider: {
    height: 1,
    backgroundColor: '#EAE7E0',
    marginVertical: 20,
  },
  podOverviewManageTitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 24,
    letterSpacing: -0.48,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  podOverviewActionList: {
    gap: 4,
  },
  podOverviewActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  podOverviewActionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podOverviewActionLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
    marginLeft: 12,
    flex: 1,
  },
  podOverviewActionColLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  podOverviewActionTextCol: {
    marginLeft: 12,
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  podOverviewActionSubtext: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#96938F',
    letterSpacing: -0.24,
  },
  upNextCard: {
    backgroundColor: Theme.colors.brand.secondaryAccent,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8E4',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.effects.elevation.card,
  },
  upNextIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  upNextContent: {
    flex: 1,
    marginLeft: 14,
  },
  peaCard: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e8ece9',
    ...Theme.effects.elevation.card,
  },
  peaCardSelected: {
    borderColor: Theme.colors.brand.primary,
    borderWidth: 1.5,
  },
  peaCardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  peaCardContent: {
    marginLeft: 12,
    flex: 1,
  },
  liveInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  liveInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  paginationDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: Theme.colors.brand.primary,
  },
  detailSheet: {
    width: '100%',
    maxHeight: 576,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Theme.effects.elevation.card,
  },
  detailSheetContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailHeader: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  detailAvatarOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(37,158,86,0.12)',
    borderWidth: 2,
    borderColor: '#259E56',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAvatarInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTitleArea: {
    marginLeft: 16,
    flex: 1,
    marginRight: 40,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    marginLeft: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  etaBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F6EE',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  etaBannerTextCol: {
    flexDirection: 'column',
    gap: 2,
  },
  travelInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  travelIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F6F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaItem: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#E8EAE6',
    borderRadius: 12,
    padding: 12,
  },
  metaValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  savedPlaces: {
    marginTop: 0,
    marginBottom: 20,
  },
  savedPlaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  savedPlaceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F6F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabBarContainer: {
    backgroundColor: '#FFF',
    width: '100%',
    shadowColor: '#34443A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  bottomTabBar: {
    flexDirection: 'row',
    height: 64, // Exact height of items area
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 7,
  },
  tabItem: {
    flex: 1,
    maxWidth: 100,
    minWidth: 50,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 3,
  },
  tabIconContainer: {
    height: 30,
    width: '100%', // w-full
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  tabIconActiveContainer: {
    height: 30,
    width: '100%', // w-full
    backgroundColor: '#e4f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  safeAreaIndicator: {
    height: 18,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 126,
    height: 4,
    backgroundColor: '#111',
    borderRadius: 999,
  },
  renameModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  renameModalKeyboardAvoid: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  renameModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  renameModalHeader: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  renameModalTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    lineHeight: 28,
    color: '#1A1A1A',
  },
  renameModalDismissBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  renameModalBody: {
    backgroundColor: '#FFF',
    padding: 20,
    gap: 20,
  },
  renameModalField: {
    gap: 8,
  },
  renameModalLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  renameModalInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    borderRadius: 16,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: '#1A1A1A',
  },
  renameModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  renameModalCancelBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    borderRadius: 22,
    minHeight: 44,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameModalCancelText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: '#1A1A1A',
  },
  renameModalSaveBtn: {
    flex: 1,
    borderRadius: 22,
    minHeight: 44,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameModalSaveBtnEnabled: {
    backgroundColor: '#259E56',
  },
  renameModalSaveBtnDisabled: {
    backgroundColor: '#EAE7E0',
  },
  renameModalSaveText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
  },
  renameModalSaveTextEnabled: {
    color: '#FFFFFF',
  },
  renameModalSaveTextDisabled: {
    color: '#96938F',
  },
  changeTypeModalBody: {
    backgroundColor: '#FFF',
    padding: 24,
    gap: 8,
  },
  podTypeOption: {
    backgroundColor: '#FAF8F5',
    borderRadius: 16,
    minHeight: 60,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  podTypeOptionSelected: {
    backgroundColor: '#E8F6EE',
  },
  podTypeIconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podTypeOptionLabel: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  podTypeSelectedBadge: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.24,
    color: '#259E56',
  },
  confirmModalBody: {
    backgroundColor: '#FFF',
    padding: 24,
    gap: 20,
  },
  confirmModalIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 4,
  },
  confirmModalAvatarOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#E8F6EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  confirmModalIdentityName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  confirmModalDescription: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#5C5A56',
  },
  confirmModalCancelBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    borderRadius: 22,
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalCancelText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  confirmModalDangerBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DADFDC',
    borderRadius: 22,
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalDangerText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: '#C0473B',
  },
  typePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typePillSelected: {
    backgroundColor: '#E8F6EE',
    borderColor: '#259E56',
  },
  typePillText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: '#666',
  },
  typePillTextSelected: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#259E56',
  },
  inviteCodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
  },
  inviteCodeText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: '#1A1A1A',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  inviteCopyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  inviteCopyText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: '#1A1A1A',
  },
});
