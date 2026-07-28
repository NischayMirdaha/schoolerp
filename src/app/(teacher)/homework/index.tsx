import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { homeworkService } from '../../../services/homeworkService';
import { HomeworkResponse } from '../../../types/homework';
import ScreenHeader from '../../../components/ScreenHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import ListItemCard from '../../../components/ListItemCard';

export default function TeacherHomeworkListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [homeworkList, setHomeworkList] = useState<HomeworkResponse[]>([]);

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const res = await homeworkService.listTeacherHomework();
      setHomeworkList(res.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load assigned homework.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Homework', 'Are you sure you want to delete this assignment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await homeworkService.deleteHomework(id);
            fetchHomework();
            Alert.alert('Success', 'Homework assignment deleted.');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete homework.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader title="Homework Diary" subtitle="Assigned homework and digital diary" />
      </View>

      <View className="flex-row justify-between items-center px-4 mb-3">
        <Text className="text-base font-body-bold text-slate-800">
          Assignments ({homeworkList.length})
        </Text>
        <TouchableOpacity
          className="bg-primary-500 px-3 py-2 rounded-xl"
          onPress={() => router.push('/(teacher)/homework/create' as any)}
        >
          <Text className="text-xs font-body-bold text-white">+ Create Homework</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {homeworkList.length > 0 ? (
          homeworkList.map((hw) => (
            <TouchableOpacity
              key={hw.id}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
              onPress={() =>
                router.push({
                  pathname: '/(teacher)/homework/[id]/checklist' as any,
                  params: { id: String(hw.id) },
                })
              }
            >
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-xs font-body-bold text-primary-600">
                  {hw.className} {hw.sectionName ? `(${hw.sectionName})` : ''} • {hw.subjectName}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(hw.id)}>
                  <Text className="text-xs font-body-semibold text-coral-600">Delete</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-base font-body-bold text-slate-800">{hw.title}</Text>
              {/* Truncated to 2 lines in the list view; leading-5 keeps wrapped
                  multi-line descriptions readable. */}
              {hw.description ? (
                <Text className="text-xs font-body text-slate-600 mt-1 leading-5" numberOfLines={2}>
                  {hw.description}
                </Text>
              ) : null}

              <Text className="text-xs font-body-semibold text-slate-500 mt-2">
                Due Date: {hw.dueDate}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            icon="book-outline"
            title="No Homework Assigned"
            message="Click '+ Create Homework' to assign tasks to your classes."
          />
        )}
      </ScrollView>
    </View>
  );
}