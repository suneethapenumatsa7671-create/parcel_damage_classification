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
import { loginUser } from "../api/apiService";

export default function LoginScreen({ navigation }) {
  const [loginid, setLoginid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!loginid.trim()) e.loginid = "Login ID is required";
    if (!password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await loginUser({ loginid: loginid.trim(), password });
      Alert.alert("✅ Welcome!", `Hello, ${data.name}!`, [
        {
          text: "Go to Home",
          onPress: () =>
            navigation.replace("UserHome", { user: data }),
        },
      ]);
    } catch (err) {
      let detail = "Login failed. Please try again.";
      if (err?.response?.data?.detail) {
        detail = typeof err.response.data.detail === "string" 
          ? err.response.data.detail 
          : JSON.stringify(err.response.data.detail);
      } else if (err.message) {
        detail = err.message;
      }
      Alert.alert("❌ Login Failed", detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>📦</Text>
          </View>
          <Text style={[styles.appTitle, { fontSize: 22, textAlign: "center" }]}>Parcel Damage Classification</Text>
          <Text style={styles.subtitle}>Using Computer Vision</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, SHADOW.card]}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

          {/* Login ID */}
          <Text style={styles.label}>Login ID</Text>
          <View style={[styles.inputWrap, errors.loginid && styles.inputError]}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your login ID"
              placeholderTextColor={COLORS.textMuted}
              value={loginid}
              onChangeText={(t) => { setLoginid(t); setErrors((e) => ({ ...e, loginid: "" })); }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.loginid ? <Text style={styles.errorText}>{errors.loginid}</Text> : null}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrap, errors.password && styles.inputError]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: "" })); }}
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.eyeIcon}>{showPass ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Navigate to Register */}
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineBtnText}>Create New Account</Text>
          </TouchableOpacity>
        </View>

        {/* Admin link */}
        <TouchableOpacity
          style={styles.adminLink}
          onPress={() => navigation.navigate("AdminLogin")}
        >
          <Text style={styles.adminLinkText}>🛡️ Admin Portal</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },

  // Header
  header: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
    ...SHADOW.button,
  },
  logoIcon: { fontSize: 36 },
  appTitle: { fontSize: 28, fontWeight: "800", color: COLORS.textPrimary, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardTitle: { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },

  // Form
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 8, marginTop: 4 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: 14, marginBottom: 4,
  },
  inputError: { borderColor: COLORS.error },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, height: 50, color: COLORS.textPrimary, fontSize: 15 },
  eyeIcon: { fontSize: 20, padding: 4 },
  errorText: { fontSize: 12, color: COLORS.error, marginBottom: 10, marginLeft: 4 },

  // Buttons
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 54, alignItems: "center", justifyContent: "center",
    marginTop: 20,
    ...SHADOW.button,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  outlineBtn: {
    borderWidth: 1.5, borderColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 54, alignItems: "center", justifyContent: "center",
    marginTop: 8,
  },
  outlineBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: "600" },

  // Divider
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  dividerText: { color: COLORS.textMuted, marginHorizontal: 12, fontSize: 13 },

  // Admin
  adminLink: { alignItems: "center", marginTop: 24, padding: 8 },
  adminLinkText: { color: COLORS.textMuted, fontSize: 14, fontWeight: "500" },
});
