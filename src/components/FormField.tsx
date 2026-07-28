import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

/** Labeled text input matching the login/forgot-password screen style. */
export default function FormField({ label, icon, error, ...inputProps }: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-slate-700 font-body-semibold text-sm mb-1.5">{label}</Text>
      <View
        className={`flex-row items-center bg-cream-50 rounded-2xl border px-4 ${
          error ? 'border-coral-300' : 'border-primary-100'
        }`}
      >
        {icon ? <Ionicons name={icon} size={18} color="#0ea5e9" /> : null}
        <TextInput
          className={`flex-1 text-slate-900 font-body py-3.5 text-base ${icon ? 'px-3' : ''}`}
          placeholderTextColor="#94a3b8"
          {...inputProps}
        />
      </View>
      {error ? <Text className="text-coral-600 font-body text-xs mt-1">{error}</Text> : null}
    </View>
  );
}
