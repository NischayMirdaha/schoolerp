import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getRoleNav, NavItem } from '../config/roleNavigation';
import { notificationService } from '../services/notificationService';


interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Persistent application chrome: top header + bottom tab bar + account menu.
 *
 * Previously every route group rendered a bare <Stack headerShown:false />, which
 * meant NO navigation affordances existed anywhere. Sign Out and Change Password
 * were reachable only from the Teacher dashboard, so every other role was stranded
 * on its landing screen.
 */
export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeRole, availableRoles, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const nav = getRoleNav(activeRole?.roleName);

  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnread = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res?.unreadCount ?? 0);
    } catch {
      // Non-fatal: a failed badge fetch must never block the UI.
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadUnread();
  }, [loadUnread, pathname]);

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  const go = (href: string) => {
    setMenuOpen(false);
    setMoreOpen(false);
    router.push(href as never);
  };

  const isActiveTab = (href: string) => {
    if (href === '/(admin)' || href === '/(teacher)' || href === '/(student)' || href === '/(parent)') {
      // Group roots: only highlight on the exact landing path.
      const groupRoot = href.replace(/[()]/g, '');
      return pathname === '/' || pathname === groupRoot;
    }
    return pathname.startsWith(href.replace(/[()]/g, ''));
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    await logout();
    // AuthContext.logout() already redirects to /(auth)/login.
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-100" edges={['top']}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-primary-100">
        <View className="flex-1 pr-3">
          <View className="self-start bg-primary-100 px-2.5 py-0.5 rounded-full mb-0.5">
            <Text className="text-[10px] font-body-bold text-primary-700 uppercase tracking-wider">
              {nav.portalName}
            </Text>
          </View>
          <Text className="text-lg font-heading text-slate-800" numberOfLines={1}>
            Hi, {user?.firstName || 'there'}!
          </Text>
        </View>

        {/* Notification bell with unread badge */}
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-cream-100 items-center justify-center mr-2"
          onPress={() => go('/notifications')}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={20} color="#0284c7" />
          {unreadCount > 0 ? (
            <View className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-coral-500 rounded-full items-center justify-center">
              <Text className="text-white text-[10px] font-body-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Avatar → account menu */}
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center"
          onPress={() => setMenuOpen(true)}
          accessibilityLabel="Account menu"
        >
          <Text className="text-white font-body-bold text-sm">{initials}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Screen content ─────────────────────────────────────── */}
      <View className="flex-1">{children}</View>

      {/* ── Bottom tab bar ─────────────────────────────────────── */}
      <View
        className="flex-row bg-white border-t border-primary-100 pt-1.5 px-1"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        {nav.tabs.map((tab) => {
          const active = isActiveTab(tab.href);
          return (
            <TouchableOpacity
              key={tab.href}
              className="flex-1 items-center justify-center py-1"
              onPress={() => router.replace(tab.href as never)}
              accessibilityLabel={tab.label}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={active ? '#0284c7' : '#94a3b8'}
              />
              <Text
                className={`text-[10px] mt-0.5 ${
                  active ? 'font-body-bold text-primary-600' : 'font-body text-slate-400'
                }`}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* "More" opens the overflow sheet when the role has extra destinations. */}
        {nav.more.length > 0 ? (
          <TouchableOpacity
            className="flex-1 items-center justify-center py-1"
            onPress={() => setMoreOpen(true)}
            accessibilityLabel="More"
          >
            <Ionicons name="grid-outline" size={22} color="#94a3b8" />
            <Text className="text-[10px] mt-0.5 font-body text-slate-400">More</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ── Account menu ───────────────────────────────────────── */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setMenuOpen(false)}>
          <Pressable className="mt-24 mx-5 bg-white rounded-3xl p-2 shadow-lg" onPress={(e) => e.stopPropagation()}>
            <View className="px-4 py-3 border-b border-primary-50">
              <Text className="font-body-bold text-slate-800 text-base">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className="font-body text-slate-500 text-xs mt-0.5">
                {activeRole?.roleName}
                {activeRole?.schoolName ? ` · ${activeRole.schoolName}` : ''}
              </Text>
            </View>

            <MenuRow icon="person-outline" label="My Profile" onPress={() => go('/profile')} />

            {/* Only offer role switching when more than one role exists. */}
            {availableRoles.length > 1 ? (
              <MenuRow
                icon="swap-horizontal-outline"
                label="Switch Role"
                onPress={() => go('/(auth)/switch-role')}
              />
            ) : null}

            <MenuRow
              icon="key-outline"
              label="Change Password"
              onPress={() => go('/(auth)/change-password')}
            />

            <MenuRow
              icon="log-out-outline"
              label="Sign Out"
              destructive
              onPress={handleSignOut}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── "More" sheet ───────────────────────────────────────── */}
      <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setMoreOpen(false)}>
          <Pressable
            className="bg-white rounded-t-3xl px-5 pt-5 pb-10 max-h-[70%]"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="items-center mb-4">
              <View className="w-10 h-1 bg-slate-200 rounded-full" />
            </View>
            <Text className="text-lg font-heading text-slate-800 mb-3">All Modules</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {nav.more.map((item: NavItem) => (
                <TouchableOpacity
                  key={item.href}
                  className="flex-row items-center py-3.5 border-b border-primary-50"
                  onPress={() => go(item.href)}
                >
                  <View className="w-9 h-9 bg-primary-50 rounded-xl items-center justify-center mr-3">
                    <Ionicons name={item.icon} size={17} color="#0284c7" />
                  </View>
                  <Text className="flex-1 font-body-semibold text-slate-700 text-sm">{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity className="flex-row items-center px-4 py-3.5" onPress={onPress}>
      <Ionicons name={icon} size={19} color={destructive ? '#e11d48' : '#334155'} />
      <Text
        className={`ml-3 text-sm ${
          destructive ? 'font-body-bold text-coral-600' : 'font-body-semibold text-slate-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}