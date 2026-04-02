import axios from "axios";
import { ENDPOINTS } from "./config";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerUser = async (userData) => {
  const response = await axios.post(ENDPOINTS.REGISTER, userData, {
    headers: { "Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true" },
  });
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(ENDPOINTS.LOGIN, credentials, {
    headers: { "Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true" },
  });
  return response.data;
};

// ─── Predict ─────────────────────────────────────────────────────────────────

export const uploadImageForPrediction = async (imageUri) => {
  const formData = new FormData();
  const filename = imageUri.split("/").pop();
  const ext = filename.split(".").pop().toLowerCase();
  const mimeType =
    ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "png"
        ? "image/png"
        : "image/webp";

  formData.append("file", {
    uri: imageUri,
    name: filename,
    type: mimeType,
  });

  try {
    const response = await fetch(ENDPOINTS.UPLOAD, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw { response: { data } };
    }
    return data;
  } catch (err) {
    throw err;
  }
};

export const checkHealth = async () => {
  const response = await axios.get(ENDPOINTS.HEALTH, { headers: { "Bypass-Tunnel-Reminder": "true" } });
  return response.data;
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminLogin = async (credentials) => {
  const response = await axios.post(ENDPOINTS.ADMIN_LOGIN, credentials, {
    headers: { "Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true" },
  });
  return response.data;
};

export const getRegisteredUsers = async () => {
  const response = await axios.get(ENDPOINTS.ADMIN_USERS, { headers: { "Bypass-Tunnel-Reminder": "true" } });
  return response.data;
};

export const activateUser = async (userId) => {
  const response = await axios.put(ENDPOINTS.ACTIVATE_USER(userId), {}, { headers: { "Bypass-Tunnel-Reminder": "true" } });
  return response.data;
};

export const getAdminHome = async () => {
  const response = await axios.get(ENDPOINTS.ADMIN_HOME, { headers: { "Bypass-Tunnel-Reminder": "true" } });
  return response.data;
};
6