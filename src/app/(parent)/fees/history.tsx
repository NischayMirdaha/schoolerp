import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useActiveChild } from '../../../context/ActiveChildContext';
import { feeService } from '../../../services/feeService';
import { LedgerEntryResponse } from '../../../types/fee';
import ScreenHeader from '../../../components/ScreenHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

export default function ParentFeeHistoryScreen() {
  const params = useLocalSearchParams<{ studentId?: string }>();
  const { activeChild } = useActiveChild();

  // FIX: previously defaulted to student #1 on a fresh DB. Fall back to the
  // currently-selected child instead of a hardcoded id.
  const studentId = params.studentId ? Number(params.studentId) : activeChild?.studentId ?? null;

  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [entries, setEntries] = useState<LedgerEntryResponse[]>([]);

  useEffect(() => {
    if (studentId) {
      fetchLedger(studentId);
    } else {
      setLoading(false);
    }
  }, [studentId]);

  const fetchLedger = async (id: number) => {
    try {
      setLoading(true);
      const res = await feeService.getStudentLedger(id);
      setEntries(res.entries.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load fee history.');
    } finally {
      setLoading(false);
    }
  };

  /** FIX (#6): the receipt PDF was completely unreachable from the app before. */
  const handleDownloadReceipt = async (item: LedgerEntryResponse) => {
    if (!item.receiptId) return;

    try {
      setDownloadingId(item.id);
      await feeService.downloadReceipt(item.receiptId, item.receiptNumber);
    } catch (err: any) {
      Alert.alert('Download failed', err.message || 'Could not download the receipt.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Fee History Ledger" subtitle="Complete fee charges, claims, and running balance" />
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        {!studentId ? (
          <EmptyState
            icon="person-outline"
            title="No Child Selected"
            message="Select a child from the Fees screen to view their ledger."
          />
        ) : entries.length > 0 ? (
          entries.map((item) => (
            <View
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs font-body-bold text-primary-600">
                  {item.transactionType.toUpperCase()} {item.feeHeadName ? `• ${item.feeHeadName}` : ''}
                </Text>

                <View
                  className={`px-2.5 py-0.5 rounded-full ${
                    item.status === 'approved'
                      ? 'bg-emerald-100'
                      : item.status === 'rejected'
                      ? 'bg-coral-100'
                      : 'bg-amber-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-body-bold ${
                      item.status === 'approved'
                        ? 'text-emerald-700'
                        : item.status === 'rejected'
                        ? 'text-coral-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text className="text-base font-body-bold text-slate-800">
                Amount: NPR {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>

              {item.description ? (
                <Text className="text-xs font-body text-slate-600 mt-0.5">{item.description}</Text>
              ) : null}

              <View className="flex-row justify-between items-center mt-2 border-t border-slate-100 pt-2">
                <Text className="text-xs font-body text-slate-500">Date: {item.transactionDate}</Text>
                <Text className="text-xs font-body-bold text-slate-700">
                  Balance After: NPR {item.balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              {/* FIX (#6): PDF receipt for every approved payment (§10.7). */}
              {item.receiptId ? (
                <View className="mt-3">
                  {item.receiptNumber ? (
                    <Text className="text-xs font-body text-slate-500 mb-2">
                      Receipt #{item.receiptNumber}
                    </Text>
                  ) : null}
                  <PrimaryButton
                    label="Download Receipt"
                    icon="download-outline"
                    variant="outline"
                    isLoading={downloadingId === item.id}
                    onPress={() => handleDownloadReceipt(item)}
                  />
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState
            icon="wallet-outline"
            title="No Fee History"
            message="No fee charges or payment records found."
          />
        )}
      </ScrollView>
    </View>
  );
}