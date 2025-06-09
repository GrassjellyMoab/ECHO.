import React, { useState } from 'react';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
import VotingSection from '@/src/components/thread/VotingSection'; // Import your updated VotingSection component
import { 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  StatusBar,
  SafeAreaView,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

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
  content?: string;
  real_ratio: number;
  ai_verdict?: string;
  hasVoted: boolean;
}

interface VoteData {
  real: number;
  fake: number;
  userVote: 'real' | 'fake' | null;
}

const TagComponent = ({ tag }: { tag: string }) => {
  const getTagColor = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case 'health': return '#FC8476';
      case 'cybersecurity': return '#FFD574';
      case 'politics': return '#99AD43';
      case 'whatsapp': return '#55C5D1';
      case 'elections': return '#DBAFDA';
      case 'finance': return '#99AD52';
      case 'concerts': return '#DDA35F';
      default: return '#757575';
    }
  };

  return (
    <View style={[styles.tag, { backgroundColor: getTagColor(tag) }]}>
      <Text style={styles.tagText}>{tag}</Text>
    </View>
  );
};

function ThreadPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { thread } = route.params as { thread: string };

  // Parse the thread data from JSON string
  const threadData: ThreadData = JSON.parse(thread);
  console.log(threadData);
  console.log(threadData.hasVoted);

  // Calculate vote counts based on real_ratio
  const totalVoteCount = parseInt(threadData.votes);
  const realVotes = Math.round(threadData.real_ratio * totalVoteCount);
  const fakeVotes = totalVoteCount - realVotes;
  
  // Initialize voting data using real_ratio from thread data
  const [voteData, setVoteData] = useState<VoteData>({
    real: realVotes,
    fake: fakeVotes,
    userVote: threadData.real_ratio < 0.5 ? 'fake' : null // Set user vote based on majority
  });

  // Track if user has voted in this session
  const [userHasVoted, setUserHasVoted] = useState(threadData.hasVoted);

  const handleVote = (vote: 'real' | 'fake') => {
    // In real app, this would update the backend
    setVoteData(prev => ({
      ...prev,
      userVote: vote
    }));
    setUserHasVoted(true);
  };

  // Determine if content is fake based on real_ratio
  const isFake = threadData.real_ratio < 0.5;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

          {/* Back button */}
          <TouchableOpacity onPress={() => navigation.goBack()}  style={styles.backBtn}>
            <IconSymbol name="arrow-back" size={23} color="#662D91" />
          </TouchableOpacity>
          <View style={styles.content}>
          {/* Author Info */}
          <View style={styles.authorSection}>
            <View style={styles.authorContainer}>
              {threadData.avatar ? (
                <Image source={{ uri: threadData.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar} />
              )}
              <View style={styles.authorInfo}>
                <View style={styles.authorRow}>
                  <Text style={styles.authorName}>{threadData.author}</Text>
                  {threadData.isVerified && (
                    <IconSymbol name="checkmark.circle.fill" style={styles.verifiedIcon} />
                  )}
                </View>
                <Text style={styles.threadMeta}>{threadData.timeAgo} • {threadData.readTime}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.subscribeButton}>
              <Text style={styles.subscribeText}>Subscribe</Text>
            </TouchableOpacity>
          </View>

          {/* Thread Image */}
          <View style={styles.shadowWrapper}>
            {threadData.hasImage && threadData.threadImageUrl && (
              <Image
                source={{ uri: threadData.threadImageUrl }}
                style={styles.threadImage}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Dynamic Badge based on real_ratio */}
          <View style={[styles.badge, isFake ? styles.fakeBadge : styles.realBadge]}>
            <Text style={styles.badgeText}>{isFake ? 'Fake.' : 'Real.'}</Text>
          </View>

          {/* Thread Title */}
          <Text style={styles.threadTitle}>{threadData.title}</Text>

          {/* Thread Stats */}
          <View style={styles.threadStats}>
            <View style={styles.statItem}>
              <IconSymbol name="eye" style={styles.statIcon} />
              <Text style={styles.statText}>{threadData.views} Views</Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="message" style={styles.statIcon} />
              <Text style={styles.statText}>{threadData.comments} Comments</Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="arrow.up" style={styles.statIcon} />
              <Text style={styles.statText}>{threadData.votes} Votes</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {threadData.tags.map((tag, index) => (
              <TagComponent key={index} tag={tag} />
            ))}
          </View>

          {/* Thread Content */}
          <Text style={styles.threadContent}>
            {threadData.content || "A user sent me this viral rumour that has been spreading about WhatsApp chat groups about Singhealth data leaks. What do you think?"}
          </Text>

          {/* Voting Section - Now includes AI verdict */}
          <VotingSection 
            voteData={voteData} 
            onVote={handleVote} 
            hasVoted={threadData.hasVoted}
            aiVerdict={threadData.ai_verdict} // Pass AI verdict to VotingSection
          />
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backBtn:{
    paddingHorizontal: 20,
    paddingBottom: 5,
    backgroundColor: 'white'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  authorSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9C27B0',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  verifiedIcon: {
    fontSize: 16,
    color: '#662D91',
  },
  threadMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'AnonymousPro-Bold',
  },
  subscribeButton: {
    backgroundColor: '#662D91',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'AnonymousPro-Bold',
  },
  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 5, // Android
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  threadImage: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
  },
  badge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: -32,
    marginBottom: 20,
    marginRight: 5,
    zIndex:1
  },
  fakeBadge: {
    backgroundColor: '#DC2626',
  },
  realBadge: {
    backgroundColor: '#059669',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
  },
  threadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
    lineHeight: 32,
    fontFamily: 'AnonymousPro-Bold',
  },
  threadStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    fontSize: 16,
    color: '#662D91',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 17,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#000000',
    fontSize: 12,
    fontFamily: 'AnonymousPro',
  },
  threadContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: 'AnonymousPro',
  },
});

export default ThreadPage;