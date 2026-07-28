import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { notificationService } from '../services/notificationService';
import { NotificationResponse } from '../types/notification';
import ScreenHeader from '../components/ScreenHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AppShell from '../components/AppShell';

export default function NotificationInboxScreen() {
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.listMyNotifications(unreadOnly);
      setNotifications(res.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markRead(id);
      fetchNotifications();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark notification read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      Alert.alert('Success', 'All notifications marked as read.');
      fetchNotifications();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark all read.');
    }
  };

  if (loading) {
    return (<AppShell>
      <LoadingSpinner />
    </AppShell>);
  }

  return (
    <AppShell>
      <View className="flex-1 bg-cream-100">
        <View className="p-4 pt-4">
         
          <ScreenHeader
            title="Notifications"
            subtitle="In-app updates and alert inbox"
            showBackButton={true}
          />
        </View>

        <View className="px-4 mb-3 flex-row justify-between items-center">
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-xl border ${
              unreadOnly ? 'bg-primary-500 border-primary-500' : 'bg-white border-primary-100'
            }`}
            onPress={() => setUnreadOnly(!unreadOnly)}
          >
            <Text className={`text-xs font-body-bold ${unreadOnly ? 'text-white' : 'text-slate-700'}`}>
              {unreadOnly ? 'Unread Only' : 'All Notifications'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-primary-100 px-3 py-1.5 rounded-xl border border-primary-200"
            onPress={handleMarkAllRead}
          >
            <Text className="text-xs font-body-bold text-primary-700">Mark All Read</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <TouchableOpacity
                key={n.id}
                className={`p-4 rounded-2xl border shadow-sm mb-3 ${
                  n.isRead ? 'bg-white border-primary-100' : 'bg-primary-50 border-primary-300'
                }`}
                onPress={() => handleMarkRead(n.id)}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs font-body-bold text-primary-600 uppercase">{n.type}</Text>
                  {!n.isRead ? <View className="w-2 h-2 rounded-full bg-coral-500" /> : null}
                </View>

                <Text className="text-base font-body-bold text-slate-800">{n.title}</Text>
                {n.body ? <Text className="text-xs font-body text-slate-600 mt-1">{n.body}</Text> : null}

                <Text className="text-xs font-body text-slate-400 mt-2">
                  {new Date(n.createdAt).toLocaleDateString()} at{' '}
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <EmptyState
              icon="notifications-outline"
              title="No Notifications"
              message="Your notification inbox is empty."
            />
          )}
        </ScrollView>
      </View>
    </AppShell>
  );
}