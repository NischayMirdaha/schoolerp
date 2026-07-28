import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { feeService } from '../../../services/feeService';
import { FeeHeadResponseDto } from '../../../types/fee';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ListItemCard from '../../../components/ListItemCard';
import EmptyState from '../../../components/EmptyState';

export default function FeeHeadsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feeHeads, setFeeHeads] = useState<FeeHeadResponseDto[]>([]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchFeeHeads();
  }, []);

  const fetchFeeHeads = async () => {
    try {
      setLoading(true);
      const data = await feeService.listFeeHeads();
      setFeeHeads(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load fee heads.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Fee head name is required.');
      return;
    }

    try {
      setSaving(true);
      await feeService.createFeeHead({
        name: name.trim(),
        cycle,
      });

      setModalVisible(false);
      setName('');
      fetchFeeHeads();
      Alert.alert('Success', 'Fee head created successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create fee head.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Fee Heads" subtitle="Configure tuition, transport, and facility heads" />
      </View>

      <View className="flex-row justify-between items-center px-4 mb-3">
        <Text className="text-base font-body-bold text-slate-800">Fee Heads ({feeHeads.length})</Text>
        <TouchableOpacity
          className="bg-primary-500 px-3 py-2 rounded-xl"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-xs font-body-bold text-white">+ Create Head</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {feeHeads.length > 0 ? (
          feeHeads.map((h) => (
            <ListItemCard
              key={h.id}
              title={h.name}
              subtitle={`Billing Cycle: ${h.cycle.toUpperCase()}`}
              badge={h.isActive ? 'Active' : 'Inactive'}
              badgeColor={h.isActive ? 'mint' : 'coral'}
            />
          ))
        ) : (
          <EmptyState icon="wallet-outline" title="No Fee Heads" message="Click '+ Create Head' to define fee heads." />
        )}
      </ScrollView>

      {/* Modal Form */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white p-6 rounded-t-3xl border-t border-primary-100">
            <Text className="text-lg font-body-bold text-slate-800 mb-4">Create Fee Head</Text>

            <FormField
              label="Fee Head Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Tuition Fee, Transport Fee"
            />

            <Text className="text-xs font-body-semibold text-slate-600 mb-2">Cycle *</Text>
            <View className="flex-row gap-2 mb-6">
              <TouchableOpacity
                className={`flex-1 py-2.5 items-center rounded-xl border ${
                  cycle === 'monthly' ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                }`}
                onPress={() => setCycle('monthly')}
              >
                <Text className={`text-xs font-body-bold ${cycle === 'monthly' ? 'text-white' : 'text-slate-700'}`}>
                  Monthly
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-2.5 items-center rounded-xl border ${
                  cycle === 'yearly' ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                }`}
                onPress={() => setCycle('yearly')}
              >
                <Text className={`text-xs font-body-bold ${cycle === 'yearly' ? 'text-white' : 'text-slate-700'}`}>
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <PrimaryButton label="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
              </View>
              <View className="flex-1">
                <PrimaryButton label="Save Head" onPress={handleCreate} isLoading={saving} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}