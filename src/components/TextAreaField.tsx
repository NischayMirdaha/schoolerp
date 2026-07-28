import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface TextAreaFieldProps extends TextInputProps {
  label: string;
  error?: string;
  /** Visible height in lines. Default 6. */
  minLines?: number;
  /** Shows a live "123 / 1000" counter when set. */
  maxLength?: number;
}

/**
 * Multi-line message box for longer free text (homework instructions, remarks).
 *
 * FormField centres its input inside a `flex-row items-center` wrapper, which
 * collapses a multiline TextInput to a single visible line regardless of
 * numberOfLines. This component uses a column layout with an explicit minHeight
 * and top-aligned text so the box actually looks and behaves like a message box.
 */
export default function TextAreaField({
  label,
  error,
  minLines = 6,
  maxLength,
  value,
  ...inputProps
}: TextAreaFieldProps) {
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-slate-700 font-body-semibold text-sm">{label}</Text>
        {maxLength ? (
          <Text
            className={`font-body text-xs ${
              charCount > maxLength * 0.9 ? 'text-coral-600' : 'text-slate-400'
            }`}
          >
            {charCount} / {maxLength}
          </Text>
        ) : null}
      </View>

      <View
        className={`bg-cream-50 rounded-2xl border px-4 py-3 ${
          error ? 'border-coral-300' : 'border-primary-100'
        }`}
      >
        <TextInput
          className="text-slate-900 font-body text-base"
          placeholderTextColor="#94a3b8"
          multiline
          // Android aligns multiline text vertically centre without this.
          textAlignVertical="top"
          scrollEnabled
          maxLength={maxLength}
          value={value}
          style={{ minHeight: minLines * 22 }}
          {...inputProps}
        />
      </View>

      {error ? <Text className="text-coral-600 font-body text-xs mt-1">{error}</Text> : null}
    </View>
  );
}