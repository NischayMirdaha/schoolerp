import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { StaffService } from '../../../services/staffService';
import { TeacherAttendanceSummaryResponse, TeacherResponse, TeacherAttendanceStatus } from '../../../types/staff';
import ScreenHeader from '../../../components/ScreenHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';


/**
 * Teacher attendance — mark today's status and review the monthly summary.
 *
 * FIX (#4, #10): the Principal dashboard's "Teacher Attendance Today" card routed
 * to the STUDENT attendance report, so there was no way to view or mark teacher
 * attendance at all. Both endpoints (POST /api/teachers/attendance and
 * GET /api/teachers/attendance/summary) already existed and were unused.
 * Per §7.2 teacher attendance is marked by the Principal, not self-marked.
 */
const STATUSES: { value: TeacherAttendanceStatus; label: string; cls: string }[] = [
  { value: 'present', label: 'Present', cls: 'bg-mint-500 border-mint-500' },
  { value: 'absent', label: 'Absent', cls: 'bg-coral-500 border-coral-500' },
  { value: 'half_day_am', label: 'Half AM', cls: 'bg-secondary-500 border-secondary-500' },
  { value: 'half_day_pm', label: 'Half PM', cls: 'bg-secondary-600 border-secondary-600' },
];

export default function TeacherAttendanceScreen() {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [summary, setSummary] = useState<TeacherAttendanceSummaryResponse | null>(null);
  const [markedToday, setMarkedToday] = useState<Record<number, TeacherAttendanceStatus>>({});

  const load = useCallback(async () => {
    try {
      const [teacherRes, summaryRes] = await Promise.allSettled([
        // FIX: listTeachers defaults to pageSize 10 — request a full page so
        // schools with more than 10 teachers aren't silently truncated.
        StaffService.listTeachers(undefined, true, 1, 200),
        StaffService.getTeacherAttendanceSummary(today.getFullYear(), today.getMonth() + 1),
      ]);

      // FIX: listTeachers always returns PagedResult<TeacherResponse>; the old
      // `?? teacherRes.value` fallback was unreachable and mistyped.
      setTeachers(teacherRes.status === 'fulfilled' ? teacherRes.value.items : []);
      setSummary(summaryRes.status === 'fulfilled' ? summaryRes.value : null);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load teacher attendance.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleMark = async (teacherId: number, status: TeacherAttendanceStatus) => {
    try {
      setSavingId(teacherId);
      await StaffService.markTeacherAttendance({
        teacherId,
        date: todayIso,
        status,
      });
      setMarkedToday((prev) => ({ ...prev, [teacherId]: status }));
      await load();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark attendance.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  const summaryByTeacher = new Map(
    (summary?.summaries ?? []).map((s) => [s.teacherId, s])
  );

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Teacher Attendance"
          subtitle={`Mark for ${todayIso} · monthly summary below`}
        />
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0284c7" />}
      >
        {summary ? (
          <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4 items-center">
            <Text className="text-3xl font-body-bold text-primary-600">{summary.totalTeachers}</Text>
            <Text className="text-sm font-body-semibold text-slate-700 mt-1">Total Teachers</Text>
            <Text className="text-xs font-body text-slate-500 mt-0.5">
              Summary for {summary.month}/{summary.year}
            </Text>
          </View>
        ) : null}

        {teachers.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No Teachers"
            message="No teacher profiles exist for this school yet."
          />
        ) : (
          teachers.map((t) => {
            const s = summaryByTeacher.get(t.teacherId);
            const marked = markedToday[t.teacherId];
            const name = `${t.firstName} ${t.lastName ?? ''}`.trim();

            return (
              <View
                key={t.teacherId}
                className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
              >
                <Text className="text-base font-body-bold text-slate-800">{name}</Text>
                <Text className="text-xs font-body text-slate-500">
                  Emp: {t.employeeId}
                  {s ? ` · ${s.presentDays}/${s.totalDaysMarked} present (${s.attendancePercentage}%)` : ''}
                </Text>

                <View className="flex-row flex-wrap mt-3">
                  {STATUSES.map((st) => {
                    const active = marked === st.value;
                    return (
                      <TouchableOpacity
                        key={st.value}
                        className={`px-3 py-1.5 rounded-xl mr-2 mb-2 border ${
                          active ? st.cls : 'bg-cream-50 border-primary-100'
                        }`}
                        disabled={savingId === t.teacherId}
                        onPress={() => handleMark(t.teacherId, st.value)}
                      >
                        <Text
                          className={`text-xs font-body-bold ${active ? 'text-white' : 'text-slate-700'}`}
                        >
                          {st.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}