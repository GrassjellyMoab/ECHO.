import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PopularTopicsProps {
  topics?: string[];
  onTopicPress?: (topic: string) => void;
}

export const PopularTopics = ({ 
  topics = ['Cybersecurity', 'Technology', 'Health', 'Finance', 'Politics', 'Sports'],
  onTopicPress 
}: PopularTopicsProps) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Popular Topics</Text>
      <View style={styles.topicsContainer}>
        {topics.map((topic, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.topicTag}
            onPress={() => onTopicPress?.(topic)}
          >
            <Text style={styles.topicText}>{topic}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    fontFamily: 'AnonymousPro-Bold',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicTag: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  topicText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'AnonymousPro-Bold',
  },
});