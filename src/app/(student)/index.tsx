import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { dashboardService } from '../../services/dashboardService';
import { StudentService } from '../../services/studentService';
import { StudentDashboardResponse } from '../../types/dashboard';
import { StudentResponse } from '../../types/student';
import ScreenHeader from '../../components/ScreenHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ListItemCard from '../../components/ListItemCard';

export default function StudentDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [profile, setProfile] = useState<StudentResponse | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      // Settled individually so a profile failure doesn't blank the dashboard.
      const [dashRes, profileRes] = await Promise.allSettled([
        dashboardService.getStudentDashboard(),
        StudentService.getMyProfile(),
      ]);

      setData(dashRes.status === 'fulfilled' ? dashRes.value : null);
      setProfile(profileRes.status === 'fulfilled' ? profileRes.value : null);

      if (dashRes.status === 'rejected') {
        Alert.alert('Error', (dashRes.reason as Error)?.message || 'Failed to load student dashboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Student Portal"
          subtitle="Daily classes, homework, and latest results"
          showBackButton={false}
        />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Identity card — class, section, roll, admission number */}
        {profile ? (
          <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
            <Text className="text-lg font-body-extrabold text-slate-800">
              {profile.firstName} {profile.lastName ?? ''}
            </Text>

            <View className="flex-row flex-wrap mt-2">
              <View className="bg-primary-100 px-3 py-1 rounded-full mr-2 mb-1.5">
                <Text className="text-xs font-body-bold text-primary-700">
                  {profile.className}
                  {profile.sectionName ? ` — ${profile.sectionName}` : ''}
                </Text>
              </View>

              {profile.rollNo ? (
                <View className="bg-mint-100 px-3 py-1 rounded-full mr-2 mb-1.5">
                  <Text className="text-xs font-body-bold text-mint-600">Roll {profile.rollNo}</Text>
                </View>
              ) : null}

              <View className="bg-cream-200 px-3 py-1 rounded-full mb-1.5">
                <Text className="text-xs font-body-bold text-slate-600">Adm {profile.admissionNo}</Text>
              </View>
            </View>

            {profile.academicYearName ? (
              <Text className="text-xs font-body text-slate-500 mt-1">
                Academic Year: {profile.academicYearName}
              </Text>
            ) : null}
          </View>
        ) : null}

        {data ? (
          <>
            <Text className="text-base font-body-bold text-slate-800 mb-2">My Dashboard</Text>

            <ListItemCard
              title="Today's Classes"
              subtitle={`${data.todayScheduledPeriodsCount} scheduled periods today`}
              badge="Timetable"
              badgeColor="primary"
              onPress={() => router.push('/(student)/timetable' as any)}
            />

            <ListItemCard
              title="Pending Homework"
              subtitle={`${data.dueHomeworkCount} tasks due`}
              badge={data.dueHomeworkCount > 0 ? 'Due' : 'Clear'}
              badgeColor={data.dueHomeworkCount > 0 ? 'coral' : 'mint'}
              onPress={() => router.push('/(student)/homework' as any)}
            />

            <ListItemCard
              title="Latest Published Result"
              subtitle={
                data.latestResultExamName
                  ? `${data.latestResultExamName}: ${data.latestResultPercentage}%`
                  : 'No results published'
              }
              badge="Results"
              badgeColor="mint"
              onPress={() => router.push('/(student)/results' as any)}
            />

            <ListItemCard
              title="My Attendance Record"
              subtitle="View overall attendance percentage"
              badge="Attendance"
              badgeColor="primary"
              onPress={() => router.push('/(student)/attendance' as any)}
            />

            <ListItemCard
              title="Academic History Timeline"
              subtitle="Past classes and closing fee records"
              badge="Timeline"
              badgeColor="secondary"
              onPress={() => router.push('/(student)/academic-history' as any)}
            />

            <ListItemCard
              title="Notices & Events Calendar"
              subtitle={`${data.latestAnnouncementsCount} active notices`}
              badge="Notices"
              badgeColor="primary"
              onPress={() => router.push('/(student)/announcements' as any)}
            />
          </>
        ) : null}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}