import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { homeworkService } from '../../../../services/homeworkService';
import { HomeworkDetailResponse, HomeworkChecklistRecord } from '../../../../types/homework';
import ScreenHeader from '../../../../components/ScreenHeader';
import PrimaryButton from '../../../../components/PrimaryButton';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import EmptyState from '../../../../components/EmptyState';

export default function HomeworkChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const homeworkId = Number(id);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [homework, setHomework] = useState<HomeworkDetailResponse | null>(null);
  const [students, setStudents] = useState<HomeworkChecklistRecord[]>([]);

  useEffect(() => {
    if (homeworkId) {
      fetchDetail();
    }
  }, [homeworkId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await homeworkService.getHomeworkDetail(homeworkId);
      setHomework(data);
      setStudents(data.students || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load homework details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = (studentId: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, isDone: !s.isDone } : s))
    );
  };

  const handleSaveDone = async () => {
    const doneIds = students.filter((s) => s.isDone).map((s) => s.studentId);
    const notDoneIds = students.filter((s) => !s.isDone).map((s) => s.studentId);

    try {
      setSubmitting(true);

      if (doneIds.length > 0) {
        await homeworkService.markHomeworkDone(homeworkId, { studentIds: doneIds, isDone: true });
      }
      if (notDoneIds.length > 0) {
        await homeworkService.markHomeworkDone(homeworkId, { studentIds: notDoneIds, isDone: false });
      }

      Alert.alert('Success', 'Checklist saved. Parents of students marked Done have been notified.');
      fetchDetail();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark homework.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const doneCount = students.filter((s) => s.isDone).length;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title={homework?.title || 'Homework Checklist'}
          subtitle={
            homework
              ? `${homework.subjectName} · ${homework.className}${
                  homework.sectionName ? ` (${homework.sectionName})` : ''
                } · Due ${homework.dueDate}`
              : ''
          }
        />
      </View>

      {students.length > 0 ? (
        <View className="px-4 mb-3">
          <Text className="text-xs font-body-semibold text-slate-600">
            {doneCount} of {students.length} marked done
          </Text>
        </View>
      ) : null}

      <ScrollView className="flex-1 px-4 mb-4">
        {students.length > 0 ? (
          students.map((student) => (
            <View
              key={student.studentId}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3 flex-row justify-between items-center"
            >
              <View className="flex-1 mr-2">
                <Text className="text-base font-body-bold text-slate-800">{student.studentName}</Text>
                <Text className="text-xs font-body text-slate-500">
                  Adm: {student.admissionNumber}
                  {student.rollNumber ? ` | Roll: ${student.rollNumber}` : ''}
                </Text>
              </View>

              <TouchableOpacity
                className={`px-4 py-2 rounded-xl border ${
                  student.isDone ? 'bg-mint-500 border-mint-500' : 'bg-slate-100 border-slate-200'
                }`}
                onPress={() => toggleDone(student.studentId)}
              >
                <Text
                  className={`text-xs font-body-bold ${student.isDone ? 'text-white' : 'text-slate-600'}`}
                >
                  {student.isDone ? 'DONE' : 'PENDING'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <EmptyState
            icon="people-outline"
            title="No Students Assigned"
            message="This homework has no assigned students."
          />
        )}
      </ScrollView>

      {students.length > 0 ? (
        <View className="p-4 bg-white border-t border-primary-100">
          <PrimaryButton
            label={submitting ? 'Saving...' : 'Save Checked Work'}
            onPress={handleSaveDone}
            isLoading={submitting}
          />
        </View>
      ) : null}
    </View>
  );
}