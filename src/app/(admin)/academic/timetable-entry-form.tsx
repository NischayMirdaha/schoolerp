import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { timetableService } from '../../../services/timetableService';
import { AcademicService } from '../../../services/academicService';
import { StaffService } from '../../../services/staffService';
import { SectionResponse, SubjectResponse } from '../../../types/academic';
import { TeacherResponse } from '../../../types/staff';
import ScreenHeader from '../../../components/ScreenHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';

/**
 * Create / edit / delete a single timetable slot.
 * Opened from the Weekly Timetable screen by tapping a teaching slot.
 *
 * Route params (all strings):
 *   academicYearId, classId, className, dayOfWeek, dayName,
 *   periodId, periodLabel,
 *   entryId?, sectionId?, subjectId?, teacherId?   (edit mode only)
 */
export default function TimetableEntryFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    academicYearId: string;
    classId: string;
    className: string;
    dayOfWeek: string;
    dayName: string;
    periodId: string;
    periodLabel: string;
    entryId?: string;
    sectionId?: string;
    subjectId?: string;
    teacherId?: string;
  }>();

  const academicYearId = Number(params.academicYearId);
  const classId = Number(params.classId);
  const dayOfWeek = Number(params.dayOfWeek);
  const periodId = Number(params.periodId);
  const entryId = params.entryId ? Number(params.entryId) : null;
  const isEdit = entryId !== null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);

  const [sectionId, setSectionId] = useState<number | null>(
    params.sectionId ? Number(params.sectionId) : null
  );
  const [subjectId, setSubjectId] = useState<number | null>(
    params.subjectId ? Number(params.subjectId) : null
  );
  const [teacherId, setTeacherId] = useState<number | null>(
    params.teacherId ? Number(params.teacherId) : null
  );

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const [sectionList, subjectList, teacherPage] = await Promise.all([
        AcademicService.listSections(classId),
        AcademicService.listSubjects(),
        StaffService.listTeachers(undefined, true, 1, 100),
      ]);
      setSections(sectionList);
      setSubjects(subjectList);
      setTeachers(teacherPage.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load form options.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (isEdit) {
        await timetableService.updateTimetableEntry(entryId!, {
          subjectId,
          teacherId,
        });
        Alert.alert('Saved', 'Timetable slot updated.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await timetableService.createTimetableEntry({
          academicYearId,
          classId,
          sectionId,
          dayOfWeek,
          periodId,
          subjectId,
          teacherId,
        });
        Alert.alert('Saved', 'Timetable slot assigned.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save timetable slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!isEdit) return;
    Alert.alert('Remove Slot', 'Remove this subject/teacher assignment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setSaving(true);
            await timetableService.deleteTimetableEntry(entryId!);
            router.back();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to remove slot.');
          } finally {
            setSaving(false);
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
        <ScreenHeader
          title={isEdit ? 'Edit Timetable Slot' : 'Assign Timetable Slot'}
          subtitle={`${params.className || ''} • ${params.dayName || ''} • ${params.periodLabel || ''}`}
        />
      </View>

      <ScrollView className="flex-1 px-4">
        <Text className="text-sm font-body-bold text-slate-800 mb-2">Section</Text>
        <View className="flex-row flex-wrap">
          {sections.map((s) => {
            const sel = sectionId === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                disabled={isEdit} // section is part of the slot identity in edit mode
                className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${
                  sel ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                }`}
                onPress={() => setSectionId(sel ? null : s.id)}
              >
                <Text className={`text-xs font-body-bold ${sel ? 'text-white' : 'text-slate-700'}`}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          {sections.length === 0 ? (
            <Text className="text-xs font-body text-slate-400 italic">No sections for this class.</Text>
          ) : null}
        </View>

        <Text className="text-sm font-body-bold text-slate-800 mb-2 mt-4">Subject</Text>
        <View className="flex-row flex-wrap">
          {subjects.map((s) => {
            const sel = subjectId === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${
                  sel ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                }`}
                onPress={() => setSubjectId(sel ? null : s.id)}
              >
                <Text className={`text-xs font-body-bold ${sel ? 'text-white' : 'text-slate-700'}`}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-sm font-body-bold text-slate-800 mb-2 mt-4">Teacher</Text>
        <View className="flex-row flex-wrap">
          {teachers.map((t) => {
            const sel = teacherId === t.teacherId;
            return (
              <TouchableOpacity
                key={t.teacherId}
                className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${
                  sel ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                }`}
                onPress={() => setTeacherId(sel ? null : t.teacherId)}
              >
                <Text className={`text-xs font-body-bold ${sel ? 'text-white' : 'text-slate-700'}`}>
                  {`${t.firstName} ${t.lastName ?? ''}`.trim()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-xs font-body text-slate-400 mt-2">
          Tap a selected chip again to clear it. Subject and teacher may be left empty.
        </Text>
        <View className="h-8" />
      </ScrollView>

      <View className="p-4 bg-white border-t border-primary-100">
        <PrimaryButton
          label={saving ? 'Saving...' : isEdit ? 'Update Slot' : 'Assign Slot'}
          onPress={handleSave}
          isLoading={saving}
        />
        {isEdit ? (
          <TouchableOpacity className="mt-3 items-center py-2" onPress={handleDelete}>
            <Text className="text-sm font-body-bold text-coral-600">Remove Slot</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}