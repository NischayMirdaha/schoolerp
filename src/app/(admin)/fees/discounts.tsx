import React, {
  useCallback,
  useState,
} from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { feeService } from '../../../services/feeService';
import { DiscountResponseDto } from '../../../types/fee';
import ScreenHeader from '../../../components/ScreenHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

export default function DiscountApprovalsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<
    number | null
  >(null);
  const [requests, setRequests] = useState<
    DiscountResponseDto[]
  >([]);

  const loadRequests = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const response = await feeService.listDiscounts({
          status: 'pending',
          page: 1,
          pageSize: 100,
        });

        setRequests(response.items);
      } catch (error: any) {
        Alert.alert(
          'Unable to load discounts',
          error?.message ||
            'Failed to load pending discount requests.'
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadRequests();

      return undefined;
    }, [loadRequests])
  );

  const refresh = async () => {
    try {
      setRefreshing(true);
      await loadRequests(false);
    } finally {
      setRefreshing(false);
    }
  };

  const approve = (request: DiscountResponseDto) => {
    Alert.alert(
      'Approve Discount',
      [
        `Student: ${
          request.studentName ||
          `ID ${request.studentId}`
        }`,
        `Discount: ${request.percentage}%`,
        '',
        'Approval creates an approved discount entry in the student fee ledger and immediately reduces the outstanding balance.',
        '',
        'Do you want to continue?',
      ].join('\n'),
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setProcessingId(request.id);

              await feeService.approveDiscount(request.id);
              await loadRequests(false);

              Alert.alert(
                'Discount approved',
                'The discount was applied to the student ledger successfully.'
              );
            } catch (error: any) {
              Alert.alert(
                'Approval failed',
                error?.message ||
                  'Failed to approve the discount.'
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const reject = (request: DiscountResponseDto) => {
    Alert.alert(
      'Reject Discount',
      [
        `Student: ${
          request.studentName ||
          `ID ${request.studentId}`
        }`,
        `Discount: ${request.percentage}%`,
        '',
        'The current backend permanently removes a rejected request. This action cannot be undone.',
        '',
        'Do you want to reject it?',
      ].join('\n'),
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(request.id);

              await feeService.rejectDiscount(request.id);
              await loadRequests(false);

              Alert.alert(
                'Request rejected',
                'The discount request was rejected and removed.'
              );
            } catch (error: any) {
              Alert.alert(
                'Rejection failed',
                error?.message ||
                  'Failed to reject the discount.'
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader
          title="Discount Approvals"
          subtitle="Review pending discounts and scholarships"
        />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
          />
        }
      >
        <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Text className="text-sm font-body-bold text-amber-800">
            Principal approval required
          </Text>

          <Text className="mt-1 text-xs font-body text-amber-700">
            Approval calculates the discount from the
            student's posted charges. If no charges exist, the
            backend falls back to configured class fee amounts.
          </Text>
        </View>

        {requests.length > 0 ? (
          requests.map((request) => {
            const processing =
              processingId === request.id;

            return (
              <View
                key={request.id}
                className="mb-4 rounded-3xl border border-primary-100 bg-white p-5 shadow-sm"
              >
                <View className="flex-row items-start justify-between">
                  <View className="mr-3 flex-1">
                    <Text className="text-lg font-body-bold text-slate-800">
                      {request.studentName ||
                        `Student ID ${request.studentId}`}
                    </Text>

                    <Text className="mt-1 text-xs font-body text-slate-500">
                      Student ID: {request.studentId}
                    </Text>

                    <Text className="mt-1 text-xs font-body text-slate-500">
                      Class ID: {request.classId}
                    </Text>

                    <Text className="mt-1 text-xs font-body text-slate-500">
                      Academic Year ID:{' '}
                      {request.academicYearId}
                    </Text>
                  </View>

                  <View className="rounded-full bg-amber-100 px-3 py-1">
                    <Text className="text-xs font-body-bold text-amber-700">
                      PENDING
                    </Text>
                  </View>
                </View>

                <View className="my-4 flex-row gap-3">
                  <View className="flex-1 rounded-2xl bg-primary-50 p-4">
                    <Text className="text-xs font-body-semibold text-slate-500">
                      Requested
                    </Text>
                    <Text className="mt-1 text-2xl font-body-bold text-primary-600">
                      {request.percentage}%
                    </Text>
                  </View>

                  <View className="flex-1 rounded-2xl bg-sky-50 p-4">
                    <Text className="text-xs font-body-semibold text-slate-500">
                      Mode
                    </Text>
                    <Text className="mt-1 text-sm font-body-bold text-sky-700">
                      {request.mode
                        .replace('_', ' ')
                        .toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View className="mb-4 rounded-2xl bg-cream-50 p-4">
                  <Text className="text-xs font-body-semibold text-slate-500">
                    Reason
                  </Text>

                  <Text className="mt-1 text-sm font-body text-slate-700">
                    {request.reason ||
                      'No reason was supplied.'}
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <PrimaryButton
                      label="Reject"
                      variant="outline"
                      onPress={() => reject(request)}
                      disabled={processing}
                    />
                  </View>

                  <View className="flex-1">
                    <PrimaryButton
                      label="Approve"
                      onPress={() => approve(request)}
                      isLoading={processing}
                      disabled={processing}
                    />
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState
            icon="checkmark-done-circle-outline"
            title="No Pending Discounts"
            message="All discount requests have been reviewed."
          />
        )}
      </ScrollView>
    </View>
  );
}