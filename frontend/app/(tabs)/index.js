import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { courseAPI, categoryAPI } from '../../src/services/api';
import { COLORS } from '../../src/theme/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, catRes] = await Promise.all([
        courseAPI.getPopular(),
        categoryAPI.getAll(),
      ]);
      setCourses(coursesRes.data);
      setCategories(catRes.data);
    } catch (error) { console.error(error); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const renderCourseCard = ({ item }) => (
    <TouchableOpacity style={styles.courseCard} onPress={() => router.push(`/course/${item._id}`)}>
      <View style={styles.courseThumbnail}>
        <Ionicons name="play-circle" size={40} color={COLORS.white} />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.courseInstructor}>{item.instructor?.name}</Text>
        <View style={styles.courseMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={COLORS.secondary} />
            <Text style={styles.rating}>{item.rating || 'New'}</Text>
          </View>
          <Text style={styles.enrolledCount}>{item.enrolledCount} students</Text>
        </View>
        <Text style={styles.coursePrice}>{item.price === 0 ? 'Free' : `$${item.price}`}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <Ionicons name="folder" size={24} color={COLORS.primary} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}!</Text>
          <Text style={styles.subtitle}>What do you want to learn today?</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <FlatList data={categories} renderItem={renderCategory} keyExtractor={(item) => item._id} horizontal showsHorizontalScrollIndicator={false} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Courses</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList data={courses} renderItem={renderCourseCard} keyExtractor={(item) => item._id} scrollEnabled={false} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="book" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{courses.length}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>{categories.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: COLORS.black },
  subtitle: { fontSize: 14, color: COLORS.gray[500], marginTop: 4 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.gray[100], justifyContent: 'center', alignItems: 'center' },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black, marginBottom: 12 },
  seeAll: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  categoryCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginRight: 12, alignItems: 'center', width: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  categoryName: { fontSize: 12, fontWeight: '600', color: COLORS.gray[700], marginTop: 8, textAlign: 'center' },
  courseCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  courseThumbnail: { width: 120, height: 90, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  courseInfo: { flex: 1, padding: 12 },
  courseTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.black, marginBottom: 4 },
  courseInstructor: { fontSize: 12, color: COLORS.gray[500], marginBottom: 8 },
  courseMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  rating: { fontSize: 12, color: COLORS.gray[600], marginLeft: 4 },
  enrolledCount: { fontSize: 12, color: COLORS.gray[500] },
  coursePrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  statsContainer: { flexDirection: 'row', padding: 20, gap: 12 },
  statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: COLORS.black, marginTop: 8 },
  statLabel: { fontSize: 12, color: COLORS.gray[500], marginTop: 4 },
});
