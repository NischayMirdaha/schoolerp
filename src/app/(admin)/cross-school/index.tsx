import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenHeader from '../../../components/ScreenHeader';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { SchoolService } from '../../../services/schoolService';
import { CrossSchoolDashboardResponse } from '../../../types/school';

export default function CrossSchoolDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<CrossSchoolDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async () => {
    try {
      setHasError(false);
      const data = await SchoolService.getCrossSchoolStats();
      setStats(data);
    } catch {
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-cream-100 px-6 pt-10">
      <ScreenHeader
        title="Cross-School Dashboard"
        subtitle="System-wide statistics & management"
        showBackButton={false}
      />

      {/* Quick Action Navigation Bar */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          className="flex-1 bg-primary-500 py-3 rounded-2xl items-center flex-row justify-center shadow-sm"
          onPress={() => router.push('/(admin)/schools')}
        >
          <Ionicons name="business" size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text className="text-white font-body-bold text-xs">Manage Schools</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-white border border-primary-200 py-3 rounded-2xl items-center flex-row justify-center shadow-sm"
          onPress={() => router.push('/(admin)/settings')}
        >
          <Ionicons name="options-outline" size={16} color="#0284c7" style={{ marginRight: 6 }} />
          <Text className="text-primary-600 font-body-bold text-xs">Global Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#0ea5e9" />}
      >
        {hasError || !stats ? (
          <EmptyState icon="alert-circle-outline" title="Couldn't load stats" message="Pull down to try again." />
        ) : (
          <>
            {/* System Summary Cards */}
            <View className="flex-row mb-4">
              <View className="flex-1 bg-white p-4 rounded-3xl border border-primary-100 shadow-sm mr-2 items-center">
                <View className="w-10 h-10 bg-primary-100 rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="business-outline" size={18} color="#0284c7" />
                </View>
                <Text className="text-2xl font-heading text-slate-800">{stats.totalSchools}</Text>
                <Text className="text-slate-500 font-body text-xs">Schools</Text>
              </View>

              <View className="flex-1 bg-white p-4 rounded-3xl border border-mint-100 shadow-sm mx-1 items-center">
                <View className="w-10 h-10 bg-mint-100 rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="school-outline" size={18} color="#059669" />
                </View>
                <Text className="text-2xl font-heading text-slate-800">{stats.totalStudentsSystemWide}</Text>
                <Text className="text-slate-500 font-body text-xs">Students</Text>
              </View>

              <View className="flex-1 bg-white p-4 rounded-3xl border border-secondary-100 shadow-sm ml-2 items-center">
                <View className="w-10 h-10 bg-secondary-100 rounded-2xl items-center justify-center mb-2">
                  <Ionicons name="easel-outline" size={18} color="#d97706" />
                </View>
                <Text className="text-2xl font-heading text-slate-800">{stats.totalTeachersSystemWide}</Text>
                <Text className="text-slate-500 font-body text-xs">Teachers</Text>
              </View>
            </View>

            {/* Clickable Per-School Breakdown */}
            <Text className="font-body-bold text-slate-800 text-sm mb-3">Per-School Breakdown (Tap for details)</Text>
            {stats.schools.length === 0 ? (
              <EmptyState icon="business-outline" title="No schools yet" />
            ) : (
              stats.schools.map((s) => (
                <TouchableOpacity
                  key={s.schoolId}
                  className="bg-white p-4 rounded-3xl border border-primary-100 shadow-sm mb-3 active:bg-primary-50"
                  onPress={() => router.push(`/(admin)/schools/${s.schoolId}`)}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-body-bold text-slate-800 text-base flex-1" numberOfLines={1}>
                      {s.schoolName}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-slate-400 font-body text-xs mr-1">{s.schoolCode}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                    </View>
                  </View>

                  <View className="flex-row justify-around bg-cream-50 rounded-2xl border border-primary-100 py-3">
                    <View className="items-center">
                      <Text className="text-slate-400 font-body-semibold text-xs">Students</Text>
                      <Text className="text-slate-800 font-body-bold text-base mt-0.5">{s.activeStudents}</Text>
                    </View>
                    <View className="w-[1px] bg-primary-100" />
                    <View className="items-center">
                      <Text className="text-slate-400 font-body-semibold text-xs">Teachers</Text>
                      <Text className="text-slate-800 font-body-bold text-base mt-0.5">{s.activeTeachers}</Text>
                    </View>
                    <View className="w-[1px] bg-primary-100" />
                    <View className="items-center">
                      <Text className="text-slate-400 font-body-semibold text-xs">This Month</Text>
                      <Text className="text-slate-800 font-body-bold text-base mt-0.5">
                        NPR {s.monthCollection.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}