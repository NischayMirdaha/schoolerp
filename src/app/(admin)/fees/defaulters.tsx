import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { feeService } from '../../../services/feeService';
import { GetDefaultersResponseDto } from '../../../types/fee';
import ScreenHeader from '../../../components/ScreenHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

export default function DefaultersReportScreen() {
  const [loading, setLoading] = useState(true);
  const [defaultersData, setDefaultersData] = useState<GetDefaultersResponseDto | null>(null);

  useEffect(() => {
    fetchDefaulters();
  }, []);

  const fetchDefaulters = async () => {
    try {
      setLoading(true);
      const data = await feeService.getDefaulters();
      setDefaultersData(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load defaulters aging report.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEligibility = async (studentId: number, currentAllowed: boolean) => {
    try {
      await feeService.setExamEligibility(studentId, !currentAllowed);
      Alert.alert('Success', `Student exam eligibility updated.`);
      fetchDefaulters();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update exam eligibility.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const summary = defaultersData?.summary;
  const students = defaultersData?.students.items || [];

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Fee Defaulters & Aging" subtitle="Overdue balances and exam eligibility" />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Aging Summary Card */}
        {summary ? (
          <View className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-4">
            <Text className="text-sm font-body-bold text-slate-800 mb-2">Aging Summary</Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex-1">
                <Text className="text-xs font-body text-slate-500">0-30 Days</Text>
                <Text className="text-sm font-body-bold text-amber-700">NPR {summary.days0To30Amount.toLocaleString()}</Text>
              </View>

              <View className="bg-coral-50 p-2.5 rounded-xl border border-coral-200 flex-1">
                <Text className="text-xs font-body text-slate-500">31-60 Days</Text>
                <Text className="text-sm font-body-bold text-coral-700">NPR {summary.days31To60Amount.toLocaleString()}</Text>
              </View>

              <View className="bg-coral-100 p-2.5 rounded-xl border border-coral-300 flex-1">
                <Text className="text-xs font-body text-slate-500">90+ Days</Text>
                <Text className="text-sm font-body-bold text-coral-800">NPR {summary.over90Amount.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Student Defaulters Roster */}
        {students.length > 0 ? (
          students.map((item) => (
            <View
              key={item.studentId}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base font-body-bold text-slate-800">{item.studentName}</Text>
                <View className="bg-coral-100 px-2.5 py-0.5 rounded-full">
                  <Text className="text-xs font-body-bold text-coral-700">{item.agingBucket}</Text>
                </View>
              </View>

              <Text className="text-xs font-body text-slate-500 mb-2">
                Class: {item.className} | Adm: {item.admissionNo}
              </Text>

              <Text className="text-sm font-body-bold text-coral-600">
                Outstanding Dues: NPR {item.totalDues.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>

              <TouchableOpacity
                className="mt-3 bg-primary-50 p-2.5 rounded-xl border border-primary-200 items-center"
                onPress={() => handleToggleEligibility(item.studentId, true)}
              >
                <Text className="text-xs font-body-bold text-primary-700">Toggle Exam Eligibility</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <EmptyState icon="wallet-outline" title="No Defaulters" message="All students have clear fee accounts." />
        )}
      </ScrollView>
    </View>
  );
}