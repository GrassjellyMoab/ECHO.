import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

const TabBarBackground = () => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint="light"
        intensity={100}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return <View style={[StyleSheet.absoluteFill, styles.default]} />;
};

const styles = StyleSheet.create({
  default: {
    backgroundColor: '#ffffff',
  },
});

export default () => <TabBarBackground />; 