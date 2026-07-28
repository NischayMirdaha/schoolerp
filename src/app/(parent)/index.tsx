import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { dashboardService } from '../../services/dashboardService';
import { ParentChildDashboardResponse } from '../../types/dashboard';
import ScreenHeader from '../../components/ScreenHeader';
import ChildSelectorHeader from '../../components/ChildSelectorHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ListItemCard from '../../components/ListItemCard';

export default function ParentDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [childrenDashboards, setChildrenDashboards] = useState<ParentChildDashboardResponse[]>([]);

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getParentDashboard();
      setChildrenDashboards(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load parent dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Parent Overview" subtitle="Linked children academic & fee status" showBackButton={false} />
        <ChildSelectorHeader />
      </View>

      <ScrollView className="flex-1 px-4">
        {childrenDashboards.map((child) => (
          <View key={child.studentId} className="bg-white p-4 rounded-3xl border border-primary-100 shadow-sm mb-4">
            <Text className="text-base font-body-bold text-slate-800 mb-2">{child.studentName}</Text>

            <ListItemCard
              title="Fee Dues & Payments"
              subtitle={`Outstanding Balance: NPR ${child.outstandingFeeBalance.toLocaleString()}`}
              badge={child.outstandingFeeBalance > 0 ? 'Dues' : 'Clear'}
              badgeColor={child.outstandingFeeBalance > 0 ? 'coral' : 'mint'}
              onPress={() => router.push('/(parent)/fees' as any)}
            />

            <ListItemCard
              title="Pending Homework"
              subtitle={`${child.dueHomeworkCount} tasks assigned`}
              badge="Tasks"
              badgeColor="primary"
              onPress={() => router.push('/(parent)/homework' as any)}
            />

            <ListItemCard
              title="Attendance Summary"
              subtitle="View percentage and recorded days"
              badge="Attendance"
              badgeColor="mint"
              onPress={() => router.push('/(parent)/attendance' as any)}
            />

            <ListItemCard
              title="Class Timetable"
              subtitle="View daily class periods"
              badge="Timetable"
              badgeColor="secondary"
              onPress={() => router.push('/(parent)/timetable' as any)}
            />

            <ListItemCard
              title="Transport Status"
              subtitle={child.activeTransportStatus || 'Not assigned'}
              badge="Bus"
              badgeColor="secondary"
              onPress={() => router.push('/(parent)/transport' as any)}
            />

            <ListItemCard
              title="Exam Results"
              subtitle={child.latestResultExamName ? `${child.latestResultExamName}: ${child.latestResultPercentage}%` : 'No results published'}
              badge="Results"
              badgeColor="mint"
              onPress={() => router.push('/(parent)/results' as any)}
            />
          </View>
        ))}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}