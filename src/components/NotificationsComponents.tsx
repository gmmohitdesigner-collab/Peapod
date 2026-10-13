import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  StatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G } from 'react-native-svg';

export const STATUS_BAR_SAFE_SPACE = Platform.OS === 'android'
  ? (StatusBar.currentHeight ? Math.max(StatusBar.currentHeight, 36) : 44)
  : (Platform.OS === 'web' ? 58 : 50);

// ----------------------------------------------------
// TYPES & DATA (Figma Nodes: 377-1334, 369-1189, 371-1252)
// ----------------------------------------------------
export type NotificationType = 'pod_activity' | 'system' | 'security' | 'calendar' | 'member';

export type NotificationItemState = 'Unread' | 'Read' | 'State3' | 'State4';

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  time: string;
  isRead: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const MOCK_NOTIFICATIONS: NotificationData[] = [
  // Unread items (Figma Node: 377-1334 & 369-1189)
  {
    id: 'n1',
    type: 'pod_activity',
    iconName: 'people',
    title: 'New activity in your Pod: Sarah shared a photo.',
    time: '2m ago',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'system',
    iconName: 'settings-outline',
    title: 'System update: PEAPOD maintenance completed successfully.',
    time: '8m ago',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'security',
    iconName: 'notifications-outline',
    title: 'New login detected from a device near San Francisco.',
    time: '18m ago',
    isRead: false,
  },
  // Earlier items (Figma Node: 377-1334)
  {
    id: 'n4',
    type: 'pod_activity',
    iconName: 'people',
    title: 'Weekly Pod summary: 12 new posts and 3 comments.',
    time: '1h ago',
    isRead: true,
  },
  {
    id: 'n5',
    type: 'calendar',
    iconName: 'calendar-outline',
    title: 'Reminder: your PEAPOD subscription renews in 3 days.',
    time: '2h ago',
    isRead: true,
  },
  {
    id: 'n6',
    type: 'security',
    iconName: 'notifications-outline',
    title: 'Security check: your account is secure.',
    time: 'Yesterday',
    isRead: true,
  },
];

// ----------------------------------------------------
// 1. NOTIFICATIONS ITEM (Figma Node: 371-1252)
// ----------------------------------------------------
export interface NotificationsItemProps {
  message?: string;
  timestamp?: string;
  state?: NotificationItemState;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  onDelete?: () => void;
  style?: any;
}

export const NotificationsItem = ({
  message = 'You have a new update in PEAPOD.',
  timestamp = '2m ago',
  state = 'Unread',
  iconName = 'notifications-outline',
  onPress,
  onDelete,
  style,
}: NotificationsItemProps) => {
  const isUnread = state === 'Unread' || state === 'State3';
  const defaultIcon: keyof typeof Ionicons.glyphMap = iconName || 'notifications-outline';

  const [translateX] = useState(() => new Animated.Value(0));
  const [rowHeight] = useState(() => new Animated.Value(1));
  const isOpenRef = useRef(false);
  const onDeleteRef = useRef(onDelete);

  const onPressRef = useRef(onPress);
  useEffect(() => {
    onPressRef.current = onPress;
  }, [onPress]);

  useEffect(() => {
    onDeleteRef.current = onDelete;
  }, [onDelete]);

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -500,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(rowHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onDeleteRef.current?.();
    });
  };

  // eslint-disable-next-line react-hooks/refs
  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: (_, gestureState) => {
        // Yield to parent ScrollView if dragging vertically
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) < Math.abs(gestureState.dy)) return;
        const base = isOpenRef.current ? -76 : 0;
        let newX = base + gestureState.dx;
        if (newX > 0) newX = newX * 0.15; // resistance swiping right
        if (newX < -140) newX = -140 + (newX + 140) * 0.3; // resistance swiping far left
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Detect tap (negligible movement)
        if (Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6) {
          if (isOpenRef.current) {
            isOpenRef.current = false;
            Animated.spring(translateX, {
              toValue: 0,
              friction: 8,
              tension: 60,
              useNativeDriver: false,
            }).start();
          } else {
            onPressRef.current?.();
          }
          return;
        }

        const base = isOpenRef.current ? -76 : 0;
        const finalX = base + gestureState.dx;

        // Full swipe threshold (Instagram style auto-delete)
        if (finalX < -140 || gestureState.vx < -0.8) {
          handleDelete();
          return;
        }

        // Swiped past threshold -> snap open to -76px
        if (finalX < -35 || gestureState.vx < -0.3) {
          isOpenRef.current = true;
          Animated.spring(translateX, {
            toValue: -76,
            friction: 8,
            tension: 60,
            useNativeDriver: false,
          }).start();
        } else {
          // Snap back closed
          isOpenRef.current = false;
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            tension: 60,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: isOpenRef.current ? -76 : 0,
          friction: 8,
          tension: 60,
          useNativeDriver: false,
        }).start();
      },
    })
  );

  return (
    <Animated.View
      style={[
        styles.swipeItemWrapper,
        isUnread ? styles.wrapperUnread : styles.wrapperRead,
        {
          opacity: rowHeight,
          maxHeight: rowHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 120],
          }),
          transform: [{ scaleY: rowHeight }],
        },
        style,
      ]}
    >
      {/* Background Red Delete Button (Revealed on Swipe - Instagram style) */}
      <TouchableOpacity
        style={[
          styles.swipeDeleteAction,
          isUnread ? styles.deleteActionUnread : styles.deleteActionRead,
        ]}
        activeOpacity={0.8}
        onPress={handleDelete}
        accessibilityLabel="Delete notification"
      >
        <Ionicons name="close" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Foreground Sliding Card */}
      <Animated.View
        style={[
          styles.itemContainer,
          isUnread ? styles.itemUnreadBg : styles.itemReadBg,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.itemMainTouch}>
          {/* Leading visual: 40px circular white badge */}
          <View style={styles.leadingVisual}>
            <Ionicons name={defaultIcon} size={20} color="#259E56" />
          </View>

          {/* Content column */}
          <View style={styles.itemContentCol}>
            <Text
              style={isUnread ? styles.itemTitleUnread : styles.itemTitleRead}
              numberOfLines={2}
            >
              {message}
            </Text>
            <Text style={styles.itemTimestamp}>{timestamp}</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// ----------------------------------------------------
// 2. NOTIFICATION EXAMPLES (Figma Node: 369-1189)
// ----------------------------------------------------
export const NotificationExamples = () => {
  return (
    <View style={styles.examplesContainer}>
      {/* 1. Pod activity notification */}
      <NotificationsItem
        state="Unread"
        iconName="people"
        message="Maya joined The Weekend Crew."
        timestamp="5m ago"
      />

      {/* 2. System notification */}
      <NotificationsItem
        state="Read"
        iconName="settings-outline"
        message="PEAPOD maintenance is complete."
        timestamp="1h ago"
      />

      {/* 3. Login security notification */}
      <NotificationsItem
        state="Unread"
        iconName="person-outline"
        message="New login to PEAPOD on an iPhone."
        timestamp="3h ago"
      />
    </View>
  );
};

// ----------------------------------------------------
// NOTIFICATION SETTINGS ICON (Figma Node: 602:7639)
// ----------------------------------------------------
export interface NotificationSettingsIconProps {
  size?: number;
  color?: string;
}

export const NotificationSettingsIcon = ({
  size = 22,
  color = '#222222',
}: NotificationSettingsIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <G id="bell">
      <G id="vector">
        <Path
          id="Vector"
          d="M13 15.5837C8.80541 15.5837 3.66602 15.5837 3.66602 15.5837C3.48834 15.5836 3.31454 15.5318 3.16574 15.4347C3.01694 15.3376 2.89957 15.1993 2.8279 15.0367C2.75622 14.8742 2.73334 14.6943 2.76203 14.5189C2.79072 14.3435 2.86975 14.1803 2.9895 14.0491C4.20594 12.7931 5.49939 11.4574 5.49939 7.33298C5.49939 5.87417 6.07886 4.47511 7.11033 3.44357C8.1418 2.41203 9.54078 1.83252 10.9995 1.83252C12.4582 1.83252 13.8572 2.41203 14.8887 3.44357C15.9201 4.47511 16.4996 5.87417 16.4996 7.33298C16.4996 8.63994 16.6294 9.66687 16.8455 10.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          id="Vector_2"
          d="M9 19C9.16092 19.2787 9.39236 19.5101 9.67105 19.671C9.94975 19.832 10.2659 19.9167 10.5877 19.9167C10.9095 19.9167 11.2256 19.832 11.5043 19.671C11.783 19.5101 12.0145 19.2787 12.1754 19"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </G>
      <Path
        id="Vector_3"
        d="M17.4728 12.2135C17.3285 12.3508 17.2383 12.5396 17.2199 12.7428C17.2088 12.8741 17.167 13.0007 17.0993 13.1118C17.0315 13.2229 16.9392 13.3153 16.8302 13.3812C16.7211 13.4471 16.5985 13.4845 16.4727 13.4902C16.3469 13.496 16.2216 13.4699 16.1075 13.4143C15.9303 13.3304 15.7296 13.3184 15.5445 13.3807C15.3593 13.443 15.2029 13.5752 15.1056 13.7515C15.0084 13.9278 14.9772 14.1357 15.0182 14.3347C15.0592 14.5337 15.1694 14.7097 15.3274 14.8284C15.4304 14.9041 15.5145 15.0046 15.5726 15.1215C15.6307 15.2384 15.661 15.3682 15.661 15.5C15.661 15.6318 15.6307 15.7616 15.5726 15.8785C15.5145 15.9954 15.4304 16.0959 15.3274 16.1716C15.1691 16.2903 15.0587 16.4663 15.0177 16.6655C14.9766 16.8646 15.0078 17.0727 15.1051 17.2491C15.2025 17.4255 15.3591 17.5577 15.5444 17.6199C15.7298 17.6821 15.9306 17.6699 16.1078 17.5857C16.222 17.53 16.3473 17.5039 16.4731 17.5096C16.599 17.5153 16.7216 17.5527 16.8307 17.6186C16.9399 17.6845 17.0322 17.7769 17.0999 17.8881C17.1677 17.9992 17.2088 18.1258 17.2199 18.2572C17.2383 18.4604 17.3285 18.6492 17.4728 18.7865C17.6171 18.9239 17.8051 19 18.0002 19C18.1952 19 18.3832 18.9239 18.5275 18.7865C18.6718 18.6492 18.762 18.4604 18.7805 18.2572C18.7915 18.1259 18.8327 17.9993 18.9004 17.8882C18.9681 17.7771 19.0604 17.6847 19.1695 17.6188C19.2786 17.5529 19.4012 17.5155 19.527 17.5098C19.6528 17.504 19.778 17.5301 19.8922 17.5857C20.0694 17.6699 20.2702 17.6821 20.4556 17.6199C20.6409 17.5577 20.7975 17.4255 20.8949 17.2491C20.9922 17.0727 21.0234 16.8646 20.9823 16.6655C20.9413 16.4663 20.8309 16.2903 20.6726 16.1716C20.5696 16.0959 20.4855 15.9954 20.4274 15.8785C20.3693 15.7616 20.339 15.6318 20.339 15.5C20.339 15.5 20.3693 15.3682 20.4274 15.1215C20.4855 15.0046 20.5696 14.9041 20.6726 14.8284C20.8309 14.7097 20.9413 14.5337 20.9823 14.3345C21.0234 14.1354 20.9922 13.9273 20.8949 13.7509C20.7975 13.5745 20.6409 13.4423 20.4556 13.3801C20.2702 13.3179 20.0694 13.3301 19.8922 13.4143C19.778 13.4699 19.6528 13.496 19.527 13.4902C19.4012 13.4845 19.2786 13.4471 19.1695 13.3812C19.0604 13.3153 18.9681 13.2229 18.9004 13.1118C18.8327 13.0007 18.7915 12.8741 18.7805 12.7428C18.762 12.5396 18.6718 12.3508 18.5275 12.2135C18.3832 12.0761 18.1952 12 18.0002 12C17.8051 12 17.6171 12.0761 17.4728 12.2135Z"
          stroke={color}
          strokeLinecap="round"
        />
      </G>
    </Svg>
);

// ----------------------------------------------------
// 3. NOTIFICATIONS PANEL (Figma Node: 377-1334)
// ----------------------------------------------------
export interface NotificationsPanelProps {
  state?: 'Populated' | 'Empty';
  onClose?: () => void;
  onOpenSettings?: () => void;
  showUnreadSection?: boolean;
  showEarlierSection?: boolean;
  notificationsList?: NotificationData[];
  onToggleState?: () => void;
  showStateSwitcher?: boolean;
  variant?: 'card' | 'screen';
  style?: any;
  onNotificationsChange?: (items: NotificationData[]) => void;
}

export const NotificationsPanel = ({
  state = 'Populated',
  onClose,
  onOpenSettings,
  showUnreadSection = true,
  showEarlierSection = true,
  notificationsList: initialNotifications = MOCK_NOTIFICATIONS,
  onToggleState,
  showStateSwitcher = false,
  variant = 'card',
  style,
  onNotificationsChange,
}: NotificationsPanelProps) => {
  const [items, setItems] = useState<NotificationData[]>(initialNotifications);
  const [viewState, setViewState] = useState<'Populated' | 'Empty'>(state);

  const unreadItems = items.filter((item) => !item.isRead);
  const earlierItems = items.filter((item) => item.isRead);

  const isEmpty = viewState === 'Empty' || items.length === 0;

  const handleToggleRead = (id: string) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, isRead: !item.isRead } : item
      );
      onNotificationsChange?.(next);
      return next;
    });
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      onNotificationsChange?.(next);
      return next;
    });
  };

  const handleMarkAllRead = () => {
    if (unreadItems.length > 0) {
      setItems((prev) => {
        const next = prev.map((item) => ({ ...item, isRead: true }));
        onNotificationsChange?.(next);
        return next;
      });
    } else if (items.length > 0) {
      // Clear all to demonstrate empty state
      setItems([]);
      onNotificationsChange?.([]);
    } else {
      // Restore default list
      setItems(MOCK_NOTIFICATIONS);
      setViewState('Populated');
      onNotificationsChange?.(MOCK_NOTIFICATIONS);
    }
  };

  const isScreen = variant === 'screen';

  return (
    <View
      style={[
        isScreen ? styles.panelScreenOverlay : styles.panelCardModal,
        style,
      ]}
    >
      {/* Header (Figma Node: 602:7636 / 602:7648) */}
      <View style={styles.panelHeader}>
        {/* Dismiss 'X' Button */}
        <TouchableOpacity
          style={styles.panelHeaderIconBtn}
          activeOpacity={0.7}
          onPress={onClose}
        >
          <Ionicons name="close" size={22} color="#222" />
        </TouchableOpacity>

        {/* Title: 24px Playfair Display Bold */}
        <Text style={styles.panelTitle}>Notifications</Text>

        {/* Notification Settings Button (Figma Node: 602:7639) */}
        <TouchableOpacity
          style={styles.panelHeaderIconBtn}
          activeOpacity={0.7}
          onPress={() => {
            if (onOpenSettings) {
              onOpenSettings();
            } else if (onToggleState) {
              onToggleState();
            } else {
              setViewState(prev => (prev === 'Populated' ? 'Empty' : 'Populated'));
            }
          }}
          accessibilityLabel="Notification settings"
        >
          <NotificationSettingsIcon size={22} color="#222222" />
        </TouchableOpacity>
      </View>

      {/* State Mode Switcher Pill (Optional helper) */}
      {showStateSwitcher && (
        <View style={styles.stateSelectorBar}>
          <TouchableOpacity
            style={[
              styles.stateSelectorPill,
              !isEmpty && styles.stateSelectorPillActive,
            ]}
            onPress={() => {
              if (items.length === 0) setItems(MOCK_NOTIFICATIONS);
              setViewState('Populated');
            }}
          >
            <Text
              style={[
                styles.stateSelectorText,
                !isEmpty && styles.stateSelectorTextActive,
              ]}
            >
              Populated ({items.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.stateSelectorPill,
              isEmpty && styles.stateSelectorPillActive,
            ]}
            onPress={() => setViewState('Empty')}
          >
            <Text
              style={[
                styles.stateSelectorText,
                isEmpty && styles.stateSelectorTextActive,
              ]}
            >
              Empty State
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content Area */}
      {!isEmpty ? (
        <ScrollView
          style={isScreen ? styles.panelScrollScreen : styles.panelScrollModal}
          contentContainerStyle={styles.panelScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Unread Section (Figma Node: 375:1256) */}
          {showUnreadSection && unreadItems.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeadingRow}>
                <Text style={styles.sectionHeadingText}>Unread</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={styles.markAllReadText}>Mark all as read</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.itemList}>
                {unreadItems.map((item) => (
                  <NotificationsItem
                    key={item.id}
                    state="Unread"
                    iconName={item.iconName}
                    message={item.title}
                    timestamp={item.time}
                    onPress={() => handleToggleRead(item.id)}
                    onDelete={() => handleDeleteItem(item.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Earlier Section (Figma Node: 375:1293) */}
          {showEarlierSection && earlierItems.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeadingText}>Earlier</Text>

              <View style={styles.itemList}>
                {earlierItems.map((item) => (
                  <NotificationsItem
                    key={item.id}
                    state="Read"
                    iconName={item.iconName}
                    message={item.title}
                    timestamp={item.time}
                    onPress={() => handleToggleRead(item.id)}
                    onDelete={() => handleDeleteItem(item.id)}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        /* Empty State (Figma Node: 377:1307) */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="notifications-outline" size={32} color="#259E56" />
          </View>
          <View style={styles.emptyMessageCol}>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>{"You're all caught up."}</Text>
          </View>
          <TouchableOpacity
            style={styles.restoreNotificationsBtn}
            onPress={() => {
              setItems(MOCK_NOTIFICATIONS);
              setViewState('Populated');
            }}
          >
            <Text style={styles.restoreNotificationsText}>Load demo notifications</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};



// ----------------------------------------------------
// 4. HOME NOTIFICATIONS OVERLAY (Figma Node: 603-7782)
// ----------------------------------------------------
export interface HomeNotificationsOverlayProps {
  visible: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
  initialState?: 'Populated' | 'Empty';
  notificationsList?: NotificationData[];
  onNotificationsChange?: (items: NotificationData[]) => void;
}

export const HomeNotificationsOverlay = ({
  visible,
  onClose,
  onOpenSettings,
  initialState = 'Populated',
  notificationsList,
  onNotificationsChange,
}: HomeNotificationsOverlayProps) => {
  const [slideAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 9,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible, slideAnim]);

  if (!visible) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.homeOverlayRoot} pointerEvents="box-none">
      {/* Top Safe Space (Where Android status bar appears) */}
      <TouchableOpacity
        style={styles.statusBarSafeSpace}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Notifications Panel anchored right under the safe space (Figma Node: 603-7782) */}
      <Animated.View
        style={[
          styles.screenPanelContainer,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <NotificationsPanel
          variant="screen"
          state={initialState}
          notificationsList={notificationsList}
          onClose={onClose}
          onOpenSettings={onOpenSettings}
          onNotificationsChange={onNotificationsChange}
        />
      </Animated.View>
    </View>
  );
};

// ----------------------------------------------------
// 5. NOTIFICATIONS MODAL (Floating modal fallback)
// ----------------------------------------------------
export interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  initialState?: 'Populated' | 'Empty';
}

export const NotificationsModal = ({
  visible,
  onClose,
  initialState = 'Populated',
}: NotificationsModalProps) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <NotificationsPanel state={initialState} onClose={onClose} />
      </View>
    </Modal>
  );
};

// ----------------------------------------------------
// STYLES
// ----------------------------------------------------
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panelCardModal: {
    width: '100%',
    maxWidth: 352,
    minWidth: 296,
    maxHeight: 692,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 8,
  },
  homeOverlayRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 150,
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  statusBarSafeSpace: {
    height: STATUS_BAR_SAFE_SPACE,
    width: '100%',
    flexShrink: 0,
  },
  screenPanelContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  panelScreenOverlay: {
    width: '100%',
    flex: 1,
    height: '100%',
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: '#EAE7E0',
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 0,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  panelScrollScreen: {
    flex: 1,
    width: '100%',
  },
  panelScrollModal: {
    maxHeight: 520,
    width: '100%',
  },
  panelScrollContent: {
    gap: 16,
    paddingBottom: Platform.OS === 'web' ? 40 : 60,
    flexGrow: 1,
    width: '100%',
  },
  swipeItemWrapper: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  wrapperUnread: {
    borderRadius: 16,
  },
  wrapperRead: {
    borderRadius: 14,
  },
  swipeDeleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 76,
    backgroundColor: '#D94A4A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteActionUnread: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  deleteActionRead: {
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  panelHeaderIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerBellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#259E56',
  },
  panelTitle: {
    flex: 1,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    lineHeight: 32,
    color: '#222',
  },
  stateSelectorBar: {
    flexDirection: 'row',
    backgroundColor: '#EAE7E0',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  stateSelectorPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 9,
  },
  stateSelectorPillActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  stateSelectorText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: '#6F6A63',
  },
  stateSelectorTextActive: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#1A1A1A',
  },
  sectionContainer: {
    gap: 12,
    width: '100%',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeadingText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: '#222',
  },
  markAllReadText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: '#259E56',
  },
  itemList: {
    gap: 12,
    width: '100%',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    zIndex: 2,
  },
  itemUnreadBg: {
    backgroundColor: '#E8F6EE',
    borderRadius: 16,
    padding: 12,
  },
  itemReadBg: {
    backgroundColor: '#FAF8F5',
    padding: 12,
    borderRadius: 14,
  },
  itemMainTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  leadingVisual: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  itemContentCol: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  itemTitleUnread: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  itemTitleRead: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  itemTimestamp: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#6F6A63',
    letterSpacing: -0.24,
  },
  emptyContainer: {
    height: 440,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F6EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessageCol: {
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
    color: '#222',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#6F6A63',
    textAlign: 'center',
  },
  restoreNotificationsBtn: {
    marginTop: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  restoreNotificationsText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: '#259E56',
  },
  examplesContainer: {
    gap: 16,
    width: 312,
  },
});
