import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { examService } from '../../services/examService';
import { StudentResultSummaryRecordDto } from '../../types/exam';
import ScreenHeader from '../../components/ScreenHeader';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function StudentResultsScreen() {
  const [loading, setLoading] = useState(true);
  const [downloadingExamId, setDownloadingExamId] = useState<number | null>(null);
  const [results, setResults] = useState<StudentResultSummaryRecordDto[]>([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await examService.getStudentExamResults();
      setResults(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load published exam results.');
    } finally {
      setLoading(false);
    }
  };

  /** FIX (#6): report-card PDF (§16) had no entry point in the app at all. */
  const handleDownload = async (r: StudentResultSummaryRecordDto) => {
    try {
      setDownloadingExamId(r.examId);
      // No studentId → hits /api/exams/{examId}/report-card/me (Policy.Student).
      await examService.downloadReportCard(r.examId, undefined, r.examName);
    } catch (err: any) {
      Alert.alert('Download failed', err.message || 'Could not download the report card.');
    } finally {
      setDownloadingExamId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Exam Results" subtitle="Published exam performance and report cards" />
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        {results.length > 0 ? (
          results.map((r) => (
            <View
              key={r.examId}
              className="bg-white p-4 rounded-3xl border border-primary-100 shadow-sm mb-3"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-base font-body-bold text-slate-800" numberOfLines={1}>
                    {r.examName}
                  </Text>
                  <Text className="text-slate-500 font-body text-xs mt-0.5">
                    Score: {r.totalMarksObtained}/{r.totalMaxMarks} ({r.percentage}%)
                    {r.rank ? ` | Rank: #${r.rank}` : ''}
                  </Text>
                </View>

                <View className="px-2.5 py-1 rounded-full bg-primary-100">
                  <Text className="text-xs font-body-bold text-primary-600">
                    {r.letterGrade || 'Grade'}
                  </Text>
                </View>
              </View>

              {r.remarks ? (
                <Text className="text-xs font-body text-slate-600 mt-2">{r.remarks}</Text>
              ) : null}

              <View className="mt-3 border-t border-slate-100 pt-3">
                <PrimaryButton
                  label="Download Report Card"
                  icon="download-outline"
                  variant="outline"
                  isLoading={downloadingExamId === r.examId}
                  onPress={() => handleDownload(r)}
                />
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="ribbon-outline"
            title="No Published Results"
            message="Published exam results will appear here."
          />
        )}
      </ScrollView>
    </View>
  );
}