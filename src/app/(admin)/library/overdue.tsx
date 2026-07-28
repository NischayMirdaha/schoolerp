import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { libraryService } from '../../../services/libraryService';
import { OverdueBookResponse } from '../../../types/library';
import ScreenHeader from '../../../components/ScreenHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

export default function OverdueBooksScreen() {
  const [loading, setLoading] = useState(true);
  const [reminding, setReminding] = useState(false);
  const [overdueList, setOverdueList] = useState<OverdueBookResponse[]>([]);

  useEffect(() => {
    fetchOverdue();
  }, []);

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const res = await libraryService.listOverdueBooks();
      setOverdueList(res.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load overdue books.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (issueId: number) => {
    try {
      await libraryService.returnBook(issueId);
      Alert.alert('Success', 'Book returned to stock.');
      fetchOverdue();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to return book.');
    }
  };

  const handleTriggerAllReminders = async () => {
    try {
      setReminding(true);
      await libraryService.triggerOverdueReminder();
      Alert.alert('Success', 'Overdue reminders sent to students and parents.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send reminders.');
    } finally {
      setReminding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Overdue Books" subtitle="Unreturned books past due date" />
      </View>

      <View className="flex-row justify-between items-center px-4 mb-3">
        <Text className="text-base font-body-bold text-slate-800">
          Overdue Copies ({overdueList.length})
        </Text>
        {overdueList.length > 0 ? (
          <TouchableOpacity
            className="bg-coral-500 px-3 py-2 rounded-xl"
            onPress={handleTriggerAllReminders}
            disabled={reminding}
          >
            <Text className="text-xs font-body-bold text-white">Trigger Reminders</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView className="flex-1 px-4">
        {overdueList.length > 0 ? (
          overdueList.map((item) => (
            <View
              key={item.issueId}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base font-body-bold text-slate-800">{item.bookTitle}</Text>
                <View className="bg-coral-100 px-2.5 py-0.5 rounded-full">
                  <Text className="text-xs font-body-bold text-coral-700">
                    {item.daysOverdue} Days Overdue
                  </Text>
                </View>
              </View>

              <Text className="text-xs font-body text-slate-500 mb-1">
                Borrower: {item.studentName} ({item.className}) | Code: {item.bookCode}
              </Text>

              <Text className="text-xs font-body text-slate-400">
                Issued: {item.issueDate} | Due: {item.dueDate}
              </Text>

              <View className="mt-3 pt-2 border-t border-slate-100">
                <PrimaryButton
                  label="Mark Returned"
                  variant="outline"
                  onPress={() => handleReturn(item.issueId)}
                />
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon="book-outline" title="No Overdue Books" message="All issued books are within due dates." />
        )}
      </ScrollView>
    </View>
  );
}