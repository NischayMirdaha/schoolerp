import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActiveChild } from '../../context/ActiveChildContext';
import ScreenHeader from '../../components/ScreenHeader';
import ChildSelectorHeader from '../../components/ChildSelectorHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { transportService } from '../../services/transportService';
import { StudentTransportTrackingResponse } from '../../types/transport';

export default function ParentTransportScreen() {
  const { activeChild } = useActiveChild();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingData, setTrackingData] = useState<StudentTransportTrackingResponse | null>(null);

  const fetchTracking = useCallback(async () => {
    if (!activeChild) return;
    try {
      const res = await transportService.getStudentTransportTracking(activeChild.studentId);
      setTrackingData(res);
    } catch {
      setTrackingData(null);
    }
  }, [activeChild]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchTracking();
      setLoading(false);
    })();
  }, [fetchTracking]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTracking();
    setRefreshing(false);
  };

  const handleCallDriver = (phone?: string | null) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Transport Status" subtitle="Assigned route and trip checkpoint tracking" />
        <ChildSelectorHeader />
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <LoadingSpinner />
        ) : !activeChild ? (
          <EmptyState title="No Child Selected" message="Please select a child to view transport status." />
        ) : !trackingData || trackingData.routeId === 0 ? (
          <View className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-4 items-center py-8">
            <Ionicons name="bus-outline" size={48} color="#94a3b8" />
            <Text className="text-base font-body-bold text-slate-800 mt-3 mb-1">
              No Bus Route Assigned
            </Text>
            <Text className="text-sm font-body text-slate-500 text-center px-4">
              {activeChild.firstName} is currently not assigned to an active school bus route.
            </Text>
          </View>
        ) : (
          <>
            {/* Bus & Driver Card */}
            <View className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-body-bold text-slate-900">
                  {trackingData.routeName}
                </Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    trackingData.tripStatus === 'in_progress' ? 'bg-amber-100' : 'bg-emerald-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-body-bold uppercase ${
                      trackingData.tripStatus === 'in_progress' ? 'text-amber-800' : 'text-emerald-800'
                    }`}
                  >
                    {trackingData.tripStatus === 'in_progress' ? 'Bus On Route' : 'Scheduled'}
                  </Text>
                </View>
              </View>

              {/* Vehicle info */}
              <View className="flex-row items-center mb-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <Ionicons name="bus" size={24} color="#0ea5e9" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-body-bold text-slate-800">
                    {trackingData.busName || 'School Bus'}
                  </Text>
                  <Text className="text-xs font-body text-slate-500">
                    Plate: {trackingData.plateNumber || 'N/A'} • Stop: {trackingData.assignedCheckpointName || 'General Stop'}
                  </Text>
                </View>
              </View>

              {/* Driver info & call */}
              {trackingData.driverName ? (
                <View className="flex-row items-center justify-between bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100">
                  <View className="flex-row items-center">
                    <Ionicons name="person-circle-outline" size={26} color="#0284c7" />
                    <View className="ml-2.5">
                      <Text className="text-xs font-body text-slate-500">Driver</Text>
                      <Text className="text-sm font-body-bold text-slate-800">{trackingData.driverName}</Text>
                    </View>
                  </View>
                  {trackingData.driverPhone ? (
                    <TouchableOpacity
                      onPress={() => handleCallDriver(trackingData.driverPhone)}
                      className="bg-sky-600 px-4 py-2 rounded-xl flex-row items-center"
                    >
                      <Ionicons name="call" size={14} color="#ffffff" />
                      <Text className="text-white font-body-bold text-xs ml-1.5">Call Driver</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Checkpoint Timeline */}
            <View className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6">
              <Text className="text-base font-body-bold text-slate-900 mb-4">Route Checkpoints</Text>

              {trackingData.checkpoints.length === 0 ? (
                <Text className="text-sm font-body text-slate-500">No checkpoints configured for this route.</Text>
              ) : (
                trackingData.checkpoints.map((cp, idx) => (
                  <View key={cp.checkpointId} className="flex-row items-start mb-4">
                    {/* Circle Indicator */}
                    <View className="items-center mr-3 mt-0.5">
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
                          cp.isReached
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-slate-100 border-slate-300'
                        }`}
                      >
                        {cp.isReached ? (
                          <Ionicons name="checkmark" size={14} color="#ffffff" />
                        ) : (
                          <Text className="text-xs font-body-bold text-slate-500">{cp.orderNo}</Text>
                        )}
                      </View>
                      {idx < trackingData.checkpoints.length - 1 ? (
                        <View
                          className={`w-0.5 h-8 mt-1 ${cp.isReached ? 'bg-emerald-400' : 'bg-slate-200'}`}
                        />
                      ) : null}
                    </View>

                    {/* Content */}
                    <View className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-body-bold text-slate-800">{cp.checkpointName}</Text>
                        {cp.isReached ? (
                          <Text className="text-xs font-body-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Reached {cp.reachedAt ? new Date(cp.reachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Text>
                        ) : (
                          <Text className="text-xs font-body text-slate-400">Pending</Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}