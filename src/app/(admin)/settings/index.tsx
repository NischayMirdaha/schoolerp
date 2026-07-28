import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../../components/ScreenHeader';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { GlobalSettingsService } from '../../../services/globalSettingsService';
import { DefaultClassResponse, DefaultGradingScaleResponse } from '../../../types/school';

type Tab = 'classes' | 'grading';

export default function GlobalSettingsScreen() {
  const [tab, setTab] = useState<Tab>('classes');
  const [isLoading, setIsLoading] = useState(true);

  const [classes, setClasses] = useState<DefaultClassResponse[]>([]);
  const [className, setClassName] = useState('');
  const [classSortOrder, setClassSortOrder] = useState('');
  const [isAddingClass, setIsAddingClass] = useState(false);

  const [scales, setScales] = useState<DefaultGradingScaleResponse[]>([]);
  const [minPct, setMinPct] = useState('');
  const [maxPct, setMaxPct] = useState('');
  const [letterGrade, setLetterGrade] = useState('');
  const [gradePoint, setGradePoint] = useState('');
  const [isAddingScale, setIsAddingScale] = useState(false);

  const loadAll = async () => {
    try {
      const [classData, scaleData] = await Promise.all([
        GlobalSettingsService.listDefaultClasses(),
        GlobalSettingsService.listDefaultGradingScales(),
      ]);
      setClasses(classData);
      setScales(scaleData);
    } catch {
      // leave lists empty; EmptyState will show
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadAll();
      setIsLoading(false);
    })();
  }, []);

  const handleAddClass = async () => {
    if (!className.trim() || !classSortOrder.trim()) {
      Alert.alert('Validation Error', 'Class name and sort order are required.');
      return;
    }
    const order = Number(classSortOrder);
    if (!Number.isInteger(order) || order < 0) {
      Alert.alert('Validation Error', 'Sort order must be a non-negative whole number.');
      return;
    }
    setIsAddingClass(true);
    try {
      const created = await GlobalSettingsService.createDefaultClass({
        name: className.trim(),
        sortOrder: order,
      });
      setClasses((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setClassName('');
      setClassSortOrder('');
    } catch (error: any) {
      Alert.alert('Could not add class', error.message || 'Please try again.');
    } finally {
      setIsAddingClass(false);
    }
  };

  const handleDeleteClass = (id: number) => {
    Alert.alert('Delete Template', 'Remove this default class template?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await GlobalSettingsService.deleteDefaultClass(id);
            setClasses((prev) => prev.filter((c) => c.id !== id));
          } catch (error: any) {
            Alert.alert('Could not delete', error.message || 'Please try again.');
          }
        },
      },
    ]);
  };

  const handleAddScale = async () => {
    if (!minPct.trim() || !maxPct.trim() || !letterGrade.trim()) {
      Alert.alert('Validation Error', 'Min %, Max %, and letter grade are required.');
      return;
    }
    const min = Number(minPct);
    const max = Number(maxPct);
    const gp = gradePoint.trim() ? Number(gradePoint) : null;
    if (isNaN(min) || min < 0 || min > 100) {
      Alert.alert('Validation Error', 'Min percentage must be between 0 and 100.');
      return;
    }
    if (isNaN(max) || max < 0 || max > 100) {
      Alert.alert('Validation Error', 'Max percentage must be between 0 and 100.');
      return;
    }
    if (min >= max) {
      Alert.alert('Validation Error', 'Min percentage must be less than Max percentage.');
      return;
    }
    if (gp !== null && (isNaN(gp) || gp < 0 || gp > 4)) {
      Alert.alert('Validation Error', 'Grade point must be between 0 and 4.');
      return;
    }
    setIsAddingScale(true);
    try {
      const created = await GlobalSettingsService.createDefaultGradingScale({
        minPercentage: min,
        maxPercentage: max,
        letterGrade: letterGrade.trim().toUpperCase(),
        gradePoint: gp,
      });
      setScales((prev) => [...prev, created].sort((a, b) => b.minPercentage - a.minPercentage));
      setMinPct('');
      setMaxPct('');
      setLetterGrade('');
      setGradePoint('');
    } catch (error: any) {
      Alert.alert('Could not add grading scale', error.message || 'Please try again.');
    } finally {
      setIsAddingScale(false);
    }
  };

  const handleDeleteScale = (id: number) => {
    Alert.alert('Delete Template', 'Remove this default grading scale?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await GlobalSettingsService.deleteDefaultGradingScale(id);
            setScales((prev) => prev.filter((s) => s.id !== id));
          } catch (error: any) {
            Alert.alert('Could not delete', error.message || 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-100 px-6 pt-10">
      <ScreenHeader title="Global Settings" subtitle="Default class & grading templates" />

      {/* Tabs */}
      <View className="flex-row bg-white rounded-2xl border border-primary-100 p-1 mb-4 shadow-sm">
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-xl items-center ${tab === 'classes' ? 'bg-primary-500' : ''}`}
          onPress={() => setTab('classes')}
        >
          <Text className={`font-body-bold text-sm ${tab === 'classes' ? 'text-white' : 'text-slate-500'}`}>
            Default Classes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-xl items-center ${tab === 'grading' ? 'bg-primary-500' : ''}`}
          onPress={() => setTab('grading')}
        >
          <Text className={`font-body-bold text-sm ${tab === 'grading' ? 'text-white' : 'text-slate-500'}`}>
            Grading Scale
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {tab === 'classes' ? (
            <>
              <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
                <Text className="font-body-bold text-slate-800 text-sm mb-3">Add Default Class</Text>
                <View className="flex-row mb-3">
                  <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-4 flex-[2] mr-2">
                    <TextInput
                      className="flex-1 text-slate-900 font-body py-3.5 text-base"
                      placeholder="e.g. Class 1"
                      placeholderTextColor="#94a3b8"
                      value={className}
                      onChangeText={setClassName}
                    />
                  </View>
                  <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-4 flex-1">
                    <TextInput
                      className="flex-1 text-slate-900 font-body py-3.5 text-base"
                      placeholder="Order"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      value={classSortOrder}
                      onChangeText={setClassSortOrder}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  className={`bg-primary-500 py-3 rounded-2xl items-center shadow-sm active:bg-primary-600 flex-row justify-center ${isAddingClass ? 'opacity-60' : ''}`}
                  onPress={handleAddClass}
                  disabled={isAddingClass}
                >
                  <Ionicons name="add" size={18} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text className="text-white font-body-bold text-sm">Add Class</Text>
                </TouchableOpacity>
              </View>

              {classes.length === 0 ? (
                <EmptyState icon="library-outline" title="No default classes yet" message="Add templates used to bootstrap new schools." />
              ) : (
                classes.map((c) => (
                  <View
                    key={c.id}
                    className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-2.5 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-primary-100 rounded-xl items-center justify-center mr-3">
                        <Text className="text-primary-600 font-body-bold text-xs">{c.sortOrder}</Text>
                      </View>
                      <Text className="font-body-bold text-slate-800 text-sm">{c.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteClass(c.id)}>
                      <Ionicons name="trash-outline" size={18} color="#e11d48" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          ) : (
            <>
              <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
                <Text className="font-body-bold text-slate-800 text-sm mb-3">Add Grading Band</Text>
                <View className="flex-row mb-3">
                  <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-3 flex-1 mr-2">
                    <TextInput
                      className="flex-1 text-slate-900 font-body py-3.5 text-sm"
                      placeholder="Min %"
                      placeholderTextColor="#94a3b8"
                      keyboardType="decimal-pad"
                      value={minPct}
                      onChangeText={setMinPct}
                    />
                  </View>
                  <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-3 flex-1 mr-2">
                    <TextInput
                      className="flex-1 text-slate-900 font-body py-3.5 text-sm"
                      placeholder="Max %"
                      placeholderTextColor="#94a3b8"
                      keyboardType="decimal-pad"
                      value={maxPct}
                      onChangeText={setMaxPct}
                    />
                  </View>
                  <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-3 flex-1">
                    <TextInput
                      className="flex-1 text-slate-900 font-body py-3.5 text-sm"
                      placeholder="Grade"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="characters"
                      value={letterGrade}
                      onChangeText={setLetterGrade}
                    />
                  </View>
                </View>
                <View className="flex-row items-center bg-cream-50 rounded-2xl border border-primary-100 px-4 mb-3">
                  <TextInput
                    className="flex-1 text-slate-900 font-body py-3.5 text-base"
                    placeholder="Grade Point (optional)"
                    placeholderTextColor="#94a3b8"
                    keyboardType="decimal-pad"
                    value={gradePoint}
                    onChangeText={setGradePoint}
                  />
                </View>
                <TouchableOpacity
                  className={`bg-primary-500 py-3 rounded-2xl items-center shadow-sm active:bg-primary-600 flex-row justify-center ${isAddingScale ? 'opacity-60' : ''}`}
                  onPress={handleAddScale}
                  disabled={isAddingScale}
                >
                  <Ionicons name="add" size={18} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text className="text-white font-body-bold text-sm">Add Grading Band</Text>
                </TouchableOpacity>
              </View>

              {scales.length === 0 ? (
                <EmptyState icon="ribbon-outline" title="No grading bands yet" message="Add templates used to bootstrap new schools." />
              ) : (
                scales.map((s) => (
                  <View
                    key={s.id}
                    className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-2.5 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center">
                      <View className="w-9 h-9 bg-secondary-100 rounded-xl items-center justify-center mr-3">
                        <Text className="text-secondary-600 font-body-bold text-xs">{s.letterGrade}</Text>
                      </View>
                      <Text className="font-body text-slate-700 text-sm">
                        {s.minPercentage}% - {s.maxPercentage}%{s.gradePoint != null ? ` (GP ${s.gradePoint})` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteScale(s.id)}>
                      <Ionicons name="trash-outline" size={18} color="#e11d48" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          )}
          <View className="h-6" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
