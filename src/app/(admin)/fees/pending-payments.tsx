import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { feeService } from '../../../services/feeService';
import { LedgerEntryResponse } from '../../../types/fee';
import ScreenHeader from '../../../components/ScreenHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

export default function PendingPaymentsScreen() {
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [claims, setClaims] = useState<LedgerEntryResponse[]>([]);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await feeService.listPendingPayments();
      setClaims(res.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load pending payment claims.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ledgerId: number) => {
    try {
      setProcessingId(ledgerId);
      await feeService.approvePayment(ledgerId);
      Alert.alert('Success', 'Payment claim approved successfully and allocated FIFO.');
      fetchClaims();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to approve payment.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (ledgerId: number) => {
    Alert.prompt(
      'Reject Payment Claim',
      'Please enter the reason for rejecting this payment claim:',
      async (reason) => {
        if (!reason || !reason.trim()) {
          Alert.alert('Validation Error', 'A rejection reason is required.');
          return;
        }

        try {
          setProcessingId(ledgerId);
          await feeService.rejectPayment(ledgerId, reason.trim());
          Alert.alert('Rejected', 'Payment claim rejected.');
          fetchClaims();
        } catch (err: any) {
          Alert.alert('Error', err.message || 'Failed to reject payment.');
        } finally {
          setProcessingId(null);
        }
      }
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Pending Payment Claims" subtitle="Verify and approve offline parent claims" />
      </View>

      <ScrollView className="flex-1 px-4">
        {claims.length > 0 ? (
          claims.map((claim) => (
            <View
              key={claim.id}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs font-body-bold text-primary-600">
                  Method: {claim.paymentMethod?.toUpperCase() || 'OFFLINE'}
                </Text>
                <Text className="text-xs font-body text-slate-500">Ref: {claim.referenceNumber}</Text>
              </View>

              <Text className="text-lg font-body-bold text-slate-800">
                Amount: NPR {claim.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>

              {claim.description ? (
                <Text className="text-xs font-body text-slate-600 mt-1">{claim.description}</Text>
              ) : null}

              <Text className="text-xs font-body text-slate-400 mt-1">Date: {claim.transactionDate}</Text>

              <View className="flex-row gap-2 mt-4 pt-3 border-t border-slate-100">
                <View className="flex-1">
                  <PrimaryButton
                    label="Approve"
                    onPress={() => handleApprove(claim.id)}
                    isLoading={processingId === claim.id}
                  />
                </View>

                <View className="flex-1">
                  <PrimaryButton
                    label="Reject"
                    variant="coral"
                    onPress={() => handleReject(claim.id)}
                    isLoading={processingId === claim.id}
                  />
                </View>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="checkmark-circle-outline"
            title="No Pending Claims"
            message="All payment claims have been processed."
          />
        )}
      </ScrollView>
    </View>
  );
}