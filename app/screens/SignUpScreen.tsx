import { FontAwesome } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth } from '@/services/auth';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Field', 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Missing Field', 'Please enter your email address.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      await auth.register(name, email, password);
      router.replace('/home');
    } catch (e: any) {
      Alert.alert('Sign Up Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your musical journey today</Text>

        <View style={styles.illustration}>
          <Text style={[styles.noteBlue, { fontSize: 24, top: 10, left: 24 }]}>♪</Text>
          <Text style={[styles.noteBlue, { fontSize: 18, top: 0, left: 76 }]}>♩</Text>
          <Text style={[styles.noteBlue, { fontSize: 28, top: 6, right: 76 }]}>♫</Text>
          <Text style={[styles.noteBlue, { fontSize: 20, top: 18, right: 28 }]}>♪</Text>
          <Text style={[styles.noteBlue, { fontSize: 15, bottom: 12, right: 52 }]}>♩</Text>
          <Text style={styles.fluteEmoji}>🪈</Text>
        </View>

        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Jane Doe"
          placeholderTextColor="#ABABC0"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!loading}
        />

        {/* Email */}
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="example@mail.com"
          placeholderTextColor="#ABABC0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Min. 6 characters"
            placeholderTextColor="#ABABC0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
            <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={18} color="#ABABC0" />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text style={styles.label}>Confirm Password</Text>
        <View style={[styles.inputWrapper, { marginBottom: 28 }]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Re-enter password"
            placeholderTextColor="#ABABC0"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showConfirm}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
            <FontAwesome name={showConfirm ? 'eye' : 'eye-slash'} size={18} color="#ABABC0" />
          </TouchableOpacity>
        </View>

        {/* Sign Up button */}
        <TouchableOpacity
          style={[styles.signupButton, loading && styles.disabled]}
          activeOpacity={0.85}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.signupButtonText}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        {/* Back to login */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FB' },
  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A2E', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#9090A8', textAlign: 'center', marginTop: 6 },
  illustration: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  fluteEmoji: { fontSize: 64, transform: [{ rotate: '-30deg' }] },
  noteBlue: { position: 'absolute', color: '#4B6BFF' },
  label: { fontSize: 13, fontWeight: '600', color: '#6B6B80', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A2E',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8F2',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8E8F2',
    marginBottom: 16,
  },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1A1A2E' },
  disabled: { opacity: 0.5 },
  signupButton: {
    backgroundColor: '#6C47FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signupButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: '#9090A8' },
  loginLink: { fontSize: 14, color: '#6C47FF', fontWeight: '700' },
});
