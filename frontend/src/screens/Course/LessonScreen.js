import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { lessonAPI, enrollmentAPI } from '../../services/api';
import { COLORS } from '../../theme/colors';

function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function LessonScreen({ route, navigation }) {
  const { lessonId, enrollmentId } = route.params;
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await lessonAPI.getOne(lessonId);
      setLesson(res.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await enrollmentAPI.updateProgress(enrollmentId, lessonId);
      Alert.alert('Success', 'Lesson marked as complete!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!lesson) {
    return <View style={styles.center}><Text>Lesson not found</Text></View>;
  }

  const youtubeId = extractYouTubeId(lesson.videoUrl);

  return (
    <ScrollView style={styles.container}>
      {youtubeId ? (
        <View style={styles.videoContainer}>
          <YoutubePlayer
            height={220}
            play={playing}
            videoId={youtubeId}
            onChangeState={onStateChange}
          />
        </View>
      ) : lesson.videoUrl ? (
        <TouchableOpacity
          style={styles.videoPlayer}
          onPress={() => Linking.openURL(lesson.videoUrl)}
        >
          <Ionicons name="open-outline" size={48} color={COLORS.white} />
          <Text style={styles.videoText}>Open Video Link</Text>
          <Text style={styles.videoUrl} numberOfLines={1}>{lesson.videoUrl}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.videoPlayer}>
          <Ionicons name="videocam-off-outline" size={64} color={COLORS.gray[500]} />
          <Text style={styles.videoText}>No video for this lesson</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{lesson.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.gray[500]} />
            <Text style={styles.metaText}>{Math.round(lesson.duration / 60)} min</Text>
          </View>
          {youtubeId && (
            <View style={styles.metaItem}>
              <Ionicons name="logo-youtube" size={16} color={COLORS.danger} />
              <Text style={styles.metaText}>Video Lesson</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this lesson</Text>
          <Text style={styles.description}>{lesson.description || 'No description available.'}</Text>
        </View>

        {lesson.content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lesson Content</Text>
            <Text style={styles.contentText}>{lesson.content}</Text>
          </View>
        )}

        {lesson.resources?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resources</Text>
            {lesson.resources.map((resource, index) => (
              <TouchableOpacity key={index} style={styles.resourceItem} onPress={() => resource.url && Linking.openURL(resource.url)}>
                <Ionicons name="document-text" size={20} color={COLORS.primary} />
                <Text style={styles.resourceText}>{resource.title}</Text>
                {resource.url && <Ionicons name="open-outline" size={16} color={COLORS.gray[400]} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
          <Text style={styles.completeButtonText}>Mark as Complete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videoContainer: { backgroundColor: '#000' },
  videoPlayer: { height: 220, backgroundColor: COLORS.gray[800], justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  videoText: { color: COLORS.gray[400], marginTop: 12, fontSize: 16, fontWeight: '500' },
  videoUrl: { color: COLORS.gray[500], marginTop: 4, fontSize: 12 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.black, marginBottom: 12 },
  metaRow: { flexDirection: 'row', marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  metaText: { fontSize: 13, color: COLORS.gray[500], marginLeft: 6 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  description: { fontSize: 14, color: COLORS.gray[600], lineHeight: 22 },
  contentText: { fontSize: 14, color: COLORS.gray[600], lineHeight: 22 },
  resourceItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: COLORS.gray[50], borderRadius: 8, marginBottom: 8 },
  resourceText: { flex: 1, fontSize: 14, color: COLORS.primary, marginLeft: 8, fontWeight: '500' },
  completeButton: { flexDirection: 'row', backgroundColor: COLORS.success, borderRadius: 12, padding: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  completeButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});
