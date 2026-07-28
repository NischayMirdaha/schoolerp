import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { examService } from '../../../services/examService';
import { AcademicService } from '../../../services/academicService';
import { ClassMeritRecordDto } from '../../../types/exam';
import { ExamResponse, ClassResponse } from '../../../types/academic';
import ScreenHeader from '../../../components/ScreenHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import ListItemCard from '../../../components/ListItemCard';

/**
 * Class merit / rank list.
 *
 * FIX: previously defaulted examId and classId to '1' when route params were
 * absent — and the Principal "More" menu links here without params, so it
 * always showed exam #1 / class #1. Now both must be picked explicitly.
 */
export default function MeritRankScreen() {
  const params = useLocalSearchParams<{ examId?: string; classId?: string }>();

  const [pickerLoading, setPickerLoading] = useState(true);
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);

  const [selectedExamId, setSelectedExamId] = useState<number | null>(
    params.examId ? Number(params.examId) : null
  );
  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    params.classId ? Number(params.classId) : null
  );

  const [loading, setLoading] = useState(false);
  const [meritList, setMeritList] = useState<ClassMeritRecordDto[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setPickerLoading(true);
        const [examsRes, classesRes] = await Promise.allSettled([
          AcademicService.listExams(),
          AcademicService.listClasses(),
        ]);
        setExams(examsRes.status === 'fulfilled' ? examsRes.value : []);
        setClasses(classesRes.status === 'fulfilled' ? classesRes.value : []);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load exams and classes.');
      } finally {
        setPickerLoading(false);
      }
    })();
  }, []);

  const fetchMeritRank = useCallback(async (examId: number, classId: number) => {
    try {
      setLoading(true);
      const data = await examService.getClassMeritRank(examId, classId);
      setMeritList(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load class merit rank list.');
      setMeritList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch once BOTH selections are explicit.
  useEffect(() => {
    if (selectedExamId != null && selectedClassId != null) {
      fetchMeritRank(selectedExamId, selectedClassId);
    } else {
      setMeritList([]);
    }
  }, [selectedExamId, selectedClassId, fetchMeritRank]);

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  if (pickerLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Class Merit Rank List"
          subtitle={
            selectedExam && selectedClass
              ? `${selectedExam.name} — ${selectedClass.name}`
              : 'Select an exam and class'
          }
        />
      </View>

      {/* ── Exam picker ── */}
      <Text className="px-4 text-xs font-body-semibold text-slate-600 mb-2">1. Select Exam</Text>
      {exams.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3">
          {exams.map((e) => {
            const active = selectedExamId === e.id;
            return (
              <TouchableOpacity
                key={e.id}
                className={`px-3 py-2 rounded-xl mr-2 border ${
                  active ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                }`}
                onPress={() => setSelectedExamId(e.id)}
              >
                <Text className={`text-xs font-body-bold ${active ? 'text-white' : 'text-slate-800'}`}>
                  {e.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View className="px-4">
          <EmptyState
            icon="document-text-outline"
            title="No Exams Found"
            message="Create an exam under Academic Structure first."
          />
        </View>
      )}

      {/* ── Class picker ── */}
      <Text className="px-4 text-xs font-body-semibold text-slate-600 mb-2">2. Select Class</Text>
      {classes.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3">
          {classes.map((c) => {
            const active = selectedClassId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                className={`px-3 py-2 rounded-xl mr-2 border ${
                  active ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                }`}
                onPress={() => setSelectedClassId(c.id)}
              >
                <Text className={`text-xs font-body-bold ${active ? 'text-white' : 'text-slate-800'}`}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <Text className="px-4 text-xs font-body text-slate-500 mb-3">No classes configured yet.</Text>
      )}

      {/* ── Merit list ── */}
      {selectedExamId == null || selectedClassId == null ? (
        <View className="px-4 flex-1">
          <EmptyState
            icon="trophy-outline"
            title="No Selection"
            message="Choose an exam and a class above to view the merit list."
          />
        </View>
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView className="flex-1 px-4">
          {meritList.length > 0 ? (
            meritList.map((item) => (
              <ListItemCard
                key={item.studentId}
                title={`#${item.rank ?? '-'} ${item.studentName}`}
                subtitle={`Total: ${item.totalMarksObtained}/${item.totalMaxMarks} (${item.percentage}%)`}
                badge={item.letterGrade || 'N/A'}
                badgeColor="mint"
              />
            ))
          ) : (
            <EmptyState
              icon="trophy-outline"
              title="No Merit Rank Available"
              message="Merit rank appears once exam results are published for this class."
            />
          )}
          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  );
}