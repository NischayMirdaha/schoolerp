import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transportService } from '../../../services/transportService';
import { StudentAdminService } from '../../../services/studentAdminService';
import {
  RouteResponse,
  TransportDirection,
  StudentTransportAssignmentResponse,
} from '../../../types/transport';
import { StudentResponse } from '../../../types/student';
import { parseErrorMessage } from '../../../services/api';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';

/**
 * FIX (#12): Student transport assignment — POST /api/transport/assignments.
 * Direction must be 'pickup' | 'drop' | 'both' (BE validator).
 */
export default function TransportAssignmentsScreen() {
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [routes, setRoutes] = useState<RouteResponse[]>([]);

  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);

  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(null);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<number | null>(null);
  const [direction, setDirection] = useState<TransportDirection>('both');

  const [result, setResult] = useState<StudentTransportAssignmentResponse | null>(null);

  const loadRoutes = useCallback(async () => {
    try {
      const res = await transportService.listRoutes(undefined, true);
      setRoutes(res.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load routes.');
    } finally {
      setLoadingRoutes(false);
    }
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const searchStudents = async () => {
    try {
      const res = await StudentAdminService.listStudents({ searchTerm: studentSearch.trim() || undefined }, 1, 10);
      setStudents(res.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to search students.');
    }
  };

  const handleAssign = async () => {
    if (!selectedStudent || !selectedRoute) {
      Alert.alert('Validation', 'Select both a student and a route.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await transportService.assignStudent({
        studentId: selectedStudent.studentId,
        routeId: selectedRoute.id,
        checkpointId: selectedCheckpointId,
        direction,
      });
      setResult(res);
      setSelectedStudent(null);
      setStudentSearch('');
      setStudents([]);
      Alert.alert('Assigned', `${res.studentName} assigned to ${res.routeName} (${res.direction}).`);
    } catch (err: any) {
      // BE returns 409 Conflict when the student already has this direction assigned
      Alert.alert('Assignment Failed', parseErrorMessage(err?.response ?? err, err.message || 'Failed to assign transport.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRoutes) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader title="Assign Student Transport" subtitle="Link students to routes & stops" />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* 1. Route */}
        <Text className="text-xs font-body-semibold text-slate-600 mb-2">1. Select Route</Text>
        {routes.length > 0 ? (
          routes.map((r) => {
            const active = selectedRoute?.id === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                className={`p-3 rounded-2xl mb-2 border ${active ? 'bg-primary-50 border-primary-400' : 'bg-white border-primary-100'}`}
                onPress={() => {
                  setSelectedRoute(r);
                  setSelectedCheckpointId(null);
                }}
              >
                <Text className="text-sm font-body-bold text-slate-800">{r.name}</Text>
                <Text className="text-xs font-body text-slate-500">
                  Bus: {r.vehicleName || 'Unassigned'} | Stops: {r.checkpoints.length}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text className="text-xs font-body text-slate-500 mb-3">
            No active routes. Create one on the Routes screen first.
          </Text>
        )}

        {/* 2. Checkpoint (optional) */}
        {selectedRoute ? (
          <>
            <Text className="text-xs font-body-semibold text-slate-600 mt-2 mb-2">2. Select Stop (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              <TouchableOpacity
                className={`px-3 py-2 rounded-xl mr-2 border ${selectedCheckpointId === null ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'}`}
                onPress={() => setSelectedCheckpointId(null)}
              >
                <Text className={`text-xs font-body-bold ${selectedCheckpointId === null ? 'text-white' : 'text-slate-700'}`}>No specific stop</Text>
              </TouchableOpacity>
              {[...selectedRoute.checkpoints].sort((a, b) => a.orderNo - b.orderNo).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  className={`px-3 py-2 rounded-xl mr-2 border ${selectedCheckpointId === c.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'}`}
                  onPress={() => setSelectedCheckpointId(c.id)}
                >
                  <Text className={`text-xs font-body-bold ${selectedCheckpointId === c.id ? 'text-white' : 'text-slate-700'}`}>
                    #{c.orderNo} {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* 3. Direction */}
        <Text className="text-xs font-body-semibold text-slate-600 mt-2 mb-2">3. Direction</Text>
        <View className="flex-row mb-2">
          {(['pickup', 'drop', 'both'] as TransportDirection[]).map((d) => (
            <TouchableOpacity
              key={d}
              className={`px-3 py-2 rounded-xl mr-2 border ${direction === d ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'}`}
              onPress={() => setDirection(d)}
            >
              <Text className={`text-xs font-body-bold ${direction === d ? 'text-white' : 'text-slate-700'}`}>
                {d === 'pickup' ? 'Pickup (morning)' : d === 'drop' ? 'Drop (afternoon)' : 'Both'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. Student */}
        <Text className="text-xs font-body-semibold text-slate-600 mt-2 mb-2">4. Select Student</Text>
        <FormField
          label="Search Student"
          icon="search-outline"
          placeholder="Name or admission no"
          value={studentSearch}
          onChangeText={(t) => {
            setStudentSearch(t);
            setSelectedStudent(null);
          }}
          onSubmitEditing={searchStudents}
          returnKeyType="search"
        />
        {selectedStudent ? (
          <View className="bg-mint-50 border border-mint-200 rounded-xl p-3 mb-3 flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text className="text-sm font-body-bold text-mint-700 ml-2">
              {selectedStudent.firstName} {selectedStudent.lastName ?? ''} (Adm: {selectedStudent.admissionNo})
            </Text>
          </View>
        ) : students.length > 0 ? (
          students.slice(0, 6).map((s) => (
            <TouchableOpacity
              key={s.studentId}
              className="bg-white border border-primary-100 rounded-xl px-3 py-2.5 mb-2"
              onPress={() => setSelectedStudent(s)}
            >
              <Text className="text-sm font-body-bold text-slate-800">
                {s.firstName} {s.lastName ?? ''}
              </Text>
              <Text className="text-xs font-body text-slate-500">
                Adm: {s.admissionNo} | {s.className}
                {s.sectionName ? `-${s.sectionName}` : ''}
              </Text>
            </TouchableOpacity>
          ))
        ) : null}

        {/* Last assignment result */}
        {result ? (
          <View className="bg-white p-3 rounded-xl border border-mint-200 mb-3 mt-2">
            <Text className="text-xs font-body-bold text-mint-700 mb-1">Last Assignment</Text>
            <Text className="text-xs font-body text-slate-600">
              {result.studentName} (Adm: {result.admissionNo}) → {result.routeName}
              {result.checkpointName ? ` @ ${result.checkpointName}` : ''} ({result.direction})
            </Text>
          </View>
        ) : null}

        <View className="mt-3 mb-8">
          <PrimaryButton
            label={submitting ? 'Assigning...' : 'Assign Transport'}
            icon="link-outline"
            onPress={handleAssign}
            isLoading={submitting}
            disabled={!selectedStudent || !selectedRoute}
          />
        </View>
      </ScrollView>
    </View>
  );
}