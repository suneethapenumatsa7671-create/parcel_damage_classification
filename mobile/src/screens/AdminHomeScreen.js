import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { COLORS, RADIUS, SHADOW } from "../theme/theme";
import { getAdminHome, getRegisteredUsers, activateUser } from "../api/apiService";

export default function AdminHomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'waiting'

  const fetchData = async () => {
    setLoading(true);
    try {
      const homeData = await getAdminHome();
      const userData = await getRegisteredUsers();
      setStats(homeData.stats);
      setUsers(userData);
    } catch (err) {
      Alert.alert("❌ Error", "Could not fetch data from the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActivate = async (userId, name) => {
    try {
      setLoading(true);
      await activateUser(userId);
      Alert.alert("✅ Activated", `User '${name}' has been successfully activated.`);
      fetchData(); // refresh
    } catch (err) {
      Alert.alert("❌ Error", "Could not activate user.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers =
    activeTab === "all" ? users : users.filter((u) => u.status === "waiting");

  const StatCard = ({ label, value, color }) => (
    <View style={[styles.statCard, { borderColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛡️ Admin Home</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.replace("Login")}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Dashboard Stats */}
        <Text style={styles.sectionTitle}>Dashboard Stats</Text>
        {stats ? (
          <View style={styles.statRow}>
            <StatCard label="Total Users" value={stats.total_users} color={COLORS.primary} />
            <StatCard label="Activated" value={stats.activated_users} color={COLORS.success} />
            <StatCard label="Waiting" value={stats.waiting_activation} color={COLORS.warning} />
          </View>
        ) : (
          <ActivityIndicator color={COLORS.primary} />
        )}

        {/* User List Control */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>User Management</Text>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "all" && styles.tabActive]}
              onPress={() => setActiveTab("all")}
            >
              <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "waiting" && styles.tabActive]}
              onPress={() => setActiveTab("waiting")}
            >
              <Text style={[styles.tabText, activeTab === "waiting" && styles.tabTextActive]}>Waiting</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.userList}>
            {filteredUsers.length === 0 ? (
              <Text style={styles.emptyText}>No users found in this category.</Text>
            ) : (
              filteredUsers.map((item) => (
                <View key={item.id} style={[styles.userCard, SHADOW.card]}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userDetails}>ID: {item.loginid} • City: {item.city}</Text>
                    <Text style={[styles.statusText, { color: item.status === "activated" ? COLORS.success : COLORS.warning }]}>
                      Status: {item.status.toUpperCase()}
                    </Text>
                  </View>

                  {item.status === "waiting" && (
                    <TouchableOpacity
                      style={styles.activateBtn}
                      onPress={() => handleActivate(item.id, item.name)}
                    >
                      <Text style={styles.activateBtnText}>Activate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    height: 100, paddingTop: 40, paddingHorizontal: 24,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary },
  logoutBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  logoutText: { color: COLORS.error, fontSize: 13, fontWeight: "700" },
  container: { padding: 24, paddingBottom: 50 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 16 },
  statRow: { flexDirection: "row", gap: 12, marginBottom: 30 },
  statCard: {
    flex: 1, borderRadius: RADIUS.lg, borderWidth: 1.5,
    backgroundColor: COLORS.card, paddingVertical: 20,
    alignItems: "center", justifyContent: "center",
  },
  statValue: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600", letterSpacing: 0.5 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  tabRow: { flexDirection: "row", backgroundColor: COLORS.surface, borderRadius: RADIUS.full, padding: 4 },
  tab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: RADIUS.full },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: COLORS.white },
  userList: { gap: 12 },
  userCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.card, padding: 16,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 4 },
  userDetails: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  statusText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  activateBtn: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: RADIUS.md, ...SHADOW.button,
  },
  activateBtnText: { color: COLORS.white, fontSize: 13, fontWeight: "700" },
  emptyText: { color: COLORS.textMuted, fontSize: 14, fontStyle: "italic", textAlign: "center", marginTop: 20 },
});
