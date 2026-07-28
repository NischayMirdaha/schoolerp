import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { timetableService } from '../../../services/timetableService';
import { PeriodResponse } from '../../../types/timetable';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import ListItemCard from '../../../components/ListItemCard';

export default function ManagePeriodsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [periods, setPeriods] = useState<PeriodResponse[]>([]);

  // Modal Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [periodNo, setPeriodNo] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:45');
  const [isTeaching, setIsTeaching] = useState(true);
  const [label, setLabel] = useState('');

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const data = await timetableService.listPeriods();
      setPeriods(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load periods.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const num = Number(periodNo);
    if (!num || num < 1) {
      Alert.alert('Validation Error', 'Period number must be greater than zero.');
      return;
    }

    try {
      setSaving(true);
      await timetableService.createPeriod({
        periodNo: num,
        startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
        isTeaching,
        label: label.trim() || null,
      });

      setModalVisible(false);
      setLabel('');
      fetchPeriods();
      Alert.alert('Success', 'Period created successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create period.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Period', 'Are you sure you want to delete this period slot?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await timetableService.deletePeriod(id);
            fetchPeriods();
            Alert.alert('Success', 'Period deleted.');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete period.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader
          title="Manage Periods"
          subtitle="Configure school daily schedule period slots"
        />
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-body-bold text-slate-800">
            Periods ({periods.length})
          </Text>
          <TouchableOpacity
            className="bg-primary-500 px-3 py-2 rounded-xl"
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-xs font-body-bold text-white">+ Add Period</Text>
          </TouchableOpacity>
        </View>

        {periods.length > 0 ? (
          periods.map((p) => (
            <ListItemCard
              key={p.id}
              title={`Period ${p.periodNo}${p.label ? `: ${p.label}` : ''}`}
              subtitle={`${p.startTime.slice(0, 5)} - ${p.endTime.slice(0, 5)}`}
              badge={p.isTeaching ? 'Teaching' : 'Break'}
              badgeColor={p.isTeaching ? 'mint' : 'secondary'}
              onPress={() => handleDelete(p.id)}
            />
          ))
        ) : (
          <EmptyState
            title="No Periods Configured"
            message="Click '+ Add Period' to define daily school slots."
          />
        )}
      </ScrollView>

      {/* Add Period Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white p-6 rounded-t-3xl border-t border-primary-100">
            <Text className="text-lg font-body-bold text-slate-800 mb-4">Add Period Slot</Text>

            <FormField
              label="Period Number *"
              value={periodNo}
              onChangeText={setPeriodNo}
              placeholder="e.g. 1"
              keyboardType="numeric"
            />

            <View className="flex-row gap-2">
              <View className="flex-1">
                <FormField
                  label="Start Time (HH:MM) *"
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="End Time (HH:MM) *"
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="09:45"
                />
              </View>
            </View>

            <FormField
              label="Label (Optional)"
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Lunch Break, Assembly"
            />

            <TouchableOpacity
              className="flex-row items-center mb-6"
              onPress={() => setIsTeaching(!isTeaching)}
            >
              <View
                className={`w-5 h-5 rounded border mr-2 items-center justify-center ${
                  isTeaching ? 'bg-primary-500 border-primary-500' : 'border-slate-300'
                }`}
              >
                {isTeaching ? <Text className="text-white text-xs font-body-bold">✓</Text> : null}
              </View>
              <Text className="text-sm font-body text-slate-700">Teaching Slot (Untick for Break/Lunch)</Text>
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <PrimaryButton
                  label="Cancel"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                />
              </View>
              <View className="flex-1">
                <PrimaryButton
                  label="Save Period"
                  onPress={handleCreate}
                  isLoading={saving}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}