import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useActiveChild } from '../../context/ActiveChildContext';
import { timetableService } from '../../services/timetableService';
import { TimetableEntryResponse } from '../../types/timetable';
import ScreenHeader from '../../components/ScreenHeader';
import ChildSelectorHeader from '../../components/ChildSelectorHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const DAYS = [
  { id: 1, name: 'Mon' },
  { id: 2, name: 'Tue' },
  { id: 3, name: 'Wed' },
  { id: 4, name: 'Thu' },
  { id: 5, name: 'Fri' },
  { id: 6, name: 'Sat' },
  { id: 7, name: 'Sun' },
];

export default function ParentTimetableScreen() {
  const { activeChild } = useActiveChild();
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [entries, setEntries] = useState<TimetableEntryResponse[]>([]);

  useEffect(() => {
    if (activeChild) {
      fetchChildTimetable();
    }
  }, [activeChild]);

  const fetchChildTimetable = async () => {
    if (!activeChild) return;
    try {
      setLoading(true);
      const data = await timetableService.listTimetable(
        undefined,
        activeChild.classId,
        activeChild.sectionId || undefined
      );
      setEntries(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load child timetable.');
    } finally {
      setLoading(false);
    }
  };

  const dayEntries = entries
    .filter((e) => e.dayOfWeek === selectedDay)
    .sort((a, b) => a.periodNo - b.periodNo);

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Child Timetable" subtitle="Class period schedule" />
        <ChildSelectorHeader />
      </View>

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
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView className="flex-1 px-4">
          {dayEntries.length > 0 ? (
            dayEntries.map((e) => (
              <View
                key={e.id}
                className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
              >
                <Text className="text-xs font-body-bold text-primary-600">
                  Period {e.periodNo} ({e.startTime.slice(0, 5)} - {e.endTime.slice(0, 5)})
                </Text>
                <Text className="text-base font-body-bold text-slate-800 mt-1">
                  {e.subjectName || 'Subject'}
                </Text>
                {e.teacherName ? (
                  <Text className="text-xs font-body text-slate-500">Teacher: {e.teacherName}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No Periods Scheduled"
              message="No classes scheduled for this day."
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}