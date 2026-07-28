import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { SchoolService } from '../../../services/schoolService';
import {
  SchoolResponse,
  UpdateSchoolRequest,
  PrincipalResponse,
  CreatePrincipalRequest,
  UpdatePrincipalRequest,
} from '../../../types/school';

export default function SchoolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const schoolId = Number(id);
  const router = useRouter();

  const [school, setSchool] = useState<SchoolResponse | null>(null);
  const [principal, setPrincipal] = useState<PrincipalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Payment instructions shown to parents.
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] =
    useState('');
  const [bankAccountName, setBankAccountName] =
    useState('');
  const [bankBranch, setBankBranch] = useState('');

  // Principal form state
  const [showPrincipalForm, setShowPrincipalForm] = useState(false);
  const [isSavingPrincipal, setIsSavingPrincipal] = useState(false);
  const [pUsername, setPUsername] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pFirstName, setPFirstName] = useState('');
  const [pLastName, setPLastName] = useState('');
  const [pPhone, setPPhone] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await SchoolService.getSchool(schoolId);
      setSchool(data);
      const [name, setName] = useState('');
      const [code, setCode] = useState('');
      const [address, setAddress] = useState('');
      const [phone, setPhone] = useState('');
      const [email, setEmail] = useState('');

      // Payment instructions shown to parents.
      const [bankName, setBankName] = useState('');
      const [bankAccountNumber, setBankAccountNumber] =
        useState('');
      const [bankAccountName, setBankAccountName] =
        useState('');
      const [bankBranch, setBankBranch] = useState('');
    } catch {
      Alert.alert('Error', 'Could not load this school.');
    }

    try {
      const principalData = await SchoolService.getPrincipal(schoolId);
      setPrincipal(principalData);
      setPFirstName(principalData.firstName);
      setPLastName(principalData.lastName || '');
      setPPhone(principalData.phone || '');
    } catch {
      setPrincipal(null);
    }
  }, [schoolId]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, [load]);

  const handleSaveSchool = async () => {
    if (!school) return;
    if (!name.trim() || !code.trim()) {
      Alert.alert('Validation Error', 'School name and code are required.');
      return;
    }

    setIsSaving(true);
    try {
      const request: UpdateSchoolRequest = {
        name: name.trim(),
        code: code.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        logoPath: school.logoPath,
        sealImagePath: school.sealImagePath,
        qrCodePath: school.qrCodePath,
        bankName: bankName.trim() || null,
        bankAccountNumber:
          bankAccountNumber.trim() || null,
        bankAccountName:
          bankAccountName.trim() || null,
        bankBranch: bankBranch.trim() || null,
        defaultPassMark: school.defaultPassMark,
        maxBooksPerStudent: school.maxBooksPerStudent,
        feeReminderDaysBeforeDue: school.feeReminderDaysBeforeDue,
        feeReminderDaysAfterDue: school.feeReminderDaysAfterDue,
        libraryOverdueReminderDays: school.libraryOverdueReminderDays,
      };
      const updated = await SchoolService.updateSchool(schoolId, request);
      setSchool(updated);
      Alert.alert('Saved', 'School details updated.');
    } catch (error: any) {
      Alert.alert('Could not save', error.message || 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = () => {
    if (!school) return;
    const willActivate = !school.isActive;
    Alert.alert(
      willActivate ? 'Activate School' : 'Deactivate School',
      `Are you sure you want to ${willActivate ? 'activate' : 'deactivate'} "${school.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: willActivate ? 'Activate' : 'Deactivate',
          style: willActivate ? 'default' : 'destructive',
          onPress: async () => {
            setIsTogglingActive(true);
            try {
              await SchoolService.toggleSchoolActive(schoolId);
              await load();
            } catch (error: any) {
              Alert.alert('Could not update status', error.message || 'Please try again.');
            } finally {
              setIsTogglingActive(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert('Delete School', `Are you sure you want to permanently delete "${school?.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await SchoolService.deleteSchool(schoolId);
            router.replace('/(admin)/schools');
          } catch (error: any) {
            Alert.alert('Could not delete', error.message || 'Please try again.');
          }
        },
      },
    ]);
  };

  const handleSavePrincipal = async () => {
    if (!principal && (!pUsername.trim() || !pEmail.trim() || !pFirstName.trim())) {
      Alert.alert('Validation Error', 'Username, email, and first name are required.');
      return;
    }
    if (principal && !pFirstName.trim()) {
      Alert.alert('Validation Error', 'First name is required.');
      return;
    }

    setIsSavingPrincipal(true);
    try {
      if (principal) {
        const request: UpdatePrincipalRequest = {
          firstName: pFirstName.trim(),
          lastName: pLastName.trim() || null,
          phone: pPhone.trim() || null,
          address: null,
          gender: null,
          dob: null,
        };
        const updated = await SchoolService.updatePrincipal(schoolId, request);
        setPrincipal(updated);
      } else {
        const request: CreatePrincipalRequest = {
          username: pUsername.trim(),
          email: pEmail.trim(),
          firstName: pFirstName.trim(),
          lastName: pLastName.trim() || null,
          phone: pPhone.trim() || null,
        };
        const created = await SchoolService.createPrincipal(schoolId, request);
        setPrincipal(created);
      }
      setShowPrincipalForm(false);
    } catch (error: any) {
      Alert.alert('Could not save principal', error.message || 'Please try again.');
    } finally {
      setIsSavingPrincipal(false);
    }
  };

  const handleRemovePrincipal = () => {
    Alert.alert('Remove Principal', 'Are you sure you want to remove this school\'s principal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await SchoolService.deletePrincipal(schoolId);
            setPrincipal(null);
          } catch (error: any) {
            Alert.alert('Could not remove', error.message || 'Please try again.');
          }
        },
      },
    ]);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-cream-100 px-6 pt-10">
      <ScreenHeader
        title={school?.name || 'School'}
        subtitle={`Code: ${school?.code || ''}`}
        rightAction={
          <TouchableOpacity
            className={`px-3 py-2 rounded-full ${school?.isActive ? 'bg-mint-100' : 'bg-coral-100'}`}
            onPress={handleToggleActive}
            disabled={isTogglingActive}
          >
            <Text className={`font-body-bold text-xs ${school?.isActive ? 'text-mint-600' : 'text-coral-600'}`}>
              {school?.isActive ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm mb-4">
          <Text className="text-base font-body-bold text-slate-800 mb-3">
            School Details
          </Text>

          <FormField
            label="School Name"
            icon="business-outline"
            value={name}
            onChangeText={setName}
          />

          <FormField
            label="School Code"
            icon="pricetag-outline"
            autoCapitalize="characters"
            value={code}
            onChangeText={setCode}
          />

          <FormField
            label="Address"
            icon="location-outline"
            value={address}
            onChangeText={setAddress}
          />

          <FormField
            label="Phone"
            icon="call-outline"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <FormField
            label="Email"
            icon="mail-outline"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <View className="my-4 border-t border-slate-100" />

          <Text className="text-base font-body-bold text-slate-800 mb-1">
            Parent Payment Instructions
          </Text>

          <Text className="text-xs font-body text-slate-500 mb-4">
            These bank details are displayed to parents on the
            Fee & Payments screen. Enter only verified school account
            information.
          </Text>

          <FormField
            label="Bank Name"
            icon="business-outline"
            value={bankName}
            onChangeText={setBankName}
            placeholder="Example: Nabil Bank"
          />

          <FormField
            label="Bank Account Number"
            icon="card-outline"
            value={bankAccountNumber}
            onChangeText={setBankAccountNumber}
            placeholder="School bank account number"
            autoCapitalize="none"
          />

          <FormField
            label="Bank Account Name"
            icon="person-outline"
            value={bankAccountName}
            onChangeText={setBankAccountName}
            placeholder="Official account holder name"
          />

          <FormField
            label="Bank Branch"
            icon="location-outline"
            value={bankBranch}
            onChangeText={setBankBranch}
            placeholder="Optional branch name"
          />

          <View className="rounded-2xl border border-amber-200 bg-amber-50 p-3 mb-4">
            <Text className="text-xs font-body text-amber-800">
              Carefully verify the account number before saving.
              Parents will use this information to transfer money
              outside the SchoolMS application.
            </Text>
          </View>

          <PrimaryButton
            label="Save School & Payment Details"
            icon="checkmark"
            onPress={handleSaveSchool}
            isLoading={isSaving}
          />
        </View>

        {/* Principal Section */}
        <View className="bg-white p-6 rounded-3xl border border-secondary-100 shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-body-bold text-slate-800">Principal</Text>
            {principal && !showPrincipalForm ? (
              <TouchableOpacity onPress={handleRemovePrincipal}>
                <Ionicons name="trash-outline" size={18} color="#e11d48" />
              </TouchableOpacity>
            ) : null}
          </View>

          {!principal && !showPrincipalForm ? (
            <View className="items-center py-4">
              <Text className="text-slate-500 font-body text-sm mb-4 text-center">
                No principal assigned to this school yet.
              </Text>
              <PrimaryButton
                label="Assign Principal"
                icon="person-add-outline"
                variant="outline"
                onPress={() => setShowPrincipalForm(true)}
              />
            </View>
          ) : showPrincipalForm ? (
            <>
              {!principal ? (
                <>
                  <FormField label="Username" icon="at-outline" autoCapitalize="none" value={pUsername} onChangeText={setPUsername} />
                  <FormField label="Email" icon="mail-outline" autoCapitalize="none" keyboardType="email-address" value={pEmail} onChangeText={setPEmail} />
                </>
              ) : null}
              <FormField label="First Name" icon="person-outline" value={pFirstName} onChangeText={setPFirstName} />
              <FormField label="Last Name" icon="person-outline" value={pLastName} onChangeText={setPLastName} />
              <FormField label="Phone" icon="call-outline" keyboardType="phone-pad" value={pPhone} onChangeText={setPPhone} />
              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <PrimaryButton label="Cancel" variant="outline" onPress={() => setShowPrincipalForm(false)} />
                </View>
                <View className="flex-1 ml-2">
                  <PrimaryButton label="Save" icon="checkmark" onPress={handleSavePrincipal} isLoading={isSavingPrincipal} />
                </View>
              </View>
            </>
          ) : (
            <TouchableOpacity onPress={() => setShowPrincipalForm(true)}>
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-secondary-100 rounded-2xl items-center justify-center mr-4">
                  <Text className="text-secondary-600 font-heading text-lg">
                    {(principal!.firstName[0] || '').toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-body-bold text-slate-800">
                    {principal!.firstName} {principal!.lastName}
                  </Text>
                  <Text className="text-slate-500 font-body text-xs mt-0.5">{principal!.email}</Text>
                </View>
                <Ionicons name="pencil-outline" size={18} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Danger Zone */}
        <TouchableOpacity
          className="my-4 py-4 rounded-2xl bg-white border border-coral-200 items-center shadow-sm active:bg-coral-50 flex-row justify-center"
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color="#e11d48" style={{ marginRight: 6 }} />
          <Text className="text-coral-600 font-body-bold text-base">Delete School</Text>
        </TouchableOpacity>
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
