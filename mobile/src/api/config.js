/**
 * API Configuration
 * 1. Change BASE_URL to your machine's local IP (e.g. 192.168.xxx.xxx) when running on a physical device.
 * 2. If using IPv6, ensure the address is enclosed in square brackets.
 *
 * Examples:
 *   - IPv4: "http://192.168.1.100:8001"
 *   - IPv6: "http://[fe80::...]:8001"
 *
 * For emulator/simulator use:
 *   Android emulator → "http://10.0.2.2:8001"
 *   iOS simulator    → "http://127.0.0.1:8001"
 */
export const BASE_URL = "https://parcel-damage-classification-d8so.onrender.com"; // Render Backend URL

export const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/api/auth/login`,

  // Predict
  UPLOAD: `${BASE_URL}/api/predict/upload`,
  HEALTH: `${BASE_URL}/api/predict/health`,

  // Admin
  ADMIN_LOGIN: `${BASE_URL}/api/admin/login`,
  ADMIN_USERS: `${BASE_URL}/api/admin/users`,
  ACTIVATE_USER: (id) => `${BASE_URL}/api/admin/users/${id}/activate`,
  ADMIN_HOME: `${BASE_URL}/api/admin/home`,
};
