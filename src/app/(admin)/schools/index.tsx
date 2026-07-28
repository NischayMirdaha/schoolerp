import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenHeader from '../../../components/ScreenHeader';
import EmptyState from '../../../components/EmptyState';
import ListItemCard from '../../../components/ListItemCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { SchoolService } from '../../../services/schoolService';
import { SchoolResponse } from '../../../types/school';

const PAGE_SIZE = 10;

export default function SchoolsScreen() {
  const router = useRouter();

  const [schools, setSchools] = useState<SchoolResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async (pageToLoad: number, search: string) => {
    try {
      setHasError(false);
      const result = await SchoolService.listSchools(search || undefined, pageToLoad, PAGE_SIZE);
      setSchools(result.items);
      setTotalPages(result.totalPages || 1);
      setPage(result.page || pageToLoad);
    } catch {
      setHasError(true);
      setSchools([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load(1, searchTerm);
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    await load(1, searchTerm);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load(page, searchTerm);
    setIsRefreshing(false);
  };

  const goToPage = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setIsLoading(true);
    await load(nextPage, searchTerm);
    setIsLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-cream-100 px-6 pt-10">
      <ScreenHeader
        title="Schools"
        subtitle="Manage schools in the system"
        rightAction={
          <TouchableOpacity
            className="w-11 h-11 bg-primary-500 rounded-full items-center justify-center shadow-md active:bg-primary-600"
            onPress={() => router.push('/(admin)/schools/create')}
          >
            <Ionicons name="add" size={22} color="#ffffff" />
          </TouchableOpacity>
        }
      />

      {/* Search */}
      <View className="flex-row items-center bg-white rounded-2xl border border-primary-100 px-4 mb-4 shadow-sm">
        <Ionicons name="search-outline" size={18} color="#0ea5e9" />
        <TextInput
          className="flex-1 text-slate-900 font-body px-3 py-3.5 text-base"
          placeholder="Search by name or code..."
          placeholderTextColor="#94a3b8"
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => { setSearchTerm(''); load(1, ''); }}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#0ea5e9" />}
        >
          {hasError ? (
            <EmptyState icon="alert-circle-outline" title="Couldn't load schools" message="Pull down to try again." />
          ) : schools.length === 0 ? (
            <EmptyState icon="business-outline" title="No schools yet" message="Tap the + button to add your first school." />
          ) : (
            <>
              {schools.map((school) => (
                <ListItemCard
                  key={school.id}
                  title={school.name}
                  subtitle={`Code: ${school.code}`}
                  badge={school.isActive ? 'Active' : 'Inactive'}
                  badgeColor={school.isActive ? 'mint' : 'coral'}
                  onPress={() => router.push(`/(admin)/schools/${school.id}`)}
                />
              ))}

              {totalPages > 1 ? (
                <View className="flex-row items-center justify-center mb-8 mt-2">
                  <TouchableOpacity
                    className={`w-10 h-10 rounded-full items-center justify-center border border-primary-100 bg-white mr-4 ${page <= 1 ? 'opacity-40' : ''}`}
                    onPress={() => goToPage(page - 1)}
                    disabled={page <= 1}
                  >
                    <Ionicons name="chevron-back" size={18} color="#0284c7" />
                  </TouchableOpacity>
                  <Text className="font-body-semibold text-slate-600 text-sm">
                    Page {page} of {totalPages}
                  </Text>
                  <TouchableOpacity
                    className={`w-10 h-10 rounded-full items-center justify-center border border-primary-100 bg-white ml-4 ${page >= totalPages ? 'opacity-40' : ''}`}
                    onPress={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    <Ionicons name="chevron-forward" size={18} color="#0284c7" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="mb-8" />
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
