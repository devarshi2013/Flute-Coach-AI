import { useRouter } from 'expo-router';
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
import { progress } from '@/services/progress';

const LESSONS = [
  { id: 'l1', title: 'Basic Scale – Sa Re Ga Ma', number: 1, difficulty: 'Beginner' as const },
  { id: 'l2', title: 'Breath Control Basics',     number: 2, difficulty: 'Beginner' as const },
  { id: 'l3', title: 'Pa Dha Ni Sa Upper Octave', number: 3, difficulty: 'Beginner' as const },
  { id: 'l4', title: 'Simple Melody – Raga Yaman',number: 4, difficulty: 'Intermediate' as const },
  { id: 'l5', title: 'Taan Patterns Level 1',     number: 5, difficulty: 'Intermediate' as const },
];

export default function PracticeScreen() {
  const router = useRouter();
  const user   = auth.getUser();
  const [recording, setRecording] = useState<string | null>(null);

  const startLesson = (lessonId: string) => setRecording(lessonId);

  const finishLesson = async (lesson: typeof LESSONS[number]) => {
    if (!user) return;
    setRecording(null);

    // Simulate a practice result — replace with real audio analysis later
    const score    = Math.floor(Math.random() * 40) + 60; // 60–100
    const accuracy = Math.floor(Math.random() * 30) + 65; // 65–95
    const duration = Math.floor(Math.random() * 10) + 5;  // 5–15 min

    await progress.addSession({
      userId: user.id,
      timestamp: Date.now(),
      duration,
      score,
      accuracy,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonNumber: lesson.number,
      difficulty: lesson.difficulty,
    });

    Alert.alert(
      'Lesson Complete! 🎉',
      `Score: ${score}  •  Accuracy: ${accuracy}%  •  ${duration} min`,
      [{ text: 'Go to Home', onPress: () => router.push('/home') }, { text: 'Stay Here' }],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>Choose a lesson to begin</Text>

        {LESSONS.map(lesson => {
          const isActive = recording === lesson.id;
          return (
            <View key={lesson.id} style={styles.card}>
              <View style={styles.thumb}>
                <Text style={{ fontSize: 22 }}>🪈</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonMeta}>
                  {lesson.difficulty} • Lesson {lesson.number}
                </Text>
              </View>
              {isActive ? (
                <TouchableOpacity
                  style={styles.finishBtn}
                  onPress={() => finishLesson(lesson)}
                >
                  <Text style={styles.finishBtnText}>Finish</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => startLesson(lesson.id)}
                  disabled={!!recording}
                >
                  <Text style={styles.startBtnText}>
                    {recording ? '…' : 'Start'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEEEF8' },
  scroll:    { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  title:     { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  subtitle:  { fontSize: 13, color: '#9090A8', marginBottom: 20 },
  card: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  thumb: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#EEEEF8', alignItems: 'center', justifyContent: 'center',
  },
  info:        { flex: 1 },
  lessonTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  lessonMeta:  { fontSize: 12, color: '#9090A8', marginTop: 2 },
  startBtn: {
    backgroundColor: '#6C47FF', borderRadius: 12,
    paddingVertical: 8, paddingHorizontal: 16,
  },
  startBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  finishBtn: {
    backgroundColor: '#22C55E', borderRadius: 12,
    paddingVertical: 8, paddingHorizontal: 16,
  },
  finishBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});
