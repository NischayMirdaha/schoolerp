import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { visitorService } from '../../../services/visitorService';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';

export default function CreateVisitorScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [isGroup, setIsGroup] = useState(false);

  // Form State
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [purpose, setPurpose] = useState('');

  // Group Form State
  const [groupVisitors, setGroupVisitors] = useState([
    { visitorName: '', phone: '', address: '' },
    { visitorName: '', phone: '', address: '' },
  ]);

  const handleAddGroupRow = () => {
    setGroupVisitors([...groupVisitors, { visitorName: '', phone: '', address: '' }]);
  };

  const handleGroupVisitorChange = (index: number, field: string, value: string) => {
    const updated = [...groupVisitors];
    updated[index] = { ...updated[index], [field]: value };
    setGroupVisitors(updated);
  };

  const handleSubmit = async () => {
    if (isGroup) {
      const validVisitors = groupVisitors.filter((v) => v.visitorName.trim().length > 0);
      if (validVisitors.length === 0) {
        Alert.alert('Validation Error', 'Please enter at least one visitor name.');
        return;
      }

      try {
        setSubmitting(true);
        await visitorService.createGroupVisitorLog({
          visitors: validVisitors.map((v) => ({
            visitorName: v.visitorName.trim(),
            phone: v.phone.trim() || null,
            address: v.address.trim() || null,
          })),
          purpose: purpose.trim() || null,
        });

        Alert.alert('Success', 'Group visitor log entry recorded.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to record group visitor.');
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!visitorName.trim()) {
        Alert.alert('Validation Error', 'Visitor name is required.');
        return;
      }

      try {
        setSubmitting(true);
        await visitorService.createVisitorLog({
          visitorName: visitorName.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
          purpose: purpose.trim() || null,
        });

        Alert.alert('Success', 'Visitor log entry recorded.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to record visitor.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Record Front Desk Visitor" subtitle="Single or group visitor entry" />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Toggle Single / Group Entry */}
        <View className="flex-row mb-4 bg-white p-1 rounded-2xl border border-primary-100">
          <TouchableOpacity
            className={`flex-1 py-2.5 items-center rounded-xl ${
              !isGroup ? 'bg-primary-500' : 'bg-transparent'
            }`}
            onPress={() => setIsGroup(false)}
          >
            <Text className={`text-xs font-body-bold ${!isGroup ? 'text-white' : 'text-slate-700'}`}>
              Single Visitor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-2.5 items-center rounded-xl ${
              isGroup ? 'bg-primary-500' : 'bg-transparent'
            }`}
            onPress={() => setIsGroup(true)}
          >
            <Text className={`text-xs font-body-bold ${isGroup ? 'text-white' : 'text-slate-700'}`}>
              Group Entry
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Box */}
        <View className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-6">
          {!isGroup ? (
            <>
              <FormField
                label="Visitor Name *"
                value={visitorName}
                onChangeText={setVisitorName}
                placeholder="Enter visitor full name"
              />

              <FormField
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter contact number"
                keyboardType="phone-pad"
              />

              <FormField
                label="Address / City"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter visitor address"
              />
            </>
          ) : (
            <>
              <Text className="text-sm font-body-bold text-slate-800 mb-2">Group Visitors Roster</Text>
              {groupVisitors.map((v, idx) => (
                <View key={idx} className="p-3 bg-cream-50 rounded-xl mb-3 border border-primary-100">
                  <Text className="text-xs font-body-bold text-primary-600 mb-2">Visitor #{idx + 1}</Text>
                  <FormField
                    label="Visitor Name *"
                    value={v.visitorName}
                    onChangeText={(val) => handleGroupVisitorChange(idx, 'visitorName', val)}
                    placeholder="Full name"
                  />
                  <FormField
                    label="Phone"
                    value={v.phone}
                    onChangeText={(val) => handleGroupVisitorChange(idx, 'phone', val)}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                  />
                </View>
              ))}

              <TouchableOpacity
                className="mb-4 bg-primary-50 p-2.5 rounded-xl border border-primary-200 items-center"
                onPress={handleAddGroupRow}
              >
                <Text className="text-xs font-body-bold text-primary-700">+ Add Person to Group</Text>
              </TouchableOpacity>
            </>
          )}

          <FormField
            label="Purpose of Visit"
            value={purpose}
            onChangeText={setPurpose}
            placeholder="e.g. Parent Inquiry, Meeting, Admission"
          />

          <View className="mt-2">
            <PrimaryButton
              label={submitting ? 'Recording...' : 'Record Visitor Log'}
              onPress={handleSubmit}
              isLoading={submitting}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}