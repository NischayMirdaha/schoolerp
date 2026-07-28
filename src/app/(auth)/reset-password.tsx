import React, { useEffect, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthService } from '../../services/authService';

export default function ResetPasswordScreen() {
  const params =
  useLocalSearchParams<{ token?: string | string[] }>();

  const tokenFromUrl = Array.isArray(params.token)
    ? params.token[0]
    : params.token;

  const [resetToken, setResetToken] =
    useState(tokenFromUrl ?? '');

  useEffect(() => {
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleResetPassword = async () => {
    if (!resetToken.trim()) {
      Alert.alert('Validation Error', 'Reset token is required.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 8) {
      Alert.alert('Validation Error', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await AuthService.resetPassword({
        token: resetToken.trim(),
        newPassword,
        confirmPassword,
      });
      Alert.alert('Password Reset', response.message || 'Your password has been reset successfully.', [
        { text: 'Log In', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error: any) {
      Alert.alert('Reset Failed', error.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-100">
      <View className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-primary-100" />

      <View className="flex-1 justify-center px-6">
        <View className="bg-white p-8 rounded-[32px] border border-primary-100 shadow-sm">
          <View className="w-16 h-16 bg-primary-500 rounded-3xl items-center justify-center mb-4 shadow-md">
            <Ionicons name="lock-closed-outline" size={28} color="#ffffff" />
          </View>
          <Text className="text-2xl font-heading text-slate-800 mb-2">Set New Password</Text>
          <Text className="font-body text-slate-500 text-sm mb-6">
            Enter your reset token and your new password.
          </Text>

          {!tokenFromUrl ? (
            <View className="mb-4">
              <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">Reset Token</Text>
              <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-4">
                <Ionicons name="key-outline" size={18} color="#0ea5e9" />
                <TextInput
                  className="flex-1 text-slate-900 font-body px-3 py-3.5 text-base"
                  placeholder="Paste your reset token"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  value={resetToken}
                  onChangeText={setResetToken}
                />
              </View>
            </View>
          ) : null}

          <View className="mb-4">
            <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">New Password</Text>
            <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-4">
              <Ionicons name="lock-closed-outline" size={18} color="#0ea5e9" />
              <TextInput
                className="flex-1 text-slate-900 font-body px-3 py-3.5 text-base"
                placeholder="At least 8 characters"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">Confirm Password</Text>
            <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-4">
              <Ionicons name="checkmark-circle-outline" size={18} color="#0ea5e9" />
              <TextInput
                className="flex-1 text-slate-900 font-body px-3 py-3.5 text-base"
                placeholder="Re-enter your new password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary-500 py-4 rounded-2xl items-center mb-3 shadow-md active:bg-primary-600 flex-row justify-center"
            onPress={handleResetPassword}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-body-bold text-base">Update Password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="items-center py-2.5" onPress={() => router.replace('/(auth)/login')}>
            <Text className="text-slate-500 font-body-semibold text-sm">Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
