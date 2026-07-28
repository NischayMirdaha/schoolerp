import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { attendanceService } from '../../../services/attendanceService';
import { TeacherScheduledPeriodResponse } from '../../../types/attendance';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

export default function TeacherAttendanceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [periods, setPeriods] = useState<TeacherScheduledPeriodResponse[]>([]);

  useEffect(() => {
    fetchScheduledPeriods();
  }, [selectedDate]);

  const fetchScheduledPeriods = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getTeacherScheduledPeriods(selectedDate);
      setPeriods(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load scheduled periods.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSheet = (p: TeacherScheduledPeriodResponse) => {
    router.push({
      pathname: '/(teacher)/attendance/mark' as any,
      params: {
        classId: String(p.classId),
        sectionId: p.sectionId ? String(p.sectionId) : '',
        periodId: String(p.periodId),
        subjectId: p.subjectId ? String(p.subjectId) : '',
        date: selectedDate,
      },
    });
  };

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Period Attendance" subtitle="Select period slot to mark student attendance" />
      </View>

      <View className="px-4 mb-4">
        <FormField
          label="Attendance Date (YYYY-MM-DD) *"
          value={selectedDate}
          onChangeText={setSelectedDate}
          placeholder="YYYY-MM-DD"
        />
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView className="flex-1 px-4">
          {periods.length > 0 ? (
            periods.map((p) => (
              <TouchableOpacity
                key={`${p.periodId}-${p.classId}-${p.sectionId || 0}`}
                className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3 flex-row justify-between items-center active:bg-primary-50"
                onPress={() => handleOpenSheet(p)}
              >
                <View className="flex-1 mr-2">
                  <Text className="text-xs font-body-bold text-primary-600">
                    Period {p.periodNo} ({p.startTime.slice(0, 5)} - {p.endTime.slice(0, 5)})
                  </Text>
                  <Text className="text-base font-body-bold text-slate-800 mt-1">
                    {p.className} {p.sectionName ? `(${p.sectionName})` : ''}
                  </Text>
                  <Text className="text-xs font-body text-slate-500">
                    Subject: {p.subjectName || 'N/A'}
                  </Text>
                </View>

                <View
                  className={`px-3 py-1.5 rounded-full ${
                    p.isAttendanceMarked ? 'bg-emerald-100' : 'bg-coral-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-body-bold ${
                      p.isAttendanceMarked ? 'text-emerald-700' : 'text-coral-700'
                    }`}
                  >
                    {p.isAttendanceMarked ? 'Marked' : 'Pending'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No Periods Scheduled"
              message="No scheduled teaching periods for selected date."
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}