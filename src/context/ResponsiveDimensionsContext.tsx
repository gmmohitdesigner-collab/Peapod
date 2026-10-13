import { createContext, useContext } from 'react';
import { useWindowDimensions as useRNWindowDimensions } from 'react-native';

export interface ResponsiveDimensions {
  width: number;
  height: number;
  scale?: number;
  fontScale?: number;
}

export const ResponsiveDimensionsContext = createContext<ResponsiveDimensions | null>(null);

export const ResponsiveDimensionsProvider = ResponsiveDimensionsContext.Provider;

export function useResponsiveDimensions(): ResponsiveDimensions {
  const contextDimensions = useContext(ResponsiveDimensionsContext);
  const rnDimensions = useRNWindowDimensions();
  return contextDimensions || rnDimensions;
}
