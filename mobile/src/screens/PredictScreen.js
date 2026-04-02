import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { COLORS, RADIUS } from "../theme/theme";
import { uploadImageForPrediction } from "../api/apiService";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

export default function PredictScreen({ route }) {
  const user = route?.params?.user;
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) return <View style={styles.flex} />;
  
  const handleCameraOpen = () => {
    if (!permission.granted) {
      requestPermission().then((res) => {
        if (res.granted) setIsCameraOpen(true);
      });
    } else {
      setIsCameraOpen(true);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setPreviewUrl(photo.uri);
      setResult(null);
      setIsCameraOpen(false);
    } catch (err) {
      Alert.alert("❌ Error", "Failed to capture photo.");
    }
  };

  const handlePickImage = async () => {
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });

      if (!pickerResult.canceled && pickerResult.assets.length > 0) {
        setPreviewUrl(pickerResult.assets[0].uri);
        setResult(null);
      }
    } catch (err) {
      Alert.alert("❌ Error", "Failed to pick image.");
    }
  };

  const handlePredict = async () => {
    if (!previewUrl) {
      Alert.alert("⚠️ Notice", "Please choose or take a file first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await uploadImageForPrediction(previewUrl);
      setResult(data);
    } catch (err) {
      let errorMsg = "Prediction failed. Please check network connection.";
      if (err?.response?.data?.detail) {
        errorMsg = typeof err.response.data.detail === "string" 
          ? err.response.data.detail 
          : JSON.stringify(err.response.data.detail);
      } else if (err.message) {
        errorMsg = err.message;
      }
      Alert.alert("❌ Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // If the camera is open, show full-screen camera view with a "Take Photo" overlay
  if (isCameraOpen) {
    if (!permission.granted) {
      return (
        <View style={styles.center}>
          <Text style={styles.permText}>Camera access is required to scan parcels</Text>
          <TouchableOpacity style={styles.predictBtn} onPress={requestPermission}>
            <Text style={styles.predictBtnText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelTextBtn} onPress={() => setIsCameraOpen(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.flexDark}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <CameraView style={styles.camera} ref={cameraRef} facing="back" />
        
        <View style={styles.cameraFooter}>
          <TouchableOpacity style={styles.cancelCameraBtn} onPress={() => setIsCameraOpen(false)}>
             <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          
          <View style={styles.captureContainer}>
             <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                <View style={styles.captureInner} />
             </TouchableOpacity>
             <Text style={styles.takePhotoText}>Take Photo</Text>
          </View>
          
          <View style={{ width: 60 }} /> {/* Spacer to center the capture button */}
        </View>
      </View>
    );
  }

  // Main UI (Web-like layout)
  return (
    <View style={styles.flexBg}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      {/* Top Navigation / Header */}
      <View style={styles.navHeader}>
        <Text style={styles.logoText}>
          <Text style={{ color: COLORS.primary }}>Parcel Damage</Text> Classification
        </Text>
        {/* Mock navigation buttons to resemble the web app */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} disabled>
            <Text style={styles.navBtnText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} disabled>
            <Text style={styles.navBtnText}>Predict</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainHeading}>Upload a Parcel Image</Text>
        
        {/* Choose file buttons */}
        <View style={styles.fileChooserRow}>
           <TouchableOpacity style={styles.chooseFileBtn} onPress={handlePickImage}>
             <Text style={styles.chooseFileBtnText}>Choose File</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.chooseFileBtn} onPress={handleCameraOpen}>
             <Text style={styles.chooseFileBtnText}>Open Camera</Text>
           </TouchableOpacity>
           {!previewUrl && <Text style={styles.noFileText}>No file chosen</Text>}
           {previewUrl && <Text style={styles.noFileText}>File selected</Text>}
        </View>

        {/* Predict Button */}
        <TouchableOpacity 
          style={[styles.predictBtn, !previewUrl && styles.btnDisabled]} 
          onPress={handlePredict} 
          disabled={!previewUrl || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.predictBtnText}>Predict</Text>
          )}
        </TouchableOpacity>

        {/* Prediction Results */}
        {result && (
          <View style={styles.resultSection}>
            <Text style={styles.predictionTitle}>
              Prediction: <Text style={styles.predictionValue}>{result.prediction}</Text>
            </Text>
            <Image source={{ uri: previewUrl }} style={styles.previewImage} />
            <Text style={styles.confidenceText}>
              Confidence: {Number(result.confidence).toFixed(2)}
            </Text>
          </View>
        )}

        {/* Just the image if no result yet */}
        {!result && previewUrl && !loading && (
          <View style={styles.resultSection}>
             <Image source={{ uri: previewUrl }} style={styles.previewImage} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexBg: { flex: 1, backgroundColor: COLORS.bg },
  flexDark: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  
  // Header
  navHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    backgroundColor: COLORS.surface,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  navRow: {
    flexDirection: "row",
    gap: 8,
  },
  navBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  navBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "500",
  },

  // Main UI
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 60,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  fileChooserRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 4,
    backgroundColor: COLORS.white,
    padding: 4,
    marginBottom: 20,
  },
  chooseFileBtn: {
    backgroundColor: "#EEEEEE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 2,
    marginRight: 8,
  },
  chooseFileBtnText: {
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  noFileText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    paddingHorizontal: 10,
  },
  predictBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 4,
    minWidth: 120,
    alignItems: "center",
    marginBottom: 30,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  predictBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },
  
  // Results
  resultSection: {
    alignItems: "center",
    width: "100%",
  },
  predictionTitle: {
    fontSize: 26,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  predictionValue: {
    fontWeight: "700",
  },
  previewImage: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: "contain",
    marginBottom: 15,
  },
  confidenceText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  // Camera Full Screen
  camera: { 
    flex: 1, 
  },
  cameraFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 30,
    backgroundColor: "black",
  },
  captureContainer: {
    alignItems: "center",
  },
  captureBtn: {
    width: 70, 
    height: 70,
    borderRadius: 35,
    borderWidth: 4, 
    borderColor: COLORS.white,
    alignItems: "center", 
    justifyContent: "center",
    marginBottom: 10,
  },
  captureInner: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: COLORS.white 
  },
  takePhotoText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelCameraBtn: {
    padding: 10,
  },
  cancelText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
  },
  cancelTextBtn: {
    marginTop: 20,
  },
  permText: { color: COLORS.textSecondary, textAlign: "center", marginBottom: 20, fontSize: 16 },
});

