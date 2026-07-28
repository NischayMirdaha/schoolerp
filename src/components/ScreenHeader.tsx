import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

export default function ScreenHeader({ title, subtitle, showBackButton, rightAction }: ScreenHeaderProps) {
  const router = useRouter();
  const canBack = showBackButton !== undefined ? showBackButton : (router.canGoBack ? router.canGoBack() : false);

  return (
    <View className="flex-row items-center justify-between mb-6">
      <View className="flex-row items-center flex-1">
        {canBack ? (
          <TouchableOpacity
            className="w-11 h-11 bg-white rounded-full items-center justify-center border border-primary-100 shadow-sm mr-3"
            onPress={() => {
              if (router.canGoBack && router.canGoBack()) {
                router.back();
              }
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#0284c7" />
          </TouchableOpacity>
        ) : null}
        <View className="flex-1">
          <Text className="text-xl font-heading text-slate-800" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="font-body text-slate-500 text-xs mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightAction}
    </View>
  );
}