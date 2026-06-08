import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { enrollmentAPI } from '../../services/api';
import { COLORS } from '../../theme/colors';

export default function MyCoursesScreen({ navigation }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchEnrollments();
    }, [])
  );

  const fetchEnrollments = async () => {
    try {
      const res = await enrollmentAPI.getMyEnrollments();
      setEnrollments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEnrollments();
  };

  const renderEnrollment = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CourseDetail', { courseId: item.course?._id })}>
      <View style={styles.thumbnail}>
        <Ionicons name="book" size={32} color={COLORS.white} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.course?.title}</Text>
        <Text style={styles.instructor}>{item.course?.instructor?.name}</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, item.status === 'completed' && styles.completedBadge]}>
        <Text style={[styles.statusText, item.status === 'completed' && styles.completedText]}>
          {item.status === 'completed' ? 'Done' : 'Active'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={enrollments}
        renderItem={renderEnrollment}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={COLORS.gray[300]} />
            <Text style={styles.emptyTitle}>No courses yet</Text>
            <Text style={styles.emptyText}>Start exploring and enroll in courses</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  thumbnail: { width: 80, height: 80, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, padding: 12 },
  title: { fontSize: 14, fontWeight: 'bold', color: COLORS.black, marginBottom: 4 },
  instructor: { fontSize: 12, color: COLORS.gray[500], marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 6, backgroundColor: COLORS.gray[200], borderRadius: 3, marginRight: 8 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600', color: COLORS.primary, width: 36 },
  statusBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: COLORS.gray[100], borderRadius: 8 },
  completedBadge: { backgroundColor: COLORS.success + '20' },
  statusText: { fontSize: 10, fontWeight: '600', color: COLORS.gray[600] },
  completedText: { color: COLORS.success },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.gray[600], marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.gray[400], marginTop: 8 },
});
