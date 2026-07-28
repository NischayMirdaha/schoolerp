import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeRole = await login(username.trim(), password);
      if (!activeRole) {
        router.replace('/(auth)/switch-role');
      } else {
        router.replace('/');
      }
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Invalid username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-100">
      {/* Decorative soft background shapes */}
      <View className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-secondary-100" />
      <View className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-primary-100" />

      <View className="flex-1 justify-center px-6">
        <View className="bg-white p-8 rounded-[32px] border border-primary-100 shadow-sm">
          {/* Header Icon & Branding */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-primary-500 rounded-3xl items-center justify-center mb-3 shadow-md">
              <Ionicons name="school" size={30} color="#ffffff" />
            </View>
            <Text className="text-3xl font-heading text-slate-800">School ERP</Text>
            <Text className="font-body text-slate-500 text-sm mt-1">
              Welcome! Sign in to get started
            </Text>
          </View>

          {/* Username Input */}
          <View className="mb-4">
            <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">Username</Text>
            <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-4">
              <Ionicons name="person-outline" size={18} color="#0ea5e9" />
              <TextInput
                className="flex-1 text-slate-900 font-body px-3 py-3.5 text-base"
                placeholder="e.g. parent.ramesh"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">Password</Text>
            <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-4">
              <Ionicons name="lock-closed-outline" size={18} color="#0ea5e9" />
              <TextInput
                className="flex-1 text-slate-900 font-body px-3 py-3.5 text-base"
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-primary-500 py-4 rounded-2xl items-center mb-4 shadow-md active:bg-primary-600 flex-row justify-center"
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="text-white font-body-bold text-base mr-2">Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center py-2"
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text className="text-primary-600 font-body-semibold text-sm">Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}