# 📦 ParcelGuard Mobile App

This is a React Native Expo application for **Parcel Damage Classification**. It connects to a FastAPI backend to provide AI-powered damage detection for parcel/animal images.

## 🚀 Features

- **User Authentication**: Secure Login & Registration.
- **Admin Activation**: New user accounts require admin approval before login.
- **AI Prediction**: Upload or capture images to detect damage (using a ResNet-34 model).
- **Admin Dashboard**: Overview of system stats and user management.
- **Modern UI**: Dark-themed, premium design with smooth animations.

## 🛠️ Setup Instructions

### 1. Backend Setup
Ensure your FastAPI backend is running:
```bash
# From the project root
uvicorn backend.main:app --reload --port 8001
```

### 2. Configure API URL
Open `mobile/src/api/config.js` and update `BASE_URL`:
- **Android Emulator**: `http://10.0.2.2:8001` (Default)
- **iOS Simulator**: `http://127.0.0.1:8001`
- **Physical Device**: `http://YOUR_LOCAL_IP:8001` (e.g., `192.168.1.10`)

### 3. Install Dependencies
Navigate to the `mobile` directory and install:
```bash
npm install
```

### 4. Run the App
```bash
npx expo start
```
- Press `a` for Android Emulator.
- Press `i` for iOS Simulator.
- Scan the QR code with the **Expo Go** app on your physical device.

## 🛡️ Admin Access
- **Login ID**: `admin`
- **Password**: `admin`
- Use the admin portal to activate user accounts after they register.

## 📁 Project Structure
- `src/api`: API configuration and service layer.
- `src/screens`: UI screens (Login, Register, Predict, Admin).
- `src/theme`: Centralized design system (colors, spacing, shadows).
