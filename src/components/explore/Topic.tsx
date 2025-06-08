import { IconSymbol } from '@/src/components/ui/IconSymbol';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Discussion {
  id: number;
  title: string;
  author: string;
  timeAgo: string;
  voters: number;
  avatar: string;
}

interface TopicsProps {
  onBack?: () => void;
}

const Topics = ({ onBack }: TopicsProps) => {
  const [selectedSort, setSelectedSort] = useState('MOST VOTERS');

  const discussions: Discussion[] = [
    {
      id: 1,
      title: "Did PAP win Sengkang GRC?",
      author: "User1",
      timeAgo: "9 days ago",
      voters: 987,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 2,
      title: "Worker's Party running against PM La...",
      author: "User2",
      timeAgo: "6 days ago",
      voters: 793,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e70bb8?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 3,
      title: "Lawrence Wong the new Prime Minister of...",
      author: "User3",
      timeAgo: "2 days ago",
      voters: 734,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 4,
      title: "Ministry of Health has retrenched ma...",
      author: "User4",
      timeAgo: "3 days ago",
      voters: 696,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 5,
      title: "The government made a deal with Lady...",
      author: "User5",
      timeAgo: "9 days ago",
      voters: 650,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 6,
      title: "Ministry of Health has retrenched ma...",
      author: "User6",
      timeAgo: "5 days ago",
      voters: 542,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face"
    }
  ];

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navigationHeader}>
        <View style={styles.headerContent}>
          <IconSymbol name="person" size={20} color="#666" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Politics</Text>
            <View style={styles.headerSubtitleContainer}>
              <View style={styles.dot} />
              <Text style={styles.headerSubtitle}>320 vigilants</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sort Filter */}
      <View style={styles.sortFilter}>
        <IconSymbol name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {/* Handle sort change */ }}
        >
          <Text style={styles.sortText}>{selectedSort}</Text>
          <IconSymbol name="chevron.down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Discussion List */}
      <ScrollView style={styles.discussionList}>
        {discussions.map((discussion: Discussion, index: number) => (
          <TouchableOpacity key={discussion.id} style={styles.discussionItem}>
            <Text style={styles.discussionTitle}>
              {discussion.title}
            </Text>
            <View style={styles.discussionMeta}>
              <Image
                source={{ uri: discussion.avatar }}
                style={styles.avatar}
              />
              <View style={styles.metaText}>
                <Text style={styles.metaItem}>{discussion.timeAgo}</Text>
                <Text style={styles.metaItem}> | </Text>
                <Text style={styles.metaItem}>Politics</Text>
                <Text style={styles.metaItem}> | </Text>
                <Text style={styles.metaItem}>{discussion.voters} voters</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9C27B0',
    marginRight: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  sortFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  discussionList: {
    flex: 1,
  },
  discussionItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
  },
  discussionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  metaText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaItem: {
    fontSize: 14,
    color: '#666',
  },
});

export default Topics;