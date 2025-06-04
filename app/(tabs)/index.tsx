import { AppHeader } from '@/src/components/ui/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PostData {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  readTime: string;
  views: string;
  comments: string;
  votes: string;
  tags: string[];
  hasImage?: boolean;
  isVerified?: boolean;
}

const mockPosts: PostData[] = [
  {
    id: '1',
    title: 'Has our Singapore data been leaked?',
    author: '@Lebron James',
    timeAgo: '3 days ago',
    readTime: '3 mins read',
    views: '1.2k',
    comments: '354',
    votes: '539',
    tags: ['Health', 'Cybersecurity', 'WhatsApp'],
    hasImage: true,
    isVerified: true,
  },
  {
    id: '2',
    title: 'Are Ez-Link, SimplyGo Ads on Social Media may be Phishing Scams?',
    author: '@techwatch',
    timeAgo: '3 days ago',
    readTime: '3 mins read',
    views: '892',
    comments: '127',
    votes: '234',
    tags: ['Cybersecurity', 'Finance'],
    hasImage: false,
    isVerified: false,
  },
];

const TagComponent = ({ tag }: { tag: string }) => {
  const getTagColor = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case 'health': return '#FF6B6B';
      case 'cybersecurity': return '#FFD93D';
      case 'whatsapp': return '#4FC3F7';
      case 'finance': return '#9C27B0';
      default: return '#757575';
    }
  };

  return (
    <View style={[styles.tag, { backgroundColor: getTagColor(tag) }]}>
      <Text style={styles.tagText}>{tag}</Text>
    </View>
  );
};

const PostCard = ({ post }: { post: PostData }) => (
  <TouchableOpacity style={styles.postCard}>
    <View style={styles.postHeader}>
      <View style={styles.authorContainer}>
        <View style={styles.avatar} />
        <View style={styles.authorInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{post.author}</Text>
            {post.isVerified && (
              <IconSymbol name="checkmark.circle.fill" size={16} color="#007AFF" />
            )}
          </View>
          <Text style={styles.postMeta}>{post.timeAgo} • {post.readTime}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.subscribeButton}>
        <Text style={styles.subscribeText}>Subscribe</Text>
      </TouchableOpacity>
    </View>
    
    <Text style={styles.postTitle}>{post.title}</Text>
    
    <View style={styles.tagsContainer}>
      {post.tags.map((tag, index) => (
        <TagComponent key={index} tag={tag} />
      ))}
    </View>
    
    {post.hasImage && (
      <Image 
        source={{ uri: 'https://via.placeholder.com/350x200/4A5568/ffffff?text=Post+Image' }}
        style={styles.postImage}
      />
    )}
    
    <View style={styles.postStats}>
      <View style={styles.statItem}>
        <IconSymbol name="eye" size={16} color="#666" />
        <Text style={styles.statText}>{post.views} Views</Text>
      </View>
      <View style={styles.statItem}>
        <IconSymbol name="message" size={16} color="#666" />
        <Text style={styles.statText}>{post.comments} Comments</Text>
      </View>
      <View style={styles.statItem}>
        <IconSymbol name="arrow.up" size={16} color="#666" />
        <Text style={styles.statText}>{post.votes} Votes</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
      <AppHeader />
      
      <View style={styles.highlightsSection}>
        <Text style={styles.sectionTitle}>TLDR.</Text>
        <Text style={styles.sectionSubtitle}>this week's highlights</Text>
      </View>
      
      <View style={styles.postsContainer}>
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  highlightsSection: {
    paddingHorizontal: 30,
    paddingVertical: 20,
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
  postsContainer: {
    paddingHorizontal: 20,
  },
  postCard: {
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
  postHeader: {
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
  postMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'AnonymousPro-Bold',
  },
  subscribeButton: {
    backgroundColor: '#9C27B0',
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
  postTitle: {
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
    borderRadius: 16,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'AnonymousPro-Bold',
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  postStats: {
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
