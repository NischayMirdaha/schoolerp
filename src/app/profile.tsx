import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { profileService } from '../services/profileService';
import { UserProfileResponse } from '../types/profile';
import ScreenHeader from '../components/ScreenHeader';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import LoadingSpinner from '../components/LoadingSpinner';
import AppShell from '../components/AppShell';

export default function UserProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getUserProfile();
      setProfile(data);
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'First name is required.');
      return;
    }

    try {
      setSaving(true);
      const updated = await profileService.updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setProfile(updated);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner />
      </AppShell>
    );
  }

  return (
    <AppShell>
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="My Profile" />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Profile Card */}
        <View className="bg-white p-4 rounded-2xl shadow-sm border border-primary-100 mb-4 items-center">
          <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3 border-2 border-primary-500 overflow-hidden">
            {profile?.profilePicPath ? (
              <Image
                source={{ uri: profile.profilePicPath }}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <Text className="text-2xl font-body-bold text-primary-600">
                {firstName ? firstName[0].toUpperCase() : 'U'}
              </Text>
            )}
          </View>

          <Text className="text-xl font-body-bold text-slate-800">
            {profile?.firstName} {profile?.lastName}
          </Text>
          <Text className="text-sm font-body text-slate-500">{profile?.email}</Text>

          <View className="flex-row flex-wrap justify-center gap-1 mt-2">
            {profile?.roles.map((role) => (
              <View
                key={role}
                className="bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200"
              >
                <Text className="text-xs text-primary-700 font-body-semibold">{role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Edit Form */}
        <View className="bg-white p-4 rounded-2xl shadow-sm border border-primary-100 mb-6">
          <Text className="text-base font-body-bold text-slate-800 mb-3">Edit Details</Text>

          <FormField
            label="First Name *"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
          />

          <FormField
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
          />

          <FormField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <FormField
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter home address"
          />

          <View className="mt-2">
            <PrimaryButton
              label={saving ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              isLoading={saving}
              disabled={saving}
            />
          </View>
        </View>

        {/* Password Security Link */}
        <TouchableOpacity
          className="bg-white p-4 rounded-2xl shadow-sm border border-primary-100 mb-8 flex-row justify-between items-center"
          onPress={() => router.push('/(auth)/change-password')}
        >
          <View>
            <Text className="text-base font-body-bold text-slate-800">Account Security</Text>
            <Text className="text-xs font-body text-slate-500">Change login password</Text>
          </View>
          <Text className="text-primary-600 font-body-semibold text-sm">Change &gt;</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
    </AppShell>
  );
}