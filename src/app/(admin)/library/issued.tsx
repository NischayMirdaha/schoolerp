import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { libraryService } from '../../../services/libraryService';
import { StudentAdminService } from '../../../services/studentAdminService';
import { BookIssueResponse, BookResponse } from '../../../types/library';
import { StudentResponse } from '../../../types/student';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

type IssueFilter = 'active' | 'returned' | 'all';

const defaultDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

/**
 * FIX (#11): Library circulation — issue books to students, view the issued /
 * returned list, and mark returns. Previously issueBook / listIssuedBooks had
 * no UI at all (overdue screen only worked with seeded data).
 */
export default function IssuedBooksScreen() {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<BookIssueResponse[]>([]);
  const [filter, setFilter] = useState<IssueFilter>('active');

  // Issue modal
  const [issueModal, setIssueModal] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);
  const [bookSearch, setBookSearch] = useState('');
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookResponse | null>(null);
  const [dueDate, setDueDate] = useState(defaultDueDate());

  const fetchIssues = useCallback(async (f: IssueFilter) => {
    try {
      setLoading(true);
      const isActiveOnly = f === 'all' ? undefined : f === 'active';
      const res = await libraryService.listIssuedBooks(undefined, undefined, isActiveOnly);
      setIssues(res.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load issued books.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues(filter);
  }, [filter, fetchIssues]);

  const searchStudents = async () => {
    try {
      const res = await StudentAdminService.listStudents({ searchTerm: studentSearch.trim() || undefined }, 1, 10);
      setStudents(res.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to search students.');
    }
  };

  const searchBooks = async () => {
    try {
      // availableOnly=true → only books with copies on the shelf
      const res = await libraryService.listBooks(bookSearch.trim() || undefined, undefined, true, 1, 10);
      setBooks(res.items.filter((b) => b.isActive && b.availableCopies > 0));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to search books.');
    }
  };

  const openIssueModal = () => {
    setSelectedStudent(null);
    setSelectedBook(null);
    setStudentSearch('');
    setBookSearch('');
    setStudents([]);
    setBooks([]);
    setDueDate(defaultDueDate());
    setIssueModal(true);
  };

  const handleIssue = async () => {
    if (!selectedStudent || !selectedBook) {
      Alert.alert('Validation', 'Select both a student and a book.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      Alert.alert('Validation', 'Due date must be in YYYY-MM-DD format.');
      return;
    }
    try {
      setIssuing(true);
      await libraryService.issueBook({
        bookId: selectedBook.id,
        studentId: selectedStudent.studentId,
        dueDate,
      });
      setIssueModal(false);
      Alert.alert('Success', `"${selectedBook.title}" issued to ${selectedStudent.firstName}.`);
      fetchIssues(filter);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to issue book.');
    } finally {
      setIssuing(false);
    }
  };

  const handleReturn = (issue: BookIssueResponse) => {
    Alert.alert('Return Book', `Mark "${issue.bookTitle}" as returned by ${issue.studentName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Returned',
        onPress: async () => {
          try {
            await libraryService.returnBook(issue.id);
            fetchIssues(filter);
            Alert.alert('Success', 'Book returned to stock.');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to return book.');
          }
        },
      },
    ]);
  };

  if (loading && !issueModal) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Book Circulation" subtitle="Issue books to students and track returns" />
      </View>

      {/* Filter chips + Issue button */}
      <View className="flex-row items-center px-4 mb-3">
        {(['active', 'returned', 'all'] as IssueFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            className={`px-3 py-2 rounded-xl mr-2 border ${
              filter === f ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
            }`}
            onPress={() => setFilter(f)}
          >
            <Text className={`text-xs font-body-bold ${filter === f ? 'text-white' : 'text-slate-700'}`}>
              {f === 'active' ? 'Issued' : f === 'returned' ? 'Returned' : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
        <View className="flex-1" />
        <TouchableOpacity className="bg-primary-500 px-3 py-2 rounded-xl" onPress={openIssueModal}>
          <Text className="text-xs font-body-bold text-white">+ Issue Book</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {issues.length > 0 ? (
          issues.map((item) => (
            <View key={item.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base font-body-bold text-slate-800 flex-1 pr-2">{item.bookTitle}</Text>
                <View className={`px-2.5 py-0.5 rounded-full ${item.returnedDate ? 'bg-mint-100' : 'bg-secondary-100'}`}>
                  <Text className={`text-xs font-body-bold ${item.returnedDate ? 'text-mint-700' : 'text-secondary-700'}`}>
                    {item.returnedDate ? 'Returned' : 'Issued'}
                  </Text>
                </View>
              </View>

              <Text className="text-xs font-body text-slate-500 mb-1">
                Borrower: {item.studentName} (Adm: {item.admissionNo}) | Code: {item.bookCode}
              </Text>
              <Text className="text-xs font-body text-slate-400">
                Issued: {item.issueDate} | Due: {item.dueDate}
                {item.returnedDate ? ` | Returned: ${item.returnedDate}` : ''}
              </Text>

              {!item.returnedDate ? (
                <View className="mt-3 pt-2 border-t border-slate-100">
                  <PrimaryButton label="Mark Returned" variant="outline" onPress={() => handleReturn(item)} />
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState
            icon="swap-horizontal-outline"
            title="No Records"
            message={
              filter === 'active'
                ? 'No books are currently issued. Tap "+ Issue Book" to lend one.'
                : 'No circulation records found for this filter.'
            }
          />
        )}
        <View className="h-8" />
      </ScrollView>

      {/* Issue Book Modal */}
      <Modal visible={issueModal} transparent animationType="slide" onRequestClose={() => setIssueModal(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setIssueModal(false)}>
          <Pressable className="bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[90%]" onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-lg font-heading text-slate-800 mb-4">Issue Book to Student</Text>

              {/* 1. Student picker */}
              <FormField
                label="1. Search Student"
                icon="person-outline"
                placeholder="Name or admission no"
                value={studentSearch}
                onChangeText={(t) => {
                  setStudentSearch(t);
                  setSelectedStudent(null);
                }}
                onSubmitEditing={searchStudents}
                returnKeyType="search"
              />
              {selectedStudent ? (
                <View className="bg-mint-50 border border-mint-200 rounded-xl p-3 mb-4 flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text className="text-sm font-body-bold text-mint-700 ml-2">
                    {selectedStudent.firstName} {selectedStudent.lastName ?? ''} (Adm: {selectedStudent.admissionNo})
                  </Text>
                </View>
              ) : students.length > 0 ? (
                <View className="mb-4">
                  {students.slice(0, 5).map((s) => (
                    <TouchableOpacity
                      key={s.studentId}
                      className="bg-cream-50 border border-primary-100 rounded-xl px-3 py-2.5 mb-2"
                      onPress={() => setSelectedStudent(s)}
                    >
                      <Text className="text-sm font-body-bold text-slate-800">
                        {s.firstName} {s.lastName ?? ''}
                      </Text>
                      <Text className="text-xs font-body text-slate-500">
                        Adm: {s.admissionNo} | {s.className}
                        {s.sectionName ? `-${s.sectionName}` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {/* 2. Book picker */}
              <FormField
                label="2. Search Book (available copies)"
                icon="book-outline"
                placeholder="Title, author or code"
                value={bookSearch}
                onChangeText={(t) => {
                  setBookSearch(t);
                  setSelectedBook(null);
                }}
                onSubmitEditing={searchBooks}
                returnKeyType="search"
              />
              {selectedBook ? (
                <View className="bg-mint-50 border border-mint-200 rounded-xl p-3 mb-4 flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text className="text-sm font-body-bold text-mint-700 ml-2">
                    {selectedBook.title} — {selectedBook.availableCopies} available
                  </Text>
                </View>
              ) : books.length > 0 ? (
                <View className="mb-4">
                  {books.slice(0, 5).map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      className="bg-cream-50 border border-primary-100 rounded-xl px-3 py-2.5 mb-2"
                      onPress={() => setSelectedBook(b)}
                    >
                      <Text className="text-sm font-body-bold text-slate-800">{b.title}</Text>
                      <Text className="text-xs font-body text-slate-500">
                        Code: {b.bookCode} | Available: {b.availableCopies}/{b.totalCopies}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {/* 3. Due date */}
              <FormField
                label="3. Due Date (YYYY-MM-DD) *"
                icon="calendar-outline"
                placeholder="YYYY-MM-DD"
                value={dueDate}
                onChangeText={setDueDate}
              />

              <PrimaryButton label="Issue Book" onPress={handleIssue} isLoading={issuing} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}