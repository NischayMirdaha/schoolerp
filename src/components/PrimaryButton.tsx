import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'coral' | 'outline';
}

const VARIANT_STYLES: Record<string, string> = {
  primary: 'bg-primary-500 active:bg-primary-600',
  coral: 'bg-coral-500 active:bg-coral-600',
  outline: 'bg-white border border-primary-200 active:bg-primary-50',
};

const VARIANT_TEXT: Record<string, string> = {
  primary: 'text-white',
  coral: 'text-white',
  outline: 'text-primary-600',
};

/** Reusable submit/action button consistent with the login screen's CTA style. */
export default function PrimaryButton({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  icon,
  variant = 'primary',
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      className={`py-4 rounded-2xl items-center shadow-sm flex-row justify-center ${VARIANT_STYLES[variant]} ${
        disabled || isLoading ? 'opacity-60' : ''
      }`}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#0284c7' : '#ffffff'} />
      ) : (
        <>
          <Text className={`font-body-bold text-base mr-2 ${VARIANT_TEXT[variant]}`}>{label}</Text>
          {icon ? (
            <Ionicons name={icon} size={18} color={variant === 'outline' ? '#0284c7' : '#ffffff'} />
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}
