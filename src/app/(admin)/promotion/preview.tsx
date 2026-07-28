import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StudentAdminService } from '../../../services/studentAdminService';
import {
  PromotionMappingResponse,
  PromotionPreviewResponse,
  EligibleStudentResponse,
} from '../../../types/promotion';
import ScreenHeader from '../../../components/ScreenHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

/**
 * FIX (#13): previously defaulted mappingId to 1 and nothing passed a real
 * param → always errored on a fresh DB. Now the screen first lists the real
 * promotion mappings (GET /api/promotion/mappings) and previews the one the
 * principal picks. A deep link with ?mappingId= still works.
 */
export default function PromotionPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mappingId?: string }>();
  const paramMappingId = params.mappingId ? Number(params.mappingId) : null;

  const [loadingMappings, setLoadingMappings] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [mappings, setMappings] = useState<PromotionMappingResponse[]>([]);
  const [selectedMappingId, setSelectedMappingId] = useState<number | null>(paramMappingId);
  const [preview, setPreview] = useState<PromotionPreviewResponse | null>(null);

  // Load available mappings once.
  useEffect(() => {
    (async () => {
      try {
        const data = await StudentAdminService.listPromotionMappings();
        setMappings(data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load promotion mappings.');
      } finally {
        setLoadingMappings(false);
      }
    })();
  }, []);

  const fetchPreview = useCallback(async (mappingId: number) => {
    try {
      setLoadingPreview(true);
      const data = await StudentAdminService.previewPromotion(mappingId);
      setPreview(data);
    } catch (err: any) {
      // Invalid mapping id (e.g. stale ?mappingId=1 link) → fall back to the picker.
      setPreview(null);
      setSelectedMappingId(null);
      Alert.alert('Preview Unavailable', err.message || 'Failed to load promotion preview.');
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMappingId) {
      fetchPreview(selectedMappingId);
    }
  }, [selectedMappingId, fetchPreview]);

  const handleExecuteBulkPromotion = async () => {
    if (!selectedMappingId) return;
    Alert.alert('Execute Academic Transition', 'Are you sure you want to execute bulk promotion? Closing fee balances will carry forward into opening balances for the new academic year.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Execute Transition',
        onPress: async () => {
          try {
            setSubmitting(true);
            await StudentAdminService.bulkPromoteStudents({
              promotionMappingId: selectedMappingId,
              excludedStudentIds: [],
            });

            Alert.alert('Success', 'Academic year transition and bulk promotion executed successfully.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to execute promotion.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  if (loadingMappings) {
    return <LoadingSpinner />;
  }

  // ── Mapping picker view ──────────────────────────────────────────────────
  if (!preview) {
    return (
      <View className="flex-1 bg-cream-100">
        <View className="p-4 pt-12">
          <ScreenHeader
            title="Promotion Transition Preview"
            subtitle="Select a promotion mapping to preview"
          />
        </View>

        {loadingPreview ? (
          <LoadingSpinner />
        ) : (
          <ScrollView className="flex-1 px-4">
            {mappings.length > 0 ? (
              mappings.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3 flex-row justify-between items-center"
                  onPress={() => setSelectedMappingId(m.id)}
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-base font-body-bold text-slate-800">
                      {m.fromClassName} → {m.toClassName ?? (m.isGraduation ? 'Graduation' : 'N/A')}
                    </Text>
                    <Text className="text-xs font-body text-slate-500 mt-0.5">
                      {m.academicYearFromName} → {m.academicYearToName}
                      {m.isGraduation ? ' | Graduation' : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#0284c7" />
                </TouchableOpacity>
              ))
            ) : (
              <>
                <EmptyState
                  icon="trending-up-outline"
                  title="No Promotion Mappings"
                  message="Define a class-to-class mapping first — from the Students screen, Promotion tab."
                />
                <View className="mt-4">
                  <PrimaryButton
                    label="Open Students → Promotion"
                    icon="people-outline"
                    onPress={() => router.push('/(admin)/students')}
                  />
                </View>
              </>
            )}
          </ScrollView>
        )}
      </View>
    );
  }

  // ── Preview view ─────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Promotion Transition Preview" subtitle="Inspect academic transition outcomes before confirmation" />
      </View>

      <ScrollView className="flex-1 px-4 mb-4">
        <TouchableOpacity
          className="flex-row items-center mb-3"
          onPress={() => {
            setPreview(null);
            setSelectedMappingId(null);
          }}
        >
          <Ionicons name="swap-horizontal-outline" size={14} color="#0284c7" />
          <Text className="text-xs font-body-bold text-primary-600 ml-1">Choose a different mapping</Text>
        </TouchableOpacity>

        <View className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-4">
          <Text className="text-base font-body-bold text-slate-800 mb-2">Transition Summary</Text>
          <Text className="text-xs font-body text-slate-600">From Year: {preview.fromAcademicYearName}</Text>
          <Text className="text-xs font-body text-slate-600">To Year: {preview.toAcademicYearName}</Text>
          <Text className="text-xs font-body text-slate-600">From Class: {preview.fromClassName}</Text>
          <Text className="text-xs font-body text-slate-600">To Class: {preview.toClassName || 'Graduation'}</Text>
          <Text className="text-sm font-body-bold text-primary-600 mt-2">Total Eligible: {preview.totalEligible} Students</Text>
        </View>

        <Text className="text-sm font-body-bold text-slate-800 mb-2">
          Promoted Roster ({preview.promotedStudents.length})
        </Text>

        {preview.promotedStudents.map((s: EligibleStudentResponse) => (
          <View key={s.studentId} className="bg-white p-3 rounded-xl border border-primary-100 mb-2 flex-row justify-between">
            <View>
              <Text className="text-sm font-body-bold text-slate-800">{s.studentName}</Text>
              <Text className="text-xs font-body text-slate-500">Adm: {s.admissionNo}</Text>
            </View>

            <View className="items-end">
              <Text className="text-xs font-body-bold text-coral-600">
                Closing Dues: NPR {s.closingBalance.toLocaleString()}
              </Text>
              <Text className="text-xs font-body text-emerald-600">
                Credit: NPR {s.closingCreditBalance.toLocaleString()}
              </Text>
            </View>
          </View>
        ))}

        {preview.retainedStudents.length > 0 ? (
          <>
            <Text className="text-sm font-body-bold text-slate-800 mt-3 mb-2">
              Retained ({preview.retainedStudents.length})
            </Text>
            {preview.retainedStudents.map((s: EligibleStudentResponse) => (
              <View key={s.studentId} className="bg-white p-3 rounded-xl border border-slate-200 mb-2">
                <Text className="text-sm font-body-bold text-slate-800">{s.studentName}</Text>
                <Text className="text-xs font-body text-slate-500">Adm: {s.admissionNo}</Text>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>

      <View className="p-4 bg-white border-t border-primary-100">
        <PrimaryButton
          label={submitting ? 'Executing Transition...' : 'Confirm & Execute Transition'}
          onPress={handleExecuteBulkPromotion}
          isLoading={submitting}
        />
      </View>
    </View>
  );
}