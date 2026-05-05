import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth } from '@/services/auth';
import { LESSONS } from '@/services/lessons';
import { progress } from '@/services/progress';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const lesson = LESSONS.find(l => l.id === id);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Lesson not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleStartPractice = async () => {
    const user = auth.getUser();
    if (!user) {
      Alert.alert('Not logged in', 'Please log in to track your progress.');
      return;
    }

    setSaving(true);
    try {
      const score = Math.round(60 + Math.random() * 40);          // 60–100
      const accuracy = Math.round(65 + Math.random() * 30);       // 65–95
      const duration = Math.round(5 + Math.random() * 10);        // 5–15 min

      await progress.addSession({
        userId: user.id,
        timestamp: Date.now(),
        duration,
        score,
        accuracy,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonNumber: 1,
        difficulty: lesson.difficulty,
      });

      Alert.alert(
        'Lesson Complete! 🎉',
        `Great practice! You scored ${score}/100 with ${accuracy}% accuracy.`,
        [{ text: 'Awesome!', onPress: () => router.back() }],
      );
    } catch {
      Alert.alert('Error', 'Could not save session. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.outer}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── Header ───────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Lesson Detail
          </Text>

          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8}>
            <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ── Scrollable content ────────────────────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* White card */}
          <View style={styles.card}>
            {/* Top row: thumbnail + title block */}
            <View style={styles.cardTop}>
              <View style={[styles.lessonThumb, { backgroundColor: '#EEE8FF' }]}>
                <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
              </View>
              <View style={styles.lessonTitleBlock}>
                <Text style={styles.lessonTitle} numberOfLines={2}>
                  {lesson.title}
                </Text>
                <Text style={styles.lessonName}>{lesson.name}</Text>
                <Text style={styles.lessonDifficulty}>{lesson.difficulty}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Description */}
            <Text style={styles.description}>{lesson.description}</Text>

            {/* You will learn */}
            <Text style={styles.sectionHeader}>You will learn:</Text>
            {lesson.learns.map((item, idx) => (
              <View key={idx} style={styles.learnRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#22C55E"
                  style={styles.learnIcon}
                />
                <Text style={styles.learnText}>{item}</Text>
              </View>
            ))}

            {/* Divider */}
            <View style={[styles.divider, { marginTop: 20 }]} />

            {/* Preview section */}
            <Text style={styles.sectionHeader}>Preview</Text>
            <View style={styles.audioPlayer}>
              <TouchableOpacity style={styles.playButton} activeOpacity={0.8}>
                <Ionicons name="play" size={20} color="#6C47FF" />
              </TouchableOpacity>

              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>

              <View style={styles.timingRow}>
                <Text style={styles.timingText}>0:00</Text>
                <Text style={styles.timingText}>{lesson.previewDuration}</Text>
              </View>
            </View>
          </View>

          {/* Bottom spacer so content clears the fixed button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ── Start Practice button (fixed at bottom) ───────────────────── */}
        <View style={styles.fixedBottom}>
          <TouchableOpacity
            style={[styles.startButton, saving && styles.startButtonDisabled]}
            onPress={handleStartPractice}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={styles.startButtonText}>
              {saving ? 'Saving...' : 'Start Practice'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const PURPLE_BG = '#3B1F8C';

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: PURPLE_BG,
  },
  safe: {
    flex: 1,
    backgroundColor: PURPLE_BG,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  backBtn: {
    backgroundColor: '#6C47FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 8,
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  // ── White card ──
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },

  // ── Top row ──
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lessonThumb: {
    width: 80,
    height: 80,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  lessonEmoji: {
    fontSize: 40,
  },
  lessonTitleBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
    lineHeight: 24,
    marginBottom: 4,
  },
  lessonName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  lessonDifficulty: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },

  // ── Description ──
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },

  // ── Learn items ──
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  learnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  learnIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  learnText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
  },

  // ── Audio player ──
  audioPlayer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    width: '0%',
    height: '100%',
    backgroundColor: '#6C47FF',
    borderRadius: 2,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timingText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  // ── Bottom button ──
  bottomSpacer: {
    height: 100,
  },
  fixedBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 12,
    backgroundColor: PURPLE_BG,
  },
  startButton: {
    backgroundColor: '#6C47FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
