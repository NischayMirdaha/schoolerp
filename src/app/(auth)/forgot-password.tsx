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
import { AuthService } from '../../services/authService';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleResetRequest = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await AuthService.forgotPassword(email.trim());
      Alert.alert('Reset Link Sent', response.message, [
        { text: 'Back to Login', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-100">
      <View className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-primary-100" />

      <View className="flex-1 justify-center px-6">
        <View className="bg-white p-8 rounded-[32px] border border-primary-100 shadow-sm">
          <View className="w-16 h-16 bg-secondary-500 rounded-3xl items-center justify-center mb-4 shadow-md">
            <Ionicons name="key-outline" size={28} color="#ffffff" />
          </View>
          <Text className="text-2xl font-heading text-slate-800 mb-2">Reset Password</Text>
          <Text className="font-body text-slate-500 text-sm mb-6">
            Enter your email address and we will send you instructions to reset your password.
          </Text>

          <View className="mb-6">
            <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">Email Address</Text>
            <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-4">
              <Ionicons name="mail-outline" size={18} color="#0ea5e9" />
              <TextInput
                className="flex-1 text-slate-900 font-body px-3 py-3.5 text-base"
                placeholder="e.g. parent@school.edu.np"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary-500 py-4 rounded-2xl items-center mb-3 shadow-md active:bg-primary-600 flex-row justify-center"
            onPress={handleResetRequest}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-body-bold text-base">Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="items-center py-2.5" onPress={() => router.back()}>
            <Text className="text-slate-500 font-body-semibold text-sm">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}