import React from 'react';
import { useRoute } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
import { Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ThreadData {
  id: string;
  author: string;
  title: string;
  timeAgo: string;
  dateCreated: Timestamp;
  readTime: string;
  views: string;
  comments: string;
  votes: string;
  tags: string[];
  hasImage?: boolean;
  isVerified?: boolean;
  avatar?: string;
  threadImageUrl?: string;
}

function ThreadPage() {
    const route = useRoute();
  const { ThreadData: thread } = route.params;

  return (
    <View>
      <Text>{thread.title}</Text>
      {/* render other thread details */}
    </View>
  );
}

export default ThreadPage;