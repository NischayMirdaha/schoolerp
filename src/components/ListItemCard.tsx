import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ListItemCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'mint' | 'coral' | 'secondary' | 'primary';
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

const BADGE_STYLES: Record<string, string> = {
  mint: 'bg-mint-100 text-mint-600',
  coral: 'bg-coral-100 text-coral-600',
  secondary: 'bg-secondary-100 text-secondary-600',
  primary: 'bg-primary-100 text-primary-600',
};

/** Generic tappable row card used across list screens (schools, teachers, students, etc.). */
export default function ListItemCard({ title, subtitle, badge, badgeColor = 'primary', icon = 'chevron-forward', onPress }: ListItemCardProps) {
  return (
    <TouchableOpacity
      className="bg-white p-4 rounded-3xl border border-primary-100 shadow-sm mb-3 flex-row items-center justify-between active:bg-primary-50"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex-1 mr-3">
        <Text className="text-base font-body-bold text-slate-800" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-slate-500 font-body text-xs mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center">
        {badge ? (
          <View className={`px-2.5 py-1 rounded-full mr-2 ${BADGE_STYLES[badgeColor].split(' ')[0]}`}>
            <Text className={`text-xs font-body-bold ${BADGE_STYLES[badgeColor].split(' ')[1]}`}>{badge}</Text>
          </View>
        ) : null}
        {onPress ? <Ionicons name={icon} size={18} color="#94a3b8" /> : null}
      </View>
    </TouchableOpacity>
  );
}
