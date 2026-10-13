export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface MapRegion extends Coordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * Stable mock geographic coordinates for each member across different pods.
 * Based around Singapore (matching the textual addresses in the mock data).
 */
export const MOCK_POD_COORDINATES: Record<string, Record<string, Coordinate>> = {
  // Pod 1: The Weekend Crew (Central Singapore / Orchard / Bugis / Somerset)
  pod1: {
    '1': { latitude: 1.3048, longitude: 103.8318 }, // Le Wen (Home - Orchard)
    '2': { latitude: 1.3072, longitude: 103.8285 }, // Srishti (Home - Claymore)
    '3': { latitude: 1.2975, longitude: 103.8543 }, // Edwin (Library - Bugis)
    '4': { latitude: 1.3010, longitude: 103.8384 }, // Nikkee (Somerset - 313)
  },
  // Pod 2: Family (Orchard / Chinatown Market / Kallang Sports Hub)
  pod2: {
    '1': { latitude: 1.3048, longitude: 103.8318 }, // Le Wen (Home - Orchard)
    '2': { latitude: 1.2847, longitude: 103.8322 }, // Srishti (Market - Chinatown)
    '3': { latitude: 1.3032, longitude: 103.8749 }, // Edwin (Sports Hub - Kallang)
  },
  // Pod 3: Design Buddies (Ayer Rajah / Tanjong Pagar / Robertson Quay)
  pod3: {
    '1': { latitude: 1.2982, longitude: 103.7876 }, // Le Wen (Design Lab - One-North)
    '4': { latitude: 1.2741, longitude: 103.8447 }, // Nikkee (Agency Office - Anson)
    '3': { latitude: 1.2917, longitude: 103.8378 }, // Edwin (Common Man Coffee - Martin Rd)
  },
};

/**
 * Initial framing regions for each pod.
 */
export const MOCK_POD_INITIAL_REGIONS: Record<string, MapRegion> = {
  pod1: {
    latitude: 1.3026,
    longitude: 103.8382,
    latitudeDelta: 0.024,
    longitudeDelta: 0.038,
  },
  pod2: {
    latitude: 1.2976,
    longitude: 103.8463,
    latitudeDelta: 0.048,
    longitudeDelta: 0.068,
  },
  pod3: {
    latitude: 1.2880,
    longitude: 103.8162,
    latitudeDelta: 0.052,
    longitudeDelta: 0.082,
  },
};

export const DEFAULT_MAP_REGION: MapRegion = MOCK_POD_INITIAL_REGIONS.pod1;

/**
 * Helper to fetch a Pea's coordinate safely with fallback.
 */
export function getPeaCoordinate(podId: string, peaId: string): Coordinate {
  const podCoords = MOCK_POD_COORDINATES[podId];
  if (podCoords && podCoords[peaId]) {
    return podCoords[peaId];
  }
  // Fallback to Singapore central coordinate with deterministic jitter if not found
  const numericId = parseInt(peaId, 10) || 1;
  return {
    latitude: 1.3020 + (numericId * 0.004),
    longitude: 103.8350 + (numericId * 0.005),
  };
}

/**
 * Helper to get all coordinates for a pod's members.
 */
export function getPodCoordinates(podId: string, memberIds: string[]): Coordinate[] {
  return memberIds.map(id => getPeaCoordinate(podId, id));
}

/**
 * Helper to get the initial region for a pod.
 */
export function getPodInitialRegion(podId: string): MapRegion {
  return MOCK_POD_INITIAL_REGIONS[podId] || DEFAULT_MAP_REGION;
}
