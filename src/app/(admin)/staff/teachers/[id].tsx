import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StaffService } from '../../../../services/staffService';
import { TeacherResponse } from '../../../../types/staff';
import ScreenHeader from '../../../../components/ScreenHeader';
import FormField from '../../../../components/FormField';
import PrimaryButton from '../../../../components/PrimaryButton';
import LoadingSpinner from '../../../../components/LoadingSpinner';

export default function TeacherDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teacherId = Number(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacher, setTeacher] = useState<TeacherResponse | null>(null);

  useEffect(() => {
    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const data = await StaffService.getTeacher(teacherId);
      setTeacher(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load teacher profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!teacher) return;
    const newStatus = !teacher.isActive;

    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this teacher?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setSaving(true);
              const updated = await StaffService.setTeacherStatus(teacher.teacherId, newStatus);
              setTeacher(updated);
              Alert.alert('Success', `Teacher ${newStatus ? 'activated' : 'deactivated'}.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update status.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteQualification = async (qualId: number) => {
    Alert.alert('Remove Qualification', 'Are you sure you want to remove this qualification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await StaffService.deleteQualification(teacherId, qualId);
            fetchTeacher();
            Alert.alert('Success', 'Qualification removed.');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to remove qualification.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!teacher) {
    return (
      <View className="flex-1 bg-cream-100 p-4 pt-12 items-center justify-center">
        <Text className="text-slate-600 font-body">Teacher profile not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title={`${teacher.firstName} ${teacher.lastName}`} subtitle={`Employee ID: ${teacher.employeeId}`} />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Status Card */}
        <View className="bg-white p-4 rounded-2xl shadow-sm border border-primary-100 mb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-xs font-body text-slate-500">Account Status</Text>
            <Text
              className={`text-base font-body-bold ${
                teacher.isActive ? 'text-emerald-600' : 'text-coral-600'
              }`}
            >
              {teacher.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>

          <PrimaryButton
            label={teacher.isActive ? 'Deactivate' : 'Activate'}
            onPress={handleToggleStatus}
            variant={teacher.isActive ? 'coral' : 'primary'}
            isLoading={saving}
          />
        </View>

        {/* Profile Info */}
        <View className="bg-white p-4 rounded-2xl shadow-sm border border-primary-100 mb-4">
          <Text className="text-base font-body-bold text-slate-800 mb-3">Profile Information</Text>

          <View className="mb-2">
            <Text className="text-xs font-body text-slate-500">Email Address</Text>
            <Text className="text-sm font-body-semibold text-slate-800">{teacher.email}</Text>
          </View>

          <View className="mb-2">
            <Text className="text-xs font-body text-slate-500">Phone Number</Text>
            <Text className="text-sm font-body-semibold text-slate-800">{teacher.phone || '-'}</Text>
          </View>

          <View className="mb-2">
            <Text className="text-xs font-body text-slate-500">Joining Date</Text>
            <Text className="text-sm font-body-semibold text-slate-800">{teacher.joiningDate || '-'}</Text>
          </View>
        </View>

        {/* Qualifications Section */}
        <View className="bg-white p-4 rounded-2xl shadow-sm border border-primary-100 mb-8">
          <Text className="text-base font-body-bold text-slate-800 mb-3">Qualifications</Text>

          {teacher.qualifications && teacher.qualifications.length > 0 ? (
            teacher.qualifications.map((q) => (
              <View
                key={q.id}
                className="flex-row justify-between items-center border-b border-slate-100 py-2.5"
              >
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-body-bold text-slate-800">{q.degree}</Text>
                  <Text className="text-xs font-body text-slate-500">
                    {q.institution || 'N/A'} {q.yearCompleted ? `(${q.yearCompleted})` : ''}
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-coral-50 px-3 py-1.5 rounded-lg border border-coral-200"
                  onPress={() => handleDeleteQualification(q.id)}
                >
                  <Text className="text-xs font-body-semibold text-coral-600">Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-xs font-body text-slate-400 italic">No qualifications listed.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}