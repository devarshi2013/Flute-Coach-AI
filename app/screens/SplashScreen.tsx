import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKGROUND_IMAGE = 'https://images.pexels.com/photos/164936/pexels-photo-164936.jpeg?auto=compress&cs=tinysrgb&w=800';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: BACKGROUND_IMAGE }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      <LinearGradient
        colors={['rgba(15,10,40,0.2)', 'rgba(15,10,40,0.65)', 'rgba(15,10,40,0.97)']}
        locations={[0.25, 0.55, 0.85]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.notesDecor}>
        <Text style={[styles.note, { fontSize: 28, top: 0, right: 40 }]}>♫</Text>
        <Text style={[styles.note, { fontSize: 18, top: 30, right: 18 }]}>♪</Text>
        <Text style={[styles.note, { fontSize: 14, top: 55, right: 60 }]}>♩</Text>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={styles.content}>
          <Text style={styles.title}>
            FluteCoach <Text style={styles.titleAccent}>AI</Text>
          </Text>
          <Text style={styles.subtitle}>Your AI Flute Teacher</Text>

          <View style={styles.taglines}>
            <Text style={styles.tagline}>Learn. Practice. Improve.</Text>
            <Text style={styles.tagline}>Anytime, Anywhere.</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0820',
  },
  notesDecor: {
    position: 'absolute',
    top: 80,
    right: 24,
  },
  note: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.7)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  titleAccent: {
    color: '#7B5CF5',
  },
  subtitle: {
    fontSize: 17,
    color: '#FFFFFF',
    marginTop: 6,
    fontWeight: '400',
  },
  taglines: {
    marginTop: 20,
    gap: 2,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  button: {
    marginTop: 36,
    backgroundColor: '#7B5CF5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
