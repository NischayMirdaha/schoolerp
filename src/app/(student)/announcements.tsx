import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { announcementService } from '../../services/announcementService';
import { eventService } from '../../services/eventService';
import { AnnouncementResponse } from '../../types/announcement';
import { EventResponse } from '../../types/event';
import ScreenHeader from '../../components/ScreenHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function StudentAnnouncementsScreen() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, eventRes] = await Promise.all([
        announcementService.listAnnouncements(false),
        eventService.listEvents(),
      ]);
      setAnnouncements(annRes.items);
      setEvents(eventRes.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load notices & events.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Notices & Events" subtitle="Active announcements and calendar" />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Important Announcements Section */}
        <Text className="text-base font-body-bold text-slate-800 mb-2">Announcements</Text>
        {announcements.length > 0 ? (
          announcements.map((a) => (
            <View
              key={a.id}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs font-body-bold text-primary-600">
                  By: {a.createdByName || 'School Admin'}
                </Text>
                {a.isImportant ? (
                  <View className="bg-coral-100 px-2 py-0.5 rounded-full">
                    <Text className="text-xs font-body-bold text-coral-700">IMPORTANT</Text>
                  </View>
                ) : null}
              </View>

              <Text className="text-base font-body-bold text-slate-800">{a.title}</Text>
              <Text className="text-xs font-body text-slate-600 mt-1">{a.body}</Text>
            </View>
          ))
        ) : (
          <EmptyState icon="megaphone-outline" title="No Active Notices" message="No notices at this time." />
        )}

        {/* Events Calendar Section */}
        <Text className="text-base font-body-bold text-slate-800 mt-4 mb-2">Upcoming Events</Text>
        {events.length > 0 ? (
          events.map((e) => (
            <View
              key={e.id}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
            >
              <Text className="text-xs font-body-bold text-emerald-600">
                Date: {e.eventDate} {e.eventTime ? `at ${e.eventTime.slice(0, 5)}` : ''}
              </Text>
              <Text className="text-base font-body-bold text-slate-800 mt-0.5">{e.title}</Text>
              {e.description ? (
                <Text className="text-xs font-body text-slate-600 mt-1">{e.description}</Text>
              ) : null}
              {e.venue ? (
                <Text className="text-xs font-body-semibold text-slate-500 mt-1">Venue: {e.venue}</Text>
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState icon="calendar-outline" title="No Events" message="No upcoming events scheduled." />
        )}
      </ScrollView>
    </View>
  );
}