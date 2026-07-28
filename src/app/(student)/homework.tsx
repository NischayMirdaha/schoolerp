import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { homeworkService } from '../../services/homeworkService';
import { HomeworkResponse } from '../../types/homework';
import ScreenHeader from '../../components/ScreenHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function StudentHomeworkScreen() {
  const [loading, setLoading] = useState(true);
  const [homeworkList, setHomeworkList] = useState<HomeworkResponse[]>([]);

  useEffect(() => {
    fetchMyHomework();
  }, []);

  const fetchMyHomework = async () => {
    try {
      setLoading(true);
      const res = await homeworkService.listMyHomework();
      setHomeworkList(res.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load assigned homework.');
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
        <ScreenHeader title="Digital Diary" subtitle="Assigned homework and due dates" />
      </View>

      <ScrollView className="flex-1 px-4">
        {homeworkList.length > 0 ? (
          homeworkList.map((hw) => (
            <View
              key={hw.id}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs font-body-bold text-primary-600">
                  {hw.subjectName} • Teacher: {hw.teacherName}
                </Text>
                <View
                  className={`px-2.5 py-1 rounded-full ${
                    hw.isDoneByMe ? 'bg-emerald-100' : 'bg-coral-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-body-bold ${
                      hw.isDoneByMe ? 'text-emerald-700' : 'text-coral-700'
                    }`}
                  >
                    {hw.isDoneByMe ? 'Completed' : 'Pending'}
                  </Text>
                </View>
              </View>

              <Text className="text-base font-body-bold text-slate-800">{hw.title}</Text>
              {/* Not truncated — students need the full instructions.
                  React Native <Text> renders \n natively, so the teacher's
                  line breaks appear exactly as typed. */}
              {hw.description ? (
                <Text className="text-xs font-body text-slate-600 mt-1 leading-5">
                  {hw.description}
                </Text>
              ) : null}

              <Text className="text-xs font-body-semibold text-slate-500 mt-2">
                Due Date: {hw.dueDate}
              </Text>
            </View>
          ))
        ) : (
          <EmptyState
            icon="book-outline"
            title="No Homework Due"
            message="You currently have no pending homework tasks."
          />
        )}
      </ScrollView>
    </View>
  );
}