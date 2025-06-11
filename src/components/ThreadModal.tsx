import VotingSection from '@/src/components/thread/VotingSection';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { getTextColorForTag, tagColors } from '@/src/constants/posts';
import { useSessionDataStore } from '@/src/store/sessionDataStore';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface ThreadData {
  id: string;
  author: string;
  title: string;
  timeAgo: string;
  readTime: string;
  views: string;
  comments: string;
  votes: string;
  tags: string[];
  hasImage?: boolean;
  isVerified?: boolean;
  avatar?: string;
  threadImageUrl?: string;
  content: string;
  real_ratio: number;
  ai_verdict?: string;
  hasVoted: boolean;
  sources: string[];  
}

interface VoteData {
  real: number;
  fake: number;
  userVote: 'real' | 'fake' | null;
}

interface ThreadModalProps {
  visible: boolean;
  threadData: ThreadData | null;
  onClose: () => void;
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

export default function ThreadModal({ visible, threadData, onClose }: ThreadModalProps) {
  // Zustand store for session vote data
  const { addVote, getUserVote, hasUserVoted } = useSessionDataStore();
  
  // Initialize vote data state
  const [voteData, setVoteData] = useState<VoteData>({
    real: 0,
    fake: 0,
    userVote: null
  });

  const [userHasVoted, setUserHasVoted] = useState(false);

  // Update vote data when threadData changes
  useEffect(() => {
    if (threadData) {
      const totalVoteCount = parseInt(threadData.votes);
      const realVotes = Math.round(threadData.real_ratio * totalVoteCount);
      const fakeVotes = totalVoteCount - realVotes;
      
      // Check if user has voted from session store
      const sessionVote = getUserVote(threadData.id);
      const hasVotedInSession = hasUserVoted(threadData.id);
      
      setVoteData({
        real: realVotes,
        fake: fakeVotes,
        userVote: sessionVote || (threadData.hasVoted ? (threadData.real_ratio > 0.5 ? 'real' : 'fake') : null)
      });
      
      setUserHasVoted(hasVotedInSession || threadData.hasVoted);
    }
  }, [threadData, getUserVote, hasUserVoted]);

  const handleVote = (vote: 'real' | 'fake') => {
    if (!threadData) return;
    
    // Save vote to session store
    addVote(threadData.id, vote);
    
    // Update local state
    setVoteData(prev => ({
      ...prev,
      userVote: vote
    }));
    setUserHasVoted(true);
  };

  if (!threadData) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
          {/* Back button */}
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <IconSymbol name="arrow-back" size={23} color="#662D91" />
          </TouchableOpacity>
          
          <View style={styles.content}>
            {/* Author Info */}
            <View style={styles.authorSection}>
              <View style={styles.authorContainer}>
                {threadData.avatar ? (
                  <Image 
                    source={{ uri: threadData.avatar }} 
                    style={styles.avatar}
                    cachePolicy="memory-disk"
                  />
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
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              )}
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
              {threadData.tags.map((tag: string, index: number) => (
                <TagComponent key={index} tag={tag} />
              ))}
            </View>

            {/* Thread Content */}
            <Text style={styles.threadContent}>
              {threadData.content || "A user sent me this viral rumour that has been spreading about WhatsApp chat groups about Singhealth data leaks. What do you think?"}
            </Text>

            {/* Voting Section */}
            <VotingSection 
              voteData={voteData} 
              onVote={handleVote} 
              hasVoted={threadData.hasVoted}
              aiVerdict={threadData.ai_verdict}
              threadId={threadData.id}
              sources={threadData.sources}
              skipVoting={threadData.votes === '0' && !threadData.hasVoted && !!threadData.ai_verdict}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
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
    elevation: 5,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  threadImage: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
  },
  threadTitle: {
    marginTop: 10,
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
    fontSize: 12,
    fontFamily: 'AnonymousPro',
    fontWeight: 'bold',
  },
  threadContent: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: 'AnonymousPro',
  },
}); 