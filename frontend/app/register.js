import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { COLORS } from '../src/theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>LearnHub</Text>
          <Text style={styles.subtitle}>Create Account</Text>
          <Text style={styles.description}>Start your learning journey</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput style={styles.input} placeholder="Confirm your password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          <Text style={styles.label}>I want to</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity style={[styles.roleButton, role === 'student' && styles.roleActive]} onPress={() => setRole('student')}>
              <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>Learn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roleButton, role === 'instructor' && styles.roleActive]} onPress={() => setRole('instructor')}>
              <Text style={[styles.roleText, role === 'instructor' && styles.roleTextActive]}>Teach</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  subtitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  description: { fontSize: 16, color: COLORS.gray[500] },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.gray[700], marginBottom: 8 },
  input: { backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  roleContainer: { flexDirection: 'row', marginBottom: 16 },
  roleButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, alignItems: 'center', marginRight: 8 },
  roleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { color: COLORS.gray[500], fontWeight: '600' },
  roleTextActive: { color: COLORS.white },
  button: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: COLORS.gray[500], fontSize: 14 },
  link: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold' },
});
