import { AppHeader } from '@/src/components/ui/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { getTextColorForTag, tagColors } from '@/src/constants/posts';
import { useCollectionData } from '@/src/store/dataStore';
import { useImagesStore } from '@/src/store/imgStore';
import { Timestamp } from 'firebase/firestore';
import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

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
  real_ratio : number;
  ai_verdict?: string;
  hasVoted: boolean;
}

export function useThreadData(): ThreadData[] {
  const getImagesByFolder = useImagesStore(state => state.getImagesByFolder);
  const userImages = getImagesByFolder('users');
  const threadImages = getImagesByFolder('threads');

  const users = useCollectionData('users');
  const threads = useCollectionData('threads');
  const topics = useCollectionData('topics');

  const processedThreads = useMemo(() => {
    const userMap = new Map(users.map(user => [user.id, user]));
    const topicMap = new Map(topics.map(topic => [topic.id, topic]));

    const userImageMap = new Map(
      userImages.map(img => {
        const username = img.name.replace('.png', '').toLowerCase();
        return [username, img.url];
      })
    );

    const threadImageMap = new Map(
      threadImages.map(img => {
        const threadId = img.name.replace('.png', '');
        return [threadId, img.url];
      })
    );

    return threads
      .map(thread => {
        const user = userMap.get(thread.uid);
        if (!user) return null;

        const threadTopics = thread.topics?.map((topicId: string) => {
          const topic = topicMap.get(topicId);
          return topic?.topic || { name: 'Unknown Topic', id: topicId };
        }) || [];

        const authorUsername = user.username || 'unknown';
        const authorKey = authorUsername.toLowerCase().replace('@', '');

        const avatar = userImageMap.get(authorKey) ||
          `https://via.placeholder.com/80x80/4FC3F7/ffffff?text=${authorUsername.charAt(0).toUpperCase()}`;

        const threadImageUrl = threadImageMap.get(thread.id);

        const timeAgo = thread.posted_datetime
          ? calculateTimeAgo(thread.posted_datetime.toDate())
          : 'Unknown time';

        return {
          id: thread.id,
          author: authorUsername.startsWith('@') ? authorUsername : '@' + authorUsername,
          title: thread.title || 'Untitled Thread',
          timeAgo,
          dateCreated: thread.posted_datetime,
          readTime: `${thread.read_duration} mins read`,
          views: String(thread.num_views ?? 0),
          comments: String(thread.num_comments ?? 0),
          votes: String(thread.num_votes ?? 0),
          tags: threadTopics,
          hasImage: Boolean(threadImageUrl),
          isVerified: user.role === 'admin' || user.role === 'moderator',
          avatar,
          threadImageUrl,
          real_ratio: thread.real_ratio,
          ai_verdict: thread.ai_verdict,
          hasVoted: false
        } as ThreadData;
      })
      .filter((thread): thread is ThreadData => thread !== null)
      .sort((a, b) => (b.dateCreated?.seconds ?? 0) - (a.dateCreated?.seconds ?? 0));
  }, [users, threads, topics, userImages, threadImages]); // Only recalculate when these change

  return processedThreads;
}

function calculateTimeAgo(timestamp: number | string | Date): string {
  const now = new Date();
  const time = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  const diffInMs = now.getTime() - time.getTime();

  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44); // Average days per month
  const years = Math.floor(days / 365.25); // Account for leap years

  if (years > 0) return `${years} year${years === 1 ? '' : 's'} ago`;
  if (months > 0) return `${months} month${months === 1 ? '' : 's'} ago`;
  if (weeks > 0) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  return 'Just now';
}

const TagComponent = ({ tag }: { tag: string }) => {
  const getTagColor = (tagName: string) => {
    return tagColors[tagName.toLowerCase()] || tagColors.default;
  };

  const backgroundColor = getTagColor(tag);
  const textColor = getTextColorForTag(backgroundColor);

  return (
    <View style={[styles.tag, { backgroundColor }]}>
      <Text style={[styles.tagText, { color: textColor }]}>{tag}</Text>
    </View>
  );
};

const ThreadCard = ({ thread }: { thread: ThreadData }) => {
  const router = useRouter();

  function navigateToThreadPage(thread: ThreadData){
    router.push({
    pathname: '/home/thread',
    params: { thread: JSON.stringify(thread)},
  });
  }

  return (
    <TouchableOpacity style={styles.threadCard} onPress={() => navigateToThreadPage(thread)}>
      <View style={styles.threadHeader}>
        <View style={styles.authorContainer}>
          {thread.avatar ? (
            <Image source={{ uri: thread.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
          )}
          <View style={styles.authorInfo}>
            <View style={styles.authorRow}>
              <Text style={styles.authorName}>{thread.author}</Text>
              {thread.isVerified && (
                <IconSymbol name="checkmark.circle.fill" style={styles.icons} />
              )}
            </View>
            <Text style={styles.threadMeta}>{thread.timeAgo} • {thread.readTime}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.subscribeButton}>
          <Text style={styles.subscribeText}>Subscribe</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.threadTitle}>{thread.title}</Text>

      <View style={styles.tagsContainer}>
        {thread.tags.map((tag, index) => (
          <TagComponent key={index} tag={tag} />
        ))}
      </View>

      {thread.hasImage && (
        <Image
          source={{ uri: thread.threadImageUrl ? thread.threadImageUrl : '' }}
          style={styles.threadImage}
        />
      )}

      <View style={styles.threadStats}>
        <View style={styles.statItem}>
          <IconSymbol name="eye" style={styles.icons} />
          <Text style={styles.statText}>{thread.views} Views</Text>
        </View>
        <View style={styles.statItem}>
          <IconSymbol name="message" style={styles.icons} />
          <Text style={styles.statText}>{thread.comments} Comments</Text>
        </View>
        <View style={styles.statItem}>
          <IconSymbol name="arrow.up" style={styles.icons} />
          <Text style={styles.statText}>{thread.votes} Votes</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const mockThreads = useThreadData();

  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
      <AppHeader />

      <View style={styles.highlightsSection}>
        <Text style={styles.sectionTitle}>TLDR.</Text>
        <Text style={styles.sectionSubtitle}>this week's highlights</Text>
      </View>

      <View style={styles.threadsContainer}>
        {mockThreads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  highlightsSection: {
    paddingHorizontal: 30,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontFamily: 'AnonymousPro-Bold',
  },
  threadsContainer: {
    backgroundColor: '#F8F9FA',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  threadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9C27B0',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  icons: {
    fontSize: 16,
    color: "#662D91"
  },
  threadMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'AnonymousPro-Bold',
  },
  subscribeButton: {
    backgroundColor: '#662D91',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'AnonymousPro-Bold',
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    lineHeight: 22,
    fontFamily: 'AnonymousPro-Bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'AnonymousPro',
    fontWeight: 'bold',
  },
  threadImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  threadStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
  },
});