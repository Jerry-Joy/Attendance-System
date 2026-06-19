/**
 * Geofence utilities for GPS verification
 * Uses Haversine formula to calculate distance between two GPS coordinates
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param lat1 Latitude of point 1 (degrees)
 * @param lon1 Longitude of point 1 (degrees)
 * @param lat2 Latitude of point 2 (degrees)
 * @param lon2 Longitude of point 2 (degrees)
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate effective geofence radius with dynamic GPS buffer
 * @param baseRadius Base radius from QR code (e.g., 50m)
 * @param lecturerAccuracy Lecturer's GPS accuracy (meters)
 * @param studentAccuracy Student's GPS accuracy (meters)
 * @returns Effective radius in meters
 */
export function calculateEffectiveRadius(
  baseRadius: number,
  lecturerAccuracy: number,
  studentAccuracy: number
): number {
  // Calculate dynamic buffer
  const buffer = lecturerAccuracy + studentAccuracy;
  
  // Apply min/max constraints
  const constrainedBuffer = Math.max(20, Math.min(100, buffer));
  
  // Effective radius = base + buffer
  return baseRadius + constrainedBuffer;
}

/**
 * Check if student is within geofence
 * @param distance Distance from venue (meters)
 * @param effectiveRadius Effective geofence radius (meters)
 * @returns true if within geofence, false otherwise
 */
export function isWithinGeofence(distance: number, effectiveRadius: number): boolean {
  return distance <= effectiveRadius;
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "45m" or "1.2km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Validate GPS coordinates
 * @param lat Latitude
 * @param lng Longitude
 * @returns true if valid, false otherwise
 */
export function isValidCoordinate(lat: number | undefined, lng: number | undefined): boolean {
  if (lat === undefined || lng === undefined) return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

/**
 * Validate venue GPS data
 * @param venueData Venue data from QR code
 * @returns Validation result with error message if invalid
 */
export function validateVenueGPS(venueData: {
  lat?: number;
  lng?: number;
  lecturerAccuracy?: number;
  radius?: number;
}): { valid: boolean; error?: string } {
  if (!isValidCoordinate(venueData.lat, venueData.lng)) {
    return {
      valid: false,
      error: 'This session has no venue GPS coordinates',
    };
  }

  if (
    venueData.lecturerAccuracy === undefined ||
    isNaN(venueData.lecturerAccuracy) ||
    venueData.lecturerAccuracy < 0
  ) {
    return {
      valid: false,
      error: 'This session is missing lecturer GPS accuracy',
    };
  }

  if (
    venueData.radius === undefined ||
    isNaN(venueData.radius) ||
    venueData.radius <= 0
  ) {
    return {
      valid: false,
      error: 'This session has invalid geofence radius',
    };
  }

  return { valid: true };
}

/**
 * Get user-friendly geofence status message
 * @param distance Distance from venue (meters)
 * @param effectiveRadius Effective geofence radius (meters)
 * @returns Status message
 */
export function getGeofenceStatusMessage(
  distance: number,
  effectiveRadius: number
): string {
  if (distance <= effectiveRadius) {
    return `You are ${formatDistance(distance)} from the venue — Location Verified! ✓`;
  } else {
    return `You are ${formatDistance(distance)} from the venue. Required: within ${formatDistance(effectiveRadius)}`;
  }
}
