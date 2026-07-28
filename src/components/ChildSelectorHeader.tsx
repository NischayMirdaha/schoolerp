import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useActiveChild } from '../context/ActiveChildContext';

export default function ChildSelectorHeader() {
  const { childrenList, activeChild, selectChild } = useActiveChild();

  if (childrenList.length <= 1) return null;

  return (
    <View className="mb-4">
      <Text className="text-slate-500 font-body-semibold text-xs mb-2 uppercase tracking-wider">
        Select Child Profile
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {childrenList.map((child) => {
          const isSelected = activeChild?.studentId === child.studentId;
          const initials = `${child.firstName?.[0] || ''}${child.lastName?.[0] || ''}`.toUpperCase();
          return (
            <TouchableOpacity
              key={child.studentId}
              onPress={() => selectChild(child)}
              className={`mr-3 px-3 py-2.5 rounded-2xl flex-row items-center border shadow-sm ${
                isSelected
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-white border-primary-100 active:bg-primary-50'
              }`}
            >
              <View
                className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${
                  isSelected ? 'bg-white/20' : 'bg-primary-100'
                }`}
              >
                <Text
                  className={`font-body-bold text-xs ${isSelected ? 'text-white' : 'text-primary-600'}`}
                >
                  {initials}
                </Text>
              </View>
              <View>
                <Text
                  className={`font-body-bold text-sm ${
                    isSelected ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {child.firstName} {child.lastName}
                </Text>
                <Text
                  className={`font-body text-xs ${
                    isSelected ? 'text-primary-100' : 'text-slate-500'
                  }`}
                >
                  Class {child.className}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}