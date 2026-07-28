import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { announcementService } from '../../services/announcementService';
import { eventService } from '../../services/eventService';
import { TeacherService } from '../../services/teacherService';
import { AnnouncementResponse, CreateAnnouncementRequest } from '../../types/announcement';
import { EventResponse } from '../../types/event';
import ScreenHeader from '../../components/ScreenHeader';
import FormField from '../../components/FormField';
import TextAreaField from '../../components/TextAreaField';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

/** A class the teacher is assigned to, deduped from their subject assignments. */
interface AssignedClass {
  id: number;
  name: string;
}

export default function TeacherAnnouncementsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [myClasses, setMyClasses] = useState<AssignedClass[]>([]);

  // Form state — targetType is fixed to 'class', so there is no audience picker.
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annClassId, setAnnClassId] = useState<number | null>(null);
  const [annImportant, setAnnImportant] = useState(false);
  const [annStart, setAnnStart] = useState(new Date().toISOString().slice(0, 10));
  const [annEnd, setAnnEnd] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );

  const load = useCallback(async () => {
    // Settled individually so one failing call doesn't blank the whole screen.
    const [annRes, evRes, asgnRes] = await Promise.allSettled([
      announcementService.listAnnouncements(false),
      eventService.listEvents(),
      TeacherService.getMyAssignments(),
    ]);

    setAnnouncements(annRes.status === 'fulfilled' ? annRes.value.items : []);
    setEvents(evRes.status === 'fulfilled' ? evRes.value.items : []);

    if (asgnRes.status === 'fulfilled') {
      // A teacher usually has several subjects in the same class, so dedupe by
      // classId — otherwise "Grade 1" would appear once per subject.
      const seen = new Map<number, AssignedClass>();
      (asgnRes.value.assignments ?? []).forEach((a) => {
        if (!seen.has(a.classId)) {
          seen.set(a.classId, { id: a.classId, name: a.className });
        }
      });
      const list = [...seen.values()];
      setMyClasses(list);
      setAnnClassId((prev) => prev ?? (list.length > 0 ? list[0].id : null));
    } else {
      setMyClasses([]);
    }

    if (annRes.status === 'rejected') {
      Alert.alert('Error', (annRes.reason as Error)?.message || 'Failed to load announcements.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleCreate = async () => {
    if (!annTitle.trim() || !annBody.trim()) {
      Alert.alert('Validation', 'Title and body are required.');
      return;
    }
    if (!annClassId) {
      Alert.alert('Validation', 'Select the class this notice is for.');
      return;
    }

    try {
      setSaving(true);
      const payload: CreateAnnouncementRequest = {
        title: annTitle.trim(),
        body: annBody.trim(),
        // Fixed 'class' — the backend rejects 'school' for teachers.
        targetType: 'class',
        targetClassId: annClassId,
        targetSectionId: null,
        isImportant: annImportant,
        // Inputs are YYYY-MM-DD but the API expects timestamps; widen to
        // full-day boundaries so the notice is active for the whole end date.
        startAt: new Date(`${annStart}T00:00:00`).toISOString(),
        endAt: new Date(`${annEnd}T23:59:59`).toISOString(),
      };

      await announcementService.createAnnouncement(payload);

      setAnnTitle('');
      setAnnBody('');
      setAnnImportant(false);
      setShowForm(false);
      await load();
      Alert.alert('Success', 'Announcement posted to your class.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to post announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Announcement', 'Remove this notice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await announcementService.deleteAnnouncement(id);
            await load();
          } catch (err: any) {
            // The API only allows deleting your own announcements.
            Alert.alert('Error', err.message || 'Failed to delete announcement.');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner />;

  const canPost = myClasses.length > 0;

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4">
        <ScreenHeader
          title="My Announcements"
          subtitle="Post notices to your assigned classes"
          rightAction={
            canPost ? (
              <TouchableOpacity
                className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center"
                onPress={() => setShowForm((v) => !v)}
                accessibilityLabel="New announcement"
              >
                <Ionicons name={showForm ? 'close' : 'add'} size={22} color="#ffffff" />
              </TouchableOpacity>
            ) : undefined
          }
        />
      </View>

      <ScrollView
        className="flex-1 px-4"
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0284c7" />}
      >
        {/* No assigned classes -> posting is impossible; explain rather than
            showing a form the backend will reject. */}
        {!canPost ? (
          <EmptyState
            icon="alert-circle-outline"
            title="No Classes Assigned"
            message="You can only post announcements to classes you teach. Ask your Principal to assign you first."
          />
        ) : null}

        {/* ── Create form ── */}
        {showForm && canPost ? (
          <View className="bg-white p-5 rounded-3xl border border-primary-100 shadow-sm mb-4">
            <Text className="font-body-bold text-slate-800 text-sm mb-3">New Class Announcement</Text>

            <FormField
              label="Title *"
              value={annTitle}
              onChangeText={setAnnTitle}
              placeholder="e.g. Bring your science notebook"
            />

            <TextAreaField
              label="Body *"
              value={annBody}
              onChangeText={setAnnBody}
              minLines={5}
              maxLength={1000}
              placeholder="Full notice text..."
            />

            <Text className="text-slate-500 font-body text-xs mb-1">Target Class *:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {myClasses.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  className={`px-3 py-1.5 rounded-xl mr-2 border ${
                    annClassId === c.id ? 'bg-primary-500 border-primary-500' : 'bg-cream-50 border-primary-100'
                  }`}
                  onPress={() => setAnnClassId(c.id)}
                >
                  <Text
                    className={`font-body-bold text-xs ${
                      annClassId === c.id ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row mb-3">
              <View className="flex-1 mr-2">
                <FormField label="Start Date" value={annStart} onChangeText={setAnnStart} placeholder="YYYY-MM-DD" />
              </View>
              <View className="flex-1">
                <FormField label="End Date" value={annEnd} onChangeText={setAnnEnd} placeholder="YYYY-MM-DD" />
              </View>
            </View>

            <TouchableOpacity className="flex-row items-center mb-4" onPress={() => setAnnImportant((v) => !v)}>
              <Ionicons
                name={annImportant ? 'checkbox' : 'square-outline'}
                size={20}
                color={annImportant ? '#e11d48' : '#94a3b8'}
              />
              <Text className="font-body-semibold text-slate-700 text-xs ml-2">
                Mark as Important (sends email)
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              label="Post Announcement"
              icon="checkmark"
              onPress={handleCreate}
              isLoading={saving}
            />
          </View>
        ) : null}

        {/* ── Announcements list ── */}
        <Text className="font-body-bold text-slate-800 text-base mb-2">Announcements</Text>

        {announcements.length > 0 ? (
          announcements.map((a) => (
            <View key={a.id} className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                  <Text className="font-body-bold text-slate-800 text-sm">{a.title}</Text>
                  <Text className="text-slate-500 font-body text-xs mt-1 leading-5" numberOfLines={3}>
                    {a.body}
                  </Text>
                  <Text className="text-slate-400 font-body text-xs mt-1.5">
                    {a.targetType === 'school' ? 'Whole School' : a.targetClassName ?? 'Class'}
                    {a.isImportant ? ' · Important' : ''}
                    {a.createdByName ? ` · by ${a.createdByName}` : ''}
                  </Text>
                </View>

                {/* Delete lives on the icon only — tapping the card does nothing. */}
                <TouchableOpacity onPress={() => handleDelete(a.id)}>
                  <Ionicons name="trash-outline" size={18} color="#e11d48" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="megaphone-outline"
            title="No Announcements"
            message="No active notices for your classes."
          />
        )}

        {/* ── Events (read-only) ── */}
        <Text className="font-body-bold text-slate-800 text-base mt-4 mb-2">School Events</Text>

        {events.length > 0 ? (
          events.map((e) => (
            <View key={e.id} className="bg-white p-4 rounded-2xl border border-mint-100 shadow-sm mb-3">
              <Text className="font-body-bold text-slate-800 text-sm">{e.title}</Text>
              <Text className="text-slate-500 font-body text-xs mt-0.5">
                {e.eventDate}
                {e.eventTime ? ` · ${e.eventTime}` : ''}
                {e.venue ? ` · ${e.venue}` : ''}
              </Text>
              {e.description ? (
                <Text className="text-slate-500 font-body text-xs mt-1 leading-5" numberOfLines={2}>
                  {e.description}
                </Text>
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No Events"
            message="No school events scheduled."
          />
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}