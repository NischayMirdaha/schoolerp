import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { attendanceService } from '../../../services/attendanceService';
import { AttendanceSheetResponse, AttendanceSheetStudentDto } from '../../../types/attendance';
import ScreenHeader from '../../../components/ScreenHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function MarkAttendanceSheetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    classId: string;
    sectionId?: string;
    periodId: string;
    subjectId?: string;
    date: string;
  }>();

  const classId = Number(params.classId);
  const sectionId = params.sectionId ? Number(params.sectionId) : undefined;
  const periodId = Number(params.periodId);
  const subjectId = params.subjectId ? Number(params.subjectId) : undefined;
  const date = params.date;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sheet, setSheet] = useState<AttendanceSheetResponse | null>(null);
  const [studentList, setStudentList] = useState<AttendanceSheetStudentDto[]>([]);

  useEffect(() => {
    fetchSheet();
  }, []);

  const fetchSheet = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getAttendanceSheet(classId, date, periodId, sectionId);
      setSheet(data);
      setStudentList(
        data.records.map((s) => ({
          ...s,
          // 'unmarked' students default to present so a submit can never
          // send a status the backend's validator rejects.
          status: s.status === 'absent' ? 'absent' : 'present',
        })),
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load attendance sheet.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId: number) => {
    setStudentList((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? { ...s, status: s.status === 'present' ? 'absent' : 'present' }
          : s
      )
    );
  };

  const markAllPresent = () => {
    setStudentList((prev) => prev.map((s) => ({ ...s, status: 'present' })));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
            await attendanceService.markStudentAttendance({
        classId,
        sectionId,
        date,
        periodId,
        subjectId,
        records: studentList.map((s) => ({
          studentId: s.studentId,
          // submit contract is strictly 'present' | 'absent'
          status: s.status === 'absent' ? 'absent' : 'present',
          remarks: s.remarks,
        })),
      });

      Alert.alert('Success', 'Attendance marked successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader
          title={`Attendance Sheet (${sheet?.className || 'Class'})`}
          subtitle={`Date: ${date} | Period ${sheet?.periodNo || ''}`}
        />
      </View>

      {/* Roster Bar Controls */}
      <View className="flex-row justify-between items-center px-4 mb-3">
        <Text className="text-sm font-body-bold text-slate-800">
          Students ({studentList.length})
        </Text>
        <TouchableOpacity
          className="bg-primary-100 px-3 py-1.5 rounded-xl border border-primary-200"
          onPress={markAllPresent}
        >
          <Text className="text-xs font-body-bold text-primary-700">Mark All Present</Text>
        </TouchableOpacity>
      </View>

      {/* Roster Student List */}
      <ScrollView className="flex-1 px-4 mb-4">
        {studentList.map((student) => {
          const isPresent = student.status === 'present';

          return (
            <View
              key={student.studentId}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3 flex-row justify-between items-center"
            >
              <View className="flex-1 mr-2">
                <Text className="text-base font-body-bold text-slate-800">
                  {student.studentName}
                </Text>
                <Text className="text-xs font-body text-slate-500">
                  Adm: {student.admissionNumber} {student.rollNumber ? `| Roll: ${student.rollNumber}` : ''}
                </Text>
              </View>

              <TouchableOpacity
                className={`px-4 py-2 rounded-xl border ${
                  isPresent ? 'bg-emerald-500 border-emerald-500' : 'bg-coral-500 border-coral-500'
                }`}
                onPress={() => toggleStatus(student.studentId)}
              >
                <Text className="text-xs font-body-bold text-white">
                  {isPresent ? 'PRESENT' : 'ABSENT'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Submit Action */}
      <View className="p-4 bg-white border-t border-primary-100">
        <PrimaryButton
          label={submitting ? 'Submitting...' : 'Submit Attendance'}
          onPress={handleSubmit}
          isLoading={submitting}
        />
      </View>
    </View>
  );
}