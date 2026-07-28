import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../../components/ScreenHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import PrimaryButton from '../../../components/PrimaryButton';
import FormField from '../../../components/FormField';
import { StudentAdminService } from '../../../services/studentAdminService';
import { AcademicService } from '../../../services/academicService';
import { parseErrorMessage } from '../../../services/api';
import { StudentResponse } from '../../../types/student';
import { AcademicYearResponse, ClassResponse, SectionResponse, SubjectResponse } from '../../../types/academic';
import { BulkPromotionResultResponse } from '../../../types/promotion';

type StudentTab = 'directory' | 'enroll' | 'optional-subjects' | 'promotion';

export default function StudentManagementScreen() {
  const [tab, setTab] = useState<StudentTab>('directory');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reference Data
  const [academicYears, setAcademicYears] = useState<AcademicYearResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);

  // ── Directory & Filters ──────────────────────────────────────────────────
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [filterClassId, setFilterClassId] = useState<number | undefined>(undefined);
  const [filterSectionId, setFilterSectionId] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);

  // Edit / Transfer Modals
  const [showEdit, setShowEdit] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editRollNo, setEditRollNo] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [showTransfer, setShowTransfer] = useState(false);
  const [transferClassId, setTransferClassId] = useState<number | null>(null);
  const [transferSectionId, setTransferSectionId] = useState<number | null>(null);
  const [transferReason, setTransferReason] = useState('');
  const [isSavingTransfer, setIsSavingTransfer] = useState(false);

  // ── Enrollment Form ──────────────────────────────────────────────────────
  const [enrAdmNo, setEnrAdmNo] = useState('');
  const [enrRollNo, setEnrRollNo] = useState('');
  const [enrFirstName, setEnrFirstName] = useState('');
  const [enrLastName, setEnrLastName] = useState('');
  const [enrGender, setEnrGender] = useState('male');
  const [enrDob, setEnrDob] = useState('');
  const [enrPhone, setEnrPhone] = useState('');
  const [enrEmail, setEnrEmail] = useState('');
  const [enrClassId, setEnrClassId] = useState<number | null>(null);
  const [enrSectionId, setEnrSectionId] = useState<number | null>(null);

  // Parent Info
  const [pFirstName, setPFirstName] = useState('');
  const [pLastName, setPLastName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pRelation, setPRelation] = useState('Father');
  const [pOccupation, setPOccupation] = useState('');
  const [isSavingEnroll, setIsSavingEnroll] = useState(false);

  // ── Optional Subject Form ────────────────────────────────────────────────
  const [optStudentId, setOptStudentId] = useState<number | null>(null);
  const [optSubjectId, setOptSubjectId] = useState<number | null>(null);
  const [isSavingOpt, setIsSavingOpt] = useState(false);

  // ── Promotion Form ───────────────────────────────────────────────────────
  const [fromYearId, setFromYearId] = useState<number | null>(null);
  const [toYearId, setToYearId] = useState<number | null>(null);
  const [fromClassId, setFromClassId] = useState<number | null>(null);
  const [toClassId, setToClassId] = useState<number | null>(null);
  const [isGraduation, setIsGraduation] = useState(false);

  const [createdMappingId, setCreatedMappingId] = useState<number | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkPromotionResultResponse | null>(null);
  const [isSavingPromo, setIsSavingPromo] = useState(false);

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
        setFromYearId(currYear.id);
      }
      if (cls.length > 0 && !enrClassId) {
        setEnrClassId(cls[0].id);
        setFromClassId(cls[0].id);
      }
    } catch (err) {
      Alert.alert('Load Error', parseErrorMessage(err));
    }
  }, []);

  const loadStudents = useCallback(async (p: number) => {
    try {
      const res = await StudentAdminService.listStudents(
        { classId: filterClassId, sectionId: filterSectionId, status: filterStatus, searchTerm: searchTerm || undefined },
        p,
        10
      );
      setStudents(res.items);
      setTotalPages(res.totalPages || 1);
      setPage(res.page || p);
    } catch (err) {
      setStudents([]);
    }
  }, [filterClassId, filterSectionId, filterStatus, searchTerm]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadRefData();
      await loadStudents(1);
      setIsLoading(false);
    })();
  }, [loadRefData, loadStudents]);

  // Load sections when class selection changes
  useEffect(() => {
    if (filterClassId) {
      AcademicService.listSections(filterClassId).then(setSections).catch(() => setSections([]));
    }
  }, [filterClassId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRefData();
    await loadStudents(page);
    setIsRefreshing(false);
  };

  // ── DIRECTORY ACTIONS ────────────────────────────────────────────────────
  const handleUpdateStudent = async () => {
    if (!selectedStudent || !editFirstName.trim()) {
      Alert.alert('Validation Error', 'First Name is required.');
      return;
    }
    setIsSavingEdit(true);
    try {
      const res = await StudentAdminService.updateStudent(selectedStudent.studentId, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim() || null,
        rollNo: editRollNo.trim() || null,
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null,
      });
      // Refetch student profile
      const updated = await StudentAdminService.getStudent(selectedStudent.studentId);
      setSelectedStudent(updated);
      setStudents((prev) => prev.map((s) => (s.studentId === updated.studentId ? updated : s)));
      setShowEdit(false);
      Alert.alert('Updated', res.message || 'Student updated successfully.');
    } catch (err) {
      Alert.alert('Could not update', parseErrorMessage(err));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleTransferStudent = async () => {
    if (!selectedStudent || !transferClassId) {
      Alert.alert('Validation Error', 'Target class is required.');
      return;
    }
    setIsSavingTransfer(true);
    try {
      const res = await StudentAdminService.transferStudent(selectedStudent.studentId, {
        newClassId: transferClassId,
        newSectionId: transferSectionId,
        transferReason: transferReason.trim() || null,
      });
      // Refetch student profile
      const updated = await StudentAdminService.getStudent(selectedStudent.studentId);
      setSelectedStudent(updated);
      setStudents((prev) => prev.map((s) => (s.studentId === updated.studentId ? updated : s)));
      setShowTransfer(false);
      Alert.alert('Transferred', res.message || 'Student transferred successfully.');
    } catch (err) {
      Alert.alert('Could not transfer', parseErrorMessage(err));
    } finally {
      setIsSavingTransfer(false);
    }
  };

  const handleDeactivateStudent = (id: number, name: string) => {
    Alert.alert('Deactivate Student', `Deactivate "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await StudentAdminService.deactivateStudent(id);
            const updated = await StudentAdminService.getStudent(id);
            setSelectedStudent(updated);
            setStudents((prev) => prev.map((s) => (s.studentId === id ? updated : s)));
            Alert.alert('Deactivated', res.message || 'Student deactivated.');
          } catch (err) {
            Alert.alert('Could not deactivate', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  // ── ENROLLMENT ACTIONS ───────────────────────────────────────────────────
  const handleEnrollStudent = async () => {
    if (!enrFirstName.trim() || !enrClassId || !selectedYearId || !pFirstName.trim() || !pPhone.trim()) {
      Alert.alert('Validation Error', 'Student first name, class, academic year, parent first name, and parent phone are required.');
      return;
    }
    setIsSavingEnroll(true);
    try {
      const created = await StudentAdminService.enrollStudent({
        admissionNo: enrAdmNo.trim() || null,
        rollNo: enrRollNo.trim() || null,
        firstName: enrFirstName.trim(),
        lastName: enrLastName.trim() || null,
        gender: enrGender,
        dob: enrDob.trim() || null,
        phone: enrPhone.trim() || null,
        email: enrEmail.trim() || null,
        classId: enrClassId,
        sectionId: enrSectionId,
        academicYearId: selectedYearId,
        parent: {
          firstName: pFirstName.trim(),
          lastName: pLastName.trim() || null,
          phone: pPhone.trim(),
          email: pEmail.trim() || `${enrFirstName.toLowerCase().replace(/\s+/g, '')}@parent.com`,
          relation: pRelation,
          occupation: pOccupation.trim() || null,
        },
      });
      setStudents((prev) => [created, ...prev]);
      setEnrFirstName('');
      setEnrLastName('');
      setEnrAdmNo('');
      setEnrRollNo('');
      setPFirstName('');
      setPLastName('');
      setPPhone('');
      Alert.alert('Student Enrolled', `Enrolled ${created.firstName} (Admission No: ${created.admissionNo}).`);
      setTab('directory');
    } catch (err) {
      Alert.alert('Could not enroll student', parseErrorMessage(err));
    } finally {
      setIsSavingEnroll(false);
    }
  };

  // ── OPTIONAL SUBJECT ACTIONS ──────────────────────────────────────────────
  const handleEnrollOptionalSubject = async () => {
    if (!optStudentId || !optSubjectId || !selectedYearId) {
      Alert.alert('Validation Error', 'Student, subject, and academic year are required.');
      return;
    }
    setIsSavingOpt(true);
    try {
      const res = await StudentAdminService.enrollOptionalSubject(optStudentId, {
        academicYearId: selectedYearId,
        subjectId: optSubjectId,
      });
      Alert.alert('Subject Enrolled', `Enrolled optional subject "${res.subjectName}".`);
      setOptStudentId(null);
      setOptSubjectId(null);
    } catch (err) {
      Alert.alert('Could not enroll subject', parseErrorMessage(err));
    } finally {
      setIsSavingOpt(false);
    }
  };

  // ── PROMOTION ACTIONS ────────────────────────────────────────────────────
  const handleRunPromotion = async () => {
    if (!fromYearId || !toYearId || !fromClassId) {
      Alert.alert('Validation Error', 'Source year, target year, and source class are required.');
      return;
    }
    setIsSavingPromo(true);
    try {
      // Step 1: Create promotion mapping
      const mapping = await StudentAdminService.createPromotionMapping({
        academicYearFromId: fromYearId,
        academicYearToId: toYearId,
        fromClassId,
        toClassId: isGraduation ? null : toClassId,
        isGraduation,
      });
      setCreatedMappingId(mapping.id);

      // Step 2: Run bulk promotion
      const result = await StudentAdminService.bulkPromoteStudents({
        promotionMappingId: mapping.id,
      });
      setBulkResult(result);
      Alert.alert('Promotion Complete', `Processed: ${result.totalProcessed} | Promoted: ${result.promotedCount} | Graduated: ${result.graduatedCount} | Retained: ${result.retainedCount}`);
    } catch (err) {
      Alert.alert('Promotion Error', parseErrorMessage(err));
    } finally {
      setIsSavingPromo(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-cream-100 px-6 pt-10">
      <ScreenHeader title="Student Management" subtitle="Enrollment, transfers & promotions" />

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 max-h-12 flex-row">
        {[
          { key: 'directory', label: 'Directory' },
          { key: 'enroll', label: 'Enroll Student' },
          { key: 'optional-subjects', label: 'Optional Subjects' },
          { key: 'promotion', label: 'Promotion' },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            className={`px-4 py-2.5 rounded-2xl mr-2 border border-primary-100 ${
              tab === t.key ? 'bg-primary-500' : 'bg-white'
            }`}
            onPress={() => setTab(t.key as StudentTab)}
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
        {/* ── TAB 1: DIRECTORY ────────────────────────────────────────────── */}
        {tab === 'directory' ? (
          <>
            {/* Search and Filters */}
            <View className="flex-row items-center bg-white rounded-2xl border border-primary-100 px-4 mb-3 shadow-sm">
              <Ionicons name="search-outline" size={18} color="#0284c7" />
              <TextInput
                className="flex-1 text-slate-900 font-body px-3 py-3 text-sm"
                placeholder="Search by name or admission no..."
                placeholderTextColor="#94a3b8"
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={() => loadStudents(1)}
              />
            </View>

            {/* Class Filter pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <TouchableOpacity
                className={`px-3 py-1.5 rounded-xl mr-2 border ${
                  filterClassId === undefined ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                }`}
                onPress={() => { setFilterClassId(undefined); loadStudents(1); }}
              >
                <Text className={`font-body-bold text-xs ${filterClassId === undefined ? 'text-white' : 'text-slate-700'}`}>
                  All Classes
                </Text>
              </TouchableOpacity>
              {classes.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  className={`px-3 py-1.5 rounded-xl mr-2 border ${
                    filterClassId === c.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                  }`}
                  onPress={() => { setFilterClassId(c.id); loadStudents(1); }}
                >
                  <Text className={`font-body-bold text-xs ${filterClassId === c.id ? 'text-white' : 'text-slate-700'}`}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {students.length === 0 ? (
              <EmptyState icon="school-outline" title="No students found" message="Try adjusting search or class filters." />
            ) : (
              students.map((s) => (
                <View key={s.studentId} className="bg-white p-4 rounded-3xl border border-primary-100 shadow-sm mb-3">
                  <TouchableOpacity onPress={() => setSelectedStudent(selectedStudent?.studentId === s.studentId ? null : s)}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-12 h-12 bg-secondary-100 rounded-2xl items-center justify-center mr-3">
                          <Text className="text-secondary-600 font-heading text-base">
                            {s.firstName[0]}
                            {s.lastName?.[0] || ''}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-body-bold text-slate-800 text-base">
                            {s.firstName} {s.lastName}
                          </Text>
                          <Text className="text-slate-500 font-body text-xs">
                            Adm: {s.admissionNo} | {s.className} {s.sectionName ? `(${s.sectionName})` : ''}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <View className={`px-2 py-0.5 rounded-full ${s.status === 'Active' ? 'bg-mint-100' : 'bg-coral-100'}`}>
                          <Text className={`font-body-bold text-xs ${s.status === 'Active' ? 'text-mint-600' : 'text-coral-600'}`}>
                            {s.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Detail View */}
                  {selectedStudent?.studentId === s.studentId ? (
                    <View className="mt-3 pt-3 border-t border-cream-200">
                      <Text className="text-slate-600 font-body text-xs mb-1">Roll No: {s.rollNo || 'N/A'}</Text>
                      <Text className="text-slate-600 font-body text-xs mb-1">Exam Eligibility: {s.examAllowed ? 'Eligible' : 'Hold'}</Text>
                      <Text className="text-slate-600 font-body text-xs mb-2">Admission Date: {s.admissionDate || 'N/A'}</Text>

                      {s.parent ? (
                        <View className="bg-cream-50 p-2.5 rounded-xl mb-3">
                          <Text className="font-body-bold text-slate-700 text-xs">Parent: {s.parent.firstName} {s.parent.lastName} ({s.parent.relation})</Text>
                          <Text className="text-slate-500 font-body text-xs">Phone: {s.parent.phone}</Text>
                        </View>
                      ) : null}

                      {/* Action Buttons */}
                      <View className="flex-row justify-end space-x-2">
                        <TouchableOpacity
                          className="bg-primary-50 px-3 py-1.5 rounded-xl mr-2"
                          onPress={() => {
                            setEditFirstName(s.firstName);
                            setEditLastName(s.lastName || '');
                            setEditRollNo(s.rollNo || '');
                            setEditPhone(s.phone || '');
                            setEditAddress(s.address || '');
                            setShowEdit(true);
                          }}
                        >
                          <Text className="text-primary-600 font-body-bold text-xs">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-secondary-50 px-3 py-1.5 rounded-xl mr-2"
                          onPress={() => {
                            setTransferClassId(s.classId);
                            setTransferSectionId(s.sectionId);
                            setShowTransfer(true);
                          }}
                        >
                          <Text className="text-secondary-600 font-body-bold text-xs">Transfer</Text>
                        </TouchableOpacity>
                        {s.status === 'Active' ? (
                          <TouchableOpacity
                            className="bg-coral-50 px-3 py-1.5 rounded-xl"
                            onPress={() => handleDeactivateStudent(s.studentId, s.firstName)}
                          >
                            <Text className="text-coral-600 font-body-bold text-xs">Deactivate</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  ) : null}
                </View>
              ))
            )}

            {/* Edit Modal / Form */}
            {showEdit && selectedStudent ? (
              <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
                <Text className="font-body-bold text-slate-800 text-sm mb-3">Edit Student Details</Text>
                <FormField label="First Name" icon="person-outline" value={editFirstName} onChangeText={setEditFirstName} />
                <FormField label="Last Name" icon="person-outline" value={editLastName} onChangeText={setEditLastName} />
                <FormField label="Roll No" icon="list-outline" value={editRollNo} onChangeText={setEditRollNo} />
                <FormField label="Phone" icon="call-outline" keyboardType="phone-pad" value={editPhone} onChangeText={setEditPhone} />
                <FormField label="Address" icon="location-outline" value={editAddress} onChangeText={setEditAddress} />
                <View className="flex-row space-x-2">
                  <View className="flex-1 mr-1">
                    <PrimaryButton label="Cancel" variant="outline" onPress={() => setShowEdit(false)} />
                  </View>
                  <View className="flex-1 ml-1">
                    <PrimaryButton label="Save Changes" icon="checkmark" onPress={handleUpdateStudent} isLoading={isSavingEdit} />
                  </View>
                </View>
              </View>
            ) : null}

            {/* Transfer Modal / Form */}
            {showTransfer && selectedStudent ? (
              <View className="bg-white p-5 rounded-3xl border border-secondary-100 shadow-sm mb-4">
                <Text className="font-body-bold text-slate-800 text-sm mb-2">Transfer Class/Section</Text>
                <Text className="text-slate-500 font-body text-xs mb-1">Target Class:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                  {classes.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      className={`px-3 py-1.5 rounded-xl mr-2 border ${
                        transferClassId === c.id ? 'bg-secondary-500 border-secondary-500' : 'bg-cream-50 border-primary-100'
                      }`}
                      onPress={() => setTransferClassId(c.id)}
                    >
                      <Text className={`font-body-bold text-xs ${transferClassId === c.id ? 'text-white' : 'text-slate-700'}`}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <FormField label="Transfer Reason" icon="document-text-outline" placeholder="e.g. Academic progression" value={transferReason} onChangeText={setTransferReason} />
                <View className="flex-row space-x-2">
                  <View className="flex-1 mr-1">
                    <PrimaryButton label="Cancel" variant="outline" onPress={() => setShowTransfer(false)} />
                  </View>
                  <View className="flex-1 ml-1">
                    <PrimaryButton label="Confirm Transfer" icon="checkmark" onPress={handleTransferStudent} isLoading={isSavingTransfer} />
                  </View>
                </View>
              </View>
            ) : null}
          </>
        ) : null}

        {/* ── TAB 2: ENROLLMENT ───────────────────────────────────────────── */}
        {tab === 'enroll' ? (
          <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
            <Text className="font-body-bold text-slate-800 text-base mb-3">Student & Parent Enrollment</Text>

            <Text className="font-body-bold text-primary-600 text-xs uppercase mb-2">Student Information</Text>
            <FormField label="First Name *" icon="person-outline" value={enrFirstName} onChangeText={setEnrFirstName} />
            <FormField label="Last Name" icon="person-outline" value={enrLastName} onChangeText={setEnrLastName} />
            <FormField label="Admission No (Optional)" icon="id-card-outline" value={enrAdmNo} onChangeText={setEnrAdmNo} />
            <FormField label="Roll No (Optional)" icon="list-outline" value={enrRollNo} onChangeText={setEnrRollNo} />
            <Text className="text-slate-500 font-body text-xs mb-1">Gender:</Text>
            <View className="flex-row mb-3">
              {[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ].map((g) => (
                <TouchableOpacity
                  key={g.value}
                  className={`px-4 py-1.5 rounded-xl mr-2 border ${
                    enrGender === g.value
                      ? 'bg-primary-500 border-primary-500'
                      : 'bg-cream-50 border-primary-100'
                  }`}
                  onPress={() => setEnrGender(g.value)}
                >
                  <Text
                    className={`font-body-bold text-xs ${
                      enrGender === g.value ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <FormField label="Date of Birth" icon="calendar-outline" placeholder="YYYY-MM-DD" value={enrDob} onChangeText={setEnrDob} />

            <Text className="text-slate-500 font-body text-xs mb-1">Class *:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {classes.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  className={`px-3 py-1.5 rounded-xl mr-2 border ${
                    enrClassId === c.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                  }`}
                  onPress={() => setEnrClassId(c.id)}
                >
                  <Text className={`font-body-bold text-xs ${enrClassId === c.id ? 'text-white' : 'text-slate-700'}`}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="font-body-bold text-secondary-600 text-xs uppercase my-2">Parent / Guardian Information</Text>
            <FormField label="Parent First Name *" icon="person-outline" value={pFirstName} onChangeText={setPFirstName} />
            <FormField label="Parent Last Name" icon="person-outline" value={pLastName} onChangeText={setPLastName} />
            <FormField label="Parent Phone *" icon="call-outline" keyboardType="phone-pad" value={pPhone} onChangeText={setPPhone} />
            <FormField label="Parent Email" icon="mail-outline" autoCapitalize="none" keyboardType="email-address" value={pEmail} onChangeText={setPEmail} />

            <PrimaryButton label="Complete Enrollment" icon="checkmark" onPress={handleEnrollStudent} isLoading={isSavingEnroll} />
          </View>
        ) : null}

        {/* ── TAB 3: OPTIONAL SUBJECTS ────────────────────────────────────── */}
        {tab === 'optional-subjects' ? (
          <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
            <Text className="font-body-bold text-slate-800 text-base mb-3">Enroll Optional Subject</Text>
            <Text className="text-slate-500 font-body text-xs mb-1">Select Student:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {students.map((s) => (
                <TouchableOpacity
                  key={s.studentId}
                  className={`px-3.5 py-2 rounded-xl mr-2 border ${
                    optStudentId === s.studentId ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                  }`}
                  onPress={() => setOptStudentId(s.studentId)}
                >
                  <Text className={`font-body-bold text-xs ${optStudentId === s.studentId ? 'text-white' : 'text-slate-700'}`}>
                    {s.firstName} {s.lastName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="text-slate-500 font-body text-xs mb-1">Select Optional Subject:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {subjects.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  className={`px-3.5 py-2 rounded-xl mr-2 border ${
                    optSubjectId === sub.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                  }`}
                  onPress={() => setOptSubjectId(sub.id)}
                >
                  <Text className={`font-body-bold text-xs ${optSubjectId === sub.id ? 'text-white' : 'text-slate-700'}`}>
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <PrimaryButton label="Enroll Optional Subject" icon="checkmark" onPress={handleEnrollOptionalSubject} isLoading={isSavingOpt} />
          </View>
        ) : null}

        {/* ── TAB 4: PROMOTION ────────────────────────────────────────────── */}
        {tab === 'promotion' ? (
          <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
            <Text className="font-body-bold text-slate-800 text-base mb-3">Bulk Student Promotion</Text>

            <Text className="text-slate-500 font-body text-xs mb-1">From Academic Year:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              {academicYears.map((y) => (
                <TouchableOpacity
                  key={y.id}
                  className={`px-3 py-1.5 rounded-xl mr-2 border ${
                    fromYearId === y.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                  }`}
                  onPress={() => setFromYearId(y.id)}
                >
                  <Text className={`font-body-bold text-xs ${fromYearId === y.id ? 'text-white' : 'text-slate-700'}`}>
                    {y.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="text-slate-500 font-body text-xs mb-1">To Academic Year:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {academicYears.map((y) => (
                <TouchableOpacity
                  key={y.id}
                  className={`px-3 py-1.5 rounded-xl mr-2 border ${
                    toYearId === y.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                  }`}
                  onPress={() => setToYearId(y.id)}
                >
                  <Text className={`font-body-bold text-xs ${toYearId === y.id ? 'text-white' : 'text-slate-700'}`}>
                    {y.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="text-slate-500 font-body text-xs mb-1">From Class:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {classes.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  className={`px-3 py-1.5 rounded-xl mr-2 border ${
                    fromClassId === c.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                  }`}
                  onPress={() => setFromClassId(c.id)}
                >
                  <Text className={`font-body-bold text-xs ${fromClassId === c.id ? 'text-white' : 'text-slate-700'}`}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row items-center justify-between mb-3 bg-cream-50 p-3 rounded-2xl border border-primary-100">
              <Text className="text-slate-700 font-body-semibold text-sm">Graduation Mapping?</Text>
              <TouchableOpacity
                className={`px-3 py-1.5 rounded-full ${isGraduation ? 'bg-mint-100' : 'bg-slate-200'}`}
                onPress={() => setIsGraduation(!isGraduation)}
              >
                <Text className={`font-body-bold text-xs ${isGraduation ? 'text-mint-600' : 'text-slate-600'}`}>
                  {isGraduation ? 'Graduation' : 'Next Class'}
                </Text>
              </TouchableOpacity>
            </View>

            {!isGraduation ? (
              <>
                <Text className="text-slate-500 font-body text-xs mb-1">To Target Class:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                  {classes.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      className={`px-3 py-1.5 rounded-xl mr-2 border ${
                        toClassId === c.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                      }`}
                      onPress={() => setToClassId(c.id)}
                    >
                      <Text className={`font-body-bold text-xs ${toClassId === c.id ? 'text-white' : 'text-slate-700'}`}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <PrimaryButton label="Run Bulk Promotion" icon="trending-up-outline" onPress={handleRunPromotion} isLoading={isSavingPromo} />

            {bulkResult ? (
              <View className="mt-4 p-4 bg-cream-50 rounded-2xl border border-mint-200">
                <Text className="font-body-bold text-mint-600 text-sm mb-1">Promotion Result Summary</Text>
                <Text className="font-body text-slate-700 text-xs">Total Processed: {bulkResult.totalProcessed}</Text>
                <Text className="font-body text-slate-700 text-xs">Promoted: {bulkResult.promotedCount}</Text>
                <Text className="font-body text-slate-700 text-xs">Graduated: {bulkResult.graduatedCount}</Text>
                <Text className="font-body text-slate-700 text-xs">Retained: {bulkResult.retainedCount}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
