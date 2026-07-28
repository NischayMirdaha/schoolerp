import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../components/ScreenHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import PrimaryButton from '../../../components/PrimaryButton';
import FormField from '../../../components/FormField';
import { StaffService } from '../../../services/staffService';
import { AcademicService } from '../../../services/academicService';
import { parseErrorMessage } from '../../../services/api';
import {
  TeacherResponse,
  TeacherAssignmentResponse,
  ClassTeacherResponse,
  TeacherAttendanceSummaryResponse,
  TeacherAttendanceStatus,
} from '../../../types/staff';
import { AcademicYearResponse, ClassResponse, SectionResponse, SubjectResponse } from '../../../types/academic';

type StaffTab = 'teachers' | 'non-teaching' | 'assignments' | 'attendance';

export default function StaffManagementScreen() {
  const [tab, setTab] = useState<StaffTab>('teachers');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reference data
  const [academicYears, setAcademicYears] = useState<AcademicYearResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);

  // ── Teachers state ────────────────────────────────────────────────────────
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherTotalPages, setTeacherTotalPages] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherResponse | null>(null);

  // Create Teacher Form
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);
  const [tEmpId, setTEmpId] = useState('');
  const [tUsername, setTUsername] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tFirstName, setTFirstName] = useState('');
  const [tLastName, setTLastName] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tJoiningDate, setTJoiningDate] = useState('');
  const [tMornStart, setTMornStart] = useState('');
  const [tMornEnd, setTMornEnd] = useState('');
  const [tAftStart, setTAftStart] = useState('');
  const [tAftEnd, setTAftEnd] = useState('');
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);

  // Add Qualification Form
  const [showAddQual, setShowAddQual] = useState(false);
  const [qDegree, setQDegree] = useState('');
  const [qInstitution, setQInstitution] = useState('');
  const [qYear, setQYear] = useState('');
  const [isSavingQual, setIsSavingQual] = useState(false);

  // ── Non-Teaching Staff Form ───────────────────────────────────────────────
  const [staffRoleId, setStaffRoleId] = useState<4 | 5 | 6 | 7>(5);
  const [sEmpId, setSEmpId] = useState('');
  const [sDesignation, setSDesignation] = useState('');
  const [sUsername, setSUsername] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sFirstName, setSFirstName] = useState('');
  const [sLastName, setSLastName] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [isSavingStaff, setIsSavingStaff] = useState(false);

  // ── Assignments State ─────────────────────────────────────────────────────
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentResponse[]>([]);
  const [classTeachers, setClassTeachers] = useState<ClassTeacherResponse[]>([]);

  // Assign Subject Form
  const [showAssignSubj, setShowAssignSubj] = useState(false);
  const [asgnTeacherId, setAsgnTeacherId] = useState<number | null>(null);
  const [asgnClassId, setAsgnClassId] = useState<number | null>(null);
  const [asgnSectionId, setAsgnSectionId] = useState<number | null>(null);
  const [asgnSubjectId, setAsgnSubjectId] = useState<number | null>(null);
  const [asgnSections, setAsgnSections] = useState<SectionResponse[]>([]);
  const [isSavingAssignSubj, setIsSavingAssignSubj] = useState(false);

  // Assign Class Teacher Form
  const [showAssignCT, setShowAssignCT] = useState(false);
  const [ctTeacherId, setCtTeacherId] = useState<number | null>(null);
  const [ctClassId, setCtClassId] = useState<number | null>(null);
  const [ctSectionId, setCtSectionId] = useState<number | null>(null);
  const [ctSections, setCtSections] = useState<SectionResponse[]>([]);
  const [isSavingCT, setIsSavingCT] = useState(false);

  // ── Teacher Attendance State ──────────────────────────────────────────────
  const [attTeacherId, setAttTeacherId] = useState<number | null>(null);
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState<TeacherAttendanceStatus>('present');
  const [isSavingAtt, setIsSavingAtt] = useState(false);

  const [attSummaryYear, setAttSummaryYear] = useState(new Date().getFullYear());
  const [attSummaryMonth, setAttSummaryMonth] = useState(new Date().getMonth() + 1);
  const [attSummary, setAttSummary] = useState<TeacherAttendanceSummaryResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // ── Loaders ──────────────────────────────────────────────────────────────
  const loadRefData = useCallback(async () => {
    try {
      const [years, cls, subs] = await Promise.all([
        AcademicService.listAcademicYears(),
        AcademicService.listClasses(),
        AcademicService.listSubjects(),
      ]);
      setAcademicYears(years);
      setClasses(cls);
      setSubjects(subs);

      const currYear = years.find((y) => y.isCurrent) || years[0];
      if (currYear && !selectedYearId) {
        setSelectedYearId(currYear.id);
      }
    } catch (err) {
      Alert.alert('Load Error', parseErrorMessage(err));
    }
  }, []);

  const loadTeachers = useCallback(async (page: number, search: string) => {
    try {
      const res = await StaffService.listTeachers(search || undefined, undefined, page, 10);
      setTeachers(res.items);
      setTeacherTotalPages(res.totalPages || 1);
      setTeacherPage(res.page || page);
    } catch (err) {
      setTeachers([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadRefData();
      await loadTeachers(1, teacherSearch);
      setIsLoading(false);
    })();
  }, [loadRefData, loadTeachers]);

  // Load assignments when selected year changes
  useEffect(() => {
    if (selectedYearId && tab === 'assignments') {
      (async () => {
        try {
          const [asgns, cts] = await Promise.all([
            StaffService.listTeacherAssignments(selectedYearId),
            StaffService.listClassTeachers(selectedYearId),
          ]);
          setTeacherAssignments(asgns);
          setClassTeachers(cts);
        } catch {
          setTeacherAssignments([]);
          setClassTeachers([]);
        }
      })();
    }
  }, [selectedYearId, tab]);

  useEffect(() => {
    setAsgnSectionId(null);
    if (asgnClassId) {
      AcademicService.listSections(asgnClassId).then(setAsgnSections).catch(() => setAsgnSections([]));
    } else {
      setAsgnSections([]);
    }
  }, [asgnClassId]);

  useEffect(() => {
    setCtSectionId(null);
    if (ctClassId) {
      AcademicService.listSections(ctClassId).then(setCtSections).catch(() => setCtSections([]));
    } else {
      setCtSections([]);
    }
  }, [ctClassId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRefData();
    await loadTeachers(teacherPage, teacherSearch);
    setIsRefreshing(false);
  };

  // ── TEACHERS ACTIONS ──────────────────────────────────────────────────────
  const handleCreateTeacher = async () => {
    if (!tEmpId.trim() || !tUsername.trim() || !tEmail.trim() || !tFirstName.trim()) {
      Alert.alert('Validation Error', 'Employee ID, Username, Email, and First Name are required.');
      return;
    }
    setIsSavingTeacher(true);
    try {
      const created = await StaffService.createTeacher({
        employeeId: tEmpId.trim(),
        username: tUsername.trim(),
        email: tEmail.trim(),
        firstName: tFirstName.trim(),
        lastName: tLastName.trim() || null,
        phone: tPhone.trim() || null,
        joiningDate: tJoiningDate.trim() || null,
        morningStart: tMornStart.trim() || null,
        morningEnd: tMornEnd.trim() || null,
        afternoonStart: tAftStart.trim() || null,
        afternoonEnd: tAftEnd.trim() || null,
      });
      setTeachers((prev) => [created, ...prev]);
      setShowCreateTeacher(false);
      setTEmpId('');
      setTUsername('');
      setTEmail('');
      setTFirstName('');
      setTLastName('');
      setTPhone('');
      setTJoiningDate('');
      Alert.alert('Teacher Created', `Teacher profile for ${created.firstName} created successfully.`);
    } catch (err) {
      Alert.alert('Could not create teacher', parseErrorMessage(err));
    } finally {
      setIsSavingTeacher(false);
    }
  };

  const handleAddQualification = async () => {
    if (!selectedTeacher || !qDegree.trim()) {
      Alert.alert('Validation Error', 'Degree name is required.');
      return;
    }
    setIsSavingQual(true);
    try {
      const qual = await StaffService.addQualification(selectedTeacher.teacherId, {
        degree: qDegree.trim(),
        institution: qInstitution.trim() || null,
        yearCompleted: qYear.trim() ? Number(qYear) : null,
      });
      setSelectedTeacher((prev) => (prev ? { ...prev, qualifications: [...prev.qualifications, qual] } : null));
      setShowAddQual(false);
      setQDegree('');
      setQInstitution('');
      setQYear('');
    } catch (err) {
      Alert.alert('Could not add qualification', parseErrorMessage(err));
    } finally {
      setIsSavingQual(false);
    }
  };

  // ── NON-TEACHING STAFF ACTIONS ───────────────────────────────────────────
  const handleCreateStaff = async () => {
    if (!sEmpId.trim() || !sDesignation.trim() || !sUsername.trim() || !sEmail.trim() || !sFirstName.trim()) {
      Alert.alert('Validation Error', 'Employee ID, Designation, Username, Email, and First Name are required.');
      return;
    }
    setIsSavingStaff(true);
    try {
      const created = await StaffService.createStaff({
        roleId: staffRoleId,
        employeeId: sEmpId.trim(),
        designation: sDesignation.trim(),
        username: sUsername.trim(),
        email: sEmail.trim(),
        firstName: sFirstName.trim(),
        lastName: sLastName.trim() || null,
        phone: sPhone.trim() || null,
      });
      setSEmpId('');
      setSDesignation('');
      setSUsername('');
      setSEmail('');
      setSFirstName('');
      setSLastName('');
      setSPhone('');
      Alert.alert('Staff Account Created', `Created ${created.roleName} account for ${created.firstName}.`);
    } catch (err) {
      Alert.alert('Could not create staff', parseErrorMessage(err));
    } finally {
      setIsSavingStaff(false);
    }
  };

  // ── ASSIGNMENTS ACTIONS ─────────────────────────────────────────────────
  const handleAssignSubject = async () => {
    if (!selectedYearId || !asgnTeacherId || !asgnClassId || !asgnSubjectId) {
      Alert.alert('Validation Error', 'Academic Year, Teacher, Class, and Subject are required.');
      return;
    }
    setIsSavingAssignSubj(true);
    try {
      const created = await StaffService.assignTeacherToSubject({
        academicYearId: selectedYearId,
        teacherId: asgnTeacherId,
        classId: asgnClassId,
        sectionId: asgnSectionId,
        subjectId: asgnSubjectId,
      });
      setTeacherAssignments((prev) => [...prev, created]);
      setShowAssignSubj(false);
    } catch (err) {
      Alert.alert('Could not assign teacher', parseErrorMessage(err));
    } finally {
      setIsSavingAssignSubj(false);
    }
  };

  const handleUnassignSubject = (id: number) => {
    Alert.alert('Remove Assignment', 'Unassign teacher from this subject?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await StaffService.unassignTeacherFromSubject(id);
            setTeacherAssignments((prev) => prev.filter((a) => a.id !== id));
          } catch (err) {
            Alert.alert('Could not unassign', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  const handleAssignClassTeacher = async () => {
    if (!selectedYearId || !ctTeacherId || !ctClassId) {
      Alert.alert('Validation Error', 'Academic Year, Teacher, and Class are required.');
      return;
    }
    setIsSavingCT(true);
    try {
      const created = await StaffService.assignClassTeacher({
        academicYearId: selectedYearId,
        teacherId: ctTeacherId,
        classId: ctClassId,
        sectionId: ctSectionId,
      });
      setClassTeachers((prev) => [...prev.filter((ct) => !(ct.classId === ctClassId && ct.sectionId === ctSectionId)), created]);
      setShowAssignCT(false);
    } catch (err) {
      Alert.alert('Could not assign homeroom teacher', parseErrorMessage(err));
    } finally {
      setIsSavingCT(false);
    }
  };

  const handleUnassignClassTeacher = (id: number) => {
    Alert.alert('Remove Homeroom Teacher', 'Remove this homeroom teacher assignment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await StaffService.unassignClassTeacher(id);
            setClassTeachers((prev) => prev.filter((ct) => ct.id !== id));
          } catch (err) {
            Alert.alert('Could not remove', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  // ── ATTENDANCE ACTIONS ──────────────────────────────────────────────────
  const handleMarkAttendance = async () => {
    if (!attTeacherId || !attDate.trim()) {
      Alert.alert('Validation Error', 'Teacher and date are required.');
      return;
    }
    setIsSavingAtt(true);
    try {
      const res = await StaffService.markTeacherAttendance({
        teacherId: attTeacherId,
        date: attDate.trim(),
        status: attStatus,
      });
      Alert.alert('Attendance Marked', `Marked ${res.teacherName} as "${res.status}" for ${res.date}.`);
    } catch (err) {
      Alert.alert('Could not mark attendance', parseErrorMessage(err));
    } finally {
      setIsSavingAtt(false);
    }
  };

  const handleLoadSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const summary = await StaffService.getTeacherAttendanceSummary(attSummaryYear, attSummaryMonth);
      setAttSummary(summary);
    } catch (err) {
      Alert.alert('Load Error', parseErrorMessage(err));
      setAttSummary(null);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

    return (
    <SafeAreaView className="flex-1 bg-cream-100 px-6 pt-10">
      <ScreenHeader title="Staff Management" subtitle="Teachers, staff, assignments & attendance" />

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 max-h-12 flex-row">
        {[
          { key: 'teachers', label: 'Teachers' },
          { key: 'non-teaching', label: 'Non-Teaching Staff' },
          { key: 'assignments', label: 'Assignments' },
          { key: 'attendance', label: 'Attendance' },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            className={`px-4 py-2.5 rounded-2xl mr-2 border border-primary-100 ${
              tab === t.key ? 'bg-primary-500' : 'bg-white'
            }`}
            onPress={() => setTab(t.key as StaffTab)}
          >
            <Text className={`font-body-bold text-xs ${tab === t.key ? 'text-white' : 'text-slate-600'}`}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#0284c7" />}
      >
        {/* ── TAB 1: TEACHERS ─────────────────────────────────────────────── */}
        {tab === 'teachers' ? (
          <>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-body-bold text-slate-800 text-base">Teacher Directory</Text>
              <TouchableOpacity
                className="bg-primary-500 px-3.5 py-2 rounded-xl flex-row items-center"
                onPress={() => setShowCreateTeacher(!showCreateTeacher)}
              >
                <Ionicons name={showCreateTeacher ? 'close' : 'person-add'} size={16} color="#fff" />
                <Text className="text-white font-body-bold text-xs ml-1">
                  {showCreateTeacher ? 'Cancel' : 'New Teacher'}
                </Text>
              </TouchableOpacity>
            </View>

            {showCreateTeacher ? (
              <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
                <Text className="font-body-bold text-slate-800 text-sm mb-3">Create Teacher Profile</Text>
                <FormField label="Employee ID" icon="id-card-outline" placeholder="e.g. TCH-001" value={tEmpId} onChangeText={setTEmpId} />
                <FormField label="Username" icon="at-outline" placeholder="username" autoCapitalize="none" value={tUsername} onChangeText={setTUsername} />
                <FormField label="Email" icon="mail-outline" placeholder="teacher@school.com" autoCapitalize="none" keyboardType="email-address" value={tEmail} onChangeText={setTEmail} />
                <FormField label="First Name" icon="person-outline" placeholder="First Name" value={tFirstName} onChangeText={setTFirstName} />
                <FormField label="Last Name" icon="person-outline" placeholder="Last Name" value={tLastName} onChangeText={setTLastName} />
                <FormField label="Phone" icon="call-outline" placeholder="Phone Number" keyboardType="phone-pad" value={tPhone} onChangeText={setTPhone} />
                <FormField label="Joining Date" icon="calendar-outline" placeholder="YYYY-MM-DD" value={tJoiningDate} onChangeText={setTJoiningDate} />
                <View className="flex-row mb-2">
                  <View className="flex-1 mr-2">
                    <FormField label="Morning Start" icon="time-outline" placeholder="08:00" value={tMornStart} onChangeText={setTMornStart} />
                  </View>
                  <View className="flex-1">
                    <FormField label="Morning End" icon="time-outline" placeholder="12:00" value={tMornEnd} onChangeText={setTMornEnd} />
                  </View>
                </View>
                <PrimaryButton label="Create Teacher Account" icon="checkmark" onPress={handleCreateTeacher} isLoading={isSavingTeacher} />
              </View>
            ) : null}

            {/* Search Bar */}
            <View className="flex-row items-center bg-white rounded-2xl border border-primary-100 px-4 mb-3 shadow-sm">
              <Ionicons name="search-outline" size={18} color="#0284c7" />
              <TextInput
                className="flex-1 text-slate-900 font-body px-3 py-3 text-sm"
                placeholder="Search teachers..."
                placeholderTextColor="#94a3b8"
                value={teacherSearch}
                onChangeText={setTeacherSearch}
                onSubmitEditing={() => loadTeachers(1, teacherSearch)}
              />
            </View>

            {teachers.length === 0 ? (
              <EmptyState icon="people-outline" title="No teachers found" message="Add a teacher to your directory." />
            ) : (
              teachers.map((t) => (
                <View key={t.teacherId} className="bg-white p-4 rounded-3xl border border-primary-100 shadow-sm mb-3">
                  <TouchableOpacity onPress={() => setSelectedTeacher(selectedTeacher?.teacherId === t.teacherId ? null : t)}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-12 h-12 bg-mint-100 rounded-2xl items-center justify-center mr-3">
                          <Text className="text-mint-600 font-heading text-base">
                            {t.firstName[0]}
                            {t.lastName?.[0] || ''}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-body-bold text-slate-800 text-base">
                            {t.firstName} {t.lastName}
                          </Text>
                          <Text className="text-slate-500 font-body text-xs">ID: {t.employeeId} | {t.email}</Text>
                        </View>
                      </View>
                      <Ionicons name={selectedTeacher?.teacherId === t.teacherId ? 'chevron-up' : 'chevron-down'} size={18} color="#94a3b8" />
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Details */}
                  {selectedTeacher?.teacherId === t.teacherId ? (
                    <View className="mt-3 pt-3 border-t border-cream-200">
                      <Text className="font-body-bold text-slate-800 text-xs mb-1">Qualifications:</Text>
                      {t.qualifications.length === 0 ? (
                        <Text className="text-slate-400 font-body text-xs italic mb-2">No qualifications added.</Text>
                      ) : (
                        t.qualifications.map((q) => (
                          <Text key={q.id} className="text-slate-700 font-body text-xs mb-1">
                            • {q.degree} ({q.institution || 'N/A'}, {q.yearCompleted || 'N/A'})
                          </Text>
                        ))
                      )}

                      {!showAddQual ? (
                        <TouchableOpacity className="mt-2 self-start bg-primary-50 px-3 py-1.5 rounded-xl" onPress={() => setShowAddQual(true)}>
                          <Text className="text-primary-600 font-body-bold text-xs">+ Add Qualification</Text>
                        </TouchableOpacity>
                      ) : (
                        <View className="bg-cream-50 p-3 rounded-2xl border border-primary-100 mt-2">
                          <FormField label="Degree" icon="ribbon-outline" placeholder="e.g. M.Sc Physics" value={qDegree} onChangeText={setQDegree} />
                          <FormField label="Institution" icon="school-outline" placeholder="University Name" value={qInstitution} onChangeText={setQInstitution} />
                          <FormField label="Year Completed" icon="calendar-outline" placeholder="2020" keyboardType="number-pad" value={qYear} onChangeText={setQYear} />
                          <View className="flex-row space-x-2">
                            <View className="flex-1 mr-1">
                              <PrimaryButton label="Cancel" variant="outline" onPress={() => setShowAddQual(false)} />
                            </View>
                            <View className="flex-1 ml-1">
                              <PrimaryButton label="Save" icon="checkmark" onPress={handleAddQualification} isLoading={isSavingQual} />
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </>
        ) : null}

        {/* ── TAB 2: NON-TEACHING STAFF ──────────────────────────────────── */}
        {tab === 'non-teaching' ? (
          <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
            <Text className="font-body-bold text-slate-800 text-base mb-3">Create Staff Account</Text>
            <Text className="text-slate-500 font-body text-xs mb-2">Select Staff Role:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {[
                { id: 4, label: 'Accountant' },
                { id: 5, label: 'Reception' },
                { id: 6, label: 'Librarian' },
                { id: 7, label: 'Transport Manager' },
              ].map((r) => (
                <TouchableOpacity
                  key={r.id}
                  className={`px-3.5 py-2 rounded-xl mr-2 border ${
                    staffRoleId === r.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                  }`}
                  onPress={() => setStaffRoleId(r.id as any)}
                >
                  <Text className={`font-body-bold text-xs ${staffRoleId === r.id ? 'text-white' : 'text-slate-700'}`}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <FormField label="Employee ID" icon="id-card-outline" placeholder="e.g. STF-001" value={sEmpId} onChangeText={setSEmpId} />
            <FormField label="Designation" icon="briefcase-outline" placeholder="e.g. Senior Accountant" value={sDesignation} onChangeText={setSDesignation} />
            <FormField label="Username" icon="at-outline" placeholder="username" autoCapitalize="none" value={sUsername} onChangeText={setSUsername} />
            <FormField label="Email" icon="mail-outline" placeholder="staff@school.com" autoCapitalize="none" keyboardType="email-address" value={sEmail} onChangeText={setSEmail} />
            <FormField label="First Name" icon="person-outline" placeholder="First Name" value={sFirstName} onChangeText={setSFirstName} />
            <FormField label="Last Name" icon="person-outline" placeholder="Last Name" value={sLastName} onChangeText={setSLastName} />
            <FormField label="Phone" icon="call-outline" placeholder="Phone Number" keyboardType="phone-pad" value={sPhone} onChangeText={setSPhone} />
            <PrimaryButton label="Create Staff Account" icon="checkmark" onPress={handleCreateStaff} isLoading={isSavingStaff} />
          </View>
        ) : null}

        {/* ── TAB 3: ASSIGNMENTS ─────────────────────────────────────────── */}
        {tab === 'assignments' ? (
          <>
            {/* Year Selector */}
            <Text className="font-body-semibold text-slate-500 text-xs mb-1.5">Academic Year:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {academicYears.map((y) => (
                <TouchableOpacity
                  key={y.id}
                  className={`px-3.5 py-2 rounded-xl mr-2 border ${
                    selectedYearId === y.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                  }`}
                  onPress={() => setSelectedYearId(y.id)}
                >
                  <Text className={`font-body-bold text-xs ${selectedYearId === y.id ? 'text-white' : 'text-slate-700'}`}>
                    {y.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Subject Assignments */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-body-bold text-slate-800 text-base">Teacher-Subject Assignments</Text>
              <TouchableOpacity
                className="bg-primary-500 px-3 py-1.5 rounded-xl flex-row items-center"
                onPress={() => setShowAssignSubj(!showAssignSubj)}
              >
                <Ionicons name={showAssignSubj ? 'close' : 'add'} size={16} color="#fff" />
                <Text className="text-white font-body-bold text-xs ml-1">{showAssignSubj ? 'Cancel' : 'Assign'}</Text>
              </TouchableOpacity>
            </View>

            {showAssignSubj ? (
              <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
                <Text className="font-body-bold text-slate-800 text-sm mb-2">Assign Teacher to Subject</Text>
                <Text className="text-slate-500 font-body text-xs mb-1">Select Teacher:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                  {teachers.map((t) => (
                    <TouchableOpacity
                      key={t.teacherId}
                      className={`px-3 py-1.5 rounded-xl mr-2 border ${
                        asgnTeacherId === t.teacherId ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                      }`}
                      onPress={() => setAsgnTeacherId(t.teacherId)}
                    >
                      <Text className={`font-body-bold text-xs ${asgnTeacherId === t.teacherId ? 'text-white' : 'text-slate-700'}`}>
                        {t.firstName} {t.lastName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text className="text-slate-500 font-body text-xs mb-1">Select Class:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                  {classes.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      className={`px-3 py-1.5 rounded-xl mr-2 border ${
                        asgnClassId === c.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                      }`}
                      onPress={() => setAsgnClassId(c.id)}
                    >
                      <Text className={`font-body-bold text-xs ${asgnClassId === c.id ? 'text-white' : 'text-slate-700'}`}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {asgnSections.length > 0 ? (
                  <>
                    <Text className="text-slate-500 font-body text-xs mb-1">Select Section (Optional):</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                      <TouchableOpacity
                        className={`px-3 py-1.5 rounded-xl mr-2 border ${
                          asgnSectionId === null ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                        }`}
                        onPress={() => setAsgnSectionId(null)}
                      >
                        <Text className={`font-body-bold text-xs ${asgnSectionId === null ? 'text-white' : 'text-slate-700'}`}>
                          All Sections
                        </Text>
                      </TouchableOpacity>
                      {asgnSections.map((sec) => (
                        <TouchableOpacity
                          key={sec.id}
                          className={`px-3 py-1.5 rounded-xl mr-2 border ${
                            asgnSectionId === sec.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                          }`}
                          onPress={() => setAsgnSectionId(sec.id)}
                        >
                          <Text className={`font-body-bold text-xs ${asgnSectionId === sec.id ? 'text-white' : 'text-slate-700'}`}>
                            {sec.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                ) : null}

                <Text className="text-slate-500 font-body text-xs mb-1">Select Subject:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                  {subjects.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      className={`px-3 py-1.5 rounded-xl mr-2 border ${
                        asgnSubjectId === sub.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                      }`}
                      onPress={() => setAsgnSubjectId(sub.id)}
                    >
                      <Text className={`font-body-bold text-xs ${asgnSubjectId === sub.id ? 'text-white' : 'text-slate-700'}`}>
                        {sub.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <PrimaryButton label="Save Assignment" icon="checkmark" onPress={handleAssignSubject} isLoading={isSavingAssignSubj} />
              </View>
            ) : null}

            {teacherAssignments.length === 0 ? (
              <EmptyState icon="easel-outline" title="No assignments" message="Assign teachers to subjects." />
            ) : (
              Object.entries(
                teacherAssignments.reduce((acc, a) => {
                  const key = a.className;
                  (acc[key] ||= []).push(a);
                  return acc;
                }, {} as Record<string, TeacherAssignmentResponse[]>)
              ).map(([className, items]) => (
                <View key={className} className="mb-3">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="font-body-bold text-slate-700 text-xs uppercase">{className}</Text>
                    <Text className="font-body text-slate-400 text-xs">{items.length}</Text>
                  </View>

                  <ScrollView style={{ maxHeight: 240 }} nestedScrollEnabled showsVerticalScrollIndicator>
                    {items.map((a) => (
                      <View
                        key={a.id}
                        className="bg-white p-3 rounded-2xl border border-primary-100 shadow-sm mb-2 flex-row items-center justify-between"
                      >
                        <View className="flex-1 mr-2">
                          <Text className="font-body-bold text-slate-800 text-sm" numberOfLines={1}>
                            {a.teacherName}
                          </Text>
                          <Text className="text-slate-500 font-body text-xs mt-0.5" numberOfLines={1}>
                            {a.subjectName} · {a.sectionName ?? 'All Sections'}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleUnassignSubject(a.id)}>
                          <Ionicons name="trash-outline" size={18} color="#e11d48" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ))
            )}

            {/* Class Teacher (Homeroom) Assignments */}
            <View className="mt-6 border-t border-cream-200 pt-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-body-bold text-slate-800 text-base">Homeroom (Class Teachers)</Text>
                <TouchableOpacity
                  className="bg-secondary-500 px-3 py-1.5 rounded-xl flex-row items-center"
                  onPress={() => setShowAssignCT(!showAssignCT)}
                >
                  <Ionicons name={showAssignCT ? 'close' : 'add'} size={16} color="#fff" />
                  <Text className="text-white font-body-bold text-xs ml-1">{showAssignCT ? 'Cancel' : 'Assign'}</Text>
                </TouchableOpacity>
              </View>

              {showAssignCT ? (
                <View className="bg-white p-5 rounded-3xl border border-secondary-100 shadow-sm mb-4">
                  <Text className="font-body-bold text-slate-800 text-sm mb-2">Assign Homeroom Teacher</Text>
                  <Text className="text-slate-500 font-body text-xs mb-1">Select Teacher:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    {teachers.map((t) => (
                      <TouchableOpacity
                        key={t.teacherId}
                        className={`px-3 py-1.5 rounded-xl mr-2 border ${
                          ctTeacherId === t.teacherId ? 'bg-secondary-500 border-secondary-500' : 'bg-cream-50 border-primary-100'
                        }`}
                        onPress={() => setCtTeacherId(t.teacherId)}
                      >
                        <Text className={`font-body-bold text-xs ${ctTeacherId === t.teacherId ? 'text-white' : 'text-slate-700'}`}>
                          {t.firstName} {t.lastName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text className="text-slate-500 font-body text-xs mb-1">Select Class:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                    {classes.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        className={`px-3 py-1.5 rounded-xl mr-2 border ${
                          ctClassId === c.id ? 'bg-secondary-500 border-secondary-500' : 'bg-cream-50 border-primary-100'
                        }`}
                        onPress={() => setCtClassId(c.id)}
                      >
                        <Text className={`font-body-bold text-xs ${ctClassId === c.id ? 'text-white' : 'text-slate-700'}`}>
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {ctSections.length > 0 ? (
                    <>
                      <Text className="text-slate-500 font-body text-xs mb-1">Select Section (Optional):</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                        <TouchableOpacity
                          className={`px-3 py-1.5 rounded-xl mr-2 border ${
                            ctSectionId === null ? 'bg-secondary-500 border-secondary-500' : 'bg-cream-50 border-primary-100'
                          }`}
                          onPress={() => setCtSectionId(null)}
                        >
                          <Text className={`font-body-bold text-xs ${ctSectionId === null ? 'text-white' : 'text-slate-700'}`}>
                            All Sections
                          </Text>
                        </TouchableOpacity>
                        {ctSections.map((sec) => (
                          <TouchableOpacity
                            key={sec.id}
                            className={`px-3 py-1.5 rounded-xl mr-2 border ${
                              ctSectionId === sec.id ? 'bg-secondary-500 border-secondary-500' : 'bg-cream-50 border-primary-100'
                            }`}
                            onPress={() => setCtSectionId(sec.id)}
                          >
                            <Text className={`font-body-bold text-xs ${ctSectionId === sec.id ? 'text-white' : 'text-slate-700'}`}>
                              {sec.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </>
                  ) : null}

                  <PrimaryButton label="Save Homeroom Teacher" icon="checkmark" onPress={handleAssignClassTeacher} isLoading={isSavingCT} />
                </View>
              ) : null}

              {classTeachers.length === 0 ? (
                <EmptyState icon="ribbon-outline" title="No homeroom teachers" message="Assign class teachers." />
              ) : (
                classTeachers.map((ct) => (
                  <View key={ct.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-2.5 flex-row items-center justify-between">
                    <View>
                      <Text className="font-body-bold text-slate-800 text-sm">
                        {ct.className} {ct.sectionName ? `(${ct.sectionName})` : '(All Sections)'}
                      </Text>
                      <Text className="text-slate-500 font-body text-xs mt-0.5">Teacher: {ct.teacherName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleUnassignClassTeacher(ct.id)}>
                      <Ionicons name="trash-outline" size={18} color="#e11d48" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </>
        ) : null}

        {/* ── TAB 4: ATTENDANCE ──────────────────────────────────────────── */}
        {tab === 'attendance' ? (
          <>
            {/* Mark Attendance */}
            <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
              <Text className="font-body-bold text-slate-800 text-base mb-3">Mark Daily Attendance</Text>
              <Text className="text-slate-500 font-body text-xs mb-1">Select Teacher:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                {teachers.map((t) => (
                  <TouchableOpacity
                    key={t.teacherId}
                    className={`px-3 py-1.5 rounded-xl mr-2 border ${
                      attTeacherId === t.teacherId ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                    }`}
                    onPress={() => setAttTeacherId(t.teacherId)}
                  >
                    <Text className={`font-body-bold text-xs ${attTeacherId === t.teacherId ? 'text-white' : 'text-slate-700'}`}>
                      {t.firstName} {t.lastName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <FormField label="Date" icon="calendar-outline" placeholder="YYYY-MM-DD" value={attDate} onChangeText={setAttDate} />

              <Text className="text-slate-500 font-body text-xs mb-1">Status:</Text>
              <View className="flex-row mb-4">
                {[
                  { status: 'present', label: 'Present' },
                  { status: 'absent', label: 'Absent' },
                  { status: 'half_day_am', label: 'Half AM' },
                  { status: 'half_day_pm', label: 'Half PM' },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.status}
                    className={`flex-1 py-2 rounded-xl mr-1 items-center border ${
                      attStatus === s.status ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                    }`}
                    onPress={() => setAttStatus(s.status as TeacherAttendanceStatus)}
                  >
                    <Text className={`font-body-bold text-xs ${attStatus === s.status ? 'text-white' : 'text-slate-700'}`}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <PrimaryButton label="Save Attendance" icon="checkmark" onPress={handleMarkAttendance} isLoading={isSavingAtt} />
            </View>

            {/* Monthly Summary */}
            <View className="bg-white p-5 rounded-3xl border border-secondary-100 shadow-sm mb-4">
              <Text className="font-body-bold text-slate-800 text-base mb-3">Monthly Attendance Summary</Text>
              <View className="flex-row mb-3">
                <View className="flex-1 mr-2">
                  <FormField label="Year" icon="calendar-outline" keyboardType="number-pad" value={String(attSummaryYear)} onChangeText={(v) => setAttSummaryYear(Number(v))} />
                </View>
                <View className="flex-1">
                  <FormField label="Month (1-12)" icon="calendar-outline" keyboardType="number-pad" value={String(attSummaryMonth)} onChangeText={(v) => setAttSummaryMonth(Number(v))} />
                </View>
              </View>
              <PrimaryButton label="Load Summary" icon="analytics-outline" onPress={handleLoadSummary} isLoading={isLoadingSummary} />

              {attSummary ? (
                <View className="mt-4 pt-3 border-t border-cream-200">
                  <Text className="font-body-semibold text-slate-600 text-xs mb-2">
                    Total Teachers: {attSummary.totalTeachers}
                  </Text>
                  {attSummary.summaries.map((s) => (
                    <View key={s.teacherId} className="bg-cream-50 p-3 rounded-2xl border border-primary-100 mb-2">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-body-bold text-slate-800 text-sm">{s.teacherName}</Text>
                        <Text className="font-body-bold text-primary-600 text-xs">{s.attendancePercentage}%</Text>
                      </View>
                      <Text className="text-slate-500 font-body text-xs">
                        Present: {s.presentDays} | Absent: {s.absentDays} | Half-days: {s.halfDaysAM + s.halfDaysPM}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
