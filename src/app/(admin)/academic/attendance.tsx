import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { attendanceService } from '../../../services/attendanceService';
import { AcademicService } from '../../../services/academicService';
import { StudentAdminService } from '../../../services/studentAdminService';
import { StudentAttendanceSummaryResponse } from '../../../types/attendance';
import { ClassResponse, SectionResponse } from '../../../types/academic';
import { StudentResponse } from '../../../types/student';
import ScreenHeader from '../../../components/ScreenHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ListItemCard from '../../../components/ListItemCard';
import EmptyState from '../../../components/EmptyState';

/**
 * Student attendance report.
 *
 * FIX (#3): this screen was a debug harness — a raw "Student ID" text box
 * defaulting to '1'. A principal had no way to know which ID mapped to which
 * student, and the underlying service URL was wrong so it always 404'd.
 * Now: pick class -> (section) -> student from real data.
 */
export default function StudentAttendanceReportScreen() {
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const [summary, setSummary] = useState<StudentAttendanceSummaryResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const cls = await AcademicService.listClasses();
        setClasses(cls);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load classes.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load sections whenever the class changes.
  useEffect(() => {
    if (selectedClassId == null) {
      setSections([]);
      return;
    }
    (async () => {
      try {
        const secs = await AcademicService.listSections(selectedClassId);
        setSections(secs);
      } catch {
        setSections([]);
      }
    })();
  }, [selectedClassId]);

  // Load students for the chosen class (+ optional section).
  useEffect(() => {
    if (selectedClassId == null) {
      setStudents([]);
      return;
    }
    (async () => {
      try {
        const res = await StudentAdminService.listStudents(
          {
            classId: selectedClassId,
            sectionId: selectedSectionId ?? undefined,
            status: 'active',
          },
          1,
          100
        );
        setStudents(res.items);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load students.');
        setStudents([]);
      }
    })();
  }, [selectedClassId, selectedSectionId]);

  const loadSummary = useCallback(async (studentId: number) => {
    try {
      setFetching(true);
      const data = await attendanceService.getStudentAttendanceSummary(studentId);
      setSummary(data);
    } catch (err: any) {
      // A student with no attendance rows yet is a legitimate 404 from the API.
      Alert.alert('No Data', err.message || 'No attendance has been recorded for this student yet.');
      setSummary(null);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStudentId != null) {
      loadSummary(selectedStudentId);
    } else {
      setSummary(null);
    }
  }, [selectedStudentId, loadSummary]);

  if (loading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Student Attendance"
          subtitle="Per-student attendance percentage"
        />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* 1. Class */}
        <Text className="text-xs font-body-semibold text-slate-600 mb-2">1. Select Class</Text>
        {classes.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            {classes.map((c) => {
              const active = selectedClassId === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  className={`px-3 py-2 rounded-xl mr-2 border ${
                    active ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                  }`}
                  onPress={() => {
                    setSelectedClassId(c.id);
                    setSelectedSectionId(null);
                    setSelectedStudentId(null);
                  }}
                >
                  <Text className={`text-xs font-body-bold ${active ? 'text-white' : 'text-slate-800'}`}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <EmptyState icon="school-outline" title="No Classes" message="Create classes first." />
        )}

        {/* 2. Section (optional) */}
        {selectedClassId != null && sections.length > 0 ? (
          <>
            <Text className="text-xs font-body-semibold text-slate-600 mb-2">2. Section (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <TouchableOpacity
                className={`px-3 py-2 rounded-xl mr-2 border ${
                  selectedSectionId === null ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                }`}
                onPress={() => {
                  setSelectedSectionId(null);
                  setSelectedStudentId(null);
                }}
              >
                <Text className={`text-xs font-body-bold ${selectedSectionId === null ? 'text-white' : 'text-slate-800'}`}>
                  All
                </Text>
              </TouchableOpacity>

              {sections.map((s) => {
                const active = selectedSectionId === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    className={`px-3 py-2 rounded-xl mr-2 border ${
                      active ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                    }`}
                    onPress={() => {
                      setSelectedSectionId(s.id);
                      setSelectedStudentId(null);
                    }}
                  >
                    <Text className={`text-xs font-body-bold ${active ? 'text-white' : 'text-slate-800'}`}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        ) : null}

        {/* 3. Student */}
        {selectedClassId != null ? (
          <>
            <Text className="text-xs font-body-semibold text-slate-600 mb-2">3. Select Student</Text>
            {students.length > 0 ? (
              students.map((st) => {
                const active = selectedStudentId === st.studentId;
                const name = `${st.firstName} ${st.lastName ?? ''}`.trim();
                return (
                  <TouchableOpacity
                    key={st.studentId}
                    className={`p-3 rounded-2xl mb-2 border ${
                      active ? 'bg-primary-50 border-primary-400' : 'bg-white border-primary-100'
                    }`}
                    onPress={() => setSelectedStudentId(st.studentId)}
                  >
                    <Text className="text-sm font-body-bold text-slate-800">{name}</Text>
                    <Text className="text-xs font-body text-slate-500">
                      Adm: {st.admissionNo}
                      {st.rollNo ? ` | Roll: ${st.rollNo}` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text className="text-xs font-body text-slate-500 mb-3">
                No active students in this class/section.
              </Text>
            )}
          </>
        ) : null}

        {/* Summary */}
        {fetching ? (
          <LoadingSpinner />
        ) : summary ? (
          <View className="mt-4">
            <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-4 items-center">
              <Text className="text-3xl font-body-bold text-primary-600">
                {summary.attendancePercentage}%
              </Text>
              <Text className="text-sm font-body-semibold text-slate-700 mt-1">Overall Attendance</Text>
              <Text className="text-xs font-body text-slate-500 mt-0.5">
                {summary.studentName} (Adm: {students.find((s) => s.studentId === selectedStudentId)?.admissionNo ?? 'N/A'})
              </Text>
            </View>

            <ListItemCard
              title="Total Marked Days"
              subtitle={`${summary.totalDays} Days`}
              badge="Total"
              badgeColor="primary"
            />
            <ListItemCard
              title="Present Days"
              subtitle={`${summary.presentDays} Days`}
              badge="Present"
              badgeColor="mint"
            />
            <ListItemCard
              title="Absent Days"
              subtitle={`${summary.absentDays} Days`}
              badge="Absent"
              badgeColor="coral"
            />
          </View>
        ) : null}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}