import React from 'react';
import { ActivityIndicator, View } from 'react-native';

/** Centered loading indicator matching the app's cream background. */
export default function LoadingSpinner() {
  return (
    <View className="flex-1 items-center justify-center bg-cream-100">
      <ActivityIndicator size="large" color="#0ea5e9" />
    </View>
  );
}
