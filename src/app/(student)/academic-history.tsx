import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { api } from '../../services/api';
import ScreenHeader from '../../components/ScreenHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export interface StudentAcademicHistoryResponse {
  recordId: number;
  studentId: number;
  academicYearId: number;
  academicYearName: string;
  classId: number;
  className: string;
  sectionId?: number | null;
  sectionName?: string | null;
  rollNo?: string | null;
  status: string;
  closingBalance?: number | null;
  closingCreditBalance?: number | null;
  createdAt: string;
}

export default function StudentAcademicHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<StudentAcademicHistoryResponse[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Fetch profile to get student ID
      const profile = await api.request<any>('/profile');
      if (profile) {
        // Fetch academic history for student ID
        const data = await api.request<StudentAcademicHistoryResponse[]>(`/students/${profile.id}/academic-history`);
        setHistory(data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load academic history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Academic Timeline" subtitle="Historical classes, academic years, and status" />
      </View>

      <ScrollView className="flex-1 px-4">
        {history.length > 0 ? (
          history.map((h) => (
            <View
              key={h.recordId}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs font-body-bold text-primary-600">{h.academicYearName}</Text>
                <View className="bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <Text className="text-xs font-body-bold text-emerald-700">{h.status.toUpperCase()}</Text>
                </View>
              </View>

              <Text className="text-base font-body-bold text-slate-800">
                Class: {h.className} {h.sectionName ? `(${h.sectionName})` : ''}
              </Text>
              {h.rollNo ? <Text className="text-xs font-body text-slate-500">Roll No: {h.rollNo}</Text> : null}

              {h.closingBalance !== undefined && h.closingBalance !== null ? (
                <Text className="text-xs font-body-semibold text-slate-600 mt-2">
                  Year-End Closing Dues: NPR {h.closingBalance.toLocaleString()}
                </Text>
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState icon="time-outline" title="No Past History" message="No previous academic year records." />
        )}
      </ScrollView>
    </View>
  );
}