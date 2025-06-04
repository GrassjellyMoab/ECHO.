import { IconSymbol } from '@components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

// Mock forum post data
const mockPosts = [
  {
    id: 1,
    title: "Was our Singhealth Data leaked?",
    views: 1200,
    comments: 354,
    votes: 539,
    tags: ['Health', 'Cybersecurity', 'WhatsApp'],
    excerpt: "A user sent me this viral rumour that has been spreading about WhatsApp chat groups about Singhealth data leaks. What are your thoughts?",
    author: {
      name: "@ongyekung",
      verified: true,
      avatar: "https://avatar.iran.liara.run/public/32",
      timeAgo: "3 days ago",
      readTime: "3 mins read"
    }
  },
  {
    id: 2,
    title: "New AI breakthrough in healthcare diagnostics",
    views: 890,
    comments: 234,
    votes: 456,
    tags: ['Technology', 'Health', 'AI'],
    excerpt: "Researchers have developed a new AI system that can diagnose diseases with 95% accuracy. This could revolutionize healthcare as we know it.",
    author: {
      name: "@techguru",
      verified: false,
      avatar: "https://avatar.iran.liara.run/public/45",
      timeAgo: "1 day ago",
      readTime: "5 mins read"
    }
  },
  {
    id: 3,
    title: "Cryptocurrency market crash - What's next?",
    views: 2100,
    comments: 789,
    votes: 1234,
    tags: ['Finance', 'Crypto', 'Economy'],
    excerpt: "The recent cryptocurrency market crash has left many investors wondering about the future. Let's discuss the potential implications and recovery strategies.",
    author: {
      name: "@cryptoanalyst",
      verified: true,
      avatar: "https://avatar.iran.liara.run/public/67",
      timeAgo: "5 hours ago",
      readTime: "7 mins read"
    }
  }
];

const tagColors: { [key: string]: string } = {
  'Health': '#FF9999',
  'Cybersecurity': '#FFD700',
  'WhatsApp': '#87CEEB',
  'Technology': '#98FB98',
  'AI': '#DDA0DD',
  'Finance': '#F0E68C',
  'Crypto': '#FFB6C1',
  'Economy': '#B0E0E6'
};

export default function ExploreScreen() {
  const router = useRouter();
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const currentPost = mockPosts[currentPostIndex];

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY, velocityX } = event.nativeEvent;
      
      // Determine swipe direction
      const swipeThreshold = screenWidth * 0.25;
      const velocityThreshold = 500;
      
      if (Math.abs(translationX) > swipeThreshold || Math.abs(velocityX) > velocityThreshold) {
        // Card swiped
        const direction = translationX > 0 ? 'right' : 'left';
        handleSwipe(direction);
        
        // Animate card off screen
        Animated.timing(translateX, {
          toValue: direction === 'right' ? screenWidth : -screenWidth,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // Reset position and show next card
          translateX.setValue(0);
          translateY.setValue(0);
          scale.setValue(1);
          nextPost();
        });
      } else {
        // Snap back to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    console.log(`Swiped ${direction} on post: ${currentPost.title}`);
    if (direction === 'left') {
      console.log('Marked as FAKE');
    } else {
      console.log('Marked as REAL');
    }
  };

  const nextPost = () => {
    setCurrentPostIndex((prev) => (prev + 1) % mockPosts.length);
  };

  const handleFakePress = () => {
    handleSwipe('left');
    nextPost();
  };

  const handleRealPress = () => {
    handleSwipe('right');
    nextPost();
  };

  const handleBackPress = () => {
    router.back();
  };

  if (!currentPost) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyState}>No more posts to explore!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.appTitle}>ECHO.</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <TouchableOpacity>
            <IconSymbol name="xmark" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Container */}
      <View style={styles.cardContainer}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
              },
            ]}
          >
            {/* Chat Group Section */}
            <View style={styles.chatSection}>
              <View style={styles.chatHeader}>
                <View style={styles.chatInfo}>
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: currentPost.author.avatar }} style={styles.chatAvatar} />
                  </View>
                  <View style={styles.chatDetails}>
                    <Text style={styles.chatTitle}>Spotify Music Group T5</Text>
                    <Text style={styles.chatSubtitle}>Siva Sakthi, ~EthnoG, ~Akaranna, ~Abi, ~Andy, ~Balangga, ~Deb, ~Desmond...</Text>
                  </View>
                </View>
                <View style={styles.chatActions}>
                  <IconSymbol name="doc.text" size={16} color="#666" />
                  <IconSymbol name="phone" size={16} color="#666" />
                  <IconSymbol name="magnifyingglass" size={16} color="#666" />
                </View>
              </View>
              
              <View style={styles.chatMessages}>
                <View style={styles.messageItem}>
                  <Text style={styles.messageText}>This is also what I want to&nbsp;speak</Text>
                  <Text style={styles.messageTime}>10:25 AM</Text>
                </View>
                <View style={styles.messageItem}>
                  <Text style={styles.senderName}>Sakura Handayani</Text>
                  <Text style={styles.messageText}>What is done here?</Text>
                  <Text style={styles.messageTime}>10:26 AM</Text>
                </View>
                <View style={styles.messageItem}>
                  <Text style={styles.senderName}>Lye Hao Qiang</Text>
                  <Text style={styles.messageText}>It seems to have something to do with music</Text>
                  <Text style={styles.messageTime}>10:29 AM</Text>
                </View>
                <View style={styles.lastMessage}>
                  <Text style={styles.senderName}>~Spo~ify</Text>
                  <Text style={styles.messageText}>This is the Spotify Artisanal Benefits Group, and we need a lot of real users to help Spotify artists like specific songs to increase the popularity of artists' songs. You will be paid 5$D15 for completing the task and subsequent tasks. Simply click Like and we will pay you 5$D15.</Text>
                  <Text style={styles.messageTime}>10:29 AM</Text>
                </View>
              </View>
            </View>

            {/* Main Post Content */}
            <View style={styles.postContent}>
              <Text style={styles.postTitle}>{currentPost.title}</Text>
              
              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <IconSymbol name="eye" size={16} color="#666" />
                  <Text style={styles.statText}>{currentPost.views.toLocaleString()} Views</Text>
                </View>
                <View style={styles.statItem}>
                  <IconSymbol name="message" size={16} color="#666" />
                  <Text style={styles.statText}>{currentPost.comments} Comments</Text>
                </View>
                <View style={styles.statItem}>
                  <IconSymbol name="hand.thumbsup" size={16} color="#666" />
                  <Text style={styles.statText}>{currentPost.votes} Votes</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {currentPost.tags.map((tag, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: tagColors[tag] || '#E5E7EB' }]}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Post Excerpt */}
              <Text style={styles.postExcerpt}>{currentPost.excerpt}</Text>

              {/* Author Info */}
              <View style={styles.authorContainer}>
                <Image source={{ uri: currentPost.author.avatar }} style={styles.authorAvatar} />
                <View style={styles.authorInfo}>
                  <View style={styles.authorNameContainer}>
                    <Text style={styles.authorName}>{currentPost.author.name}</Text>
                    {currentPost.author.verified && (
                      <IconSymbol name="checkmark.seal.fill" size={16} color="#9C27B0" />
                    )}
                  </View>
                  <Text style={styles.authorMeta}>{currentPost.author.timeAgo} · {currentPost.author.readTime}</Text>
                </View>
                <TouchableOpacity style={styles.subscribeButton}>
                  <Text style={styles.subscribeText}>Subscribe</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Swipe Instructions */}
      <View style={styles.swipeInstructions}>
        <Text style={styles.swipeText}>swipe</Text>
        <Text style={styles.swipeDirection}>left/right.</Text>
      </View>

      {/* Bottom Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.fakeButton} onPress={handleFakePress}>
          <IconSymbol name="xmark" size={40} color="#000" />
          <Text style={styles.actionLabel}>FAKE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.realButton} onPress={handleRealPress}>
          <IconSymbol name="checkmark" size={40} color="#000" />
          <Text style={styles.actionLabel}>REAL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  headerSpacer: {
    width: 40,
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  chatSection: {
    backgroundColor: '#E8E3FF',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 8,
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  chatDetails: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  chatSubtitle: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
  },
  chatActions: {
    flexDirection: 'row',
    gap: 12,
  },
  chatMessages: {
    gap: 8,
  },
  messageItem: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  lastMessage: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 2,
    fontFamily: 'AnonymousPro-Bold',
  },
  messageText: {
    fontSize: 11,
    color: '#000',
    lineHeight: 16,
    fontFamily: 'AnonymousPro-Bold',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
    fontFamily: 'AnonymousPro-Bold',
  },
  postContent: {
    padding: 20,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    fontFamily: 'AnonymousPro-Bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
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
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
    fontFamily: 'AnonymousPro-Bold',
  },
  postExcerpt: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'AnonymousPro-Bold',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  authorMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'AnonymousPro-Bold',
  },
  subscribeButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
  },
  swipeInstructions: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  swipeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  swipeDirection: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
  },
  fakeButton: {
    alignItems: 'center',
    gap: 8,
  },
  realButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  emptyState: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
    fontFamily: 'AnonymousPro-Bold',
  },
}); 