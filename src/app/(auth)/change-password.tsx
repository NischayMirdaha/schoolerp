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
import ScreenHeader from '../../components/ScreenHeader';
import { AuthService } from '../../services/authService';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Validation Error', 'Current password is required.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 8) {
      Alert.alert('Validation Error', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password and confirmation do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert('Validation Error', 'New password must be different from current password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await AuthService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      Alert.alert('Success', 'Your password has been updated.', [
        {
          text: 'OK',
          onPress: () => {
            // FIX: don't assume there's a screen to go back to.
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/' as never);
            }
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Change Failed', error.message || 'Failed to change password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-100 px-6 pt-10">
      <ScreenHeader title="Change Password" subtitle="Update your account security" showBackButton={true} />

      <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-6">
        <View className="mb-4">
          <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">Current Password</Text>
          <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-4">
            <Ionicons name="lock-open-outline" size={18} color="#0ea5e9" />
            <TextInput
              className="flex-1 text-slate-900 font-body px-3 py-3.5 text-base"
              placeholder="Enter current password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </View>
        </View>

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
          <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">Confirm New Password</Text>
          <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-4">
            <Ionicons name="checkmark-circle-outline" size={18} color="#0ea5e9" />
            <TextInput
              className="flex-1 text-slate-900 font-body px-3 py-3.5 text-base"
              placeholder="Re-enter new password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        <TouchableOpacity
          className="bg-primary-500 py-4 rounded-2xl items-center mb-3 shadow-md active:bg-primary-600 flex-row justify-center"
          onPress={handleChangePassword}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-body-bold text-base">Save New Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
