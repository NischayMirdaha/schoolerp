import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActiveChildProvider } from '../../context/ActiveChildContext';
import AppShell from '../../components/AppShell';

export default function ParentLayout() {
  const { isAuthenticated, activeRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login' as never);
      return;
    }

    if (!activeRole) {
      router.replace('/(auth)/switch-role' as never);
      return;
    }

    if (activeRole.roleName !== 'Parent') {
      router.replace('/' as never);
    }
  }, [isAuthenticated, activeRole?.roleName, isLoading]);

  return (
    <ActiveChildProvider>
      <AppShell>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="child-profile" />
        </Stack>
      </AppShell>
    </ActiveChildProvider>
  );
}