import { IconSymbol } from '@/src/components/ui/IconSymbol';
import React from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_HEIGHT = screenHeight * 0.45;
const CARD_WIDTH = screenWidth * 0.85;

interface Post {
  id: number;
  image: string;
  title: string;
  views: number;
  comments: number;
  votes: number;
  tags: string[];
  excerpt: string;
  author: {
    name: string;
    verified: boolean;
    avatar: string;
    timeAgo: string;
    readTime: string;
  };
  groundTruth: 'FAKE' | 'REAL';
  explanation: string;
  sources: string[];
}

interface ExploreCardProps {
  post: Post;
  isNext?: boolean;
  animationKey?: number;
  translateX?: Animated.Value;
  translateY?: Animated.Value;
  scale?: Animated.Value;
  tagColors: { [key: string]: string };
}

const ExploreCard = React.forwardRef<View, ExploreCardProps>(({
  post,
  isNext = false,
  animationKey,
  translateX,
  translateY,
  scale,
  tagColors,
}, ref) => {
  // Safety check - return null if no post provided
  if (!post) return null;

  // Next card - no animations, fixed positioning
  if (isNext) {
    return (
      <View style={[styles.card, styles.nextCard]} key={`${post.id}-next`}>
        <CardContent post={post} tagColors={tagColors} />
      </View>
    );
  }

  // Current card - with animations only when actively swiping
  return (
    <Animated.View
      ref={ref}
      style={[
        styles.card,
        {
          transform: [
            { translateX: translateX || 0 },
            { translateY: translateY || 0 },
            { rotate: '0deg' }, // No rotation during drag
            { scale: scale || 1 },
          ],
        }
      ]}
      key={`current-${animationKey}`}
    >
      <CardContent post={post} tagColors={tagColors} />
    </Animated.View>
  );
});

ExploreCard.displayName = 'ExploreCard';

interface CardContentProps {
  post: Post;
  tagColors: { [key: string]: string };
}

function CardContent({ post, tagColors }: CardContentProps) {
  return (
    <>
      {/* Static Example Image */}
      <Image source={{ uri: post.image }} style={styles.exampleImage} />

      {/* Main Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{post.title}</Text>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <IconSymbol name="eye" size={16} color="#666" />
            <Text style={styles.statText}>{post.views.toLocaleString()} Views</Text>
          </View>
          <View style={styles.statItem}>
            <IconSymbol name="message" size={16} color="#666" />
            <Text style={styles.statText}>{post.comments} Comments</Text>
          </View>
          <View style={styles.statItem}>
            <IconSymbol name="hand.thumbsup" size={16} color="#666" />
            <Text style={styles.statText}>{post.votes} Votes</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: tagColors[tag] || '#E5E7EB' }]}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Post Excerpt */}
        <Text style={styles.postExcerpt}>{post.excerpt}</Text>

        {/* Author Info */}
        <View style={styles.authorContainer}>
          <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
          <View style={styles.authorInfo}>
            <View style={styles.authorNameContainer}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              {post.author.verified && (
                <IconSymbol name="checkmark.seal.fill" size={16} color="#9C27B0" />
              )}
            </View>
            <Text style={styles.authorMeta}>{post.author.timeAgo} · {post.author.readTime}</Text>
          </View>
          <TouchableOpacity style={styles.subscribeButton}>
            <Text style={styles.subscribeText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    // Much more prominent box shadows for iOS
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 50,
    },
    shadowOpacity: 0.9,
    shadowRadius: 80,
    // Much stronger elevation for Android
    elevation: 35,
    overflow: 'hidden',
    position: 'absolute',
    // Add a subtle border for better definition
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  nextCard: {
    transform: [{ scale: 0.95 }],
    zIndex: 0,
    opacity: 0.85,
    // Strong shadow for background card too
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 30,
    },
    shadowOpacity: 0.6,
    shadowRadius: 60,
    elevation: 30,
  },
  exampleImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  postContent: {
    flex: 1,
    padding: 16,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    fontFamily: 'AnonymousPro-Bold',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 9,
    color: '#000',
    fontWeight: '600',
    fontFamily: 'AnonymousPro-Bold',
  },
  postExcerpt: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
    marginBottom: 12,
    fontFamily: 'AnonymousPro-Bold',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  authorMeta: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
    fontFamily: 'AnonymousPro-Bold',
  },
  subscribeButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  subscribeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
  },
});

export type { Post };

export default ExploreCard;
