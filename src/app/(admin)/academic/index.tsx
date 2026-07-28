import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../../components/ScreenHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import PrimaryButton from '../../../components/PrimaryButton';
import FormField from '../../../components/FormField';
import { AcademicService } from '../../../services/academicService';
import { parseErrorMessage } from '../../../services/api';
import {
  AcademicYearResponse,
  ClassResponse,
  SectionResponse,
  SubjectResponse,
  ClassSubjectResponse,
  GradingScaleResponse,
  ExamResponse,
  ExamScheduleResponse,
} from '../../../types/academic';

type SubTab = 'years' | 'classes' | 'subjects' | 'grading' | 'exams';

export default function AcademicStructureScreen() {
  const [tab, setTab] = useState<SubTab>('years');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data states
  const [years, setYears] = useState<AcademicYearResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [gradingScales, setGradingScales] = useState<GradingScaleResponse[]>([]);
  const [exams, setExams] = useState<ExamResponse[]>([]);

  // Selected filters
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectResponse[]>([]);
  const [selectedYearIdForExam, setSelectedYearIdForExam] = useState<number | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [examSchedules, setExamSchedules] = useState<ExamScheduleResponse[]>([]);

  // ── Modal / Form states ──────────────────────────────────────────────────
  // Year Form
  const [showYearForm, setShowYearForm] = useState(false);
  const [yearName, setYearName] = useState('');
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [isSavingYear, setIsSavingYear] = useState(false);

  // Class Form
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [className, setClassName] = useState('');
  const [classSortOrder, setClassSortOrder] = useState('');
  const [isSavingClass, setIsSavingClass] = useState(false);

  // Section Form
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionName, setSectionName] = useState('');
  const [sectionMaxStrength, setSectionMaxStrength] = useState('40');
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Subject Form
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  // Subject Assign Form
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignSubjectId, setAssignSubjectId] = useState<number | null>(null);
  const [assignIsCompulsory, setAssignIsCompulsory] = useState(true);
  const [isSavingAssign, setIsSavingAssign] = useState(false);

  // Grading Form
  const [showGradingForm, setShowGradingForm] = useState(false);
  const [minPct, setMinPct] = useState('');
  const [maxPct, setMaxPct] = useState('');
  const [letterGrade, setLetterGrade] = useState('');
  const [gradePoint, setGradePoint] = useState('');
  const [isSavingGrading, setIsSavingGrading] = useState(false);

  // Exam Form
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [examName, setExamName] = useState('');
  const [examStart, setExamStart] = useState('');
  const [examEnd, setExamEnd] = useState('');
  const [isSavingExam, setIsSavingExam] = useState(false);

  // Schedule Form
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [schedClassId, setSchedClassId] = useState<number | null>(null);
  const [schedSectionId, setSchedSectionId] = useState<number | null>(null);
  const [schedSubjectId, setSchedSubjectId] = useState<number | null>(null);
  const [schedDate, setSchedDate] = useState('');
  const [schedMaxMarks, setSchedMaxMarks] = useState('100');
  const [schedPassMark, setSchedPassMark] = useState('33');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // ── Loaders ──────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [yearData, classData, subjectData, scaleData] = await Promise.all([
        AcademicService.listAcademicYears(),
        AcademicService.listClasses(),
        AcademicService.listSubjects(),
        AcademicService.listGradingScales(),
      ]);
      setYears(yearData);
      setClasses(classData);
      setSubjects(subjectData);
      setGradingScales(scaleData);

      if (classData.length > 0 && !selectedClassId) {
        setSelectedClassId(classData[0].id);
      }
      const currentYr = yearData.find((y) => y.isCurrent) || yearData[0];
      if (currentYr && !selectedYearIdForExam) {
        setSelectedYearIdForExam(currentYr.id);
      }
    } catch (err) {
      Alert.alert('Load Error', parseErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadAll();
      setIsLoading(false);
    })();
  }, [loadAll]);

  // Load sections and class-subjects when selected class changes
  useEffect(() => {
    if (selectedClassId) {
      (async () => {
        try {
          const [secData, subData] = await Promise.all([
            AcademicService.listSections(selectedClassId),
            AcademicService.listClassSubjects(selectedClassId),
          ]);
          setSections(secData);
          setClassSubjects(subData);
        } catch {
          setSections([]);
          setClassSubjects([]);
        }
      })();
    }
  }, [selectedClassId]);

  // Load exams when selected year changes
  useEffect(() => {
    (async () => {
      try {
        const examData = await AcademicService.listExams(selectedYearIdForExam || undefined);
        setExams(examData);
        if (examData.length > 0) {
          setSelectedExamId(examData[0].id);
        } else {
          setSelectedExamId(null);
          setExamSchedules([]);
        }
      } catch {
        setExams([]);
        setSelectedExamId(null);
        setExamSchedules([]);
      }
    })();
  }, [selectedYearIdForExam]);

  // Load schedules when selected exam changes
  useEffect(() => {
    if (selectedExamId) {
      (async () => {
        try {
          const scheds = await AcademicService.listExamSchedules(selectedExamId);
          setExamSchedules(scheds);
        } catch {
          setExamSchedules([]);
        }
      })();
    }
  }, [selectedExamId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAll();
    setIsRefreshing(false);
  };

  // ── ACADEMIC YEARS ACTIONS ────────────────────────────────────────────────
  const handleCreateYear = async () => {
    if (!yearName.trim() || !yearStart.trim() || !yearEnd.trim()) {
      Alert.alert('Validation Error', 'Year name, start date, and end date are required (YYYY-MM-DD).');
      return;
    }
    setIsSavingYear(true);
    try {
      const created = await AcademicService.createAcademicYear({
        name: yearName.trim(),
        startDate: yearStart.trim(),
        endDate: yearEnd.trim(),
      });
      setYears((prev) => [...prev, created]);
      setShowYearForm(false);
      setYearName('');
      setYearStart('');
      setYearEnd('');
    } catch (err) {
      Alert.alert('Could not create year', parseErrorMessage(err));
    } finally {
      setIsSavingYear(false);
    }
  };

  const handleSetCurrentYear = (id: number) => {
    Alert.alert('Set Current Year', 'Set this academic year as active for the school?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await AcademicService.setCurrentAcademicYear(id);
            setYears((prev) => prev.map((y) => ({ ...y, isCurrent: y.id === id })));
          } catch (err) {
            Alert.alert('Error', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  const handleArchiveYear = (id: number) => {
    Alert.alert('Archive Academic Year', 'Archive this year? Archived years cannot be active.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          try {
            await AcademicService.archiveAcademicYear(id);
            setYears((prev) => prev.map((y) => (y.id === id ? { ...y, isArchived: true, isCurrent: false } : y)));
          } catch (err) {
            Alert.alert('Error', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  // ── CLASSES ACTIONS ───────────────────────────────────────────────────────
  const handleSaveClass = async () => {
    if (!className.trim()) {
      Alert.alert('Validation Error', 'Class name is required.');
      return;
    }
    const order = classSortOrder.trim() ? Number(classSortOrder) : 0;
    setIsSavingClass(true);
    try {
      if (editingClassId) {
        const updated = await AcademicService.updateClass(editingClassId, { name: className.trim(), sortOrder: order });
        setClasses((prev) => prev.map((c) => (c.id === editingClassId ? updated : c)).sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        const created = await AcademicService.createClass({ name: className.trim(), sortOrder: order });
        setClasses((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      setShowClassForm(false);
      setEditingClassId(null);
      setClassName('');
      setClassSortOrder('');
    } catch (err) {
      Alert.alert('Could not save class', parseErrorMessage(err));
    } finally {
      setIsSavingClass(false);
    }
  };

  const handleDeleteClass = (id: number, name: string) => {
    Alert.alert('Delete Class', `Delete "${name}"? Dependent sections/students will prevent deletion.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AcademicService.deleteClass(id);
            setClasses((prev) => prev.filter((c) => c.id !== id));
            if (selectedClassId === id) {
              const remaining = classes.filter((c) => c.id !== id);
              setSelectedClassId(remaining.length > 0 ? remaining[0].id : null);
            }
          } catch (err) {
            Alert.alert('Could not delete', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  const handleReorderClass = async (classId: number, currentOrder: number, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? Math.max(0, currentOrder - 1) : currentOrder + 1;
    try {
      await AcademicService.reorderClass({ classId, newSortOrder: newOrder });
      const updated = await AcademicService.listClasses();
      setClasses(updated);
    } catch (err) {
      Alert.alert('Could not reorder', parseErrorMessage(err));
    }
  };

  // ── SECTIONS ACTIONS ──────────────────────────────────────────────────────
  const handleSaveSection = async () => {
    if (!selectedClassId || !sectionName.trim()) {
      Alert.alert('Validation Error', 'Section name is required.');
      return;
    }
    const maxStr = Number(sectionMaxStrength) || 40;
    if (maxStr <= 0) {
      Alert.alert('Validation Error', 'Maximum strength must be greater than 0.');
      return;
    }
    setIsSavingSection(true);
    try {
      if (editingSectionId) {
        const updated = await AcademicService.updateSection(editingSectionId, { name: sectionName.trim(), maxStrength: maxStr });
        setSections((prev) => prev.map((s) => (s.id === editingSectionId ? updated : s)));
      } else {
        const created = await AcademicService.createSection({ classId: selectedClassId, name: sectionName.trim(), maxStrength: maxStr });
        setSections((prev) => [...prev, created]);
      }
      setShowSectionForm(false);
      setEditingSectionId(null);
      setSectionName('');
      setSectionMaxStrength('40');
    } catch (err) {
      Alert.alert('Could not save section', parseErrorMessage(err));
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleDeleteSection = (id: number, name: string) => {
    Alert.alert('Delete Section', `Delete Section "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AcademicService.deleteSection(id);
            setSections((prev) => prev.filter((s) => s.id !== id));
          } catch (err) {
            Alert.alert('Could not delete', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  // ── SUBJECTS ACTIONS ──────────────────────────────────────────────────────
  const handleSaveSubject = async () => {
    if (!subjectName.trim()) {
      Alert.alert('Validation Error', 'Subject name is required.');
      return;
    }
    setIsSavingSubject(true);
    try {
      if (editingSubjectId) {
        const updated = await AcademicService.updateSubject(editingSubjectId, { name: subjectName.trim(), code: subjectCode.trim() || null });
        setSubjects((prev) => prev.map((s) => (s.id === editingSubjectId ? updated : s)));
      } else {
        const created = await AcademicService.createSubject({ name: subjectName.trim(), code: subjectCode.trim() || null });
        setSubjects((prev) => [...prev, created]);
      }
      setShowSubjectForm(false);
      setEditingSubjectId(null);
      setSubjectName('');
      setSubjectCode('');
    } catch (err) {
      Alert.alert('Could not save subject', parseErrorMessage(err));
    } finally {
      setIsSavingSubject(false);
    }
  };

  const handleDeleteSubject = (id: number, name: string) => {
    Alert.alert('Delete Subject', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AcademicService.deleteSubject(id);
            setSubjects((prev) => prev.filter((s) => s.id !== id));
          } catch (err) {
            Alert.alert('Could not delete', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  const handleAssignSubject = async () => {
    if (!selectedClassId || !assignSubjectId) {
      Alert.alert('Validation Error', 'Please select a subject to assign.');
      return;
    }
    setIsSavingAssign(true);
    try {
      const assigned = await AcademicService.assignSubjectToClass({
        classId: selectedClassId,
        subjectId: assignSubjectId,
        isCompulsory: assignIsCompulsory,
      });
      setClassSubjects((prev) => [...prev.filter((c) => c.subjectId !== assignSubjectId), assigned]);
      setShowAssignForm(false);
      setAssignSubjectId(null);
    } catch (err) {
      Alert.alert('Could not assign subject', parseErrorMessage(err));
    } finally {
      setIsSavingAssign(false);
    }
  };

  const handleUnassignSubject = (classSubjectId: number, name: string) => {
    Alert.alert('Unassign Subject', `Remove "${name}" from this class?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unassign',
        style: 'destructive',
        onPress: async () => {
          try {
            await AcademicService.unassignSubjectFromClass(classSubjectId);
            setClassSubjects((prev) => prev.filter((cs) => cs.id !== classSubjectId));
          } catch (err) {
            Alert.alert('Could not unassign', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  // ── GRADING SCALES ACTIONS ────────────────────────────────────────────────
  const handleSaveGrading = async () => {
    if (!minPct.trim() || !maxPct.trim() || !letterGrade.trim()) {
      Alert.alert('Validation Error', 'Min %, Max %, and letter grade are required.');
      return;
    }
    const min = Number(minPct);
    const max = Number(maxPct);
    const gp = gradePoint.trim() ? Number(gradePoint) : null;
    if (isNaN(min) || min < 0 || min > 100 || isNaN(max) || max < 0 || max > 100 || min >= max) {
      Alert.alert('Validation Error', 'Min % and Max % must be valid numbers between 0 and 100, with Min < Max.');
      return;
    }
    if (gp !== null && (isNaN(gp) || gp < 0 || gp > 4)) {
      Alert.alert('Validation Error', 'Grade point must be between 0 and 4.');
      return;
    }
    setIsSavingGrading(true);
    try {
      const created = await AcademicService.createGradingScale({
        minPercentage: min,
        maxPercentage: max,
        letterGrade: letterGrade.trim().toUpperCase(),
        gradePoint: gp,
      });
      setGradingScales((prev) => [...prev, created].sort((a, b) => b.minPercentage - a.minPercentage));
      setShowGradingForm(false);
      setMinPct('');
      setMaxPct('');
      setLetterGrade('');
      setGradePoint('');
    } catch (err) {
      Alert.alert('Could not add grading scale', parseErrorMessage(err));
    } finally {
      setIsSavingGrading(false);
    }
  };

  const handleDeleteGrading = (id: number, letter: string) => {
    Alert.alert('Delete Grade Scale', `Delete band "${letter}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AcademicService.deleteGradingScale(id);
            setGradingScales((prev) => prev.filter((s) => s.id !== id));
          } catch (err) {
            Alert.alert('Could not delete', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  // ── EXAMS & SCHEDULES ACTIONS ─────────────────────────────────────────────
  const handleSaveExam = async () => {
    if (!selectedYearIdForExam || !examName.trim()) {
      Alert.alert('Validation Error', 'Academic year and exam name are required.');
      return;
    }
    setIsSavingExam(true);
    try {
      if (editingExamId) {
        const updated = await AcademicService.updateExam(editingExamId, {
          name: examName.trim(),
          startDate: examStart.trim() || null,
          endDate: examEnd.trim() || null,
        });
        setExams((prev) => prev.map((e) => (e.id === editingExamId ? updated : e)));
      } else {
        const created = await AcademicService.createExam({
          academicYearId: selectedYearIdForExam,
          name: examName.trim(),
          startDate: examStart.trim() || null,
          endDate: examEnd.trim() || null,
        });
        setExams((prev) => [...prev, created]);
        setSelectedExamId(created.id);
      }
      setShowExamForm(false);
      setEditingExamId(null);
      setExamName('');
      setExamStart('');
      setExamEnd('');
    } catch (err) {
      Alert.alert('Could not save exam', parseErrorMessage(err));
    } finally {
      setIsSavingExam(false);
    }
  };

  const handleDeleteExam = (id: number, name: string) => {
    Alert.alert('Delete Exam', `Delete exam "${name}" and all its schedules?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AcademicService.deleteExam(id);
            const remaining = exams.filter((e) => e.id !== id);
            setExams(remaining);
            if (selectedExamId === id) {
              setSelectedExamId(remaining.length > 0 ? remaining[0].id : null);
            }
          } catch (err) {
            Alert.alert('Could not delete exam', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  const handleSaveSchedule = async () => {
    if (!selectedExamId) return;
    const maxM = Number(schedMaxMarks);
    const passM = schedPassMark.trim() ? Number(schedPassMark) : null;
    if (isNaN(maxM) || maxM <= 0) {
      Alert.alert('Validation Error', 'Max marks must be greater than 0.');
      return;
    }
    if (passM !== null && (isNaN(passM) || passM > maxM || passM < 0)) {
      Alert.alert('Validation Error', 'Pass mark must be between 0 and Max Marks.');
      return;
    }
    if (!editingScheduleId && (!schedClassId || !schedSubjectId)) {
      Alert.alert('Validation Error', 'Class and Subject are required for new schedules.');
      return;
    }

    setIsSavingSchedule(true);
    try {
      if (editingScheduleId) {
        const updated = await AcademicService.updateExamSchedule(editingScheduleId, {
          examDate: schedDate.trim() || null,
          maxMarks: maxM,
          passMark: passM,
        });
        setExamSchedules((prev) => prev.map((s) => (s.id === editingScheduleId ? updated : s)));
      } else {
        const created = await AcademicService.createExamSchedule(selectedExamId, {
          classId: schedClassId!,
          sectionId: schedSectionId,
          subjectId: schedSubjectId!,
          examDate: schedDate.trim() || null,
          maxMarks: maxM,
          passMark: passM,
        });
        setExamSchedules((prev) => [...prev, created]);
      }
      setShowScheduleForm(false);
      setEditingScheduleId(null);
      setSchedClassId(null);
      setSchedSectionId(null);
      setSchedSubjectId(null);
      setSchedDate('');
      setSchedMaxMarks('100');
      setSchedPassMark('33');
    } catch (err) {
      Alert.alert('Could not save schedule', parseErrorMessage(err));
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleDeleteSchedule = (id: number) => {
    Alert.alert('Delete Schedule', 'Delete this exam schedule entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AcademicService.deleteExamSchedule(id);
            setExamSchedules((prev) => prev.filter((s) => s.id !== id));
          } catch (err) {
            Alert.alert('Could not delete schedule', parseErrorMessage(err));
          }
        },
      },
    ]);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-cream-100 px-6 pt-10">
      <ScreenHeader title="Academic Structure" subtitle="Years, classes, sections, subjects & exams" />

      {/* Tabs Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 max-h-12 flex-row">
        {[
          { key: 'years', label: 'Years' },
          { key: 'classes', label: 'Classes & Sections' },
          { key: 'subjects', label: 'Subjects' },
          { key: 'grading', label: 'Grading' },
          { key: 'exams', label: 'Exams' },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            className={`px-4 py-2.5 rounded-2xl mr-2 border border-primary-100 ${
              tab === t.key ? 'bg-primary-500' : 'bg-white'
            }`}
            onPress={() => setTab(t.key as SubTab)}
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
        {/* ── TAB 1: ACADEMIC YEARS ───────────────────────────────────────── */}
        {tab === 'years' ? (
          <>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-body-bold text-slate-800 text-base">Academic Years</Text>
              <TouchableOpacity
                className="bg-primary-500 px-3.5 py-2 rounded-xl flex-row items-center"
                onPress={() => setShowYearForm(!showYearForm)}
              >
                <Ionicons name={showYearForm ? 'close' : 'add'} size={16} color="#fff" />
                <Text className="text-white font-body-bold text-xs ml-1">
                  {showYearForm ? 'Cancel' : 'New Year'}
                </Text>
              </TouchableOpacity>
            </View>

            {showYearForm ? (
              <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
                <Text className="font-body-bold text-slate-800 text-sm mb-3">Create Academic Year</Text>
                <FormField label="Year Name" icon="calendar-outline" placeholder="e.g. 2026-2027" value={yearName} onChangeText={setYearName} />
                <FormField label="Start Date" icon="time-outline" placeholder="YYYY-MM-DD" value={yearStart} onChangeText={setYearStart} />
                <FormField label="End Date" icon="time-outline" placeholder="YYYY-MM-DD" value={yearEnd} onChangeText={setYearEnd} />
                <PrimaryButton label="Create Academic Year" icon="checkmark" onPress={handleCreateYear} isLoading={isSavingYear} />
              </View>
            ) : null}

            {years.length === 0 ? (
              <EmptyState icon="calendar-outline" title="No academic years" message="Create an academic year to start." />
            ) : (
              years.map((y) => (
                <View key={y.id} className="bg-white p-4 rounded-3xl border border-primary-100 shadow-sm mb-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-body-extrabold text-slate-800 text-base">{y.name}</Text>
                    <View className="flex-row items-center">
                      {y.isCurrent ? (
                        <View className="bg-mint-100 px-2.5 py-0.5 rounded-full mr-1.5">
                          <Text className="text-mint-600 font-body-bold text-xs">Current</Text>
                        </View>
                      ) : null}
                      {y.isArchived ? (
                        <View className="bg-slate-100 px-2.5 py-0.5 rounded-full">
                          <Text className="text-slate-500 font-body-bold text-xs">Archived</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <Text className="text-slate-500 font-body text-xs mb-3">
                    {y.startDate} to {y.endDate}
                  </Text>
                  {!y.isArchived ? (
                    <View className="flex-row justify-end space-x-2 pt-2 border-t border-cream-200">
                      {!y.isCurrent ? (
                        <TouchableOpacity
                          className="bg-primary-50 px-3 py-1.5 rounded-xl mr-2"
                          onPress={() => handleSetCurrentYear(y.id)}
                        >
                          <Text className="text-primary-600 font-body-bold text-xs">Set Current</Text>
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity
                        className="bg-coral-50 px-3 py-1.5 rounded-xl"
                        onPress={() => handleArchiveYear(y.id)}
                      >
                        <Text className="text-coral-600 font-body-bold text-xs">Archive</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </>
        ) : null}

        {/* ── TAB 2: CLASSES & SECTIONS ────────────────────────────────────── */}
        {tab === 'classes' ? (
          <>
            {/* Classes Management */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-body-bold text-slate-800 text-base">Classes</Text>
              <TouchableOpacity
                className="bg-primary-500 px-3.5 py-2 rounded-xl flex-row items-center"
                onPress={() => {
                  setEditingClassId(null);
                  setClassName('');
                  setClassSortOrder('');
                  setShowClassForm(!showClassForm);
                }}
              >
                <Ionicons name={showClassForm ? 'close' : 'add'} size={16} color="#fff" />
                <Text className="text-white font-body-bold text-xs ml-1">
                  {showClassForm ? 'Cancel' : 'New Class'}
                </Text>
              </TouchableOpacity>
            </View>

            {showClassForm ? (
              <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
                <Text className="font-body-bold text-slate-800 text-sm mb-3">
                  {editingClassId ? 'Edit Class' : 'Create Class'}
                </Text>
                <FormField label="Class Name" icon="school-outline" placeholder="e.g. Grade 1" value={className} onChangeText={setClassName} />
                <FormField label="Sort Order" icon="list-outline" placeholder="e.g. 1" keyboardType="number-pad" value={classSortOrder} onChangeText={setClassSortOrder} />
                <PrimaryButton label={editingClassId ? 'Update Class' : 'Create Class'} icon="checkmark" onPress={handleSaveClass} isLoading={isSavingClass} />
              </View>
            ) : null}

            {classes.length === 0 ? (
              <EmptyState icon="library-outline" title="No classes" message="Create your first class." />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {classes.map((c) => (
                  <View key={c.id} className="mr-2">
                    <TouchableOpacity
                      className={`px-4 py-3 rounded-2xl border ${
                        selectedClassId === c.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                      }`}
                      onPress={() => setSelectedClassId(c.id)}
                    >
                      <Text className={`font-body-bold text-sm ${selectedClassId === c.id ? 'text-white' : 'text-slate-800'}`}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                    <View className="flex-row justify-center mt-1">
                      <TouchableOpacity
                        className="px-1.5"
                        onPress={() => {
                          setEditingClassId(c.id);
                          setClassName(c.name);
                          setClassSortOrder(String(c.sortOrder));
                          setShowClassForm(true);
                        }}
                      >
                        <Ionicons name="pencil-outline" size={14} color="#0284c7" />
                      </TouchableOpacity>
                      <TouchableOpacity className="px-1.5" onPress={() => handleReorderClass(c.id, c.sortOrder, 'up')}>
                        <Ionicons name="chevron-up" size={14} color="#64748b" />
                      </TouchableOpacity>
                      <TouchableOpacity className="px-1.5" onPress={() => handleDeleteClass(c.id, c.name)}>
                        <Ionicons name="trash-outline" size={14} color="#e11d48" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Sections Management for selected class */}
            {selectedClassId ? (
              <View className="mt-4 border-t border-cream-200 pt-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="font-body-bold text-slate-800 text-base">
                    Sections ({classes.find((c) => c.id === selectedClassId)?.name})
                  </Text>
                  <TouchableOpacity
                    className="bg-secondary-500 px-3.5 py-2 rounded-xl flex-row items-center"
                    onPress={() => {
                      setEditingSectionId(null);
                      setSectionName('');
                      setSectionMaxStrength('40');
                      setShowSectionForm(!showSectionForm);
                    }}
                  >
                    <Ionicons name={showSectionForm ? 'close' : 'add'} size={16} color="#fff" />
                    <Text className="text-white font-body-bold text-xs ml-1">
                      {showSectionForm ? 'Cancel' : 'New Section'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showSectionForm ? (
                  <View className="bg-white p-5 rounded-3xl border border-secondary-100 shadow-sm mb-4">
                    <Text className="font-body-bold text-slate-800 text-sm mb-3">
                      {editingSectionId ? 'Edit Section' : 'Create Section'}
                    </Text>
                    <FormField label="Section Name" icon="grid-outline" placeholder="e.g. Section A" value={sectionName} onChangeText={setSectionName} />
                    <FormField label="Max Capacity" icon="people-outline" placeholder="40" keyboardType="number-pad" value={sectionMaxStrength} onChangeText={setSectionMaxStrength} />
                    <PrimaryButton label={editingSectionId ? 'Update Section' : 'Create Section'} icon="checkmark" onPress={handleSaveSection} isLoading={isSavingSection} />
                  </View>
                ) : null}

                {sections.length === 0 ? (
                  <EmptyState icon="grid-outline" title="No sections" message="Add sections for this class." />
                ) : (
                  sections.map((s) => (
                    <View key={s.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-2.5 flex-row items-center justify-between">
                      <View>
                        <Text className="font-body-bold text-slate-800 text-sm">{s.name}</Text>
                        <Text className="text-slate-500 font-body text-xs mt-0.5">Max Strength: {s.maxStrength}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          className="mr-3"
                          onPress={() => {
                            setEditingSectionId(s.id);
                            setSectionName(s.name);
                            setSectionMaxStrength(String(s.maxStrength));
                            setShowSectionForm(true);
                          }}
                        >
                          <Ionicons name="pencil-outline" size={18} color="#0284c7" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteSection(s.id, s.name)}>
                          <Ionicons name="trash-outline" size={18} color="#e11d48" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ) : null}
          </>
        ) : null}

        {/* ── TAB 3: SUBJECTS ─────────────────────────────────────────────── */}
        {tab === 'subjects' ? (
          <>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-body-bold text-slate-800 text-base">Global Subject Catalog</Text>
              <TouchableOpacity
                className="bg-primary-500 px-3.5 py-2 rounded-xl flex-row items-center"
                onPress={() => {
                  setEditingSubjectId(null);
                  setSubjectName('');
                  setSubjectCode('');
                  setShowSubjectForm(!showSubjectForm);
                }}
              >
                <Ionicons name={showSubjectForm ? 'close' : 'add'} size={16} color="#fff" />
                <Text className="text-white font-body-bold text-xs ml-1">
                  {showSubjectForm ? 'Cancel' : 'New Subject'}
                </Text>
              </TouchableOpacity>
            </View>

            {showSubjectForm ? (
              <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
                <Text className="font-body-bold text-slate-800 text-sm mb-3">
                  {editingSubjectId ? 'Edit Subject' : 'Create Subject'}
                </Text>
                <FormField label="Subject Name" icon="book-outline" placeholder="e.g. Mathematics" value={subjectName} onChangeText={setSubjectName} />
                <FormField label="Subject Code" icon="pricetag-outline" placeholder="e.g. MATH-101" autoCapitalize="characters" value={subjectCode} onChangeText={setSubjectCode} />
                <PrimaryButton label={editingSubjectId ? 'Update Subject' : 'Create Subject'} icon="checkmark" onPress={handleSaveSubject} isLoading={isSavingSubject} />
              </View>
            ) : null}

            {subjects.length === 0 ? (
              <EmptyState icon="book-outline" title="No subjects" message="Add subjects to your global catalog." />
            ) : (
              subjects.map((sub) => (
                <View key={sub.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-2.5 flex-row items-center justify-between">
                  <View>
                    <Text className="font-body-bold text-slate-800 text-sm">{sub.name}</Text>
                    {sub.code ? <Text className="text-slate-400 font-body text-xs mt-0.5">Code: {sub.code}</Text> : null}
                  </View>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      className="mr-3"
                      onPress={() => {
                        setEditingSubjectId(sub.id);
                        setSubjectName(sub.name);
                        setSubjectCode(sub.code || '');
                        setShowSubjectForm(true);
                      }}
                    >
                      <Ionicons name="pencil-outline" size={18} color="#0284c7" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteSubject(sub.id, sub.name)}>
                      <Ionicons name="trash-outline" size={18} color="#e11d48" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Class Subject Assignment Section */}
            {selectedClassId ? (
              <View className="mt-6 border-t border-cream-200 pt-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="font-body-bold text-slate-800 text-base">
                    Assigned to {classes.find((c) => c.id === selectedClassId)?.name}
                  </Text>
                  <TouchableOpacity
                    className="bg-secondary-500 px-3.5 py-2 rounded-xl flex-row items-center"
                    onPress={() => setShowAssignForm(!showAssignForm)}
                  >
                    <Ionicons name={showAssignForm ? 'close' : 'add'} size={16} color="#fff" />
                    <Text className="text-white font-body-bold text-xs ml-1">
                      {showAssignForm ? 'Cancel' : 'Assign Subject'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showAssignForm ? (
                  <View className="bg-white p-5 rounded-3xl border border-secondary-100 shadow-sm mb-4">
                    <Text className="font-body-bold text-slate-800 text-sm mb-3">Assign Subject to Class</Text>
                    <Text className="text-slate-500 font-body text-xs mb-2">Select Subject:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                      {subjects.map((sub) => (
                        <TouchableOpacity
                          key={sub.id}
                          className={`px-3 py-2 rounded-xl mr-2 border ${
                            assignSubjectId === sub.id ? 'bg-secondary-500 border-secondary-500' : 'bg-cream-50 border-primary-100'
                          }`}
                          onPress={() => setAssignSubjectId(sub.id)}
                        >
                          <Text className={`font-body-bold text-xs ${assignSubjectId === sub.id ? 'text-white' : 'text-slate-700'}`}>
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <View className="flex-row items-center justify-between mb-4 bg-cream-50 p-3 rounded-2xl border border-primary-100">
                      <Text className="text-slate-700 font-body-semibold text-sm">Compulsory Subject?</Text>
                      <TouchableOpacity
                        className={`px-3 py-1.5 rounded-full ${assignIsCompulsory ? 'bg-mint-100' : 'bg-slate-200'}`}
                        onPress={() => setAssignIsCompulsory(!assignIsCompulsory)}
                      >
                        <Text className={`font-body-bold text-xs ${assignIsCompulsory ? 'text-mint-600' : 'text-slate-600'}`}>
                          {assignIsCompulsory ? 'Yes (Compulsory)' : 'No (Optional)'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <PrimaryButton label="Assign to Class" icon="checkmark" onPress={handleAssignSubject} isLoading={isSavingAssign} />
                  </View>
                ) : null}

                {classSubjects.length === 0 ? (
                  <EmptyState icon="book-outline" title="No subjects assigned" message="Assign subjects from the global catalog." />
                ) : (
                  classSubjects.map((cs) => (
                    <View key={cs.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-2.5 flex-row items-center justify-between">
                      <View>
                        <Text className="font-body-bold text-slate-800 text-sm">{cs.subjectName}</Text>
                        <View className="mt-0.5">
                          <Text className={`font-body-semibold text-xs ${cs.isCompulsory ? 'text-mint-600' : 'text-secondary-600'}`}>
                            {cs.isCompulsory ? 'Compulsory' : 'Optional'}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleUnassignSubject(cs.id, cs.subjectName)}>
                        <Ionicons name="trash-outline" size={18} color="#e11d48" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            ) : null}
          </>
        ) : null}

        {/* ── TAB 4: GRADING SCALES ───────────────────────────────────────── */}
        {tab === 'grading' ? (
          <>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-body-bold text-slate-800 text-base">Grading Scale Bands</Text>
              <TouchableOpacity
                className="bg-primary-500 px-3.5 py-2 rounded-xl flex-row items-center"
                onPress={() => setShowGradingForm(!showGradingForm)}
              >
                <Ionicons name={showGradingForm ? 'close' : 'add'} size={16} color="#fff" />
                <Text className="text-white font-body-bold text-xs ml-1">
                  {showGradingForm ? 'Cancel' : 'New Band'}
                </Text>
              </TouchableOpacity>
            </View>

            {showGradingForm ? (
              <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
                <Text className="font-body-bold text-slate-800 text-sm mb-3">Add Grading Band</Text>
                <View className="flex-row mb-2">
                  <View className="flex-1 mr-2">
                    <FormField label="Min %" icon="pie-chart-outline" placeholder="0" keyboardType="decimal-pad" value={minPct} onChangeText={setMinPct} />
                  </View>
                  <View className="flex-1">
                    <FormField label="Max %" icon="pie-chart-outline" placeholder="100" keyboardType="decimal-pad" value={maxPct} onChangeText={setMaxPct} />
                  </View>
                </View>
                <View className="flex-row mb-2">
                  <View className="flex-1 mr-2">
                    <FormField label="Letter Grade" icon="ribbon-outline" placeholder="e.g. A+" autoCapitalize="characters" value={letterGrade} onChangeText={setLetterGrade} />
                  </View>
                  <View className="flex-1">
                    <FormField label="Grade Point (0-4)" icon="star-outline" placeholder="4.0" keyboardType="decimal-pad" value={gradePoint} onChangeText={setGradePoint} />
                  </View>
                </View>
                <PrimaryButton label="Save Grading Band" icon="checkmark" onPress={handleSaveGrading} isLoading={isSavingGrading} />
              </View>
            ) : null}

            {gradingScales.length === 0 ? (
              <EmptyState icon="ribbon-outline" title="No grading scales" message="Define grading bands for your school." />
            ) : (
              gradingScales.map((s) => (
                <View key={s.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-2.5 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-secondary-100 rounded-xl items-center justify-center mr-3">
                      <Text className="text-secondary-600 font-body-bold text-sm">{s.letterGrade}</Text>
                    </View>
                    <View>
                      <Text className="font-body-bold text-slate-800 text-sm">
                        {s.minPercentage}% – {s.maxPercentage}%
                      </Text>
                      {s.gradePoint != null ? (
                        <Text className="text-slate-500 font-body text-xs mt-0.5">Grade Point: {s.gradePoint}</Text>
                      ) : null}
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteGrading(s.id, s.letterGrade)}>
                    <Ionicons name="trash-outline" size={18} color="#e11d48" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        ) : null}

        {/* ── TAB 5: EXAMS & SCHEDULES ────────────────────────────────────── */}
        {tab === 'exams' ? (
          <>
            {/* Year Selector */}
            <Text className="font-body-semibold text-slate-500 text-xs mb-1.5">Filter Exams by Year:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {years.map((y) => (
                <TouchableOpacity
                  key={y.id}
                  className={`px-3.5 py-2 rounded-xl mr-2 border ${
                    selectedYearIdForExam === y.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                  }`}
                  onPress={() => setSelectedYearIdForExam(y.id)}
                >
                  <Text className={`font-body-bold text-xs ${selectedYearIdForExam === y.id ? 'text-white' : 'text-slate-700'}`}>
                    {y.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-body-bold text-slate-800 text-base">Exams</Text>
              <TouchableOpacity
                className="bg-primary-500 px-3.5 py-2 rounded-xl flex-row items-center"
                onPress={() => {
                  setEditingExamId(null);
                  setExamName('');
                  setExamStart('');
                  setExamEnd('');
                  setShowExamForm(!showExamForm);
                }}
              >
                <Ionicons name={showExamForm ? 'close' : 'add'} size={16} color="#fff" />
                <Text className="text-white font-body-bold text-xs ml-1">
                  {showExamForm ? 'Cancel' : 'New Exam'}
                </Text>
              </TouchableOpacity>
            </View>

            {showExamForm ? (
              <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
                <Text className="font-body-bold text-slate-800 text-sm mb-3">
                  {editingExamId ? 'Edit Exam' : 'Create Exam'}
                </Text>
                <FormField label="Exam Name" icon="document-text-outline" placeholder="e.g. Midterm 2026" value={examName} onChangeText={setExamName} />
                <FormField label="Start Date (Optional)" icon="calendar-outline" placeholder="YYYY-MM-DD" value={examStart} onChangeText={setExamStart} />
                <FormField label="End Date (Optional)" icon="calendar-outline" placeholder="YYYY-MM-DD" value={examEnd} onChangeText={setExamEnd} />
                <PrimaryButton label={editingExamId ? 'Update Exam' : 'Create Exam'} icon="checkmark" onPress={handleSaveExam} isLoading={isSavingExam} />
              </View>
            ) : null}

            {exams.length === 0 ? (
              <EmptyState icon="document-text-outline" title="No exams" message="Create an exam for this academic year." />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {exams.map((ex) => (
                  <View key={ex.id} className="mr-2">
                    <TouchableOpacity
                      className={`px-4 py-3 rounded-2xl border ${
                        selectedExamId === ex.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                      }`}
                      onPress={() => setSelectedExamId(ex.id)}
                    >
                      <Text className={`font-body-bold text-sm ${selectedExamId === ex.id ? 'text-white' : 'text-slate-800'}`}>
                        {ex.name}
                      </Text>
                    </TouchableOpacity>
                    <View className="flex-row justify-center mt-1">
                      <TouchableOpacity
                        className="px-1.5"
                        onPress={() => {
                          setEditingExamId(ex.id);
                          setExamName(ex.name);
                          setExamStart(ex.startDate || '');
                          setExamEnd(ex.endDate || '');
                          setShowExamForm(true);
                        }}
                      >
                        <Ionicons name="pencil-outline" size={14} color="#0284c7" />
                      </TouchableOpacity>
                      <TouchableOpacity className="px-1.5" onPress={() => handleDeleteExam(ex.id, ex.name)}>
                        <Ionicons name="trash-outline" size={14} color="#e11d48" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Exam Schedules */}
            {selectedExamId ? (
              <View className="mt-4 border-t border-cream-200 pt-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="font-body-bold text-slate-800 text-base">
                    Schedules ({exams.find((e) => e.id === selectedExamId)?.name})
                  </Text>
                  <TouchableOpacity
                    className="bg-secondary-500 px-3.5 py-2 rounded-xl flex-row items-center"
                    onPress={() => {
                      setEditingScheduleId(null);
                      setSchedClassId(classes[0]?.id || null);
                      setSchedSectionId(null);
                      setSchedSubjectId(subjects[0]?.id || null);
                      setSchedDate('');
                      setSchedMaxMarks('100');
                      setSchedPassMark('33');
                      setShowScheduleForm(!showScheduleForm);
                    }}
                  >
                    <Ionicons name={showScheduleForm ? 'close' : 'add'} size={16} color="#fff" />
                    <Text className="text-white font-body-bold text-xs ml-1">
                      {showScheduleForm ? 'Cancel' : 'New Schedule'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showScheduleForm ? (
                  <View className="bg-white p-5 rounded-3xl border border-secondary-100 shadow-sm mb-4">
                    <Text className="font-body-bold text-slate-800 text-sm mb-3">
                      {editingScheduleId ? 'Edit Schedule' : 'Add Exam Schedule Entry'}
                    </Text>

                    {!editingScheduleId ? (
                      <>
                        <Text className="text-slate-500 font-body text-xs mb-1">Select Class:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                          {classes.map((c) => (
                            <TouchableOpacity
                              key={c.id}
                              className={`px-3 py-1.5 rounded-xl mr-2 border ${
                                schedClassId === c.id ? 'bg-secondary-500 border-secondary-500' : 'bg-cream-50 border-primary-100'
                              }`}
                              onPress={() => setSchedClassId(c.id)}
                            >
                              <Text className={`font-body-bold text-xs ${schedClassId === c.id ? 'text-white' : 'text-slate-700'}`}>
                                {c.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        <Text className="text-slate-500 font-body text-xs mb-1">Select Subject:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                          {subjects.map((sub) => (
                            <TouchableOpacity
                              key={sub.id}
                              className={`px-3 py-1.5 rounded-xl mr-2 border ${
                                schedSubjectId === sub.id ? 'bg-secondary-500 border-secondary-500' : 'bg-cream-50 border-primary-100'
                              }`}
                              onPress={() => setSchedSubjectId(sub.id)}
                            >
                              <Text className={`font-body-bold text-xs ${schedSubjectId === sub.id ? 'text-white' : 'text-slate-700'}`}>
                                {sub.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </>
                    ) : null}

                    <FormField label="Exam Date" icon="calendar-outline" placeholder="YYYY-MM-DD" value={schedDate} onChangeText={setSchedDate} />
                    <View className="flex-row mb-2">
                      <View className="flex-1 mr-2">
                        <FormField label="Max Marks" icon="calculator-outline" placeholder="100" keyboardType="number-pad" value={schedMaxMarks} onChangeText={setSchedMaxMarks} />
                      </View>
                      <View className="flex-1">
                        <FormField label="Pass Mark" icon="checkmark-circle-outline" placeholder="33" keyboardType="number-pad" value={schedPassMark} onChangeText={setSchedPassMark} />
                      </View>
                    </View>
                    <PrimaryButton label={editingScheduleId ? 'Update Schedule' : 'Create Schedule'} icon="checkmark" onPress={handleSaveSchedule} isLoading={isSavingSchedule} />
                  </View>
                ) : null}

                {examSchedules.length === 0 ? (
                  <EmptyState icon="calendar-outline" title="No schedules" message="Add schedule entries for this exam." />
                ) : (
                  examSchedules.map((s) => (
                    <View key={s.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-2.5 flex-row items-center justify-between">
                      <View>
                        <Text className="font-body-bold text-slate-800 text-sm">
                          {s.className} – {s.subjectName}
                        </Text>
                        <Text className="text-slate-500 font-body text-xs mt-0.5">
                          Date: {s.examDate || 'TBD'} | Max: {s.maxMarks} | Pass: {s.passMark || 'N/A'}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          className="mr-3"
                          onPress={() => {
                            setEditingScheduleId(s.id);
                            setSchedDate(s.examDate || '');
                            setSchedMaxMarks(String(s.maxMarks));
                            setSchedPassMark(s.passMark != null ? String(s.passMark) : '');
                            setShowScheduleForm(true);
                          }}
                        >
                          <Ionicons name="pencil-outline" size={18} color="#0284c7" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteSchedule(s.id)}>
                          <Ionicons name="trash-outline" size={18} color="#e11d48" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ) : null}
          </>
        ) : null}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
