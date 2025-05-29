import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MainTabScreenProps } from '../types/navigation';

type Props = MainTabScreenProps<'Home'>;

const MainScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Forum Threads</Text>
        {/* Thread list will be added here */}
        <View style={styles.threadPlaceholder}>
          <Text style={styles.placeholderText}>Thread list will appear here</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  threadPlaceholder: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
  },
});

export default MainScreen; 