import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { libraryService } from '../../../services/libraryService';
import { BookResponse } from '../../../types/library';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';

export default function BookCatalogScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [books, setBooks] = useState<BookResponse[]>([]);

  // Create/Edit modal — editingBook == null ⇒ "create" mode
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<BookResponse | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [bookCode, setBookCode] = useState('');
  const [isbn, setIsbn] = useState('');
  const [totalCopies, setTotalCopies] = useState('1');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await libraryService.listBooks(search.trim() || undefined);
      setBooks(res.items);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load catalog books.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setCategory('');
    setBookCode('');
    setIsbn('');
    setTotalCopies('1');
    setModalVisible(true);
  };

  /** FIX (#11): edit a catalog book — previously updateBook had zero UI callers. */
  const openEditModal = (book: BookResponse) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author ?? '');
    setCategory(book.category ?? '');
    setBookCode(book.bookCode);
    setIsbn(book.isbn ?? '');
    setTotalCopies(String(book.totalCopies));
    setModalVisible(true);
  };

  const handleSave = async () => {
    const numCopies = Number(totalCopies);
    if (!title.trim() || !bookCode.trim() || !numCopies || numCopies < 1) {
      Alert.alert('Validation Error', 'Title, book code, and valid copy count are required.');
      return;
    }

    try {
      setSaving(true);
      if (editingBook) {
        await libraryService.updateBook(editingBook.id, {
          title: title.trim(),
          author: author.trim() || null,
          category: category.trim() || null,
          bookCode: bookCode.trim(),
          isbn: isbn.trim() || null,
          totalCopies: numCopies,
        });
      } else {
        await libraryService.createBook({
          title: title.trim(),
          author: author.trim() || null,
          category: category.trim() || null,
          bookCode: bookCode.trim(),
          isbn: isbn.trim() || null,
          totalCopies: numCopies,
        });
      }

      setModalVisible(false);
      fetchBooks();
      Alert.alert('Success', editingBook ? 'Book updated.' : 'Book added to catalog.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save book.');
    } finally {
      setSaving(false);
    }
  };

  /** FIX (#11): activate/deactivate a book — previously setBookActive had no UI. */
  const handleToggleActive = (book: BookResponse) => {
    const target = !book.isActive;
    Alert.alert(
      target ? 'Activate Book' : 'Deactivate Book',
      target
        ? `"${book.title}" will become issuable again.`
        : `"${book.title}" will stop being issuable. Existing issues are not affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: target ? 'Activate' : 'Deactivate',
          style: target ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await libraryService.setBookActive(book.id, target);
              fetchBooks();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update book status.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader title="Library Catalog" subtitle="Search, edit and manage book catalog entries" />
      </View>

      <View className="px-4 mb-3">
        <FormField
          label="Search Title / Author / Code"
          value={search}
          onChangeText={setSearch}
          placeholder="Type to search..."
          onSubmitEditing={fetchBooks}
        />

        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-base font-body-bold text-slate-800">Catalog Books ({books.length})</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="bg-secondary-500 px-3 py-2 rounded-xl flex-row items-center"
              onPress={() => router.push('/(admin)/library/issued')}
            >
              <Ionicons name="swap-horizontal-outline" size={14} color="#ffffff" />
              <Text className="text-xs font-body-bold text-white ml-1">Circulation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary-500 px-3 py-2 rounded-xl"
              onPress={openCreateModal}
            >
              <Text className="text-xs font-body-bold text-white">+ Add Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {books.length > 0 ? (
          books.map((b) => (
            <View
              key={b.id}
              className="bg-white p-4 rounded-2xl border border-primary-100 shadow-sm mb-3"
            >
              <View className="flex-row justify-between items-start mb-1">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-body-bold text-slate-800">
                    {b.title} <Text className="text-xs text-slate-400">(Code: {b.bookCode})</Text>
                  </Text>
                  <Text className="text-xs font-body text-slate-500">
                    Author: {b.author || 'N/A'} | Available: {b.availableCopies}/{b.totalCopies}
                    {b.category ? ` | ${b.category}` : ''}
                  </Text>
                </View>
                <View
                  className={`px-2.5 py-0.5 rounded-full ${
                    !b.isActive ? 'bg-slate-200' : b.availableCopies > 0 ? 'bg-mint-100' : 'bg-coral-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-body-bold ${
                      !b.isActive ? 'text-slate-600' : b.availableCopies > 0 ? 'text-mint-700' : 'text-coral-700'
                    }`}
                  >
                    {!b.isActive ? 'Inactive' : b.availableCopies > 0 ? 'In Stock' : 'Out of Stock'}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2 mt-2 pt-2 border-t border-slate-100">
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-2 rounded-xl bg-primary-50 border border-primary-100"
                  onPress={() => openEditModal(b)}
                >
                  <Ionicons name="create-outline" size={14} color="#0284c7" />
                  <Text className="text-xs font-body-bold text-primary-600 ml-1">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center py-2 rounded-xl border ${
                    b.isActive
                      ? 'bg-coral-50 border-coral-200'
                      : 'bg-mint-50 border-mint-200'
                  }`}
                  onPress={() => handleToggleActive(b)}
                >
                  <Ionicons
                    name={b.isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                    size={14}
                    color={b.isActive ? '#e11d48' : '#059669'}
                  />
                  <Text
                    className={`text-xs font-body-bold ml-1 ${
                      b.isActive ? 'text-coral-600' : 'text-mint-600'
                    }`}
                  >
                    {b.isActive ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon="book-outline" title="No Books Found" message="No catalog books match your search." />
        )}
      </ScrollView>

      {/* Create / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setModalVisible(false)}>
          <Pressable className="bg-white p-6 rounded-t-3xl border-t border-primary-100" onPress={(e) => e.stopPropagation()}>
            <Text className="text-lg font-body-bold text-slate-800 mb-4">
              {editingBook ? 'Edit Catalog Book' : 'Add Catalog Book'}
            </Text>

            <FormField label="Title *" value={title} onChangeText={setTitle} placeholder="Book title" />
            <FormField label="Book Code *" value={bookCode} onChangeText={setBookCode} placeholder="Unique Code/ID" />
            <FormField label="Author" value={author} onChangeText={setAuthor} placeholder="Author name" />
            <FormField label="Category" value={category} onChangeText={setCategory} placeholder="e.g. Science, Fiction" />
            <FormField label="ISBN" value={isbn} onChangeText={setIsbn} placeholder="Optional ISBN" />
            <FormField label="Total Copies *" value={totalCopies} onChangeText={setTotalCopies} placeholder="1" keyboardType="numeric" />

            <View className="flex-row gap-3 mt-2">
              <View className="flex-1">
                <PrimaryButton label="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
              </View>
              <View className="flex-1">
                <PrimaryButton
                  label={editingBook ? 'Save Changes' : 'Save Book'}
                  onPress={handleSave}
                  isLoading={saving}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}