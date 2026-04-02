import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { COLORS, RADIUS, SHADOW } from "../theme/theme";
import { adminLogin } from "../api/apiService";

export default function AdminLoginScreen({ navigation }) {
  const [loginid, setLoginid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!loginid.trim() || !password.trim()) {
      Alert.alert("Input Error", "Please enter both credentials.");
      return;
    }
    setLoading(true);
    try {
      const data = await adminLogin({ loginid: loginid.trim(), password });
      Alert.alert("🛡️ Admin Access", data.message, [
        { text: "Continue", onPress: () => navigation.replace("AdminHome") },
      ]);
    } catch (err) {
      const detail = err?.response?.data?.detail || "Admin login failed.";
      Alert.alert("❌ Error", detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: COLORS.accent }]}>
            <Text style={styles.logoIcon}>🛡️</Text>
          </View>
          <Text style={styles.appTitle}>Admin Portal</Text>
          <Text style={styles.subtitle}>Parcel Damage Management System</Text>
        </View>

        <View style={[styles.card, SHADOW.card]}>
          <Text style={styles.label}>Admin Login ID</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="admin"
              placeholderTextColor={COLORS.textMuted}
              value={loginid}
              onChangeText={setLoginid}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Admin Password</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.eyeIcon}>{showPass ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Login as Admin</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>⬅️ Back to User Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12, ...SHADOW.button,
  },
  logoIcon: { fontSize: 36 },
  appTitle: { fontSize: 28, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 28,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 8, marginTop: 12 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: 14, marginBottom: 4,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, height: 50, color: COLORS.textPrimary, fontSize: 15 },
  eyeIcon: { fontSize: 20, padding: 4 },
  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    height: 54, alignItems: "center", justifyContent: "center",
    marginTop: 24, ...SHADOW.button,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  backBtn: { alignItems: "center", marginTop: 24, padding: 8 },
  backText: { color: COLORS.textMuted, fontSize: 14, fontWeight: "500" },
});
