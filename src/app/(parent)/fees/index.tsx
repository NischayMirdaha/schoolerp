import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useActiveChild } from '../../../context/ActiveChildContext';
import { feeService } from '../../../services/feeService';
import { ChildFeeSummaryResponse } from '../../../types/fee';
import ScreenHeader from '../../../components/ScreenHeader';
import ChildSelectorHeader from '../../../components/ChildSelectorHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function ParentFeeSummaryScreen() {
  const router = useRouter();
  const { activeChild } = useActiveChild();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ChildFeeSummaryResponse | null>(null);

  useEffect(() => {
    if (activeChild) {
      fetchSummary();
    }
  }, [activeChild]);

  const fetchSummary = async () => {
    if (!activeChild) return;
    try {
      setLoading(true);
      const data = await feeService.getChildFeeSummary(activeChild.studentId);
      setSummary(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load fee summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Fee & Payments" subtitle="Outstanding dues, bank QR, and claims" />
        <ChildSelectorHeader />
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : summary ? (
        <ScrollView className="flex-1 px-4">
          {/* Dues Balance Card */}
          <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-4 items-center">
            <Text className="text-xs font-body-semibold text-slate-500 uppercase tracking-wider">
              Total Outstanding Dues
            </Text>
            <Text className="text-3xl font-body-bold text-coral-600 mt-1">
              NPR {summary.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>

            {summary.currentCreditBalance > 0 ? (
              <Text className="text-xs font-body-bold text-emerald-600 mt-1">
                Credit Balance: NPR {summary.currentCreditBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            ) : null}

            <View className="mt-4 w-full">
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <PrimaryButton
                    label="I Have Paid"
                    icon="checkmark-circle-outline"
                    onPress={() =>
                      router.push({
                        pathname: '/(parent)/fees/claim' as any,
                        params: {
                          studentId: String(summary.studentId),
                        },
                      })
                    }
                  />
                </View>

                <View className="flex-1">
                  <PrimaryButton
                    label="Fee History"
                    icon="time-outline"
                    variant="outline"
                    onPress={() =>
                      router.push({
                        pathname: '/(parent)/fees/history' as any,
                        params: {
                          studentId: String(summary.studentId),
                        },
                      })
                    }
                  />
                </View>
              </View>

              <View className="mt-3">
                <PrimaryButton
                  label="Request Discount / Scholarship"
                  icon="pricetag-outline"
                  variant="outline"
                  onPress={() =>
                    router.push('/(parent)/fees/discounts' as any)
                  }
                />
              </View>
            </View>
          </View>

          {/* School Bank Details */}
          {summary.schoolBankName ||
          summary.schoolBankAccountNumber ||
          summary.schoolBankAccountName ? (
            <View className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-4">
              <Text className="text-base font-body-bold text-slate-800 mb-3">
                School Bank Account Details
              </Text>

              {summary.schoolBankName ? (
                <View className="mb-2">
                  <Text className="text-xs font-body text-slate-500">
                    Bank Name
                  </Text>
                  <Text className="text-sm font-body-bold text-slate-800">
                    {summary.schoolBankName}
                  </Text>
                </View>
              ) : null}

              {summary.schoolBankAccountNumber ? (
                <View className="mb-2">
                  <Text className="text-xs font-body text-slate-500">
                    Account Number
                  </Text>
                  <Text className="text-sm font-body-bold text-primary-600">
                    {summary.schoolBankAccountNumber}
                  </Text>
                </View>
              ) : null}

              {summary.schoolBankAccountName ? (
                <View className="mb-2">
                  <Text className="text-xs font-body text-slate-500">
                    Account Name
                  </Text>
                  <Text className="text-sm font-body-semibold text-slate-800">
                    {summary.schoolBankAccountName}
                  </Text>
                </View>
              ) : null}

              {summary.schoolBankBranch ? (
                <View className="mb-2">
                  <Text className="text-xs font-body text-slate-500">
                    Branch
                  </Text>
                  <Text className="text-sm font-body-semibold text-slate-800">
                    {summary.schoolBankBranch}
                  </Text>
                </View>
              ) : null}

              {!summary.schoolBankName ||
              !summary.schoolBankAccountNumber ||
              !summary.schoolBankAccountName ? (
                <View className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <Text className="text-xs font-body text-amber-800">
                    Some bank details are incomplete. Confirm the
                    payment information with the school accounts office
                    before transferring money.
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View className="bg-amber-50 p-4 rounded-2xl border border-amber-200 mb-4">
              <Text className="text-sm font-body-bold text-amber-800">
                Bank payment details unavailable
              </Text>

              <Text className="text-xs font-body text-amber-700 mt-1">
                The school has not configured its bank account
                information. You can still report a cash, cheque, or
                separately confirmed payment using “I Have Paid,” or
                contact the school accounts office.
              </Text>
            </View>
          )}

          {/* Payment QR Code */}
          {summary.qrCodePath ? (
            <View className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-8 items-center">
              <Text className="text-base font-body-bold text-slate-800 mb-2">Scan & Pay via UPI/QR</Text>
              <Image
                source={{ uri: summary.qrCodePath }}
                className="w-48 h-48 rounded-xl border border-primary-200"
                resizeMode="contain"
              />
              <Text className="text-xs font-body text-slate-500 mt-2 text-center">
                Scan using Fonepay / eSewa / Khalti / Mobile Banking app
              </Text>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}