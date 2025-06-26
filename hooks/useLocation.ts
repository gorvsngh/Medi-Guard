'use client';

import { useState, useCallback } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  permissionState: PermissionState | null;
}

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useLocation(options: UseLocationOptions = {}) {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    permissionState: null,
  });

  const {
    enableHighAccuracy = true,
    timeout = 10000, // 10 seconds
    maximumAge = 60000, // 1 minute
  } = options;

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by this browser';
      setState(prev => ({ ...prev, error, loading: false }));
      throw new Error(error);
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check permission first
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permissionState: permission.state }));

        if (permission.state === 'denied') {
          const error = 'Location access denied. Please enable location services for emergency alerts.';
          setState(prev => ({ ...prev, error, loading: false }));
          throw new Error(error);
        }
      }

      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy,
            timeout,
            maximumAge,
          }
        );
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };

      setState(prev => ({
        ...prev,
        location: locationData,
        loading: false,
        error: null,
      }));

      return locationData;
    } catch (error: any) {
      let errorMessage = 'Failed to get location';

      if (error.code) {
        switch (error.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services for emergency alerts.';
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your device settings.';
            break;
          case GeolocationPositionError.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  }, [enableHighAccuracy, timeout, maximumAge]);

  const watchLocation = useCallback((
    onLocationUpdate: (location: LocationData) => void,
    onError?: (error: string) => void
  ): (() => void) => {
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by this browser';
      setState(prev => ({ ...prev, error }));
      onError?.(error);
      return () => {};
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        setState(prev => ({
          ...prev,
          location: locationData,
          loading: false,
          error: null,
        }));

        onLocationUpdate(locationData);
      },
      (error) => {
        let errorMessage = 'Failed to watch location';

        switch (error.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            errorMessage = 'Location access denied';
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case GeolocationPositionError.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        onError?.(errorMessage);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );

    // Return cleanup function
    return () => {
      navigator.geolocation.clearWatch(watchId);
      setState(prev => ({ ...prev, loading: false }));
    };
  }, [enableHighAccuracy, timeout, maximumAge]);

  const clearLocation = useCallback(() => {
    setState({
      location: null,
      loading: false,
      error: null,
      permissionState: null,
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      return false;
    }

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permissionState: permission.state }));
        return permission.state === 'granted';
      }

      // Fallback: try to get location to trigger permission request
      await getCurrentLocation();
      return true;
    } catch {
      return false;
    }
  }, [getCurrentLocation]);

  return {
    ...state,
    getCurrentLocation,
    watchLocation,
    clearLocation,
    requestPermission,
    isLocationAvailable: !!state.location,
    hasPermission: state.permissionState === 'granted',
  };
} 