import React from 'react';
import { useRoute } from '@react-navigation/native';
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function ThreadPage() {
    const route = useRoute();
  const { thread } = route.params;

  return (
    <View>
      <Text>{thread.title}</Text>
      {/* render other thread details */}
    </View>
  );
}

export default ThreadPage;