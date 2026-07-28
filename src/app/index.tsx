import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const ADMIN_ROLES = [
  'SuperAdmin',
  'Principal',
  'Accountant',
  'Reception',
  'Librarian',
  'TransportManager',
];

function resolveHomeRoute(roleName: string | undefined): string {
  if (!roleName) return '/(auth)/switch-role';

  switch (roleName) {
    case 'Teacher':
      return '/(teacher)';
    case 'Student':
      return '/(student)';
    case 'Parent':
      return '/(parent)';
    default:
      return ADMIN_ROLES.includes(roleName) ? '/(admin)' : '/(auth)/switch-role';
  }
}

export default function IndexRedirect() {
  const router = useRouter();
  const { isAuthenticated, isLoading, activeRole, availableRoles } = useAuth();

  // Ensures the navigator is mounted before we call replace().
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return; // navigator not ready yet
    if (isLoading) return;             // session still resolving

    // Not logged in -> login screen.
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    // Logged in but no role selected yet (multi-role "picker" token).
    if (!activeRole) {
      // If exactly one role exists, the backend should have auto-selected it.
      // Anything else means the user must pick.
      router.replace(
        availableRoles.length > 0 ? '/(auth)/switch-role' : '/(auth)/login'
      );
      return;
    }

    router.replace(resolveHomeRoute(activeRole.roleName) as never);
  }, [
    navigationState?.key,
    isLoading,
    isAuthenticated,
    activeRole?.roleName,
    activeRole?.schoolId,
    availableRoles.length,
  ]);

  // Neutral splash while the dispatch decision is being made.
  return (
    <View className="flex-1 items-center justify-center bg-cream-100">
      <ActivityIndicator size="large" color="#0ea5e9" />
    </View>
  );
}