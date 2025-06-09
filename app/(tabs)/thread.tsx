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
  const { thread } = route.params as { thread: string };

  // Parse the thread data from JSON string
  const threadData: ThreadData = JSON.parse(thread);
  console.log(threadData);
  console.log(threadData);
  return (
    <View>
      <Text>{threadData.id}</Text>
      {/* render other thread details */}
    </View>
  );
}

export default ThreadPage;