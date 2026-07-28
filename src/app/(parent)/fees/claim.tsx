import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { feeService } from '../../../services/feeService';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';

const PAYMENT_METHODS = [
  { id: 'bank', label: 'Bank Transfer' },
  { id: 'cash', label: 'Cash' },
  { id: 'cheque', label: 'Cheque' },
  { id: 'other', label: 'Other / Mobile App' },
];

export default function SubmitPaymentClaimScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ studentId: string }>();
  const studentId = Number(params.studentId || '1');

  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'cheque' | 'bank' | 'other'>('bank');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid payment amount.');
      return;
    }

    if (!referenceNumber.trim()) {
      Alert.alert('Validation Error', 'Transaction or reference number is required.');
      return;
    }

    try {
      setSubmitting(true);
      await feeService.submitPaymentClaim(studentId, {
        studentId,
        amount: numAmount,
        paymentMethod,
        paymentDate,
        referenceNumber: referenceNumber.trim(),
        note: note.trim() || null,
      });

      Alert.alert(
        'Claim Submitted',
        'Payment claim submitted successfully with Pending status. Accountant will verify and approve.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit payment claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="I Have Paid" subtitle="Submit offline payment claim for verification" />
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-6">
          <FormField
            label="Amount Paid (NPR) *"
            value={amount}
            onChangeText={setAmount}
            placeholder="e.g. 5000"
            keyboardType="numeric"
          />

          <Text className="text-xs font-body-semibold text-slate-600 mb-2">Payment Method *</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {PAYMENT_METHODS.map((m) => {
              const isSelected = paymentMethod === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  className={`px-3 py-2 rounded-xl border ${
                    isSelected ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                  }`}
                  onPress={() => setPaymentMethod(m.id as any)}
                >
                  <Text className={`text-xs font-body-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FormField
            label="Payment Date (YYYY-MM-DD) *"
            value={paymentDate}
            onChangeText={setPaymentDate}
            placeholder="YYYY-MM-DD"
          />

          <FormField
            label="Transaction / Reference Number *"
            value={referenceNumber}
            onChangeText={setReferenceNumber}
            placeholder="UTR / Bank Ref / Receipt No."
          />

          <FormField
            label="Note (Optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Additional details"
          />

          <View className="mt-2">
            <PrimaryButton
              label={submitting ? 'Submitting...' : 'Submit Payment Claim'}
              onPress={handleSubmit}
              isLoading={submitting}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}