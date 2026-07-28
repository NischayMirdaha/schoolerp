import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerFieldProps {
  label: string;
  value: string; // Expected format: 'YYYY-MM-DD'
  onChangeDate: (formattedDate: string) => void;
  error?: string;
}

export default function DatePickerField({ label, value, onChangeDate, error }: DatePickerFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Parse initial date or default to current date
  const parsedDate = value ? new Date(value) : new Date();
  const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const [selectedYear, setSelectedYear] = useState<number>(validDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(validDate.getMonth() + 1); // 1-indexed
  const [selectedDay, setSelectedDay] = useState<number>(validDate.getDate());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYear - 20 + i);
  const months = [
    { num: 1, name: 'Jan' },
    { num: 2, name: 'Feb' },
    { num: 3, name: 'Mar' },
    { num: 4, name: 'Apr' },
    { num: 5, name: 'May' },
    { num: 6, name: 'Jun' },
    { num: 7, name: 'Jul' },
    { num: 8, name: 'Aug' },
    { num: 9, name: 'Sep' },
    { num: 10, name: 'Oct' },
    { num: 11, name: 'Nov' },
    { num: 12, name: 'Dec' },
  ];

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleConfirm = () => {
    const yyyy = selectedYear.toString();
    const mm = selectedMonth.toString().padStart(2, '0');
    const dd = Math.min(selectedDay, daysInMonth).toString().padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChangeDate(formatted);
    setModalVisible(false);
  };

  return (
    <View className="mb-4">
      <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">{label}</Text>
      <Pressable
        onPress={() => setModalVisible(true)}
        className={`flex-row items-center bg-cream-50 rounded-2xl border px-4 py-3.5 ${
          error ? 'border-coral-300' : 'border-primary-100'
        }`}
      >
        <Ionicons name="calendar-outline" size={20} color="#0ea5e9" />
        <Text className={`flex-1 font-body text-base px-3 ${value ? 'text-slate-900' : 'text-slate-400'}`}>
          {value || 'Select Date (YYYY-MM-DD)'}
        </Text>
        <Ionicons name="chevron-down-outline" size={18} color="#94a3b8" />
      </Pressable>
      {error ? <Text className="text-coral-600 font-body text-xs mt-1">{error}</Text> : null}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setModalVisible(false)}>
          <Pressable className="bg-white rounded-t-3xl p-6 border-t border-slate-200">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-body-bold text-slate-900">Select Date</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Year Selector */}
            <Text className="text-xs font-body-semibold text-slate-500 uppercase tracking-wider mb-2">Year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {years.map((y) => (
                <TouchableOpacity
                  key={y}
                  onPress={() => setSelectedYear(y)}
                  className={`px-4 py-2 rounded-xl mr-2 border ${
                    selectedYear === y ? 'bg-sky-600 border-sky-600' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <Text className={`font-body-semibold ${selectedYear === y ? 'text-white' : 'text-slate-700'}`}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Month Selector */}
            <Text className="text-xs font-body-semibold text-slate-500 uppercase tracking-wider mb-2">Month</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {months.map((m) => (
                <TouchableOpacity
                  key={m.num}
                  onPress={() => setSelectedMonth(m.num)}
                  className={`px-4 py-2 rounded-xl mr-2 border ${
                    selectedMonth === m.num ? 'bg-sky-600 border-sky-600' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <Text className={`font-body-semibold ${selectedMonth === m.num ? 'text-white' : 'text-slate-700'}`}>
                    {m.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Day Selector */}
            <Text className="text-xs font-body-semibold text-slate-500 uppercase tracking-wider mb-2">Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              {days.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setSelectedDay(d)}
                  className={`w-10 h-10 rounded-xl mr-2 items-center justify-center border ${
                    selectedDay === d ? 'bg-sky-600 border-sky-600' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <Text className={`font-body-semibold ${selectedDay === d ? 'text-white' : 'text-slate-700'}`}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Confirm Button */}
            <TouchableOpacity onPress={handleConfirm} className="bg-sky-600 py-3.5 rounded-2xl items-center shadow-sm">
              <Text className="text-white font-body-bold text-base">Set Date</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
