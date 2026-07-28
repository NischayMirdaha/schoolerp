import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenHeader from '../../../components/ScreenHeader';
import FormField from '../../../components/FormField';
import PrimaryButton from '../../../components/PrimaryButton';
import { feeService } from '../../../services/feeService';

type Operation =
  | 'classAmount'
  | 'charges'
  | 'openingBalance'
  | 'adjustment'
  | 'directPayment';

const today = new Date().toISOString().slice(0, 10);

function requiredPositiveId(value: string, label: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive whole number.`);
  }

  return parsed;
}

function requiredPositiveAmount(value: string): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  return parsed;
}

export default function FeeOperationsScreen() {
  const [operation, setOperation] =
    useState<Operation>('classAmount');
  const [saving, setSaving] = useState(false);

  const [feeHeadId, setFeeHeadId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [amount, setAmount] = useState('');
  const [year, setYear] = useState(
    String(new Date().getFullYear())
  );
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1)
  );
  const [description, setDescription] = useState('');
  const [adjustmentType, setAdjustmentType] =
    useState<'credit' | 'waived'>('credit');
  const [paymentMethod, setPaymentMethod] =
    useState<'cash' | 'cheque' | 'bank' | 'other'>('cash');
  const [paymentDate, setPaymentDate] = useState(today);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('');

  const clearTransactionFields = () => {
    setAmount('');
    setDescription('');
    setReferenceNumber('');
    setNote('');
  };

  const save = async () => {
    try {
      setSaving(true);

      const academicYear = requiredPositiveId(
        academicYearId,
        'Academic year ID'
      );

      if (operation === 'classAmount') {
        const result = await feeService.setFeeHeadClassAmount(
          requiredPositiveId(feeHeadId, 'Fee head ID'),
          {
            classId: requiredPositiveId(classId, 'Class ID'),
            academicYearId: academicYear,
            amount: requiredPositiveAmount(amount),
          }
        );

        Alert.alert(
          'Class amount saved',
          `Fee head ${result.feeHeadId} will charge NPR ${result.amount} for class ${result.classId}.`
        );
      }

      if (operation === 'charges') {
        const chargeYear = requiredPositiveId(year, 'Year');
        const chargeMonth = month.trim()
          ? requiredPositiveId(month, 'Month')
          : undefined;

        if (
          chargeMonth !== undefined &&
          (chargeMonth < 1 || chargeMonth > 12)
        ) {
          throw new Error('Month must be between 1 and 12.');
        }

        const result = await feeService.postPeriodicCharges({
          feeHeadId: requiredPositiveId(
            feeHeadId,
            'Fee head ID'
          ),
          academicYearId: academicYear,
          classId: classId.trim()
            ? requiredPositiveId(classId, 'Class ID')
            : undefined,
          sectionId: sectionId.trim()
            ? requiredPositiveId(sectionId, 'Section ID')
            : undefined,
          studentIds: studentId.trim()
            ? [
                requiredPositiveId(
                  studentId,
                  'Student ID'
                ),
              ]
            : undefined,
          year: chargeYear,
          month: chargeMonth,
        });

        Alert.alert(
          'Charges posted',
          [
            `Charged: ${result.chargedCount}`,
            `Skipped: ${result.skippedCount}`,
            `Reference: ${result.referenceNumber}`,
          ].join('\n')
        );
      }

      if (operation === 'openingBalance') {
        const result = await feeService.postOpeningBalance({
          studentId: requiredPositiveId(
            studentId,
            'Student ID'
          ),
          academicYearId: academicYear,
          amount: requiredPositiveAmount(amount),
          description: description.trim() || undefined,
        });

        Alert.alert(
          'Opening balance posted',
          `New outstanding balance: NPR ${result.balanceAfter.toFixed(
            2
          )}`
        );
      }

      if (operation === 'adjustment') {
        const result = await feeService.postLedgerAdjustment({
          studentId: requiredPositiveId(
            studentId,
            'Student ID'
          ),
          academicYearId: academicYear,
          type: adjustmentType,
          amount: requiredPositiveAmount(amount),
          description: description.trim() || undefined,
        });

        Alert.alert(
          'Adjustment posted',
          `New outstanding balance: NPR ${result.balanceAfter.toFixed(
            2
          )}`
        );
      }

      if (operation === 'directPayment') {
        const result = await feeService.enterDirectPayment({
          studentId: requiredPositiveId(
            studentId,
            'Student ID'
          ),
          academicYearId: academicYear,
          amount: requiredPositiveAmount(amount),
          paymentMethod,
          paymentDate,
          referenceNumber:
            referenceNumber.trim() || undefined,
          note: note.trim() || undefined,
        });

        Alert.alert(
          'Payment recorded',
          [
            `Receipt: ${result.receiptNumber}`,
            `Amount: NPR ${result.amount.toFixed(2)}`,
            `Remaining dues: NPR ${result.newBalance.toFixed(2)}`,
          ].join('\n')
        );
      }

      clearTransactionFields();
    } catch (error: any) {
      Alert.alert(
        'Unable to save',
        error?.message || 'The operation failed.'
      );
    } finally {
      setSaving(false);
    }
  };

  const operationButtons: {
    id: Operation;
    label: string;
  }[] = [
    { id: 'classAmount', label: 'Class Amount' },
    { id: 'charges', label: 'Post Charges' },
    { id: 'openingBalance', label: 'Opening Balance' },
    { id: 'adjustment', label: 'Adjustment' },
    { id: 'directPayment', label: 'Direct Payment' },
  ];

  return (
    <View className="flex-1 bg-cream-100">
      <View className="p-4 pt-12">
        <ScreenHeader
          title="Finance Operations"
          subtitle="Configure charges and post student ledger transactions"
        />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="mb-2 text-xs font-body-semibold text-slate-600">
          Choose operation
        </Text>

        <View className="mb-5 flex-row flex-wrap gap-2">
          {operationButtons.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setOperation(item.id)}
              className={`rounded-xl border px-3 py-2 ${
                operation === item.id
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-primary-100 bg-white'
              }`}
            >
              <Text
                className={`text-xs font-body-bold ${
                  operation === item.id
                    ? 'text-white'
                    : 'text-slate-700'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="rounded-3xl border border-primary-100 bg-white p-5">
          <Text className="mb-4 text-lg font-body-bold text-slate-800">
            {
              operationButtons.find(
                (item) => item.id === operation
              )?.label
            }
          </Text>

          {(operation === 'classAmount' ||
            operation === 'charges') && (
            <FormField
              label="Fee Head ID *"
              value={feeHeadId}
              onChangeText={setFeeHeadId}
              placeholder="Example: 1"
              keyboardType="number-pad"
            />
          )}

          <FormField
            label="Academic Year ID *"
            value={academicYearId}
            onChangeText={setAcademicYearId}
            placeholder="Example: 1"
            keyboardType="number-pad"
          />

          {(operation === 'classAmount' ||
            operation === 'charges') && (
            <FormField
              label={
                operation === 'classAmount'
                  ? 'Class ID *'
                  : 'Class ID (optional)'
              }
              value={classId}
              onChangeText={setClassId}
              placeholder="Example: 4"
              keyboardType="number-pad"
            />
          )}

          {operation === 'charges' && (
            <>
              <FormField
                label="Section ID (optional)"
                value={sectionId}
                onChangeText={setSectionId}
                placeholder="Leave empty for all sections"
                keyboardType="number-pad"
              />

              <FormField
                label="Student ID (optional)"
                value={studentId}
                onChangeText={setStudentId}
                placeholder="Leave empty to charge matching students"
                keyboardType="number-pad"
              />

              <FormField
                label="Calendar Year *"
                value={year}
                onChangeText={setYear}
                placeholder="2026"
                keyboardType="number-pad"
              />

              <FormField
                label="Month"
                value={month}
                onChangeText={setMonth}
                placeholder="1 to 12"
                keyboardType="number-pad"
              />
            </>
          )}

          {(operation === 'openingBalance' ||
            operation === 'adjustment' ||
            operation === 'directPayment') && (
            <FormField
              label="Student ID *"
              value={studentId}
              onChangeText={setStudentId}
              placeholder="Example: 12"
              keyboardType="number-pad"
            />
          )}

          {operation !== 'charges' && (
            <FormField
              label="Amount (NPR) *"
              value={amount}
              onChangeText={setAmount}
              placeholder="Example: 2500"
              keyboardType="decimal-pad"
            />
          )}

          {operation === 'adjustment' && (
            <>
              <Text className="mb-2 text-xs font-body-semibold text-slate-600">
                Adjustment type *
              </Text>

              <View className="mb-4 flex-row gap-2">
                {(['credit', 'waived'] as const).map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() =>
                        setAdjustmentType(type)
                      }
                      className={`flex-1 items-center rounded-xl border py-3 ${
                        adjustmentType === type
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-primary-100 bg-cream-50'
                      }`}
                    >
                      <Text
                        className={`text-xs font-body-bold ${
                          adjustmentType === type
                            ? 'text-white'
                            : 'text-slate-700'
                        }`}
                      >
                        {type.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </>
          )}

          {(operation === 'openingBalance' ||
            operation === 'adjustment') && (
            <FormField
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Reason or internal note"
            />
          )}

          {operation === 'directPayment' && (
            <>
              <Text className="mb-2 text-xs font-body-semibold text-slate-600">
                Payment method *
              </Text>

              <View className="mb-4 flex-row flex-wrap gap-2">
                {(
                  [
                    'cash',
                    'cheque',
                    'bank',
                    'other',
                  ] as const
                ).map((method) => (
                  <TouchableOpacity
                    key={method}
                    onPress={() =>
                      setPaymentMethod(method)
                    }
                    className={`rounded-xl border px-4 py-2 ${
                      paymentMethod === method
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-primary-100 bg-cream-50'
                    }`}
                  >
                    <Text
                      className={`text-xs font-body-bold ${
                        paymentMethod === method
                          ? 'text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {method.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FormField
                label="Payment Date *"
                value={paymentDate}
                onChangeText={setPaymentDate}
                placeholder="YYYY-MM-DD"
              />

              <FormField
                label="Reference Number"
                value={referenceNumber}
                onChangeText={setReferenceNumber}
                placeholder="Cheque, bank, or transaction reference"
              />

              <FormField
                label="Note"
                value={note}
                onChangeText={setNote}
                placeholder="Optional payment note"
              />
            </>
          )}

          <PrimaryButton
            label={
              operation === 'classAmount'
                ? 'Save Class Amount'
                : operation === 'charges'
                ? 'Post Charges'
                : operation === 'openingBalance'
                ? 'Post Opening Balance'
                : operation === 'adjustment'
                ? 'Post Adjustment'
                : 'Record Direct Payment'
            }
            onPress={save}
            isLoading={saving}
          />
        </View>

        <View className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Text className="text-sm font-body-bold text-amber-800">
            Recommended order
          </Text>
          <Text className="mt-1 text-xs font-body text-amber-700">
            1. Create fee heads{'\n'}
            2. Set amounts for every applicable class and academic year
            {'\n'}
            3. Post monthly or yearly charges{'\n'}
            4. Enter payments or process parent claims
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}