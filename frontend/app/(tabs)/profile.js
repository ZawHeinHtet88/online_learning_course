import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { enrollmentAPI } from '../../src/services/api';
import { COLORS } from '../../src/theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try { const res = await enrollmentAPI.getStats(); setStats(res.data); } catch (error) { console.error(error); }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/login'); } },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Ionicons name="person" size={48} color={COLORS.white} />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats?.totalEnrolled || 0}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats?.totalCompleted || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats?.avgProgress || 0}%</Text>
          <Text style={styles.statLabel}>Avg Progress</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/my-courses')}>
          <Ionicons name="book" size={22} color={COLORS.primary} />
          <Text style={styles.menuText}>My Courses</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
        {user?.role === 'instructor' && (
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="add-circle" size={22} color={COLORS.primary} />
            <Text style={styles.menuText}>Create Course</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings" size={22} color={COLORS.primary} />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle" size={22} color={COLORS.primary} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', padding: 24, backgroundColor: COLORS.primary },
  avatarLarge: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  roleBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  roleText: { fontSize: 12, color: COLORS.white, fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.white, margin: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.gray[500], marginTop: 4 },
  menuSection: { backgroundColor: COLORS.white, margin: 16, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  menuText: { flex: 1, fontSize: 16, color: COLORS.black, marginLeft: 12 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, padding: 16, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.danger },
  logoutText: { fontSize: 16, fontWeight: '600', color: COLORS.danger, marginLeft: 8 },
});
