import React, { useState } from 'react';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
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

const VotingSection = ({ voteData, onVote }: { 
  voteData: VoteData, 
  onVote: (vote: 'real' | 'fake') => void 
}) => {
  const totalVotes = voteData.real + voteData.fake;
  const realPercentage = totalVotes > 0 ? (voteData.real / totalVotes) * 100 : 0;
  const fakePercentage = totalVotes > 0 ? (voteData.fake / totalVotes) * 100 : 0;

  return (
    <View style={styles.votingSection}>
      <Text style={styles.votingPrompt}>
        You voted <Text style={styles.fakeText}>Fake.</Text>
      </Text>
      <Text style={styles.overallVotes}>Overall Votes:</Text>
      
      <View style={styles.voteOptions}>
        <TouchableOpacity 
          style={[styles.voteButton, styles.realButton]}
          onPress={() => onVote('real')}
        >
          <Text style={styles.voteButtonText}>Real.</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.voteButton, styles.fakeButton]}
          onPress={() => onVote('fake')}
        >
          <Text style={styles.voteButtonText}>Fake.</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.voteBar}>
        <View style={[styles.realBar, { width: `${realPercentage}%` }]} />
        <View style={[styles.fakeBar, { width: `${fakePercentage}%` }]} />
      </View>

      <View style={styles.votePercentages}>
        <Text style={styles.realPercentage}>{Math.round(realPercentage)}%</Text>
        <Text style={styles.fakePercentage}>{Math.round(fakePercentage)}%</Text>
      </View>
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

  const handleVote = (vote: 'real' | 'fake') => {
    // In real app, this would update the backend
    setVoteData(prev => ({
      ...prev,
      userVote: vote
    }));
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

          {/* Voting Section */}
          <VotingSection voteData={voteData} onVote={handleVote} />

          {/* AI Verdict*/}
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <IconSymbol name="info.circle" style={styles.aiIcon} />
              <Text style={styles.aiTitle}>AI Verdict</Text>
            </View>
            <Text style={styles.aiText}>{threadData.ai_verdict}</Text>
          </View>
          
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
    marginBottom: 24,
    fontFamily: 'AnonymousPro',
  },
  votingSection: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  votingPrompt: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'AnonymousPro',
  },
  fakeText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  overallVotes: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    fontFamily: 'AnonymousPro-Bold',
  },
  voteOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  voteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  realButton: {
    backgroundColor: '#E5E7EB',
  },
  fakeButton: {
    backgroundColor: '#662D91',
  },
  voteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'AnonymousPro-Bold',
  },
  voteBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  realBar: {
    backgroundColor: '#E5E7EB',
  },
  fakeBar: {
    backgroundColor: '#662D91',
  },
  votePercentages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  realPercentage: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
  },
  fakePercentage: {
    fontSize: 12,
    color: '#662D91',
    fontFamily: 'AnonymousPro-Bold',
  },
  aiSection: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiIcon: {
    fontSize: 18,
    color: '#662D91',
    marginRight: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  aiText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontFamily: 'AnonymousPro',
  },
  aiConfidence: {
    fontSize: 12,
    color: '#662D91',
    fontWeight: 'bold',
    marginTop: 8,
    fontFamily: 'AnonymousPro-Bold',
  },
  boldText: {
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
  },
});

export default ThreadPage;