import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { auth } from '@/services/auth';
import { LESSONS, Lesson } from '@/services/lessons';
import { progress } from '@/services/progress';

// ─── SmallProgressRing ───────────────────────────────────────────────────────

type SmallProgressRingProps = {
  percent: number;
};

function SmallProgressRing({ percent }: SmallProgressRingProps) {
  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 270 / 360;
  const arcLength = circumference * arcFraction;
  const progressLength = arcLength * (percent / 100);
  const gapLength = arcLength - progressLength;
  const totalGap = circumference - arcLength;

  // dasharray: filled arc | gap within 270° arc + remaining 90° fixed gap
  const strokeDasharray = `${progressLength} ${gapLength + totalGap}`;
  // Rotate so the open end sits at the bottom (arc starts at 135°)
  const rotation = 135;

  let arcColor: string;
  if (percent === 0) {
    arcColor = '#E5E7EB';
  } else if (percent <= 40) {
    arcColor = '#F97316';
  } else if (percent <= 70) {
    arcColor = '#EAB308';
  } else if (percent <= 89) {
    arcColor = '#22C55E';
  } else {
    arcColor = '#6C47FF';
  }

  const textColor = percent === 0 ? '#9CA3AF' : arcColor;

  return (
    <View style={styles.ringWrapper}>
      <Svg width={size} height={size}>
        {/* Track arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${arcLength} ${totalGap}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation}, ${size / 2}, ${size / 2})`}
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={arcColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation}, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.ringLabelContainer}>
          <Text style={[styles.ringLabel, { color: textColor }]}>
            {percent}%
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Filter tabs ─────────────────────────────────────────────────────────────

type FilterTab = 'All' | 'Scales' | 'Songs' | 'Exercises';
const TABS: FilterTab[] = ['All', 'Scales', 'Songs', 'Exercises'];

// ─── LessonsScreen ───────────────────────────────────────────────────────────

export default function LessonsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      const user = auth.getUser();
      if (!user) return;
      progress.getAllLessonProgress(user.id).then(setLessonProgress);
    }, []),
  );

  const filtered: Lesson[] =
    activeTab === 'All'
      ? LESSONS
      : LESSONS.filter(l => l.category === activeTab);

  const renderLesson = ({ item }: { item: Lesson }) => {
    const pct = lessonProgress[item.id] ?? 0;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: item.id } })}
      >
        {/* Thumbnail */}
        <View style={[styles.thumbnail, { backgroundColor: item.bgColor }]}>
          <Text style={styles.thumbnailEmoji}>{item.emoji}</Text>
        </View>

        {/* Text info */}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardMeta}>
            {item.difficulty} • {item.lessonCount} Lessons
          </Text>
        </View>

        {/* Progress ring */}
        <SmallProgressRing percent={pct} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lessons</Text>
        <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color="#6C47FF" />
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Choose what you want to learn</Text>

      {/* Filter tabs */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lesson list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderLesson}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.5,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBEBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#6C47FF',
    borderColor: '#6C47FF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  separator: {
    height: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#6C47FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbnailEmoji: {
    fontSize: 28,
  },
  cardBody: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  cardName: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  ringWrapper: {
    width: 56,
    height: 56,
    position: 'relative',
  },
  ringLabelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
