"use client";

import React, { createContext, useContext, useReducer, useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDiscover } from '@/hooks/useDiscover';
import { useDiscoverItems } from '@/hooks/useDiscoverItems';
import { useDiscoverFoundations } from '@/hooks/useDiscoverFoundations';
import { useGeolocation } from '@/hooks/useGeolocation';
import { FoundationPublicStorefront } from '@/types/foundation';

// --- Tipos de Estado ---
type ViewMode = 'MAP' | 'GRID';
type SearchType = 'STORE' | 'SERVICE' | 'PACKAGE' | 'PRODUCT' | 'COURSE' | 'FOUNDATION';

interface DiscoverState {
  map: google.maps.Map | null;
  searchQuery: string;
  searchType: SearchType;
  viewMode: ViewMode;
  selectedId: number | null;
  hoveredId: number | null;
  isFiltersOpen: boolean;
  isMapImmersive: boolean;
}

// --- Acciones del Reducer ---
type Action =
  | { type: 'SET_MAP'; payload: google.maps.Map | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_TYPE'; payload: SearchType }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SELECTED_ID'; payload: number | null }
  | { type: 'SET_HOVERED_ID'; payload: number | null }
  | { type: 'SET_FILTERS_OPEN'; payload: boolean }
  | { type: 'SET_MAP_IMMERSIVE'; payload: boolean };

const initialState: DiscoverState = {
  map: null,
  searchQuery: '',
  searchType: 'STORE',
  viewMode: 'MAP',
  selectedId: null,
  hoveredId: null,
  isFiltersOpen: false,
  isMapImmersive: false,
};

function discoverReducer(state: DiscoverState, action: Action): DiscoverState {
  switch (action.type) {
    case 'SET_MAP': return { ...state, map: action.payload };
    case 'SET_SEARCH_QUERY': return { ...state, searchQuery: action.payload };
    case 'SET_SEARCH_TYPE': return { ...state, searchType: action.payload, selectedId: null, hoveredId: null };
    case 'SET_VIEW_MODE': return { ...state, viewMode: action.payload };
    case 'SET_SELECTED_ID': return { ...state, selectedId: action.payload };
    case 'SET_HOVERED_ID': return { ...state, hoveredId: action.payload };
    case 'SET_FILTERS_OPEN': return { ...state, isFiltersOpen: action.payload };
    case 'SET_MAP_IMMERSIVE': return { ...state, isMapImmersive: action.payload };
    default: return state;
  }
}

// --- Interfaz del Contexto ---
interface DiscoverContextProps extends DiscoverState {
  setMap: (map: google.maps.Map | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchType: (type: SearchType) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedId: (id: number | null) => void;
  setHoveredId: (id: number | null) => void;
  setIsFiltersOpen: (isOpen: boolean) => void;
  setIsMapImmersive: (isImmersive: boolean) => void;
  
  providers: any[];
  items: any[];
  foundations: FoundationPublicStorefront[];
  isLoading: boolean;
  isValidating: boolean;
  isLoadingMore: boolean;
  isReachingEnd: boolean;
  loadMore: () => void;
  
  coordinates: { lat: number; lng: number } | null;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number | undefined;
  isGeoLoading: boolean;
  geoError: string | null;
  locationDeclined: boolean;
  setLocationDeclined: (declined: boolean) => void;
  showSuccess: boolean;
  requestLocation: () => void;
}

const DiscoverContext = createContext<DiscoverContextProps | undefined>(undefined);

export const DiscoverProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [state, dispatch] = useReducer(discoverReducer, {
    ...initialState,
    searchQuery: searchParams.get('q') || searchParams.get('provider') || '',
    searchType: (searchParams.get('type') as SearchType) || 'STORE',
  });

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(state.searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(state.searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [state.searchQuery]);

  const handleSetSearchType = (type: SearchType) => {
    dispatch({ type: 'SET_SEARCH_TYPE', payload: type });
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', type);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const {
    coordinates,
    calculateDistance,
    isLoading: isGeoLoading,
    error: geoError,
    requestLocation,
  } = useGeolocation();

  const [locationDeclined, setLocationDeclinedState] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Restaurar preferencia guardada en sesión tras montar en cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const declined = sessionStorage.getItem('quhealthy_location_declined') === 'true';
      if (declined) {
        setLocationDeclinedState(true);
      }
    }
  }, []);

  const setLocationDeclined = useCallback((val: boolean) => {
    setLocationDeclinedState(val);
    if (typeof window !== 'undefined') {
      if (val) {
        sessionStorage.setItem('quhealthy_location_declined', 'true');
      } else {
        sessionStorage.removeItem('quhealthy_location_declined');
      }
    }
  }, []);

  const handleRequestLocation = useCallback(() => {
    requestLocation(
      () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
      },
      () => {
        // En caso de denegación o fallo, geoError se propaga automáticamente
      }
    );
  }, [requestLocation]);

  const isFoundation = state.searchType === 'FOUNDATION';
  const isStore = state.searchType === 'STORE';

  // Cargar siempre proveedores y fundaciones con coordenadas reactivas
  const { 
    providers, 
    isLoading: isLoadingProviders, 
    isValidating: isValidatingProviders,
    size: providerSize,
    setSize: setProviderSize,
    isReachingEnd: isReachingEndProviders,
    isLoadingMore: isLoadingMoreProviders
  } = useDiscover(
    debouncedSearchQuery, 
    isFoundation ? 'STORE' : state.searchType,
    coordinates,
    isGeoLoading
  );

  const {
    items,
    isLoading: isLoadingItems,
    isValidating: isValidatingItems,
    size: itemSize,
    setSize: setItemSize,
    isReachingEnd: isReachingEndItems,
    isLoadingMore: isLoadingMoreItems
  } = useDiscoverItems({
    q: debouncedSearchQuery,
    type: isFoundation ? 'STORE' : state.searchType,
    lat: coordinates?.lat,
    lng: coordinates?.lng,
    isGeoLoading,
  });

  const {
    foundations,
    isLoading: isLoadingFoundations,
    isValidating: isValidatingFoundations,
  } = useDiscoverFoundations(debouncedSearchQuery, true);

  const isLoading = isFoundation
    ? !!isLoadingFoundations
    : isStore
    ? !!isLoadingProviders
    : !!isLoadingItems;

  const isValidating = isFoundation
    ? !!isValidatingFoundations
    : isStore
    ? !!isValidatingProviders
    : !!isValidatingItems;

  const isLoadingMore = isFoundation
    ? false
    : isStore
    ? !!isLoadingMoreProviders
    : !!isLoadingMoreItems;

  const isReachingEnd = isFoundation
    ? true
    : isStore
    ? !!isReachingEndProviders
    : !!isReachingEndItems;

  const loadMore = () => {
    if (isStore) {
      setProviderSize(providerSize + 1);
    } else if (!isFoundation) {
      setItemSize(itemSize + 1);
    }
  };

  const contextValue = useMemo(() => ({
    ...state,
    setMap: (map: google.maps.Map | null) => dispatch({ type: 'SET_MAP', payload: map }),
    setSearchQuery: (q: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: q }),
    setSearchType: handleSetSearchType,
    setViewMode: (mode: ViewMode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode }),
    setSelectedId: (id: number | null) => dispatch({ type: 'SET_SELECTED_ID', payload: id }),
    setHoveredId: (id: number | null) => dispatch({ type: 'SET_HOVERED_ID', payload: id }),
    setIsFiltersOpen: (open: boolean) => dispatch({ type: 'SET_FILTERS_OPEN', payload: open }),
    setIsMapImmersive: (immersive: boolean) => dispatch({ type: 'SET_MAP_IMMERSIVE', payload: immersive }),
    
    providers,
    items,
    foundations,
    isLoading,
    isValidating,
    isLoadingMore,
    isReachingEnd,
    loadMore,
    
    coordinates,
    calculateDistance,
    isGeoLoading,
    geoError,
    locationDeclined,
    setLocationDeclined,
    showSuccess,
    requestLocation: handleRequestLocation,
  }), [
    state,
    providers,
    items,
    foundations,
    isLoading,
    isValidating,
    isLoadingMore,
    isReachingEnd,
    coordinates,
    calculateDistance,
    isGeoLoading,
    geoError,
    locationDeclined,
    setLocationDeclined,
    showSuccess,
    handleRequestLocation,
  ]);

  return (
    <DiscoverContext.Provider value={contextValue}>
      {children}
    </DiscoverContext.Provider>
  );
};

export const useDiscoverContext = () => {
  const context = useContext(DiscoverContext);
  if (context === undefined) {
    throw new Error('useDiscoverContext must be used within a DiscoverProvider');
  }
  return context;
};
