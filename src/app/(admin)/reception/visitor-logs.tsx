import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { visitorService } from '../../../services/visitorService';
import { VisitorLogResponse } from '../../../types/visitor';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

export default function VisitorLogListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openOnly, setOpenOnly] = useState(false);
  const [logs, setLogs] = useState<VisitorLogResponse[]>([]);

  useEffect(() => {
    fetchLogs();
  }, [openOnly]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await visitorService.listVisitorLogs(search.trim() || undefined, openOnly ? true : undefined);
      setLogs(res.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load visitor logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkExit = async (id: number) => {
    try {
      await visitorService.markVisitorExit(id);
      Alert.alert('Success', 'Marked visitor departure exit.');
      fetchLogs();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark exit.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Front Desk Visitor Logs" subtitle="Search and manage active visitor entries" />
      </View>

      <View className="px-4 mb-3">
        <FormField
          label="Search Visitor / Phone / Purpose"
          value={search}
          onChangeText={setSearch}
          placeholder="Type to search..."
          onSubmitEditing={fetchLogs}
        />

        <View className="flex-row justify-between items-center mt-1">
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-xl border ${
              openOnly ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
            }`}
            onPress={() => setOpenOnly(!openOnly)}
          >
            <Text className={`text-xs font-body-bold ${openOnly ? 'text-white' : 'text-slate-700'}`}>
              {openOnly ? 'Active Open Visits' : 'Show All Visits'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-primary-600 px-3 py-1.5 rounded-xl"
            onPress={() => router.push('/(admin)/reception/create-visitor' as any)}
          >
            <Text className="text-xs font-body-bold text-white">+ New Visitor</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {logs.length > 0 ? (
          logs.map((log) => (
            <View
              key={log.id}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base font-body-bold text-slate-800">{log.visitorName}</Text>
                <View
                  className={`px-2.5 py-0.5 rounded-full ${
                    log.outTime ? 'bg-slate-100' : 'bg-emerald-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-body-bold ${
                      log.outTime ? 'text-slate-600' : 'text-emerald-700'
                    }`}
                  >
                    {log.outTime ? 'DEPARTED' : 'OPEN VISIT'}
                  </Text>
                </View>
              </View>

              <Text className="text-xs font-body text-slate-500 mb-1">
                Phone: {log.phone || '-'} | Purpose: {log.purpose || '-'}
              </Text>

              <Text className="text-xs font-body text-slate-400">
                In: {new Date(log.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {log.outTime ? ` | Out: ${new Date(log.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </Text>

              {!log.outTime ? (
                <View className="mt-3 pt-2 border-t border-slate-100">
                  <PrimaryButton
                    label="Mark Departure Exit"
                    variant="outline"
                    onPress={() => handleMarkExit(log.id)}
                  />
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState icon="people-outline" title="No Visitor Logs" message="No visitor records matching your filter." />
        )}
      </ScrollView>
    </View>
  );
}