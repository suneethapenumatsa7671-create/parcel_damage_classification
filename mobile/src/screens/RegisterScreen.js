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
import { registerUser } from "../api/apiService";

const FIELDS = [
  { key: "name", label: "Full Name", icon: "👤", placeholder: "John Doe" },
  { key: "loginid", label: "Login ID", icon: "🆔", placeholder: "johndoe", lower: true },
  { key: "password", label: "Password", icon: "🔒", placeholder: "Min 8 chars with uppercase & number", secure: true },
  { key: "mobile", label: "Mobile Number", icon: "📱", placeholder: "9876543210", numeric: true },
  { key: "email", label: "Email Address", icon: "📧", placeholder: "john@example.com", lower: true },
  { key: "locality", label: "Locality", icon: "🏘️", placeholder: "Koramangala" },
  { key: "address", label: "Address", icon: "🏠", placeholder: "123, Main Road", multi: true },
  { key: "city", label: "City", icon: "🏙️", placeholder: "Bangalore" },
  { key: "state", label: "State", icon: "📍", placeholder: "Karnataka" },
];

export default function RegisterScreen({ navigation }) {
  const initial = Object.fromEntries(FIELDS.map((f) => [f.key, ""]));
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[a-zA-Z]+$/.test(form.loginid)) e.loginid = "Letters only";
    if (form.password.length < 8) e.password = "Min 8 characters";
    if (!/^[56789][0-9]{9}$/.test(form.mobile)) e.mobile = "Enter a valid 10-digit mobile";
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = "Enter a valid email";
    FIELDS.forEach(({ key }) => {
      if (!form[key].trim() && !e[key]) e[key] = "This field is required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerUser(form);
      Alert.alert(
        "✅ Registration Successful!",
        "Your account is pending admin activation. Please wait for approval before logging in.",
        [{ text: "Go to Login", onPress: () => navigation.replace("Login") }]
      );
    } catch (err) {
      let detail = "Registration failed. Please try again.";
      if (err?.response?.data?.detail) {
        detail = typeof err.response.data.detail === "string"
          ? err.response.data.detail
          : JSON.stringify(err.response.data.detail);
      } else if (err.message) {
        detail = err.message;
      }
      Alert.alert("❌ Error", detail);
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>📝</Text>
          </View>
          <Text style={styles.appTitle}>Create Account</Text>
          <Text style={styles.subtitle}>Join Parcel Damage Classification</Text>
        </View>

        <View style={[styles.card, SHADOW.card]}>
          <Text style={styles.cardNote}>
            ℹ️ After registration, an admin must activate your account before you can log in.
          </Text>

          {FIELDS.map((field) => (
            <View key={field.key}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={[styles.inputWrap, errors[field.key] && styles.inputError]}>
                <Text style={styles.inputIcon}>{field.icon}</Text>
                <TextInput
                  style={[styles.input, field.multi && { height: 80, textAlignVertical: "top", paddingTop: 12 }]}
                  placeholder={field.placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  value={form[field.key]}
                  onChangeText={(t) => set(field.key, t)}
                  secureTextEntry={field.secure && !showPass}
                  autoCapitalize={field.lower ? "none" : "words"}
                  keyboardType={field.numeric ? "numeric" : field.lower === true && field.key === "email" ? "email-address" : "default"}
                  multiline={!!field.multi}
                  autoCorrect={false}
                />
                {field.secure && (
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Text style={styles.eyeIcon}>{showPass ? "🙈" : "👁️"}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {errors[field.key] ? (
                <Text style={styles.errorText}>{errors[field.key]}</Text>
              ) : null}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.btnText}>Register Now</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.linkText}>Already have an account? </Text>
            <Text style={styles.linkHighlight}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, padding: 24, paddingBottom: 40 },

  header: { alignItems: "center", marginBottom: 28, marginTop: 8 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.accent,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12, ...SHADOW.button,
  },
  logoIcon: { fontSize: 32 },
  appTitle: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardNote: {
    fontSize: 13, color: COLORS.info,
    backgroundColor: "rgba(79,195,247,0.12)",
    padding: 12, borderRadius: RADIUS.md,
    marginBottom: 20, lineHeight: 20,
  },

  label: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 7, marginTop: 12 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
  },
  inputError: { borderColor: COLORS.error },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, height: 50, color: COLORS.textPrimary, fontSize: 15 },
  eyeIcon: { fontSize: 20, padding: 4 },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4, marginLeft: 4 },

  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    height: 54, alignItems: "center", justifyContent: "center",
    marginTop: 28, ...SHADOW.button,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },

  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  linkText: { color: COLORS.textSecondary, fontSize: 14 },
  linkHighlight: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
});
