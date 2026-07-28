import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { attendanceService } from '../../services/attendanceService';
import { StudentAttendanceSummaryResponse } from '../../types/attendance';
import ScreenHeader from '../../components/ScreenHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ListItemCard from '../../components/ListItemCard';

export default function StudentAttendanceScreen() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<StudentAttendanceSummaryResponse | null>(null);

  useEffect(() => {
    fetchMySummary();
  }, []);

  const fetchMySummary = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getMyAttendanceSummary();
      setSummary(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load attendance summary.');
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
        <ScreenHeader title="My Attendance" subtitle="Attendance percentage and record" />
      </View>

      {summary ? (
        <ScrollView className="flex-1 px-4">
          <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-4 items-center">
            <Text className="text-4xl font-body-bold text-primary-600">
              {summary.attendancePercentage}%
            </Text>
            <Text className="text-sm font-body-semibold text-slate-700 mt-1">
              Attendance Percentage
            </Text>
          </View>

          <ListItemCard
            title="Present Days"
            subtitle={`${summary.presentDays} Days`}
            badge="Present"
            badgeColor="mint"
          />

          <ListItemCard
            title="Absent Days"
            subtitle={`${summary.absentDays} Days`}
            badge="Absent"
            badgeColor="coral"
          />

          <ListItemCard
            title="Total Recorded Days"
            subtitle={`${summary.totalDays} Days`}
            badge="Total"
            badgeColor="primary"
          />
        </ScrollView>
      ) : null}
    </View>
  );
}