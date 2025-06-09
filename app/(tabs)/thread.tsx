import React, { useState } from 'react';
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
import { IconSymbol } from '@/src/components/ui/IconSymbol';

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

const AIVerdict = () => {
  return (
    <View style={styles.aiSection}>
      <View style={styles.aiHeader}>
        <IconSymbol name="info.circle" style={styles.aiIcon} />
        <Text style={styles.aiTitle}>AI Verdict</Text>
      </View>
      <Text style={styles.aiText}>
        The news about the health data leak is <Text style={styles.boldText}>false</Text> because 
        there is no evidence of a breach in the government's secure health systems. Independent 
        security audits show no unauthorized access or anomalies. Additionally, the supposed 
        leaked data contains fabricated entries that do <Text style={styles.boldText}>not match</Text> real patient records.
      </Text>
    </View>
  );
};

function ThreadPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { thread } = route.params as { thread: string };
  
  // Parse the thread data from JSON string
  const threadData: ThreadData = JSON.parse(thread);
  
  // Mock voting data - in real app, this would come from your backend
  const [voteData, setVoteData] = useState<VoteData>({
    real: 27,
    fake: 73,
    userVote: 'fake'
  });

  const handleVote = (vote: 'real' | 'fake') => {
    // In real app, this would update the backend
    setVoteData(prev => ({
      ...prev,
      userVote: vote
    }));
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share thread');
  };

  const handleBookmark = () => {
    // Implement bookmark functionality
    console.log('Bookmark thread');
  };

  const handleSubscribe = () => {
    // Implement subscribe functionality
    console.log('Subscribe to author');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconSymbol name="arrow.left" style={styles.headerIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ECHO.</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare}>
            <IconSymbol name="square.and.arrow.up" style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBookmark}>
            <IconSymbol name="bookmark" style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
          <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
            <Text style={styles.subscribeText}>Subscribe</Text>
          </TouchableOpacity>
        </View>

        {/* Thread Image */}
        {threadData.hasImage && threadData.threadImageUrl && (
          <Image
            source={{ uri: threadData.threadImageUrl }}
            style={styles.threadImage}
            resizeMode="contain"
          />
        )}

        {/* Fake Badge */}
        <View style={styles.fakeBadge}>
          <Text style={styles.fakeBadgeText}>Fake.</Text>
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
          A user sent me this viral rumour that has been spreading about WhatsApp chat groups about Singhealth data leaks. What do you think?
        </Text>

        {/* Voting Section */}
        <VotingSection voteData={voteData} onVote={handleVote} />

        {/* AI Verdict */}
        <AIVerdict />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  headerIcon: {
    fontSize: 20,
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
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
  threadImage: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  fakeBadge: {
    backgroundColor: '#DC2626',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  fakeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
  },
  threadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    lineHeight: 32,
    fontFamily: 'AnonymousPro-Bold',
  },
  threadStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
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
    marginBottom: 20,
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
  boldText: {
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
  },
});

export default ThreadPage;