import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import { SchoolService } from '../../../services/schoolService';
import { CreateSchoolRequest } from '../../../types/school';

export default function CreateSchoolScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || !code.trim()) {
      Alert.alert('Validation Error', 'School name and code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const request: CreateSchoolRequest = {
        name: name.trim(),
        code: code.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
      };
      await SchoolService.createSchool(request);
      Alert.alert('Success', 'School created successfully.', [
        { text: 'OK', onPress: () => router.replace('/(admin)/schools') },
      ]);
    } catch (error: any) {
      Alert.alert('Could not create school', error.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-100 px-6 pt-10">
      <ScreenHeader title="Add School" subtitle="Create a new school in the system" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-6">
          <FormField label="School Name" icon="business-outline" placeholder="e.g. Greenwood High School" value={name} onChangeText={setName} />
          <FormField label="School Code" icon="pricetag-outline" placeholder="e.g. GHS001" autoCapitalize="characters" value={code} onChangeText={setCode} />
          <FormField label="Address" icon="location-outline" placeholder="Street, city, state" value={address} onChangeText={setAddress} />
          <FormField label="Phone" icon="call-outline" placeholder="Contact number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <FormField label="Email" icon="mail-outline" placeholder="school@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />

          <Text className="text-slate-400 font-body text-xs mb-4">
            Bank details, fee reminder settings, and branding assets can be added later from the school's edit screen.
          </Text>

          <PrimaryButton label="Create School" icon="checkmark" onPress={handleCreate} isLoading={isSubmitting} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
