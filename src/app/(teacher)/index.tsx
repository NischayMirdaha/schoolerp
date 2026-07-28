import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { TeacherService } from '../../services/teacherService';
import { TeacherResponse, MyTeacherAssignmentsResponse } from '../../types/staff';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

function InfoRow({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <View className="flex-row items-center py-1.5">
      <Ionicons name={icon} size={16} color="#94a3b8" />
      <Text className="text-slate-600 font-body text-sm ml-2">{value}</Text>
    </View>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<TeacherResponse | null>(null);
  const [assignments, setAssignments] = useState<MyTeacherAssignmentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setHasError(false);
      const [profileData, assignmentsData] = await Promise.all([
        TeacherService.getMyProfile(),
        TeacherService.getMyAssignments(),
      ]);
      setProfile(profileData);
      setAssignments(assignmentsData);
    } catch {
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    })();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const initials = `${profile?.firstName?.[0] || user?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`.toUpperCase();

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-cream-100">
      <View className="absolute -top-14 -right-14 w-52 h-52 rounded-full bg-mint-100" />

      <ScrollView
        className="px-6 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#059669" />}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <View className="self-start bg-mint-100 px-2.5 py-1 rounded-full mb-1.5">
              <Text className="text-xs font-body-bold text-mint-600 uppercase tracking-wider">
                Teacher Portal
              </Text>
            </View>
            <Text className="text-2xl font-heading text-slate-800">
              Welcome, {profile?.firstName || user?.firstName}!
            </Text>
          </View>
        </View>

        {hasError || !profile ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Couldn't load your dashboard"
            message="Pull down to try again."
          />
        ) : (
          <>
            {/* Profile Card */}
            <View className="bg-white p-6 rounded-3xl border border-mint-100 shadow-sm mb-4">
              <View className="flex-row items-center mb-4">
                <View className="w-14 h-14 bg-mint-100 rounded-2xl items-center justify-center mr-4">
                  <Text className="text-mint-600 font-heading text-xl">{initials}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-body-extrabold text-slate-800" numberOfLines={1}>
                    {profile.firstName} {profile.lastName}
                  </Text>
                  <Text className="text-slate-500 font-body text-xs mt-0.5">
                    Employee ID: {profile.employeeId}
                  </Text>
                </View>
                {assignments && assignments.classTeacherOf.length > 0 ? (
                  <View className="bg-secondary-100 px-3 py-1 rounded-full">
                    <Text className="text-secondary-600 font-body-bold text-xs">Homeroom</Text>
                  </View>
                ) : null}
              </View>

              {/* Status & Details */}
              <View className="bg-cream-50 rounded-2xl border border-primary-50 px-4 py-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-slate-400 font-body-semibold text-xs">Status</Text>
                  <View className={`px-2.5 py-0.5 rounded-full ${profile.isActive ? 'bg-mint-100' : 'bg-coral-100'}`}>
                    <Text className={`font-body-bold text-xs ${profile.isActive ? 'text-mint-600' : 'text-coral-600'}`}>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <InfoRow icon="calendar-outline" value={profile.joiningDate ? `Joined: ${profile.joiningDate}` : null} />
                <InfoRow icon="mail-outline" value={profile.email} />
              </View>

              {/* Working Hours */}
              {(profile.morningStart || profile.afternoonStart) ? (
                <View className="mt-3 bg-cream-50 rounded-2xl border border-primary-50 px-4 py-3">
                  <Text className="text-slate-400 font-body-semibold text-xs mb-2">Working Hours</Text>
                  {profile.morningStart && profile.morningEnd ? (
                    <View className="flex-row items-center py-1">
                      <Ionicons name="sunny-outline" size={15} color="#94a3b8" />
                      <Text className="text-slate-600 font-body text-sm ml-2">
                        Morning: {profile.morningStart} – {profile.morningEnd}
                      </Text>
                    </View>
                  ) : null}
                  {profile.afternoonStart && profile.afternoonEnd ? (
                    <View className="flex-row items-center py-1">
                      <Ionicons name="partly-sunny-outline" size={15} color="#94a3b8" />
                      <Text className="text-slate-600 font-body text-sm ml-2">
                        Afternoon: {profile.afternoonStart} – {profile.afternoonEnd}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Qualifications */}
            <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-9 h-9 bg-primary-100 rounded-2xl items-center justify-center mr-3">
                  <Ionicons name="ribbon-outline" size={16} color="#0284c7" />
                </View>
                <Text className="text-base font-body-bold text-slate-800">Qualifications</Text>
              </View>

              {profile.qualifications.length === 0 ? (
                <Text className="text-slate-500 font-body text-sm">No qualifications recorded yet.</Text>
              ) : (
                profile.qualifications.map((q) => (
                  <View key={q.id} className="bg-cream-50 rounded-2xl px-4 py-2.5 mb-1.5">
                    <Text className="text-slate-800 font-body-bold text-sm">{q.degree}</Text>
                    {q.institution ? (
                      <Text className="text-slate-500 font-body text-xs mt-0.5">{q.institution}</Text>
                    ) : null}
                    {q.yearCompleted ? (
                      <Text className="text-slate-400 font-body text-xs mt-0.5">{q.yearCompleted}</Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>

            {/* Homeroom Card */}
            {assignments && assignments.classTeacherOf.length > 0 ? (
              <View className="bg-white p-5 rounded-3xl border border-secondary-100 shadow-sm mb-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-9 h-9 bg-secondary-100 rounded-2xl items-center justify-center mr-3">
                    <Ionicons name="medal-outline" size={16} color="#d97706" />
                  </View>
                  <Text className="text-base font-body-bold text-slate-800">Class Teacher Of</Text>
                </View>
                {assignments.classTeacherOf.map((ct) => (
                  <View key={ct.id} className="bg-cream-50 rounded-2xl px-4 py-2.5 mb-1.5 flex-row items-center justify-between">
                    <Text className="text-slate-700 font-body-semibold text-sm">
                      {ct.className} {ct.sectionName ? `– ${ct.sectionName}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Assignments */}
            <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
              <View className="flex-row items-center mb-3">
                <View className="w-9 h-9 bg-primary-100 rounded-2xl items-center justify-center mr-3">
                  <Ionicons name="easel-outline" size={16} color="#0284c7" />
                </View>
                <Text className="text-base font-body-bold text-slate-800">My Classes & Subjects</Text>
              </View>

              {!assignments || assignments.assignments.length === 0 ? (
                <Text className="text-slate-500 font-body text-sm">
                  No class or subject assignments yet for the current academic year.
                </Text>
              ) : (
                assignments.assignments.map((a) => (
                  <View
                    key={a.id}
                    className="flex-row items-center justify-between bg-cream-50 rounded-2xl px-4 py-3 mb-1.5"
                  >
                    <View className="flex-1 pr-2">
                      <Text className="text-slate-800 font-body-bold text-sm">{a.subjectName}</Text>
                      <Text className="text-slate-500 font-body text-xs mt-0.5">
                        {a.className} {a.sectionName ? `– ${a.sectionName}` : ''}
                      </Text>
                    </View>
                    <Ionicons name="book-outline" size={16} color="#0284c7" />
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}