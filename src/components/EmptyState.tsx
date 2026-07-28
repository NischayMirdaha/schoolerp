import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

/** Friendly empty-list placeholder, consistent with the app's rounded-card style. */
export default function EmptyState({ icon = 'file-tray-outline', title, message }: EmptyStateProps) {
  return (
    <View className="bg-white p-8 rounded-3xl border border-primary-100 shadow-sm items-center">
      <View className="w-14 h-14 bg-primary-100 rounded-2xl items-center justify-center mb-3">
        <Ionicons name={icon} size={26} color="#0284c7" />
      </View>
      <Text className="text-slate-700 font-body-bold text-base text-center">{title}</Text>
      {message ? (
        <Text className="text-slate-500 font-body text-sm text-center mt-1">{message}</Text>
      ) : null}
    </View>
  );
}
