import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { courseAPI, categoryAPI } from '../../services/api';
import { COLORS } from '../../theme/colors';

export default function ExploreScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, [selectedCategory, page]);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;
      const res = await courseAPI.getAll(params);
      setCourses(res.data.courses);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchCourses();
  };

  const renderCourse = ({ item }) => (
    <TouchableOpacity style={styles.courseCard} onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}>
      <View style={styles.courseThumbnail}>
        <Ionicons name="play-circle" size={40} color={COLORS.white} />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.instructor}>{item.instructor?.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={COLORS.secondary} />
            <Text style={styles.ratingText}>{item.rating || 'New'}</Text>
          </View>
          <Text style={styles.students}>{item.enrolledCount} students</Text>
        </View>
        <Text style={styles.price}>{item.price === 0 ? 'Free' : `$${item.price}`}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.gray[400]} />
          <TextInput style={styles.searchInput} placeholder="Search courses..." value={search} onChangeText={setSearch} onSubmitEditing={handleSearch} returnKeyType="search" />
        </View>
      </View>

      <FlatList data={categories} horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList} contentContainerStyle={styles.categoriesContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.categoryChip, selectedCategory === item._id && styles.categoryChipActive]} onPress={() => setSelectedCategory(selectedCategory === item._id ? null : item._id)}>
            <Text style={[styles.categoryChipText, selectedCategory === item._id && styles.categoryChipTextActive]}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id}
      />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList data={courses} renderItem={renderCourse} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent} ListEmptyComponent={<Text style={styles.emptyText}>No courses found</Text>} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: { padding: 16, backgroundColor: COLORS.white },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray[50], borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.gray[200] },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  categoriesList: { maxHeight: 60, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  categoriesContent: { paddingHorizontal: 16, paddingVertical: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.gray[100], marginRight: 8 },
  categoryChipActive: { backgroundColor: COLORS.primary },
  categoryChipText: { fontSize: 13, color: COLORS.gray[600], fontWeight: '500' },
  categoryChipTextActive: { color: COLORS.white },
  loader: { marginTop: 40 },
  listContent: { padding: 16 },
  courseCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  courseThumbnail: { width: 120, height: 100, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  courseInfo: { flex: 1, padding: 12 },
  courseTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.black, marginBottom: 4 },
  instructor: { fontSize: 12, color: COLORS.gray[500], marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  ratingText: { fontSize: 11, color: COLORS.gray[600], marginLeft: 2 },
  students: { fontSize: 11, color: COLORS.gray[500] },
  price: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  emptyText: { textAlign: 'center', color: COLORS.gray[500], marginTop: 40, fontSize: 16 },
});
