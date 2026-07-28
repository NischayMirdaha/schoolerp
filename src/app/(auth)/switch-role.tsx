import React from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { RoleInfo } from '../../types/auth';

type RoleStyle = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  badgeBg: string;
  border: string;
  selectedBg: string;
  selectedBorder: string;
};

function getRoleStyle(roleName: string): RoleStyle {
  switch (roleName) {
    case 'Parent':
      return {
        icon: 'people-outline',
        iconBg: 'bg-coral-100',
        badgeBg: 'bg-coral-500',
        border: 'border-coral-100',
        selectedBg: 'bg-coral-50',
        selectedBorder: 'border-coral-400',
      };
    case 'Student':
      return {
        icon: 'school-outline',
        iconBg: 'bg-secondary-100',
        badgeBg: 'bg-secondary-500',
        border: 'border-secondary-100',
        selectedBg: 'bg-secondary-50',
        selectedBorder: 'border-secondary-400',
      };
    case 'Teacher':
      return {
        icon: 'easel-outline',
        iconBg: 'bg-mint-100',
        badgeBg: 'bg-mint-500',
        border: 'border-mint-100',
        selectedBg: 'bg-mint-50',
        selectedBorder: 'border-mint-400',
      };
    default:
      return {
        icon: 'shield-checkmark-outline',
        iconBg: 'bg-primary-100',
        badgeBg: 'bg-primary-500',
        border: 'border-primary-100',
        selectedBg: 'bg-primary-50',
        selectedBorder: 'border-primary-400',
      };
  }
}

export default function SwitchRoleScreen() {
  const { user, activeRole, availableRoles, switchRole, logout } = useAuth();
  const router = useRouter();

  const handleSelectRole = async (role: RoleInfo) => {
    try {
      const newRole = await switchRole(role.schoolId, role.roleId);

      if (!newRole) {
        Alert.alert('Could not switch role', 'The server did not return an active role.');
        return;
      }

      const ADMIN_ROLES = [
        'SuperAdmin', 'Principal', 'Accountant',
        'Reception', 'Librarian', 'TransportManager',
      ];

      let target = '/(admin)';
      if (newRole.roleName === 'Teacher') target = '/(teacher)';
      else if (newRole.roleName === 'Student') target = '/(student)';
      else if (newRole.roleName === 'Parent') target = '/(parent)';
      else if (!ADMIN_ROLES.includes(newRole.roleName)) target = '/';

      router.replace(target as never);
    } catch (error: any) {
      Alert.alert('Could not switch role', error.message || 'Failed to select role.');
    }
  };

  const handleSignOut = async () => {
    await logout();
    setTimeout(() => router.replace('/(auth)/login'), 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-100 px-6 pt-12">
      <View className="mb-6">
        <Text className="text-2xl font-heading text-slate-800">
          Hello, {user?.firstName || 'User'}!
        </Text>
        <Text className="font-body text-slate-500 text-sm mt-1">
          Select which portal interface you want to enter:
        </Text>
      </View>

      <FlatList
        data={availableRoles}
        keyExtractor={(item, index) => `${item.roleId}-${item.schoolId || 'sys'}-${index}`}
        renderItem={({ item }) => {
          const isSelected = activeRole?.roleId === item.roleId && activeRole?.schoolId === item.schoolId;
          const style = getRoleStyle(item.roleName);

          return (
            <TouchableOpacity
              className={`p-5 rounded-3xl border shadow-sm mb-4 flex-row items-center justify-between ${
                isSelected ? `${style.selectedBg} ${style.selectedBorder}` : `bg-white ${style.border}`
              }`}
              onPress={() => handleSelectRole(item)}
            >
              <View className="flex-row items-center flex-1 pr-4">
                <View className={`w-12 h-12 ${style.iconBg} rounded-2xl items-center justify-center mr-4`}>
                  <Ionicons name={style.icon} size={22} color="#334155" />
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-body-bold text-slate-800">{item.roleName}</Text>
                  <Text className="text-slate-500 font-body text-xs mt-0.5" numberOfLines={1}>
                    {item.schoolName || 'System Wide Access'}
                  </Text>
                </View>
              </View>

              <View className={`w-9 h-9 ${style.badgeBg} rounded-full items-center justify-center shadow-sm`}>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        className="my-8 py-4 rounded-2xl bg-white border border-coral-200 items-center shadow-sm active:bg-coral-50 flex-row justify-center"
        onPress={handleSignOut}
      >
        <Ionicons name="log-out-outline" size={18} color="#e11d48" style={{ marginRight: 6 }} />
        <Text className="text-coral-600 font-body-bold text-base">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}