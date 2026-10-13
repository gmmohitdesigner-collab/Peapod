/**
 * ASSET REGISTRY
 * 
 * Centralized registry for all static assets (images, icons, avatars).
 * Use this module instead of hardcoding 'require()' paths throughout the app.
 * 
 * NOTE ON FIGMA IMPORTS:
 * Due to limitations in the Figma MCP Dev Mode server, original SVG/PNG files 
 * could not be directly downloaded to the filesystem. The following structure 
 * reflects the complete asset inventory found in the Figma file.
 * You will need to manually export these from Figma Desktop into their respective folders.
 */

// AVATARS (Node ID: 500:698 "People/Avatar")
export const Avatars = {
  // portraitOriginal: require('../../assets/avatars/portrait_original.png'), // Node ID: 288:79
  // portrait1: require('../../assets/avatars/portrait_1.png'), // Node ID: 500:695
  // portrait2: require('../../assets/avatars/portrait_2.png'), // Node ID: 500:696
  // portrait3: require('../../assets/avatars/portrait_3.png'), // Node ID: 500:697
};

// ICONS (Node ID: 238:93 "peapod-icon")
export const Icons = {
  /*
  // Navigation & Core
  home: require('../../assets/icons/home.svg'), // 238:2
  location: require('../../assets/icons/location.svg'), // 238:5
  bell: require('../../assets/icons/bell.svg'), // 238:8
  person: require('../../assets/icons/person.svg'), // 238:11
  group: require('../../assets/icons/group.svg'), // 238:14
  settings: require('../../assets/icons/settings.svg'), // 238:26
  search: require('../../assets/icons/search.svg'), // 238:38
  navigation: require('../../assets/icons/navigation.svg'), // 238:44
  
  // Actions
  heart: require('../../assets/icons/heart.svg'), // 238:17
  calendar: require('../../assets/icons/calendar.svg'), // 238:20
  clock: require('../../assets/icons/clock.svg'), // 238:23
  share: require('../../assets/icons/share.svg'), // 238:29
  link: require('../../assets/icons/link.svg'), // 238:32
  add: require('../../assets/icons/add.svg'), // 238:35
  star: require('../../assets/icons/star.svg'), // 238:41
  chat: require('../../assets/icons/chat.svg'), // 238:47
  close: require('../../assets/icons/close.svg'), // 368:23
  
  // Transit & Activity
  walking: require('../../assets/icons/walking.svg'), // 238:50
  running: require('../../assets/icons/running.svg'), // 238:53
  cycling: require('../../assets/icons/cycling.svg'), // 238:56
  driving: require('../../assets/icons/driving.svg'), // 238:59
  flying: require('../../assets/icons/flying.svg'), // 238:62
  train: require('../../assets/icons/train.svg'), // 238:65
  boat: require('../../assets/icons/boat.svg'), // 238:68
  motorcycle: require('../../assets/icons/motorcycle.svg'), // 238:71
  swimming: require('../../assets/icons/swimming.svg'), // 238:74
  hiking: require('../../assets/icons/hiking.svg'), // 238:79
  beach: require('../../assets/icons/beach.svg'), // 238:82
  scooter: require('../../assets/icons/scooter.svg'), // 238:90
  
  // Status Meta
  battery: require('../../assets/icons/battery.svg'), // 392:108
  network: require('../../assets/icons/network.svg'), // 392:112
  distanceApart: require('../../assets/icons/distance-apart.svg'), // 392:116
  */
};

// IMAGES & MAPS
export const Images = {
  mapBackground: require('../../assets/images/map_background.jpg'), // Already implemented placeholder
};

export const Assets = {
  Avatars,
  Icons,
  Images,
};
