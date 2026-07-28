import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { homeworkService } from '../../../services/homeworkService';
import { TeacherService } from '../../../services/teacherService';
import { TeacherAssignmentResponse } from '../../../types/staff';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import TextAreaField from '../../../components/TextAreaField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

export default function CreateHomeworkScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<TeacherAssignmentResponse[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherAssignmentResponse | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await TeacherService.getMyAssignments();
      setAssignments(data.assignments || []);
      if (data.assignments && data.assignments.length > 0) {
        setSelectedAssignment(data.assignments[0]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load your assigned classes and subjects.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) {
      Alert.alert('Validation Error', 'Please select a class and subject.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      Alert.alert('Validation Error', 'Due date must be in YYYY-MM-DD format.');
      return;
    }

    try {
      setSubmitting(true);
      await homeworkService.createHomework({
        classId: selectedAssignment.classId,
        sectionId: selectedAssignment.sectionId,
        subjectId: selectedAssignment.subjectId,
        targetScope: selectedAssignment.sectionId ? 'section' : 'class',
        title: title.trim(),
        description: description.trim() || null,
        dueDate,
      });

      Alert.alert('Success', 'Homework assigned successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to assign homework.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cream-100"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="p-4">
        <ScreenHeader title="Create Homework" subtitle="Assign digital diary task to students" />
      </View>

      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        {assignments.length === 0 ? (
          <EmptyState
            icon="alert-circle-outline"
            title="No Classes Assigned"
            message="You have no class/subject assignments for the current academic year. Ask your Principal to assign you first."
          />
        ) : (
          <>
            <Text className="text-xs font-body-semibold text-slate-600 mb-2">
              Select Target Class &amp; Subject *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {assignments.map((a) => {
                const isSelected = selectedAssignment?.id === a.id;
                return (
                  <TouchableOpacity
                    key={a.id}
                    className={`p-3 rounded-2xl mr-2 border ${
                      isSelected ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                    }`}
                    onPress={() => setSelectedAssignment(a)}
                  >
                    <Text className={`text-xs font-body-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {a.className} {a.sectionName ? `(${a.sectionName})` : ''}
                    </Text>
                    <Text className={`text-xs font-body ${isSelected ? 'text-primary-100' : 'text-slate-500'}`}>
                      {a.subjectName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-6">
              <FormField
                label="Homework Title *"
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Chapter 4 Exercise 4.2"
              />

              <TextAreaField
                label="Description / Details"
                value={description}
                onChangeText={setDescription}
                placeholder={
                  'Write the full instructions here.\n\n' +
                  'e.g. Chapter 4 — Exercise 4.2\n' +
                  'Pages 56-58, questions 1 to 10\n' +
                  'Show all working in the notebook.'
                }
                minLines={7}
                maxLength={1000}
              />

              <FormField
                label="Due Date (YYYY-MM-DD) *"
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
              />

              <View className="mt-2">
                <PrimaryButton
                  label={submitting ? 'Assigning...' : 'Assign Homework'}
                  onPress={handleSubmit}
                  isLoading={submitting}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}