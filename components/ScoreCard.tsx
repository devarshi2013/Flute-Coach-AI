import { StyleSheet, Text, View } from 'react-native';

type Props = {
  score: number;
  label: string;
};

export default function ScoreCard({ score, label }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    marginTop: 4,
  },
});
