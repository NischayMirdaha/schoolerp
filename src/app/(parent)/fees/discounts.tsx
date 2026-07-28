import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useActiveChild } from '../../../context/ActiveChildContext';
import { feeService } from '../../../services/feeService';
import { DiscountResponseDto } from '../../../types/fee';
import ScreenHeader from '../../../components/ScreenHeader';
import ChildSelectorHeader from '../../../components/ChildSelectorHeader';
import FormField from '../../../components/FormField';
import TextAreaField from '../../../components/TextAreaField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

type DiscountMode = 'proportional' | 'lump_sum';

export default function ParentDiscountsScreen() {
  const { activeChild } = useActiveChild();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<
    DiscountResponseDto[]
  >([]);

  const [academicYearId, setAcademicYearId] = useState('');
  const [percentage, setPercentage] = useState('');
  const [mode, setMode] =
    useState<DiscountMode>('proportional');
  const [reason, setReason] = useState('');

  const loadRequests = useCallback(
    async (showLoading = true) => {
      if (!activeChild) {
        setRequests([]);
        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }

        const response = await feeService.listDiscounts({
          studentId: activeChild.studentId,
          page: 1,
          pageSize: 50,
        });

        setRequests(response.items);
      } catch (error: any) {
        Alert.alert(
          'Unable to load requests',
          error?.message ||
            'Failed to load discount requests.'
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [activeChild?.studentId]
  );

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useFocusEffect(
    useCallback(() => {
      loadRequests(false);
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

  const submitRequest = async () => {
    if (!activeChild) {
      Alert.alert(
        'No child selected',
        'Please select a child before requesting a discount.'
      );
      return;
    }

    const parsedAcademicYearId = Number(academicYearId);
    const parsedPercentage = Number(percentage);

    if (
      !Number.isInteger(parsedAcademicYearId) ||
      parsedAcademicYearId <= 0
    ) {
      Alert.alert(
        'Validation Error',
        'Enter a valid academic year ID.'
      );
      return;
    }

    if (
      !Number.isFinite(parsedPercentage) ||
      parsedPercentage <= 0 ||
      parsedPercentage > 100
    ) {
      Alert.alert(
        'Validation Error',
        'Percentage must be greater than 0 and no more than 100.'
      );
      return;
    }

    if (!reason.trim()) {
      Alert.alert(
        'Validation Error',
        'Please explain why the discount is being requested.'
      );
      return;
    }

    try {
      setSubmitting(true);

      await feeService.requestDiscount({
        studentId: activeChild.studentId,
        academicYearId: parsedAcademicYearId,
        percentage: parsedPercentage,
        mode,
        reason: reason.trim(),
      });

      setPercentage('');
      setReason('');

      await loadRequests(false);

      Alert.alert(
        'Request submitted',
        'The discount request is pending Principal approval. No fee balance changes until it is approved.'
      );
    } catch (error: any) {
      Alert.alert(
        'Unable to submit request',
        error?.message ||
          'Failed to submit the discount request.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const hasPendingRequest = requests.some(
    (request) => !request.isApproved
  );

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader
          title="Discounts & Scholarships"
          subtitle="Request fee assistance and view approval status"
        />
        <ChildSelectorHeader />
      </View>

      {!activeChild ? (
        <View className="flex-1 px-4">
          <EmptyState
            icon="people-outline"
            title="No Child Selected"
            message="Select a linked child to continue."
          />
        </View>
      ) : loading ? (
        <LoadingSpinner />
      ) : (
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
          <View className="mb-4 rounded-3xl border border-primary-100 bg-white p-5 shadow-sm">
            <Text className="text-lg font-body-bold text-slate-800">
              New Discount Request
            </Text>

            <Text className="mb-4 mt-1 text-xs font-body text-slate-500">
              Student: {activeChild.firstName}{' '}{activeChild.lastName}
            </Text>

            {hasPendingRequest ? (
              <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <Text className="text-sm font-body-bold text-amber-800">
                  Request already pending
                </Text>

                <Text className="mt-1 text-xs font-body text-amber-700">
                  A discount request for this child is waiting
                  for Principal approval. Only one request is
                  allowed per student and academic year.
                </Text>
              </View>
            ) : (
              <>
                <FormField
                  label="Academic Year ID *"
                  value={academicYearId}
                  onChangeText={setAcademicYearId}
                  placeholder="Example: 1"
                  keyboardType="number-pad"
                />

                <FormField
                  label="Requested Discount Percentage *"
                  value={percentage}
                  onChangeText={setPercentage}
                  placeholder="Example: 20"
                  keyboardType="decimal-pad"
                />

                <Text className="mb-2 text-xs font-body-semibold text-slate-600">
                  Application mode *
                </Text>

                <View className="mb-4 flex-row gap-2">
                  <TouchableOpacity
                    className={`flex-1 items-center rounded-xl border px-2 py-3 ${
                      mode === 'proportional'
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-primary-100 bg-cream-50'
                    }`}
                    onPress={() =>
                      setMode('proportional')
                    }
                  >
                    <Text
                      className={`text-xs font-body-bold ${
                        mode === 'proportional'
                          ? 'text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      PROPORTIONAL
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 items-center rounded-xl border px-2 py-3 ${
                      mode === 'lump_sum'
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-primary-100 bg-cream-50'
                    }`}
                    onPress={() => setMode('lump_sum')}
                  >
                    <Text
                      className={`text-xs font-body-bold ${
                        mode === 'lump_sum'
                          ? 'text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      LUMP SUM
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-3">
                  <Text className="text-xs font-body text-sky-800">
                    {mode === 'proportional'
                      ? 'Proportional: the approved percentage reduces applicable charges proportionally.'
                      : 'Lump sum: the backend records one discount ledger adjustment calculated from the approved percentage.'}
                  </Text>
                </View>

                <TextAreaField
                  label="Reason for Request *"
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Explain the financial, scholarship, sibling, or other circumstances."
                  maxLength={500}
                  minLines={4}
                />

                <PrimaryButton
                  label="Submit Discount Request"
                  onPress={submitRequest}
                  isLoading={submitting}
                />
              </>
            )}
          </View>

          <Text className="mb-3 text-base font-body-bold text-slate-800">
            Request History
          </Text>

          {requests.length > 0 ? (
            requests.map((request) => (
              <View
                key={request.id}
                className="mb-3 rounded-2xl border border-primary-100 bg-white p-4 shadow-sm"
              >
                <View className="flex-row items-start justify-between">
                  <View className="mr-3 flex-1">
                    <Text className="text-base font-body-bold text-slate-800">
                      {request.percentage}% Discount
                    </Text>

                    <Text className="mt-1 text-xs font-body text-slate-500">
                      Academic Year ID:{' '}
                      {request.academicYearId}
                    </Text>

                    <Text className="mt-1 text-xs font-body text-slate-500">
                      Mode:{' '}
                      {request.mode
                        .replace('_', ' ')
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View
                    className={`rounded-full px-3 py-1 ${
                      request.isApproved
                        ? 'bg-emerald-100'
                        : 'bg-amber-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-body-bold ${
                        request.isApproved
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {request.isApproved
                        ? 'APPROVED'
                        : 'PENDING'}
                    </Text>
                  </View>
                </View>

                {request.reason ? (
                  <View className="mt-3 border-t border-slate-100 pt-3">
                    <Text className="text-xs font-body-semibold text-slate-600">
                      Reason
                    </Text>
                    <Text className="mt-1 text-sm font-body text-slate-700">
                      {request.reason}
                    </Text>
                  </View>
                ) : null}

                {request.approvedAt ? (
                  <Text className="mt-3 text-xs font-body text-emerald-700">
                    Approved:{' '}
                    {new Date(
                      request.approvedAt
                    ).toLocaleString()}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <EmptyState
              icon="pricetag-outline"
              title="No Discount Requests"
              message="No discount or scholarship request has been submitted for this child."
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}