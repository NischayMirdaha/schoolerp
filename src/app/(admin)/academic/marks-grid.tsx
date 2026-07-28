import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { examService } from '../../../services/examService';
import { AcademicService } from '../../../services/academicService';
import { ExamScheduleMarksGridResponse, StudentMarkRecordDto } from '../../../types/exam';
import { ExamResponse, ExamScheduleResponse } from '../../../types/academic';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

/**
 * Marks entry grid.
 *
 * FIX: previously read examScheduleId from route params with a hardcoded
 * fallback of '1' — but the Principal "More" menu links here with NO params,
 * so it always opened exam schedule #1. On a populated database that silently
 * loaded the wrong class, and marks could be entered and published against it.
 * The screen now requires an explicit exam -> schedule selection first.
 */
export default function MarksGridScreen() {
  // A deep link may still pass a scheduleId; honour it, but never invent one.
  const params = useLocalSearchParams<{ examScheduleId?: string }>();
  const deepLinkScheduleId = params.examScheduleId ? Number(params.examScheduleId) : null;

  // ── Picker state ───────────────────────────────────────────────────────
  const [pickerLoading, setPickerLoading] = useState(true);
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [schedules, setSchedules] = useState<ExamScheduleResponse[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(deepLinkScheduleId);

  // ── Grid state ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [grid, setGrid] = useState<ExamScheduleMarksGridResponse | null>(null);
  const [marksList, setMarksList] = useState<StudentMarkRecordDto[]>([]);
  const [postPublishNote, setPostPublishNote] = useState('');

  // Load the exam list once.
  useEffect(() => {
    (async () => {
      try {
        setPickerLoading(true);
        const data = await AcademicService.listExams();
        setExams(data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load exams.');
      } finally {
        setPickerLoading(false);
      }
    })();
  }, []);

  // Load schedules whenever the chosen exam changes.
  useEffect(() => {
    if (selectedExamId == null) {
      setSchedules([]);
      return;
    }
    (async () => {
      try {
        const data = await AcademicService.listExamSchedules(selectedExamId);
        setSchedules(data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load exam schedules.');
        setSchedules([]);
      }
    })();
  }, [selectedExamId]);

  const fetchGrid = useCallback(async (scheduleId: number) => {
    try {
      setLoading(true);
      const data = await examService.getMarksGrid(scheduleId);
      setGrid(data);
      setMarksList(data.marks);
      setPostPublishNote('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load marks grid.');
      setGrid(null);
      setMarksList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only ever fetches for an explicitly selected schedule.
  useEffect(() => {
    if (selectedScheduleId != null) {
      fetchGrid(selectedScheduleId);
    } else {
      setGrid(null);
      setMarksList([]);
    }
  }, [selectedScheduleId, fetchGrid]);

  const handleMarkChange = (studentId: number, value: string) => {
    // Allow clearing the field; treat empty as 0 on save.
    const num = value === '' ? 0 : Number(value);
    if (Number.isNaN(num)) return;

    // Guard against entering more than the paper is out of.
    if (grid && num > grid.maxMarks) {
      Alert.alert('Invalid Marks', `Marks cannot exceed the maximum of ${grid.maxMarks}.`);
      return;
    }

    setMarksList((prev) =>
      prev.map((m) => (m.studentId === studentId ? { ...m, marksObtained: num } : m))
    );
  };

  const handleSaveMarks = async () => {
    if (!grid || selectedScheduleId == null) return;

    if (grid.isPublished && !postPublishNote.trim()) {
      Alert.alert('Audit Required', 'A post-publish edit note is required when editing published marks.');
      return;
    }

    try {
      setSaving(true);
      await examService.saveStudentMarks({
        examScheduleId: selectedScheduleId,
        marks: marksList.map((m) => ({
          studentId: m.studentId,
          marksObtained: m.marksObtained,
          remarks: m.remarks,
          postPublishEditNote: grid.isPublished ? postPublishNote.trim() : null,
        })),
      });

      Alert.alert('Success', grid.isPublished ? 'Published marks updated with audit note.' : 'Marks saved as draft.');
      fetchGrid(selectedScheduleId);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (selectedScheduleId == null || !grid) return;

    Alert.alert(
      'Confirm Publish',
      // Names the exact target so a mis-selection is caught before publishing.
      `Publish results for ${grid.examName} — ${grid.subjectName} (${grid.className})?\n\n` +
        'Published results become immediately visible to students and parents.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              setPublishing(true);
              await examService.publishExamSchedule(selectedScheduleId);
              Alert.alert('Success', 'Exam schedule results published successfully.');
              fetchGrid(selectedScheduleId);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to publish exam results.');
            } finally {
              setPublishing(false);
            }
          },
        },
      ]
    );
  };

  if (pickerLoading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title={grid ? `${grid.examName} — ${grid.subjectName}` : 'Marks Entry'}
          subtitle={
            grid
              ? `Class: ${grid.className} | Max Marks: ${grid.maxMarks}`
              : 'Select an exam and subject to begin'
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
                onPress={() => {
                  setSelectedExamId(e.id);
                  setSelectedScheduleId(null); // reset downstream selection
                }}
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

      {/* ── Schedule picker ── */}
      {selectedExamId != null ? (
        <>
          <Text className="px-4 text-xs font-body-semibold text-slate-600 mb-2">
            2. Select Class & Subject
          </Text>
          {schedules.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3">
              {schedules.map((s) => {
                const active = selectedScheduleId === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    className={`px-3 py-2 rounded-xl mr-2 border ${
                      active ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                    }`}
                    onPress={() => setSelectedScheduleId(s.id)}
                  >
                    <Text className={`text-xs font-body-bold ${active ? 'text-white' : 'text-slate-800'}`}>
                      {s.className} {s.sectionName ? `(${s.sectionName})` : ''}
                    </Text>
                    <Text className={`text-xs font-body ${active ? 'text-primary-100' : 'text-slate-500'}`}>
                      {s.subjectName} {s.isPublished ? '• published' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <Text className="px-4 text-xs font-body text-slate-500 mb-3">
              This exam has no class/subject schedules yet.
            </Text>
          )}
        </>
      ) : null}

      {/* ── Grid ── */}
      {selectedScheduleId == null ? (
        <View className="px-4 flex-1">
          <EmptyState
            icon="create-outline"
            title="No Subject Selected"
            message="Choose an exam and a class/subject above to enter marks."
          />
        </View>
      ) : loading ? (
        <LoadingSpinner />
      ) : grid ? (
        <>
          <View className="px-4 mb-3 flex-row justify-between items-center">
            <View className={`px-3 py-1 rounded-full ${grid.isPublished ? 'bg-mint-100' : 'bg-coral-100'}`}>
              <Text className={`text-xs font-body-bold ${grid.isPublished ? 'text-mint-600' : 'text-coral-700'}`}>
                {grid.isPublished ? 'PUBLISHED' : 'DRAFT (Staff Only)'}
              </Text>
            </View>

            {!grid.isPublished ? (
              <TouchableOpacity
                className="bg-mint-600 px-3 py-1.5 rounded-xl"
                onPress={handlePublish}
                disabled={publishing}
              >
                <Text className="text-xs font-body-bold text-white">Publish Results</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {grid.isPublished ? (
            <View className="px-4 mb-3">
              <FormField
                label="Post-Publish Edit Audit Note *"
                value={postPublishNote}
                onChangeText={setPostPublishNote}
                placeholder="Reason for changing published marks"
              />
            </View>
          ) : null}

          <ScrollView className="flex-1 px-4 mb-4">
            {marksList.length > 0 ? (
              marksList.map((student) => (
                <View
                  key={student.studentId}
                  className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3 flex-row justify-between items-center"
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-body-bold text-slate-800">{student.studentName}</Text>
                    <Text className="text-xs font-body text-slate-500">
                      Adm: {student.admissionNumber}
                      {student.rollNumber ? ` | Roll: ${student.rollNumber}` : ''}
                    </Text>
                  </View>

                  <View className="w-24">
                    <Text className="text-xs font-body-semibold text-slate-600 mb-1">
                      Marks / {grid.maxMarks}
                    </Text>
                    <TextInput
                      className="bg-cream-50 border border-primary-200 rounded-xl px-3 py-2 text-base font-body-bold text-slate-900 text-center"
                      value={String(student.marksObtained)}
                      onChangeText={(v) => handleMarkChange(student.studentId, v)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                icon="people-outline"
                title="No Students"
                message="No active students found for this class/section."
              />
            )}
          </ScrollView>

          {marksList.length > 0 ? (
            <View className="p-4 bg-white border-t border-primary-100">
              <PrimaryButton
                label={saving ? 'Saving...' : 'Save Marks'}
                onPress={handleSaveMarks}
                isLoading={saving}
              />
            </View>
          ) : null}
        </>
      ) : (
        <View className="px-4 flex-1">
          <EmptyState
            icon="alert-circle-outline"
            title="Couldn't load marks"
            message="Please pick the subject again."
          />
        </View>
      )}
    </View>
  );
}