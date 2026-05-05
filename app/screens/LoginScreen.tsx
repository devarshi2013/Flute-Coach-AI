import { FontAwesome } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth } from '@/services/auth';

WebBrowser.maybeCompleteAuthSession();

// ─── Replace with your Google OAuth client IDs ────────────────────────────────
// Get them at: https://console.cloud.google.com → APIs & Services → Credentials
const GOOGLE_CLIENT_IDS = {
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [request, response, promptGoogleAsync] = Google.useAuthRequest(GOOGLE_CLIENT_IDS);

  const fetchGoogleUser = useCallback(
    async (accessToken: string) => {
      try {
        setLoading(true);
        const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const info = await res.json();
        await auth.setUser({ id: info.id, email: info.email, name: info.name, photo: info.picture, provider: 'google' });
        router.replace('/home');
      } catch {
        Alert.alert('Error', 'Failed to fetch Google account info.');
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (token) fetchGoogleUser(token);
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-In Failed', response.error?.message ?? 'Unknown error');
    }
  }, [response, fetchGoogleUser]);

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      await auth.setUser({
        id: credential.user,
        email: credential.email ?? '',
        name: [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ') || undefined,
        provider: 'apple',
      });
      router.replace('/home');
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Sign-In Failed', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      await auth.loginWithEmail(email, password);
      router.replace('/home');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
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
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Continue your musical journey</Text>

        <View style={styles.illustration}>
          <Text style={[styles.noteBlue, { fontSize: 26, top: 12, left: 30 }]}>♪</Text>
          <Text style={[styles.noteBlue, { fontSize: 20, top: 0, left: 80 }]}>♩</Text>
          <Text style={[styles.noteBlue, { fontSize: 30, top: 8, right: 80 }]}>♫</Text>
          <Text style={[styles.noteBlue, { fontSize: 22, top: 20, right: 30 }]}>♪</Text>
          <Text style={[styles.noteBlue, { fontSize: 16, bottom: 14, right: 55 }]}>♩</Text>
          <Text style={styles.fluteEmoji}>🪈</Text>
        </View>

        <TouchableOpacity
          style={[styles.socialButton, (!request || loading) && styles.disabled]}
          activeOpacity={0.8}
          onPress={() => promptGoogleAsync()}
          disabled={!request || loading}
        >
          <FontAwesome name="google" size={21} color="#4285F4" />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.socialButton, loading && styles.disabled]}
            activeOpacity={0.8}
            onPress={handleAppleSignIn}
            disabled={loading}
          >
            <FontAwesome name="apple" size={23} color="#000" />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

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

        <View style={styles.passwordHeader}>
          <Text style={styles.label}>Password</Text>
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
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

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabled]}
          activeOpacity={0.85}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>{loading ? 'Please wait…' : 'Login'}</Text>
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>{"Don't have an account? "}</Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign Up</Text>
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
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  fluteEmoji: { fontSize: 72, transform: [{ rotate: '-30deg' }] },
  noteBlue: { position: 'absolute', color: '#4B6BFF' },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 15,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  socialButtonText: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  disabled: { opacity: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E0E0EC' },
  dividerText: { fontSize: 13, color: '#ABABC0' },
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: { fontSize: 13, color: '#6C47FF', fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8E8F2',
    marginBottom: 28,
  },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1A1A2E' },
  loginButton: {
    backgroundColor: '#6C47FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { fontSize: 14, color: '#9090A8' },
  signupLink: { fontSize: 14, color: '#6C47FF', fontWeight: '700' },
});
