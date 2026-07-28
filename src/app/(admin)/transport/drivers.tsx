import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transportService } from '../../../services/transportService';
import { DriverResponse, VehicleResponse } from '../../../types/transport';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

/**
 * FIX (#12): Drivers & vehicles admin — create/edit drivers, edit vehicles
 * (incl. driver assignment), and activate/deactivate both. Previously only
 * a read-only vehicle list existed.
 */
export default function DriversVehiclesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);

  // Driver modal — editingDriver == null ⇒ "create" mode
  const [driverModal, setDriverModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverResponse | null>(null);
  const [dName, setDName] = useState('');
  const [dPhone, setDPhone] = useState('');
  const [dAddress, setDAddress] = useState('');
  const [dLicense, setDLicense] = useState('');

  // Vehicle modal (edit only — add already exists on the Routes screen)
  const [vehicleModal, setVehicleModal] = useState<{ vehicle: VehicleResponse } | null>(null);
  const [vBusName, setVBusName] = useState('');
  const [vPlate, setVPlate] = useState('');
  const [vCapacity, setVCapacity] = useState('');
  const [vDriverId, setVDriverId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.allSettled([
        transportService.listDrivers(),
        transportService.listVehicles(),
      ]);
      setDrivers(driversRes.status === 'fulfilled' ? driversRes.value.items : []);
      setVehicles(vehiclesRes.status === 'fulfilled' ? vehiclesRes.value.items : []);
      if (driversRes.status === 'rejected') {
        Alert.alert('Error', driversRes.reason?.message || 'Failed to load drivers.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load data.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // ── Driver create/edit ───────────────────────────────────────────────────
  const openDriverCreate = () => {
    setEditingDriver(null);
    setDName('');
    setDPhone('');
    setDAddress('');
    setDLicense('');
    setDriverModal(true);
  };

  const openDriverEdit = (d: DriverResponse) => {
    setEditingDriver(d);
    setDName(d.name);
    setDPhone(d.phone);
    setDAddress(d.address ?? '');
    setDLicense(d.licenseNumber ?? '');
    setDriverModal(true);
  };

  const handleSaveDriver = async () => {
    if (!dName.trim() || !dPhone.trim()) {
      Alert.alert('Validation', 'Driver name and phone are required.');
      return;
    }
    try {
      setBusy(true);
      if (editingDriver) {
        await transportService.updateDriver(editingDriver.id, {
          name: dName.trim(),
          phone: dPhone.trim(),
          address: dAddress.trim() || null,
          licenseNumber: dLicense.trim() || null,
        });
      } else {
        await transportService.createDriver({
          name: dName.trim(),
          phone: dPhone.trim(),
          address: dAddress.trim() || null,
          licenseNumber: dLicense.trim() || null,
        });
      }
      setDriverModal(false);
      await load();
      Alert.alert('Success', editingDriver ? 'Driver updated.' : 'Driver added.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save driver.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleDriver = (d: DriverResponse) => {
    const target = !d.isActive;
    Alert.alert(target ? 'Activate Driver' : 'Deactivate Driver', `${d.name} will be marked ${target ? 'active' : 'inactive'}.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: target ? 'default' : 'destructive',
        onPress: async () => {
          try {
            await transportService.setDriverActive(d.id, target);
            await load();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update driver status.');
          }
        },
      },
    ]);
  };

  // ── Vehicle edit / toggle ────────────────────────────────────────────────
  const openVehicleEdit = (v: VehicleResponse) => {
    setVBusName(v.busName);
    setVPlate(v.plateNumber ?? '');
    setVCapacity(v.capacity != null ? String(v.capacity) : '');
    setVDriverId(v.driverId ?? null);
    setVehicleModal({ vehicle: v });
  };

  const handleSaveVehicle = async () => {
    if (!vehicleModal) return;
    if (!vBusName.trim()) {
      Alert.alert('Validation', 'Bus name is required.');
      return;
    }
    try {
      setBusy(true);
      await transportService.updateVehicle(vehicleModal.vehicle.id, {
        busName: vBusName.trim(),
        plateNumber: vPlate.trim() || null,
        capacity: vCapacity ? parseInt(vCapacity, 10) : null,
        driverId: vDriverId,
      });
      setVehicleModal(null);
      await load();
      Alert.alert('Success', 'Vehicle updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update vehicle.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleVehicle = (v: VehicleResponse) => {
    const target = !v.isActive;
    Alert.alert(target ? 'Activate Vehicle' : 'Deactivate Vehicle', `${v.busName} will be marked ${target ? 'active' : 'inactive'}.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: target ? 'default' : 'destructive',
        onPress: async () => {
          try {
            await transportService.setVehicleActive(v.id, target);
            await load();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update vehicle status.');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader title="Drivers & Vehicles" subtitle="Fleet and driver management" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Vehicles ── */}
        <Text className="text-base font-body-bold text-slate-800 mb-2">Vehicles ({vehicles.length})</Text>
        {vehicles.length > 0 ? (
          vehicles.map((v) => (
            <View key={v.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-body-bold text-slate-800">{v.busName}</Text>
                  <Text className="text-xs font-body text-slate-500 mt-0.5">
                    Plate: {v.plateNumber || 'N/A'} | Capacity: {v.capacity ?? 'N/A'} | Driver: {v.driverName || 'Unassigned'}
                  </Text>
                </View>
                <View className={`px-2.5 py-0.5 rounded-full ${v.isActive ? 'bg-mint-100' : 'bg-slate-200'}`}>
                  <Text className={`text-xs font-body-bold ${v.isActive ? 'text-mint-700' : 'text-slate-600'}`}>
                    {v.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2 mt-3 pt-2 border-t border-slate-100">
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-2 rounded-xl bg-primary-50 border border-primary-100"
                  onPress={() => openVehicleEdit(v)}
                >
                  <Ionicons name="create-outline" size={14} color="#0284c7" />
                  <Text className="text-xs font-body-bold text-primary-600 ml-1">Edit / Assign Driver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-2 rounded-xl bg-white border border-slate-200"
                  onPress={() => handleToggleVehicle(v)}
                >
                  <Ionicons name={v.isActive ? 'pause-circle-outline' : 'play-circle-outline'} size={14} color={v.isActive ? '#e11d48' : '#059669'} />
                  <Text className={`text-xs font-body-bold ml-1 ${v.isActive ? 'text-coral-600' : 'text-mint-600'}`}>
                    {v.isActive ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon="bus-outline" title="No Vehicles" message="Add vehicles from the Routes screen (+ Vehicle), then manage them here." />
        )}

        {/* ── Drivers ── */}
        <View className="flex-row justify-between items-center mt-4 mb-2">
          <Text className="text-base font-body-bold text-slate-800">Drivers ({drivers.length})</Text>
          <TouchableOpacity className="bg-primary-500 px-3 py-2 rounded-xl" onPress={openDriverCreate}>
            <Text className="text-xs font-body-bold text-white">+ Add Driver</Text>
          </TouchableOpacity>
        </View>

        {drivers.length > 0 ? (
          drivers.map((d) => (
            <View key={d.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-body-bold text-slate-800">{d.name}</Text>
                  <Text className="text-xs font-body text-slate-500 mt-0.5">
                    {d.phone}{d.licenseNumber ? ` | Lic: ${d.licenseNumber}` : ''}
                    {d.address ? `\n${d.address}` : ''}
                  </Text>
                </View>
                <View className={`px-2.5 py-0.5 rounded-full ${d.isActive ? 'bg-mint-100' : 'bg-slate-200'}`}>
                  <Text className={`text-xs font-body-bold ${d.isActive ? 'text-mint-700' : 'text-slate-600'}`}>
                    {d.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2 mt-3 pt-2 border-t border-slate-100">
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-2 rounded-xl bg-primary-50 border border-primary-100"
                  onPress={() => openDriverEdit(d)}
                >
                  <Ionicons name="create-outline" size={14} color="#0284c7" />
                  <Text className="text-xs font-body-bold text-primary-600 ml-1">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-2 rounded-xl bg-white border border-slate-200"
                  onPress={() => handleToggleDriver(d)}
                >
                  <Ionicons name={d.isActive ? 'pause-circle-outline' : 'play-circle-outline'} size={14} color={d.isActive ? '#e11d48' : '#059669'} />
                  <Text className={`text-xs font-body-bold ml-1 ${d.isActive ? 'text-coral-600' : 'text-mint-600'}`}>
                    {d.isActive ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon="id-card-outline" title="No Drivers" message='Tap "+ Add Driver" to register your first driver.' />
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Driver modal */}
      <Modal visible={driverModal} transparent animationType="slide" onRequestClose={() => setDriverModal(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setDriverModal(false)}>
          <Pressable className="bg-white rounded-t-3xl px-5 pt-5 pb-10" onPress={(e) => e.stopPropagation()}>
            <Text className="text-lg font-heading text-slate-800 mb-4">
              {editingDriver ? 'Edit Driver' : 'Add Driver'}
            </Text>

            <FormField label="Full Name *" icon="person-outline" placeholder="e.g. Ram Bahadur" value={dName} onChangeText={setDName} />
            <FormField label="Phone *" icon="call-outline" placeholder="98XXXXXXXX" value={dPhone} onChangeText={setDPhone} keyboardType="phone-pad" />
            <FormField label="License Number" icon="card-outline" placeholder="Optional" value={dLicense} onChangeText={setDLicense} />
            <FormField label="Address" icon="location-outline" placeholder="Optional" value={dAddress} onChangeText={setDAddress} />

            <PrimaryButton
              label={editingDriver ? 'Save Changes' : 'Add Driver'}
              onPress={handleSaveDriver}
              isLoading={busy}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Vehicle edit modal */}
      <Modal visible={!!vehicleModal} transparent animationType="slide" onRequestClose={() => setVehicleModal(null)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setVehicleModal(null)}>
          <Pressable className="bg-white rounded-t-3xl px-5 pt-5 pb-10 max-h-[90%]" onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-lg font-heading text-slate-800 mb-4">Edit Vehicle</Text>

              <FormField label="Bus Name *" icon="bus-outline" value={vBusName} onChangeText={setVBusName} />
              <FormField label="Plate Number" icon="card-outline" value={vPlate} onChangeText={setVPlate} />
              <FormField label="Seating Capacity" icon="people-outline" value={vCapacity} onChangeText={setVCapacity} keyboardType="numeric" />

              <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">Assigned Driver</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <TouchableOpacity
                  className={`px-3 py-2 rounded-xl mr-2 border ${vDriverId === null ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'}`}
                  onPress={() => setVDriverId(null)}
                >
                  <Text className={`text-xs font-body-bold ${vDriverId === null ? 'text-white' : 'text-slate-700'}`}>None</Text>
                </TouchableOpacity>
                {drivers.filter((d) => d.isActive).map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    className={`px-3 py-2 rounded-xl mr-2 border ${vDriverId === d.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'}`}
                    onPress={() => setVDriverId(d.id)}
                  >
                    <Text className={`text-xs font-body-bold ${vDriverId === d.id ? 'text-white' : 'text-slate-700'}`}>{d.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <PrimaryButton label="Save Vehicle" onPress={handleSaveVehicle} isLoading={busy} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}