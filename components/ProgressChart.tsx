import { StyleSheet, View } from 'react-native';

type Props = {
  data: number[];
};

export default function ProgressChart({ data }: Props) {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
  },
});
