import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { announcementService } from '../../services/announcementService';
import { eventService } from '../../services/eventService';
import { AnnouncementResponse } from '../../types/announcement';
import { EventResponse } from '../../types/event';
import ScreenHeader from '../../components/ScreenHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ListItemCard from '../../components/ListItemCard';
import { Ionicons } from '@expo/vector-icons';
import { AcademicService } from '../../services/academicService';
import { CreateAnnouncementRequest } from '../../types/announcement';
import { CreateEventRequest } from '../../types/event';
import { ClassResponse } from '../../types/academic';
import FormField from '../../components/FormField';
import TextAreaField from '../../components/TextAreaField';
import PrimaryButton from '../../components/PrimaryButton';

export default function ManageAnnouncementsScreen() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'events'>('announcements');
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annTargetType, setAnnTargetType] = useState<'school' | 'class'>('school');
  const [annClassId, setAnnClassId] = useState<number | null>(null);
  const [annImportant, setAnnImportant] = useState(false);
  const [annStart, setAnnStart] = useState(new Date().toISOString().slice(0, 10));
  const [annEnd, setAnnEnd] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );

  // Event form
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evDate, setEvDate] = useState(new Date().toISOString().slice(0, 10));
  const [evTime, setEvTime] = useState('');
  const [evVenue, setEvVenue] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

    // Needed for the "target class" picker on both forms.
  useEffect(() => {
    AcademicService.listClasses().then(setClasses).catch(() => setClasses([]));
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'announcements') {
        const res = await announcementService.listAnnouncements(true);
        setAnnouncements(res.items);
      } else {
        const res = await eventService.listEvents();
        setEvents(res.items);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = (id: number) => {
    Alert.alert('Delete Announcement', 'Are you sure you want to delete this announcement?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await announcementService.deleteAnnouncement(id);
            fetchData();
            Alert.alert('Success', 'Announcement deleted.');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete announcement.');
          }
        },
      },
    ]);
  };

    const resetForms = () => {
    setAnnTitle(''); setAnnBody(''); setAnnTargetType('school');
    setAnnClassId(null); setAnnImportant(false);
    setEvTitle(''); setEvDesc(''); setEvTime(''); setEvVenue('');
    setShowForm(false);
  };

  const handleCreateAnnouncement = async () => {
    if (!annTitle.trim() || !annBody.trim()) {
      Alert.alert('Validation', 'Title and body are required.');
      return;
    }
    if (annTargetType === 'class' && !annClassId) {
      Alert.alert('Validation', 'Select a target class.');
      return;
    }
    try {
      setSaving(true);
      // §7.6: startAt/endAt are timestamps — the API expects ISO strings,
      // so widen the YYYY-MM-DD inputs to full-day boundaries.
      const payload: CreateAnnouncementRequest = {
        title: annTitle.trim(),
        body: annBody.trim(),
        targetType: annTargetType,
        targetClassId: annTargetType === 'class' ? annClassId : null,
        targetSectionId: null,
        isImportant: annImportant,
        startAt: new Date(`${annStart}T00:00:00`).toISOString(),
        endAt: new Date(`${annEnd}T23:59:59`).toISOString(),
      };
      await announcementService.createAnnouncement(payload);
      resetForms();
      fetchData();
      Alert.alert('Success', 'Announcement published.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!evTitle.trim()) {
      Alert.alert('Validation', 'Event title is required.');
      return;
    }
    try {
      setSaving(true);
      const payload: CreateEventRequest = {
        title: evTitle.trim(),
        description: evDesc.trim() || null,
        eventDate: evDate,
        endDate: null,
        eventTime: evTime.trim() || null,
        venue: evVenue.trim() || null,
        targetType: 'school',
        targetClassId: null,
      };
      await eventService.createEvent(payload);
      resetForms();
      fetchData();
      Alert.alert('Success', 'Event added to calendar.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = (id: number) => {
    Alert.alert('Delete Event', 'Remove this calendar event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await eventService.deleteEvent(id);
            fetchData();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete event.');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="Notices & Events"
          subtitle="Manage school announcements and calendar events"
          rightAction={
            <TouchableOpacity
              className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center"
              onPress={() => setShowForm((v) => !v)}
            >
              <Ionicons name={showForm ? 'close' : 'add'} size={22} color="#ffffff" />
            </TouchableOpacity>
          }
        />
      </View>

      {/* Tab Selector */}
      <View className="flex-row px-4 mb-4">
        <TouchableOpacity
          className={`flex-1 py-2.5 items-center rounded-xl mr-2 ${
            activeTab === 'announcements' ? 'bg-primary-600' : 'bg-white border border-primary-100'
          }`}
          onPress={() => setActiveTab('announcements')}
        >
          <Text
            className={`text-xs font-body-bold ${
              activeTab === 'announcements' ? 'text-white' : 'text-slate-700'
            }`}
          >
            Announcements
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2.5 items-center rounded-xl ${
            activeTab === 'events' ? 'bg-primary-600' : 'bg-white border border-primary-100'
          }`}
          onPress={() => setActiveTab('events')}
        >
          <Text
            className={`text-xs font-body-bold ${
              activeTab === 'events' ? 'text-white' : 'text-slate-700'
            }`}
          >
            Calendar Events
          </Text>
        </TouchableOpacity>
              {showForm ? (
        <ScrollView className="px-4 mb-3" keyboardShouldPersistTaps="handled">
          <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm">
            {activeTab === 'announcements' ? (
              <>
                <Text className="font-body-bold text-slate-800 text-sm mb-3">New Announcement</Text>
                <FormField label="Title *" value={annTitle} onChangeText={setAnnTitle} placeholder="e.g. Parent-Teacher Meeting" />
                <TextAreaField label="Body *" value={annBody} onChangeText={setAnnBody} minLines={5} maxLength={1000} placeholder="Full notice text..." />

                <Text className="text-slate-500 font-body text-xs mb-1">Audience:</Text>
                <View className="flex-row mb-3">
                  {(['school', 'class'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      className={`px-4 py-1.5 rounded-xl mr-2 border ${
                        annTargetType === t ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                      }`}
                      onPress={() => { setAnnTargetType(t); if (t === 'school') setAnnClassId(null); }}
                    >
                      <Text className={`font-body-bold text-xs ${annTargetType === t ? 'text-white' : 'text-slate-700'}`}>
                        {t === 'school' ? 'Whole School' : 'Specific Class'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {annTargetType === 'class' ? (
                  <>
                    <Text className="text-slate-500 font-body text-xs mb-1">Target Class *:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                      {classes.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          className={`px-3 py-1.5 rounded-xl mr-2 border ${
                            annClassId === c.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                          }`}
                          onPress={() => setAnnClassId(c.id)}
                        >
                          <Text className={`font-body-bold text-xs ${annClassId === c.id ? 'text-white' : 'text-slate-700'}`}>
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                ) : null}

                <View className="flex-row mb-3">
                  <View className="flex-1 mr-2">
                    <FormField label="Start Date" value={annStart} onChangeText={setAnnStart} placeholder="YYYY-MM-DD" />
                  </View>
                  <View className="flex-1">
                    <FormField label="End Date" value={annEnd} onChangeText={setAnnEnd} placeholder="YYYY-MM-DD" />
                  </View>
                </View>

                <TouchableOpacity
                  className="flex-row items-center mb-4"
                  onPress={() => setAnnImportant((v) => !v)}
                >
                  <Ionicons
                    name={annImportant ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={annImportant ? '#e11d48' : '#94a3b8'}
                  />
                  <Text className="font-body-semibold text-slate-700 text-xs ml-2">
                    Mark as Important (sends email)
                  </Text>
                </TouchableOpacity>

                <PrimaryButton label="Publish Announcement" icon="checkmark" onPress={handleCreateAnnouncement} isLoading={saving} />
              </>
            ) : (
              <>
                <Text className="font-body-bold text-slate-800 text-sm mb-3">New Calendar Event</Text>
                <FormField label="Title *" value={evTitle} onChangeText={setEvTitle} placeholder="e.g. Annual Sports Day" />
                <TextAreaField label="Description" value={evDesc} onChangeText={setEvDesc} minLines={4} maxLength={500} />
                <FormField label="Event Date *" value={evDate} onChangeText={setEvDate} placeholder="YYYY-MM-DD" />
                <FormField label="Time (optional)" value={evTime} onChangeText={setEvTime} placeholder="HH:MM" />
                <FormField label="Venue (optional)" value={evVenue} onChangeText={setEvVenue} placeholder="e.g. School Ground" />
                <PrimaryButton label="Add Event" icon="checkmark" onPress={handleCreateEvent} isLoading={saving} />
              </>
            )}
          </View>
        </ScrollView>
      ) : null}
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : activeTab === 'announcements' ? (
        <ScrollView className="flex-1 px-4">
          {announcements.length > 0 ? (
            announcements.map((a) => (
              <View key={a.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-2">
                    <Text className="font-body-bold text-slate-800 text-sm">{a.title}</Text>
                    <Text className="text-slate-500 font-body text-xs mt-1" numberOfLines={3}>{a.body}</Text>
                    <Text className="text-slate-400 font-body text-xs mt-1.5">
                      {a.targetType === 'school' ? 'Whole School' : a.targetClassName ?? 'Class'}
                      {a.isImportant ? ' · Important' : ''}
                    </Text>
                  </View>
                  {/* FIX: the whole card previously triggered delete on tap. */}
                  <TouchableOpacity onPress={() => handleDeleteAnnouncement(a.id)}>
                    <Ionicons name="trash-outline" size={18} color="#e11d48" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <EmptyState icon="megaphone-outline" title="No Announcements" message="No notices recorded." />
          )}
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-4">
          {events.length > 0 ? (
            events.map((e) => (
              <View key={e.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-2">
                    <Text className="font-body-bold text-slate-800 text-sm">{e.title}</Text>
                    <Text className="text-slate-500 font-body text-xs mt-0.5">
                      {e.eventDate}{e.eventTime ? ` · ${e.eventTime}` : ''}{e.venue ? ` · ${e.venue}` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteEvent(e.id)}>
                    <Ionicons name="trash-outline" size={18} color="#e11d48" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <EmptyState icon="calendar-outline" title="No Calendar Events" message="No school events listed." />
          )}
        </ScrollView>
      )}
    </View>
  );
}