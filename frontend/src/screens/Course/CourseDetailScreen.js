import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, enrollmentAPI, lessonAPI } from '../../services/api';
import { COLORS } from '../../theme/colors';

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        courseAPI.getOne(courseId),
        lessonAPI.getByCourse(courseId),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      try {
        const enrollRes = await enrollmentAPI.getMyEnrollments();
        const found = enrollRes.data.find((e) => e.course?._id === courseId);
        if (found) setEnrollment(found);
      } catch (e) {}
    } catch (error) {
      Alert.alert('Error', 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await enrollmentAPI.enroll(courseId);
      setEnrollment(res.data);
      Alert.alert('Success', 'You have been enrolled in this course!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!course) {
    return <View style={styles.center}><Text>Course not found</Text></View>;
  }

  const videoCount = lessons.filter((l) => l.videoUrl).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.thumbnail}>
          <Ionicons name="play-circle" size={60} color={COLORS.white} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.instructor}>By {course.instructor?.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Ionicons name="star" size={14} color={COLORS.secondary} />
              <Text style={styles.badgeText}>{course.rating || 'New'}</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="people" size={14} color={COLORS.gray[500]} />
              <Text style={styles.badgeText}>{course.enrolledCount} students</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="time" size={14} color={COLORS.gray[500]} />
              <Text style={styles.badgeText}>{Math.round(course.duration / 60)}h</Text>
            </View>
          </View>
          <Text style={styles.price}>{course.price === 0 ? 'Free' : `$${course.price}`}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Course</Text>
        <Text style={styles.description}>{course.description}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lessons ({lessons.length})</Text>
          {videoCount > 0 && (
            <View style={styles.videoCountBadge}>
              <Ionicons name="videocam" size={14} color={COLORS.primary} />
              <Text style={styles.videoCountText}>{videoCount} videos</Text>
            </View>
          )}
        </View>
        {lessons.map((lesson, index) => (
          <TouchableOpacity key={lesson._id} style={styles.lessonItem}
            onPress={() => enrollment ? navigation.navigate('Lesson', { lessonId: lesson._id, enrollmentId: enrollment._id }) : null}>
            <View style={styles.lessonNumber}>
              {enrollment?.completedLessons?.includes(lesson._id) ? (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              ) : (
                <Text style={styles.lessonNumberText}>{index + 1}</Text>
              )}
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <View style={styles.lessonMeta}>
                <Text style={styles.lessonDuration}>{Math.round(lesson.duration / 60)} min</Text>
                {lesson.videoUrl ? (
                  <View style={styles.videoBadge}>
                    <Ionicons name="logo-youtube" size={12} color={COLORS.danger} />
                    <Text style={styles.videoBadgeText}>Video</Text>
                  </View>
                ) : null}
              </View>
            </View>
            {lesson.isFree && <Text style={styles.freeBadge}>Free</Text>}
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray[400]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomBar}>
        {enrollment ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${enrollment.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{enrollment.progress}% Complete</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll} disabled={enrolling}>
            <Text style={styles.enrollButtonText}>{enrolling ? 'Enrolling...' : 'Enroll Now'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.white },
  thumbnail: { height: 200, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  instructor: { fontSize: 14, color: COLORS.gray[500], marginBottom: 12 },
  metaRow: { flexDirection: 'row', marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  badgeText: { fontSize: 13, color: COLORS.gray[600], marginLeft: 4 },
  price: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  section: { padding: 20, backgroundColor: COLORS.white, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
  videoCountBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.danger + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  videoCountText: { fontSize: 12, color: COLORS.danger, marginLeft: 4, fontWeight: '600' },
  description: { fontSize: 14, color: COLORS.gray[600], lineHeight: 22 },
  lessonItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  lessonNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.gray[100], justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  lessonNumberText: { fontSize: 14, fontWeight: 'bold', color: COLORS.gray[600] },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  lessonDuration: { fontSize: 12, color: COLORS.gray[500], marginRight: 8 },
  videoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.danger + '10', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  videoBadgeText: { fontSize: 10, color: COLORS.danger, marginLeft: 2, fontWeight: '600' },
  freeBadge: { fontSize: 11, color: COLORS.success, fontWeight: '600', marginRight: 8 },
  bottomBar: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray[100] },
  enrollButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  enrollButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  progressContainer: { alignItems: 'center' },
  progressBar: { width: '100%', height: 8, backgroundColor: COLORS.gray[200], borderRadius: 4, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  progressText: { fontSize: 14, color: COLORS.gray[600], fontWeight: '600' },
});
