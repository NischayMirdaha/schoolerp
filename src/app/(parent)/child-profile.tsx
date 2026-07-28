import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useActiveChild } from '../../context/ActiveChildContext';
import { ParentService } from '../../services/parentService';
import { StudentResponse } from '../../types/student';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View className="flex-row justify-between py-1.5 border-b border-primary-50">
      <Text className="text-slate-500 font-body text-sm flex-1">{label}</Text>
      <Text className="text-slate-800 font-body-semibold text-sm ml-4 text-right flex-1" numberOfLines={2}>
        {value || 'N/A'}
      </Text>
    </View>
  );
}

export default function ChildProfileScreen() {
  const { activeChild } = useActiveChild();
  const [details, setDetails] = useState<StudentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (activeChild) {
      loadDetails();
    }
  }, [activeChild?.studentId]);

  const loadDetails = async () => {
    if (!activeChild) return;
    setLoading(true);
    setHasError(false);
    try {
      const data = await ParentService.getChildDetails(activeChild.studentId);
      setDetails(data);
    } catch {
      setHasError(true);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-100 px-6 pt-10">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDetails} tintColor="#0284c7" />}
      >
        {/* Back Bar */}
        <TouchableOpacity
          className="flex-row items-center mb-4 py-1"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(parent)')}
        >
          <Ionicons name="chevron-back" size={18} color="#0284c7" />
          <Text className="text-primary-600 font-body-bold text-base ml-1">Back to Dashboard</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-heading text-slate-800 mb-4">Child Profile</Text>

        {!activeChild ? (
          <EmptyState
            icon="people-outline"
            title="No child selected"
            message="Go back to the dashboard and select a child."
          />
        ) : loading ? (
          <LoadingSpinner />
        ) : hasError ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Couldn't load profile"
            message="Pull down to try again."
          />
        ) : !details ? (
          <EmptyState
            icon="person-outline"
            title="Profile unavailable"
            message="This child's profile could not be loaded."
          />
        ) : (
          <>
            {/* Personal Details */}
            <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-4">
              <View className="flex-row items-center border-b border-primary-100 pb-2 mb-3">
                <Ionicons name="person-circle-outline" size={18} color="#0284c7" />
                <Text className="text-base font-body-bold text-slate-800 ml-2">Personal Information</Text>
              </View>
              <InfoRow label="Full Name" value={`${details.firstName} ${details.lastName || ''}`.trim()} />
              <InfoRow label="Gender" value={details.gender} />
              <InfoRow label="Date of Birth" value={details.dob} />
              <InfoRow label="Blood Group" value={details.bloodGroup} />
              <InfoRow label="Phone" value={details.phone} />
              <InfoRow label="Address" value={details.address} />
            </View>

            {/* Academic Information */}
            <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-4">
              <View className="flex-row items-center border-b border-primary-100 pb-2 mb-3">
                <Ionicons name="school-outline" size={18} color="#0284c7" />
                <Text className="text-base font-body-bold text-slate-800 ml-2">Academic & Admission</Text>
              </View>
              <InfoRow label="Admission No" value={details.admissionNo} />
              <InfoRow label="Roll No" value={details.rollNo} />
              <InfoRow label="Current Class" value={`${details.className}${details.sectionName ? ` – ${details.sectionName}` : ''}`} />
              <InfoRow label="Admitted Class" value={details.joinedClassName || details.className} />
              <InfoRow label="Academic Year" value={details.academicYearName} />
              <InfoRow label="Admission Date" value={details.admissionDate} />
              <InfoRow label="Status" value={details.status} />

              <View className="flex-row justify-between items-center py-1.5">
                <Text className="text-slate-500 font-body text-sm">Exam Status</Text>
                <View className={`px-2.5 py-1 rounded-full ${details.examAllowed ? 'bg-mint-100' : 'bg-coral-100'}`}>
                  <Text className={`font-body-bold text-xs ${details.examAllowed ? 'text-mint-600' : 'text-coral-600'}`}>
                    {details.examAllowed ? 'Eligible for Exams' : 'Dues Pending (Hold)'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Parent / Guardian */}
            {details.parent ? (
              <View className="bg-white p-6 rounded-3xl border border-secondary-100 shadow-sm mb-6">
                <View className="flex-row items-center border-b border-secondary-100 pb-2 mb-3">
                  <Ionicons name="people-outline" size={18} color="#d97706" />
                  <Text className="text-base font-body-bold text-slate-800 ml-2">Parent / Guardian</Text>
                </View>
                <InfoRow label="Name" value={`${details.parent.firstName} ${details.parent.lastName || ''}`.trim()} />
                <InfoRow label="Relation" value={details.parent.relation} />
                <InfoRow label="Phone" value={details.parent.phone} />
                <InfoRow label="Email" value={details.parent.email} />
                <InfoRow label="Occupation" value={details.parent.occupation} />
              </View>
            ) : null}
          </>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}