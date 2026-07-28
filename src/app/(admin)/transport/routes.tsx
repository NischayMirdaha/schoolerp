import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transportService } from '../../../services/transportService';
import { RouteResponse, TripResponse, VehicleResponse } from '../../../types/transport';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

/**
 * Transport routes, checkpoints, and manual trip tracking (§13.3 / §13.5).
 *
 * Adds the pieces the backend already supported but the UI never exposed:
 *  - Create route              → POST /api/routes
 *  - Add checkpoint            → POST /api/routes/{id}/checkpoints
 *  - "Reached" per checkpoint  → POST /api/trips/{id}/checkpoints   (§13.5 step 2)
 *  - Send route alert          → POST /api/transport/alerts         (§13.6)
 *  - Active-trip recovery      → GET  /api/trips?status=in_progress
 */
export default function TransportRoutesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [activeTrip, setActiveTrip] = useState<TripResponse | null>(null);
  const [busy, setBusy] = useState(false);

  // Create-route modal
  const [routeModal, setRouteModal] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeVehicleId, setRouteVehicleId] = useState<number | null>(null);

  // Add-checkpoint modal
  const [cpModal, setCpModal] = useState<{ route: RouteResponse } | null>(null);
  const [cpName, setCpName] = useState('');

  // Add-vehicle modal
  const [vehicleModal, setVehicleModal] = useState(false);
  const [busName, setBusName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [capacity, setCapacity] = useState('');

  // Alert modal
  const [alertModal, setAlertModal] = useState<{ route: RouteResponse } | null>(null);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'info' | 'warning' | 'critical'>('info');

  const load = useCallback(async () => {
    try {
      // Settled individually so one failure doesn't blank the screen.
      const [routesRes, vehiclesRes, tripsRes] = await Promise.allSettled([
        transportService.listRoutes(),
        transportService.listVehicles(undefined, true),
        transportService.listTrips(undefined, 'in_progress'),
      ]);

      setRoutes(routesRes.status === 'fulfilled' ? routesRes.value.items : []);
      setVehicles(vehiclesRes.status === 'fulfilled' ? vehiclesRes.value.items : []);

      // Recover an in-progress trip rather than relying on component state.
      setActiveTrip(
        tripsRes.status === 'fulfilled' && tripsRes.value.items.length > 0
          ? tripsRes.value.items[0]
          : null
      );

      if (routesRes.status === 'rejected') {
        Alert.alert('Error', routesRes.reason?.message || 'Failed to load transport routes.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load transport data.');
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

  // ── Create route ─────────────────────────────────────────────────────────
  const handleCreateRoute = async () => {
    if (!routeName.trim()) {
      Alert.alert('Validation', 'Route name is required.');
      return;
    }
    try {
      setBusy(true);
      await transportService.createRoute(routeName.trim(), routeVehicleId);
      setRouteModal(false);
      setRouteName('');
      setRouteVehicleId(null);
      await load();
      Alert.alert('Success', 'Route created.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create route.');
    } finally {
      setBusy(false);
    }
  };

  // ── Create vehicle ───────────────────────────────────────────────────────
  const handleCreateVehicle = async () => {
    if (!busName.trim()) {
      Alert.alert('Validation', 'Bus name is required.');
      return;
    }
    try {
      setBusy(true);
      await transportService.createVehicle({
        busName: busName.trim(),
        plateNumber: plateNumber.trim() || undefined,
        capacity: capacity ? parseInt(capacity, 10) : undefined,
      });
      setVehicleModal(false);
      setBusName('');
      setPlateNumber('');
      setCapacity('');
      await load();
      Alert.alert('Success', 'Vehicle added successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add vehicle.');
    } finally {
      setBusy(false);
    }
  };

  // ── Add checkpoint ───────────────────────────────────────────────────────
  const handleAddCheckpoint = async () => {
    if (!cpModal) return;
    if (!cpName.trim()) {
      Alert.alert('Validation', 'Checkpoint name is required.');
      return;
    }
    try {
      setBusy(true);
      // OrderNo must be unique per route; append after the current highest.
      const nextOrder =
        cpModal.route.checkpoints.reduce((max, c) => Math.max(max, c.orderNo), 0) + 1;

      await transportService.addCheckpoint(cpModal.route.id, cpName.trim(), nextOrder);
      setCpModal(null);
      setCpName('');
      await load();
      Alert.alert('Success', 'Checkpoint added.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add checkpoint.');
    } finally {
      setBusy(false);
    }
  };

  // ── Trip controls ────────────────────────────────────────────────────────
  const handleStartTrip = async (routeId: number, tripType: 'morning_pickup' | 'afternoon_drop') => {
    try {
      setBusy(true);
      const trip = await transportService.startTrip(routeId, tripType);
      setActiveTrip(trip);
      Alert.alert(
        'Trip started',
        `${tripType === 'morning_pickup' ? 'Morning pickup' : 'Afternoon drop'} trip started. Parents have been notified.`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to start trip.');
    } finally {
      setBusy(false);
    }
  };

  /** §13.5 step 2 — mark a checkpoint reached; notifies parents on the route. */
  const handleReached = async (checkpointId: number, checkpointName: string) => {
    if (!activeTrip) return;
    try {
      setBusy(true);
      await transportService.logTripCheckpoint(activeTrip.id, checkpointId);

      // Re-fetch so the timestamp shown comes from the server, not the device clock.
      const refreshed = await transportService.listTrips(activeTrip.routeId, 'in_progress');
      setActiveTrip(refreshed.items.length > 0 ? refreshed.items[0] : activeTrip);

      Alert.alert('Checkpoint logged', `Bus marked as reached "${checkpointName}".`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to log checkpoint.');
    } finally {
      setBusy(false);
    }
  };

  const handleEndTrip = async () => {
    if (!activeTrip) return;
    Alert.alert('End trip?', 'This marks the trip as completed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Trip',
        style: 'destructive',
        onPress: async () => {
          try {
            setBusy(true);
            await transportService.endTrip(activeTrip.id);
            setActiveTrip(null);
            await load();
            Alert.alert('Success', 'Trip marked as completed.');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to end trip.');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  // ── Alerts ───────────────────────────────────────────────────────────────
  const handleSendAlert = async () => {
    if (!alertModal) return;
    if (!alertTitle.trim() || !alertMessage.trim()) {
      Alert.alert('Validation', 'Both a title and a message are required.');
      return;
    }
    try {
      setBusy(true);
      await transportService.sendAlert(
        alertModal.route.id, alertSeverity, alertTitle.trim(), alertMessage.trim()
      );
      setAlertModal(null);
      setAlertTitle('');
      setAlertMessage('');
      setAlertSeverity('info');
      Alert.alert('Sent', 'Alert delivered to parents on this route.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send alert.');
    } finally {
      setBusy(false);
    }
  };

  const activeRoute = activeTrip ? routes.find((r) => r.id === activeTrip.routeId) : undefined;
  const reachedIds = new Set(activeTrip?.checkpointLogs.map((l) => l.checkpointId) ?? []);

  if (loading) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Transport Routes & Trips"
          subtitle="Bus routes, stops, and trip controls"
          rightAction={
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                className="px-3 py-2 bg-emerald-600 rounded-xl flex-row items-center"
                onPress={() => setVehicleModal(true)}
                accessibilityLabel="Add Vehicle"
              >
                <Ionicons name="bus-outline" size={16} color="#ffffff" />
                <Text className="text-white font-body-bold text-xs ml-1">+ Vehicle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-9 h-9 bg-primary-500 rounded-full items-center justify-center"
                onPress={() => setRouteModal(true)}
                accessibilityLabel="Create route"
              >
                <Ionicons name="add" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0284c7" />}
      >
        {/* Active trip panel with per-checkpoint "Reached" buttons */}
        {activeTrip ? (
          <View className="mb-4 bg-mint-50 p-4 rounded-2xl border border-mint-200">
            <Text className="text-xs font-body-bold text-mint-600 uppercase">Trip in progress</Text>
            <Text className="text-base font-body-bold text-slate-800 mt-1">{activeTrip.routeName}</Text>
            <Text className="text-xs font-body text-slate-600">
              {activeTrip.tripType === 'morning_pickup' ? 'Morning Pickup' : 'Afternoon Drop'} · started{' '}
              {new Date(activeTrip.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            <Text className="text-xs font-body-bold text-slate-700 mt-3 mb-1.5">Checkpoints</Text>

            {activeRoute && activeRoute.checkpoints.length > 0 ? (
              [...activeRoute.checkpoints]
                .sort((a, b) => a.orderNo - b.orderNo)
                .map((cp) => {
                  const log = activeTrip.checkpointLogs.find((l) => l.checkpointId === cp.id);
                  const done = reachedIds.has(cp.id);
                  return (
                    <View
                      key={cp.id}
                      className="flex-row items-center justify-between bg-white rounded-xl px-3 py-2.5 mb-1.5 border border-mint-100"
                    >
                      <View className="flex-1 pr-2">
                        <Text className="text-sm font-body-semibold text-slate-800">
                          {cp.orderNo}. {cp.name}
                        </Text>
                        {done && log ? (
                          <Text className="text-[11px] font-body text-mint-600 mt-0.5">
                            Reached at{' '}
                            {new Date(log.reachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        ) : null}
                      </View>

                      {done ? (
                        <View className="flex-row items-center">
                          <Ionicons name="checkmark-circle" size={20} color="#059669" />
                        </View>
                      ) : (
                        <TouchableOpacity
                          className="bg-mint-500 px-3 py-1.5 rounded-lg active:bg-mint-600"
                          disabled={busy}
                          onPress={() => handleReached(cp.id, cp.name)}
                        >
                          <Text className="text-xs font-body-bold text-white">Reached</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
            ) : (
              <Text className="text-xs font-body text-slate-500">
                This route has no checkpoints yet.
              </Text>
            )}

            <View className="mt-3">
              <PrimaryButton label="End Active Trip" variant="coral" onPress={handleEndTrip} disabled={busy} />
            </View>
          </View>
        ) : null}

        {/* Routes */}
        {routes.length > 0 ? (
          routes.map((r) => (
            <View key={r.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-body-bold text-slate-800">{r.name}</Text>
                  <Text className="text-xs font-body text-slate-500 mt-0.5">
                    Bus: {r.vehicleName || 'Unassigned'} ({r.vehiclePlateNumber || 'N/A'})
                  </Text>
                </View>
                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-secondary-100 items-center justify-center"
                  onPress={() => setAlertModal({ route: r })}
                  accessibilityLabel="Send alert"
                >
                  <Ionicons name="megaphone-outline" size={15} color="#d97706" />
                </TouchableOpacity>
              </View>

              <Text className="text-xs font-body-semibold text-primary-600 mt-2">
                Stops ({r.checkpoints.length}):{' '}
                {[...r.checkpoints].sort((a, b) => a.orderNo - b.orderNo).map((c) => c.name).join(' → ') ||
                  'No checkpoints'}
              </Text>

              <TouchableOpacity
                className="mt-2 flex-row items-center"
                onPress={() => setCpModal({ route: r })}
              >
                <Ionicons name="add-circle-outline" size={15} color="#0284c7" />
                <Text className="text-xs font-body-bold text-primary-600 ml-1">Add checkpoint</Text>
              </TouchableOpacity>

              {!activeTrip ? (
                <View className="flex-row gap-2 mt-3 pt-3 border-t border-slate-100">
                  <TouchableOpacity
                    className="flex-1 bg-primary-500 py-2 rounded-xl items-center"
                    disabled={busy}
                    onPress={() => handleStartTrip(r.id, 'morning_pickup')}
                  >
                    <Text className="text-xs font-body-bold text-white">Start Pickup</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-primary-600 py-2 rounded-xl items-center"
                    disabled={busy}
                    onPress={() => handleStartTrip(r.id, 'afternoon_drop')}
                  >
                    <Text className="text-xs font-body-bold text-white">Start Drop</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState
            icon="bus-outline"
            title="No Routes Found"
            message="Tap + above to create your first transport route."
          />
        )}

        <View className="h-8" />
      </ScrollView>

      {/* ── Create route modal ── */}
      <Modal visible={routeModal} transparent animationType="slide" onRequestClose={() => setRouteModal(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setRouteModal(false)}>
          <Pressable className="bg-white rounded-t-3xl px-5 pt-5 pb-10" onPress={(e) => e.stopPropagation()}>
            <Text className="text-lg font-heading text-slate-800 mb-4">New Route</Text>

            <FormField
              label="Route Name"
              icon="git-branch-outline"
              placeholder="e.g. Route 1 – Hetauda East"
              value={routeName}
              onChangeText={setRouteName}
            />

            <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">Assign Bus (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <TouchableOpacity
                className={`px-3 py-2 rounded-xl mr-2 border ${
                  routeVehicleId === null ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                }`}
                onPress={() => setRouteVehicleId(null)}
              >
                <Text className={`text-xs font-body-bold ${routeVehicleId === null ? 'text-white' : 'text-slate-700'}`}>
                  None
                </Text>
              </TouchableOpacity>

              {vehicles.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  className={`px-3 py-2 rounded-xl mr-2 border ${
                    routeVehicleId === v.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                  }`}
                  onPress={() => setRouteVehicleId(v.id)}
                >
                  <Text className={`text-xs font-body-bold ${routeVehicleId === v.id ? 'text-white' : 'text-slate-700'}`}>
                    {v.busName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <PrimaryButton label="Create Route" onPress={handleCreateRoute} isLoading={busy} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Add checkpoint modal ── */}
      <Modal visible={!!cpModal} transparent animationType="slide" onRequestClose={() => setCpModal(null)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setCpModal(null)}>
          <Pressable className="bg-white rounded-t-3xl px-5 pt-5 pb-10" onPress={(e) => e.stopPropagation()}>
            <Text className="text-lg font-heading text-slate-800 mb-1">Add Checkpoint</Text>
            <Text className="text-xs font-body text-slate-500 mb-4">{cpModal?.route.name}</Text>

            <FormField
              label="Checkpoint Name"
              icon="location-outline"
              placeholder="e.g. Main Chowk"
              value={cpName}
              onChangeText={setCpName}
            />

            <Text className="text-xs font-body text-slate-500 mb-4">
              Added as stop #{(cpModal?.route.checkpoints.reduce((m, c) => Math.max(m, c.orderNo), 0) ?? 0) + 1} on this route.
            </Text>

            <PrimaryButton label="Add Checkpoint" onPress={handleAddCheckpoint} isLoading={busy} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Send alert modal ── */}
      <Modal visible={!!alertModal} transparent animationType="slide" onRequestClose={() => setAlertModal(null)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setAlertModal(null)}>
          <Pressable className="bg-white rounded-t-3xl px-5 pt-5 pb-10" onPress={(e) => e.stopPropagation()}>
            <Text className="text-lg font-heading text-slate-800 mb-1">Send Route Alert</Text>
            <Text className="text-xs font-body text-slate-500 mb-4">{alertModal?.route.name}</Text>

            <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">Severity</Text>
            <View className="flex-row mb-4">
              {(['info', 'warning', 'critical'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  className={`px-3 py-2 rounded-xl mr-2 border ${
                    alertSeverity === s ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
                  }`}
                  onPress={() => setAlertSeverity(s)}
                >
                  <Text className={`text-xs font-body-bold ${alertSeverity === s ? 'text-white' : 'text-slate-700'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <FormField
              label="Title"
              icon="alert-circle-outline"
              placeholder="e.g. Bus delayed"
              value={alertTitle}
              onChangeText={setAlertTitle}
            />

            <FormField
              label="Message"
              icon="chatbox-outline"
              placeholder="e.g. Bus 3 delayed by 15 minutes due to traffic."
              value={alertMessage}
              onChangeText={setAlertMessage}
              multiline
            />

            <PrimaryButton label="Send Alert" onPress={handleSendAlert} isLoading={busy} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Add vehicle modal ── */}
      <Modal visible={vehicleModal} transparent animationType="slide" onRequestClose={() => setVehicleModal(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setVehicleModal(false)}>
          <Pressable className="bg-white rounded-t-3xl px-5 pt-5 pb-10" onPress={(e) => e.stopPropagation()}>
            <Text className="text-lg font-heading text-slate-800 mb-1">Add Vehicle</Text>
            <Text className="text-xs font-body text-slate-500 mb-4">Register a new bus or transport vehicle</Text>

            <FormField
              label="Bus Name / Number"
              icon="bus-outline"
              placeholder="e.g. Bus 1 (North Route)"
              value={busName}
              onChangeText={setBusName}
            />

            <FormField
              label="Plate Number"
              icon="card-outline"
              placeholder="e.g. BA 2 PA 1234"
              value={plateNumber}
              onChangeText={setPlateNumber}
            />

            <FormField
              label="Seating Capacity"
              icon="people-outline"
              placeholder="e.g. 40"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />

            <PrimaryButton label="Add Vehicle" onPress={handleCreateVehicle} isLoading={busy} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}