import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { auth } from '@/services/auth';
import { progress, type UserStats } from '@/services/progress';

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const size = 140;
  const sw   = 11;
  const r    = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const arc  = circ * 0.75;
  const gap  = circ - arc;
  const filled = arc * (Math.min(score, 100) / 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#DDD8F8" strokeWidth={sw}
          strokeDasharray={`${arc} ${gap}`} strokeLinecap="round"
          transform={`rotate(135, ${size / 2}, ${size / 2})`}
        />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#6C47FF" strokeWidth={sw}
          strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
          transform={`rotate(135, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <Text style={styles.scoreNumber}>{score}</Text>
    </View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

// ─── Greeting suffix ──────────────────────────────────────────────────────────
function scoreLabel(score: number) {
  if (score === 0)  return 'Start Practicing!';
  if (score < 50)   return 'Keep Going!';
  if (score < 75)   return 'Good Job!';
  if (score < 90)   return 'Great Work!';
  return 'Excellent!';
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router    = useRouter();
  const user      = auth.getUser();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const [stats,   setStats]   = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Reload every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);
      progress.getStats(user.id).then(s => {
        setStats(s);
        setLoading(false);
      });
    }, [user]),
  );

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6C47FF" />
        </View>
      </SafeAreaView>
    );
  }

  const noData = stats.overallScore === 0 && stats.streak === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}! 👋</Text>
            <Text style={styles.subGreeting}>{"Let's practice flute today"}</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={24} color="#6C47FF" />
          </TouchableOpacity>
        </View>

        {/* Row 1: Streak + Score */}
        <View style={styles.row}>
          <View style={[styles.card, styles.streakCard]}>
            <Text style={styles.fire}>{stats.streak > 0 ? '🔥' : '💤'}</Text>
            <Text style={styles.streakNum}>
              {stats.streak}
              <Text style={styles.streakX}>x</Text>
            </Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>

          <View style={[styles.card, styles.scoreCard]}>
            <ScoreRing score={stats.overallScore} />
            <Text style={styles.scoreLabel}>Overall Score</Text>
            <Text style={styles.goodJob}>{scoreLabel(stats.overallScore)}</Text>
          </View>
        </View>

        {/* Row 2: 2×2 stats */}
        <View style={styles.grid}>
          <StatCard
            label="Practice Time"
            value={stats.practiceTimeToday > 0 ? `${stats.practiceTimeToday} min` : '—'}
            sub="Today"
          />
          <StatCard
            label="Lessons Done"
            value={stats.lessonsDoneThisWeek > 0 ? String(stats.lessonsDoneThisWeek) : '—'}
            sub="This Week"
          />
          <StatCard
            label="Accuracy"
            value={stats.accuracyAverage > 0 ? `${stats.accuracyAverage}%` : '—'}
            sub="Average"
          />
          <StatCard
            label="Next Goal"
            value={`${stats.dailyGoalMinutes} min`}
            sub="Daily Goal"
          />
        </View>

        {/* Continue Practice */}
        <Text style={styles.sectionTitle}>Continue Practice</Text>
        {noData ? (
          // Empty state — user hasn't practiced yet
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🪈</Text>
            <Text style={styles.emptyTitle}>No practice yet</Text>
            <Text style={styles.emptySub}>
              Head to the Practice tab to start your first lesson!
            </Text>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => router.push('/practice')}
            >
              <Text style={styles.startBtnText}>Start Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.practiceCard}>
            <View style={styles.lessonThumb}>
              <Text style={{ fontSize: 26 }}>🪈</Text>
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle} numberOfLines={1}>
                {stats.lastLesson?.lessonTitle ?? 'Basic Scale – Sa Re Ga Ma'}
              </Text>
              <Text style={styles.lessonSub}>
                {stats.lastLesson?.difficulty ?? 'Beginner'} • Lesson{' '}
                {stats.lastLesson?.lessonNumber ?? 1}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => router.push('/practice')}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEEEF8' },
  scroll:    { paddingHorizontal: 20, paddingBottom: 32 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingTop: 16, marginBottom: 20,
  },
  greeting:    { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  subGreeting: { fontSize: 13, color: '#9090A8', marginTop: 2 },
  bellBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },

  row:  { flexDirection: 'row', gap: 14, marginBottom: 14 },
  card: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  streakCard: { justifyContent: 'center' },
  fire:       { fontSize: 28, marginBottom: 6 },
  streakNum:  { fontSize: 40, fontWeight: '800', color: '#FF6B2B' },
  streakX:    { fontSize: 20, fontWeight: '700', color: '#FF6B2B' },
  streakLabel:{ fontSize: 14, fontWeight: '600', color: '#FF6B2B', marginTop: 2 },

  scoreCard:   { alignItems: 'center', paddingVertical: 16 },
  scoreNumber: { fontSize: 34, fontWeight: '800', color: '#1A1A2E' },
  scoreLabel:  { fontSize: 13, color: '#9090A8', marginTop: 4 },
  goodJob:     { fontSize: 13, fontWeight: '700', color: '#6C47FF', marginTop: 2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 24 },
  statCard: {
    width: '47%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statLabel: { fontSize: 12, color: '#9090A8', marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#1A1A2E' },
  statSub:   { fontSize: 12, color: '#9090A8', marginTop: 2 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },

  // Empty state
  emptyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
  emptySub:   { fontSize: 13, color: '#9090A8', textAlign: 'center', marginBottom: 20 },
  startBtn:   {
    backgroundColor: '#6C47FF', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 32,
  },
  startBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // Practice card
  practiceCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  lessonThumb: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#EEEEF8', alignItems: 'center', justifyContent: 'center',
  },
  lessonInfo:  { flex: 1 },
  lessonTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  lessonSub:   { fontSize: 12, color: '#9090A8', marginTop: 2 },
  continueBtn: {
    backgroundColor: '#6C47FF', borderRadius: 20,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  continueBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});
