import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { timetableService } from '../../../services/timetableService';
import { AcademicService } from '../../../services/academicService';
import { TimetableEntryResponse, PeriodResponse } from '../../../types/timetable';
import { ClassResponse } from '../../../types/academic';
import ScreenHeader from '../../../components/ScreenHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

const DAYS = [
  { id: 1, name: 'Mon' },
  { id: 2, name: 'Tue' },
  { id: 3, name: 'Wed' },
  { id: 4, name: 'Thu' },
  { id: 5, name: 'Fri' },
  { id: 6, name: 'Sat' },
  { id: 7, name: 'Sun' },
];

export default function ConfigureTimetableScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [periods, setPeriods] = useState<PeriodResponse[]>([]);
  const [entries, setEntries] = useState<TimetableEntryResponse[]>([]);
  // FIX (#9): resolve the real current academic year instead of assuming ID 1.
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Runs on first focus AND every time we come back from the assign/edit form.
  useFocusEffect(
    useCallback(() => {
      if (selectedClassId && academicYearId) {
        fetchTimetable();
      }
    }, [selectedClassId, academicYearId])
  );

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [clsList, periodList, years] = await Promise.all([
        AcademicService.listClasses(),
        timetableService.listPeriods(),
        AcademicService.listAcademicYears(),
      ]);

      setClasses(clsList);
      setPeriods(periodList);

      // Prefer the year flagged IsCurrent; fall back to the first available.
      const current = years.find((y) => y.isCurrent) ?? years[0];
      if (current) {
        setAcademicYearId(current.id);
      } else {
        Alert.alert(
          'No Academic Year',
          'No academic year has been created yet. Create one under Academic Structure before configuring the timetable.'
        );
      }

      if (clsList.length > 0) {
        setSelectedClassId(clsList[0].id);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load initial timetable setup.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedClassId || !academicYearId) return;
    try {
      // FIX (#9): was hardcoded `1`. Academic year IDs are per-school and
      // sequential across the whole table, so ID 1 rarely exists — the request
      // failed and surfaced as "An unexpected error occurred".
      const data = await timetableService.listTimetable(academicYearId, selectedClassId);
      setEntries(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load class timetable.');
      setEntries([]);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const dayEntries = entries.filter((e) => e.dayOfWeek === selectedDay);

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader title="Weekly Timetable" subtitle="View and manage class period slots" />
      </View>

      {/* Class Selector Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3 max-h-10">
        {classes.map((c) => (
          <TouchableOpacity
            key={c.id}
            className={`px-4 py-2 rounded-xl mr-2 ${
              selectedClassId === c.id ? 'bg-primary-500' : 'bg-white border border-primary-100'
            }`}
            onPress={() => setSelectedClassId(c.id)}
          >
            <Text
              className={`text-xs font-body-bold ${
                selectedClassId === c.id ? 'text-white' : 'text-slate-700'
              }`}
            >
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Day Selector Bar */}
      <View className="flex-row justify-between px-4 mb-4">
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d.id}
            className={`flex-1 items-center py-2 rounded-xl mx-0.5 ${
              selectedDay === d.id ? 'bg-primary-600' : 'bg-white border border-primary-100'
            }`}
            onPress={() => setSelectedDay(d.id)}
          >
            <Text
              className={`text-xs font-body-bold ${
                selectedDay === d.id ? 'text-white' : 'text-slate-600'
              }`}
            >
              {d.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Slots List */}
      <ScrollView className="flex-1 px-4">
        {periods.map((p) => {
          const entry = dayEntries.find((e) => e.periodId === p.id);

                    return (
            <TouchableOpacity
              key={p.id}
              disabled={!p.isTeaching}
              className={`bg-white p-4 rounded-2xl border shadow-sm mb-3 flex-row justify-between items-center ${
                p.isTeaching ? 'border-primary-100 active:bg-primary-50' : 'border-slate-100'
              }`}
              onPress={() =>
                router.push({
                  pathname: '/(admin)/academic/timetable-entry-form' as any,
                  params: {
                    academicYearId: String(academicYearId),
                    classId: String(selectedClassId),
                    className: classes.find((c) => c.id === selectedClassId)?.name ?? '',
                    dayOfWeek: String(selectedDay),
                    dayName: DAYS.find((d) => d.id === selectedDay)?.name ?? '',
                    periodId: String(p.id),
                    periodLabel: `Period ${p.periodNo} (${p.startTime.slice(0, 5)} - ${p.endTime.slice(0, 5)})`,
                    entryId: entry ? String(entry.id) : '',
                    sectionId: entry?.sectionId ? String(entry.sectionId) : '',
                    subjectId: entry?.subjectId ? String(entry.subjectId) : '',
                    teacherId: entry?.teacherId ? String(entry.teacherId) : '',
                  },
                })
              }
            >
              <View className="flex-1 mr-2">
                <Text className="text-xs font-body-bold text-primary-600">
                  Period {p.periodNo} ({p.startTime.slice(0, 5)} - {p.endTime.slice(0, 5)})
                </Text>

                {p.isTeaching ? (
                  entry ? (
                    <View className="mt-1">
                      <Text className="text-base font-body-bold text-slate-800">
                        {entry.subjectName || 'Subject'}
                      </Text>
                      <Text className="text-xs font-body text-slate-500">
                        Teacher: {entry.teacherName || 'Unassigned'}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-xs font-body text-slate-400 italic mt-1">Unassigned Slot</Text>
                  )
                ) : (
                  <Text className="text-sm font-body-semibold text-secondary-600 mt-1">
                    {p.label || 'Break Slot'}
                  </Text>
                )}
              </View>

              {p.isTeaching ? (
                <Text
                  className={`text-xs font-body-bold ${entry ? 'text-primary-600' : 'text-coral-600'}`}
                >
                  {entry ? 'Edit ›' : 'Assign ›'}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}

        {periods.length === 0 ? (
          <EmptyState title="No Periods Set" message="Configure daily period slots first." />
        ) : null}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}