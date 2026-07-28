import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AppShell from '../../components/AppShell';

export default function StudentLayout() {
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

    if (activeRole.roleName !== 'Student') {
      router.replace('/' as never);
    }
  }, [isAuthenticated, activeRole?.roleName, isLoading]);

  return (
    <AppShell>
      <Stack screenOptions={{ headerShown: false }} />
    </AppShell>
  );
}