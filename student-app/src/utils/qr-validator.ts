/**
 * QR Code validation utilities
 * Validates QR codes for GCTU Smart Attendance
 */

export interface QRCodeData {
  token: string;
  courseId: string;
  courseCode: string;
  courseName?: string;
  lat?: number;
  lng?: number;
  lecturerAccuracy?: number;
  radius?: number;
}

export interface QRValidationResult {
  valid: boolean;
  data?: QRCodeData;
  error?: string;
}

/**
 * Validate QR code data structure and format
 * @param rawData Raw string from QR code
 * @returns Validation result with parsed data or error
 */
export function validateQRCode(rawData: string): QRValidationResult {
  // Step 1: Try to parse JSON
  let parsed: any;
  try {
    parsed = JSON.parse(rawData);
  } catch (error) {
    return {
      valid: false,
      error: 'Could not read QR code. Please try again.',
    };
  }

  // Step 2: Check if it's a GCTU Smart Attendance QR code
  if (!parsed.token || typeof parsed.token !== 'string') {
    return {
      valid: false,
      error: 'This QR code is not from GCTU Smart Attendance',
    };
  }

  // Step 3: Validate token format (must start with "SA-")
  if (!parsed.token.startsWith('SA-')) {
    return {
      valid: false,
      error: 'Invalid attendance session token',
    };
  }

  // Step 4: Check required fields
  if (!parsed.courseId || typeof parsed.courseId !== 'string') {
    return {
      valid: false,
      error: 'QR code is missing course information',
    };
  }

  if (!parsed.courseCode || typeof parsed.courseCode !== 'string') {
    return {
      valid: false,
      error: 'QR code is missing course code',
    };
  }

  // Step 5: Validate GPS data if present
  if (parsed.lat !== undefined && parsed.lng !== undefined) {
    if (
      typeof parsed.lat !== 'number' ||
      typeof parsed.lng !== 'number' ||
      isNaN(parsed.lat) ||
      isNaN(parsed.lng)
    ) {
      return {
        valid: false,
        error: 'QR code has invalid GPS coordinates',
      };
    }

    // Validate latitude/longitude ranges
    if (parsed.lat < -90 || parsed.lat > 90) {
      return {
        valid: false,
        error: 'QR code has invalid latitude',
      };
    }

    if (parsed.lng < -180 || parsed.lng > 180) {
      return {
        valid: false,
        error: 'QR code has invalid longitude',
      };
    }
  }

  // Step 6: Validate radius if present
  if (parsed.radius !== undefined) {
    if (typeof parsed.radius !== 'number' || isNaN(parsed.radius) || parsed.radius <= 0) {
      return {
        valid: false,
        error: 'QR code has invalid geofence radius',
      };
    }
  }

  // Step 7: Validate lecturer accuracy if present
  if (parsed.lecturerAccuracy !== undefined) {
    if (
      typeof parsed.lecturerAccuracy !== 'number' ||
      isNaN(parsed.lecturerAccuracy) ||
      parsed.lecturerAccuracy < 0
    ) {
      return {
        valid: false,
        error: 'QR code has invalid GPS accuracy data',
      };
    }
  }

  // All validations passed
  const data: QRCodeData = {
    token: parsed.token,
    courseId: parsed.courseId,
    courseCode: parsed.courseCode,
    courseName: parsed.courseName,
    lat: parsed.lat,
    lng: parsed.lng,
    lecturerAccuracy: parsed.lecturerAccuracy,
    radius: parsed.radius || 50, // Default to 50m if not specified
  };

  return {
    valid: true,
    data,
  };
}

/**
 * Get user-friendly error message for common QR code issues
 * @param error Error message from validation
 * @returns User-friendly error message
 */
export function getFriendlyErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    'Could not read QR code': 'The QR code could not be read. Please ensure it\'s clearly visible and try again.',
    'not from GCTU Smart Attendance': 'This QR code is not for GCTU Smart Attendance. Please scan the code displayed by your lecturer.',
    'Invalid attendance session': 'This QR code has an invalid format. Please ask your lecturer to generate a new code.',
    'missing course information': 'This QR code is incomplete. Please ask your lecturer to generate a new code.',
    'invalid GPS': 'This QR code has corrupted GPS data. Please ask your lecturer to generate a new code.',
  };

  for (const [key, message] of Object.entries(errorMap)) {
    if (error.includes(key)) {
      return message;
    }
  }

  return error;
}

/**
 * Check if QR code has GPS data for geofence verification
 * @param data QR code data
 * @returns true if GPS data is present
 */
export function hasGPSData(data: QRCodeData): boolean {
  return (
    data.lat !== undefined &&
    data.lng !== undefined &&
    data.lecturerAccuracy !== undefined &&
    data.radius !== undefined
  );
}

/**
 * Format QR code data for display
 * @param data QR code data
 * @returns Formatted string for logging/debugging
 */
export function formatQRCodeData(data: QRCodeData): string {
  return JSON.stringify(
    {
      token: data.token.substring(0, 10) + '...',
      courseCode: data.courseCode,
      courseName: data.courseName,
      hasGPS: hasGPSData(data),
    },
    null,
    2
  );
}
