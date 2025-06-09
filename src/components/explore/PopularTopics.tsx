import { getTextColorForTag, tagColors } from '@/src/constants/posts';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PopularTopicsProps {
  onTopicPress?: (topic: string) => void;
}

const PopularTopics = ({ onTopicPress }: PopularTopicsProps) => {
  const topics = ['Health', 'Politics', 'Finance', 'Technology', 'Cybersecurity'];
  
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Popular Topics</Text>
      <View style={styles.topicsContainer}>
        {topics.map((topic, index) => {
          const backgroundColor = tagColors[topic.toLowerCase()] || tagColors.default;
          const textColor = getTextColorForTag(backgroundColor);
          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.topicTag, { backgroundColor }]}
              onPress={() => onTopicPress?.(topic)}
            >
              <Text style={[styles.topicText, { color: textColor }]}>{topic}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PopularTopics;

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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  topicText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
  },
});