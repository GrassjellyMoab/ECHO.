import { SwipeResultModal } from '@/src/components/explore/Justification';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { getTextColorForTag, tagColors } from '@/src/constants/posts';
import { useCollectionData } from '@/src/store/dataStore';
import { useImagesStore } from '@/src/store/imgStore';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Card {
  id: string; // Changed to string to match Firebase ID
  image: any; // Local image asset or URL
  isReal: boolean; // Add isReal for swipe logic
  aiVerdict: string; // Add AI verdict for results
  sources: string[]; // Add sources for results
  article: {
    author: string;
    title: string;
    views: string;
    comments: string;
    votes: string;
    tags: string[];
    content: string;
    timeAgo: string;
    readTime: string;
    isVerified?: boolean;
    avatar?: string;
  };
}

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.15;
const SWIPE_OUT_DURATION = 250;

const SwipeableCards: React.FC = () => {
  const router = useRouter();
  const threads = useCollectionData('threads');
  const topics = useCollectionData('topics');
  const users = useCollectionData('users');

  const getImagesByFolder = useImagesStore(state => state.getImagesByFolder);
  const userImages = getImagesByFolder('users');
  const threadImages = getImagesByFolder('threads');

  const [showResultModal, setShowResultModal] = useState(false);
  const [currentResult, setCurrentResult] = useState<{
    result: 'REAL' | 'FAKE';
    title: string;
    explanation: string;
    sources: string[];
  } | null>(null);

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // Helper function to format date
  const formatTimeAgo = (date: any): string => {
    try {
      // Handle Firestore timestamp
      const dateObj = date?.toDate ? date.toDate() : new Date(date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - dateObj.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch (error) {
      return 'Recently';
    }
  };

  // Helper function to get topic names from topic IDs
  const getTopicNames = (topicIds: string[]): string[] => {
    return topicIds
      .map(topicId => {
        const topic = topics.find(t => t.id === topicId);
        return topic?.topic || 'Unknown';
      })
      .filter(name => name !== 'Unknown')
      .slice(0, 3); // Limit to 3 tags
  };

  // Transform Firebase threads to Card format
  const transformThreadsToCards = (): Card[] => {
    return threads.map(thread => {
      console.log('Thread AI predict:', thread.ai_verdict, 'Type:', typeof thread.ai_verdict);
      const user = users.find(u => u.id === thread.uid);
      return {
        id: thread.id,
        image: threadImages.filter(img => img.name === `${thread.id}.png`)[0]?.url,
        isReal: thread.is_real,
        aiVerdict: thread.ai_verdict && thread.ai_verdict.trim() !== '' ? thread.ai_verdict : 'No AI verdict available',
        sources: thread.sources || [],
        article: {
          author: '@' + user?.username,
          title: thread.title,
          views: `${formatNumber(thread.num_views)} Views`,
          comments: `${formatNumber(thread.num_comments)} Comments`,
          votes: `${formatNumber(thread.num_votes)} Votes`,
          tags: getTopicNames(thread.topics || []),
          content: thread.description,
          timeAgo: formatTimeAgo(thread.posted_datetime),
          readTime: `${thread.read_duration || 3} mins read`,
          isVerified: user?.role === 'admin' || user?.role === 'moderator',
          avatar: userImages.filter(img => img.name === `${user?.username}.png`)[0]?.url,
        }
      };
    });
  };

  const cards = transformThreadsToCards();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const resetPosition = (): void => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();

    Animated.spring(rotate, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const forceSwipe = (direction: 'left' | 'right'): void => {
    const x = direction === 'right' ? screenWidth : -screenWidth;

    Animated.parallel([
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: false,
      }),
    ]).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'left' | 'right'): void => {
    const item = cards[currentIndex];
    console.log(`Swiped ${direction} on:`, item.article.title);

    // Determine the result based on swipe direction
    const swipeResult = direction === 'left' ? 'FAKE' : 'REAL';

    // Use actual Firebase data for the result
    setCurrentResult({
      result: item.isReal ? 'REAL' : 'FAKE',
      title: item.article.title,
      explanation: item.aiVerdict,
      sources: item.sources.length > 0 ? item.sources : ['No sources available'],
    });
    setShowResultModal(true);

    // Proceed to next card after a short delay
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      position.setValue({ x: 0, y: 0 });
      rotate.setValue(0);
      opacity.setValue(1);
    }, 100);
  };

  const handleModalClose = () => {
    setShowResultModal(false);
    setCurrentResult(null);
  };

  // Add this function to handle "See Thread" button
  const handleSeeThread = () => {
    // Navigate to thread details or perform desired action
    console.log('Navigate to thread details');
    handleModalClose();
  };

  // Function to convert card back to thread data for navigation
  const convertCardToThreadData = (card: Card) => {
    const originalThread = threads.find(t => t.id === card.id);
    const user = users.find(u => u.id === originalThread?.uid);
    
    return {
      id: card.id,
      author: card.article.author,
      title: card.article.title,
      timeAgo: card.article.timeAgo,
      dateCreated: originalThread?.posted_datetime,
      readTime: card.article.readTime,
      views: card.article.views,
      comments: card.article.comments,
      votes: card.article.votes,
      tags: card.article.tags,
      hasImage: Boolean(card.image),
      isVerified: card.article.isVerified,
      avatar: card.article.avatar,
      threadImageUrl: card.image,
      content: card.article.content,
      real_ratio: originalThread?.real_ratio || 0,
      ai_verdict: card.aiVerdict
    };
  };

  // Function to handle card tap navigation
  const handleCardTap = (card: Card) => {
    const threadData = convertCardToThreadData(card);
    router.push({
      pathname: '/search/thread',
      params: { thread: JSON.stringify(threadData) },
    });
  };

  const getCardStyle = (index: number) => {
    const isCurrentCard = index === currentIndex;

    if (isCurrentCard) {
      const rotateStr = rotate.interpolate({
        inputRange: [-screenWidth / 2, 0, screenWidth / 2],
        outputRange: ['-30deg', '0deg', '30deg'],
        extrapolate: 'clamp',
      });

      return {
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate: rotateStr }
        ],
        opacity,
      };
    }

    const scale = index === currentIndex + 1 ? 0.95 : 0.9;
    const translateY = (index - currentIndex) * -25;

    return {
      transform: [{ scale }, { translateY }],
      opacity: index <= currentIndex + 2 ? 1 : 0,
    };
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderGrant: () => {
      console.log('Pan responder granted');
    },
    onPanResponderMove: (evt, gestureState) => {
      position.setValue({ x: gestureState.dx, y: gestureState.dy });
      rotate.setValue(gestureState.dx);
      console.log('Moving with dx:', gestureState.dx);
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (evt, gestureState) => {
      console.log('Released with dx:', gestureState.dx, 'threshold:', SWIPE_THRESHOLD);
      if (gestureState.dx > SWIPE_THRESHOLD) {
        console.log('Triggering right swipe');
        forceSwipe('right');
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        console.log('Triggering left swipe');
        forceSwipe('left');
      } else {
        console.log('Resetting position - not enough swipe distance');
        resetPosition();
      }
    },
    onPanResponderTerminate: () => {
      resetPosition();
    },
  });

  const renderCard = (card: Card, index: number) => {
    if (index < currentIndex) return null;
    if (index > currentIndex + 2) return null;

    const isCurrentCard = index === currentIndex;

    const cardContent = (
      <>
        <View style={styles.imageSection}>
          <Image
            source={card.image}
            style={styles.cardImage}
            contentFit="cover"
          />
        </View>

        {/* Article Section */}
        <View style={styles.articleSection}>
          <Text style={styles.articleTitle} numberOfLines={2}>{card.article.title}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <IconSymbol name="eye" style={styles.icons} />
              <Text style={styles.statText}>{card.article.views}</Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="message" style={styles.icons} />
              <Text style={styles.statText}>{card.article.comments}</Text>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="arrow.up" style={styles.icons} />
              <Text style={styles.statText}>{card.article.votes}</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {card.article.tags.slice(0, 3).map((tag, idx) => {
              const backgroundColor = tagColors[tag.toLowerCase()] || tagColors.default;
              const textColor = getTextColorForTag(backgroundColor);
              return (
                <View
                  key={idx}
                  style={[
                    styles.tag,
                    { backgroundColor }
                  ]}
                >
                  <Text style={[styles.tagText, { color: textColor }]}>
                    {tag}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.articleContent} numberOfLines={3}>{card.article.content}</Text>

          <View style={styles.authorSection}>
            <View style={styles.authorInfo}>
              <View>
                {card.article.avatar ? (
                  <Image source={{ uri: card.article.avatar }} style={styles.authorAvatar} />
                ) : (
                  <View style={styles.authorAvatar} />
                )}
              </View>
              <View style={styles.authorDetails}>
                <View style={styles.authorRow}>
                  <Text style={styles.authorName}>{card.article.author}</Text>
                  {card.article.isVerified && (
                    <IconSymbol name="checkmark.circle.fill" style={styles.icons} />
                  )}
                </View>
                <Text style={styles.authorMeta}>{card.article.timeAgo} • {card.article.readTime}</Text>
              </View>
            </View>
            <View style={styles.subscribeButton}>
              <Text style={styles.subscribeText}>Subscribe</Text>
            </View>
          </View>
        </View>
      </>
    );

    return (
      <Animated.View
        key={card.id}
        style={[
          styles.card,
          getCardStyle(index),
          { zIndex: cards.length - index },
        ]}
        {...(isCurrentCard ? panResponder.panHandlers : {})}
      >
        {isCurrentCard ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleCardTap(card)}
            style={styles.cardTouchable}
          >
            {cardContent}
          </TouchableOpacity>
        ) : (
          <View style={styles.cardTouchable}>
            {cardContent}
          </View>
        )}

        {/* Swipe Indicators - only show for current card */}
        {isCurrentCard && (
          <>
            <Animated.View
              style={[
                styles.swipeIndicator,
                styles.likeIndicator,
                {
                  opacity: position.x.interpolate({
                    inputRange: [0, screenWidth / 4],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              <Text style={styles.indicatorText}>REAL</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.swipeIndicator,
                styles.passIndicator,
                {
                  opacity: position.x.interpolate({
                    inputRange: [-screenWidth / 4, 0],
                    outputRange: [1, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              <Text style={styles.indicatorText}>FAKE</Text>
            </Animated.View>
          </>
        )}
      </Animated.View>
    );
  };

  if (currentIndex >= cards.length) {
    return (
      <View style={styles.container}>
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreText}>No more cards!</Text>
          <Text style={styles.noMoreSubtext}>You've reviewed all the posts</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {cards.map((card, index) => renderCard(card, index)).reverse()}
      </View>

      <View style={styles.instructionsContainer}>
        <TouchableOpacity
          style={styles.indicatorContainer}
          onPress={() => forceSwipe('left')}
          activeOpacity={0.7}
        >
          <IconSymbol name="close-circle" size={43} color="#666" style={styles.swipeIcons} />
          <Text style={styles.instructionsText}>FAKE</Text>
        </TouchableOpacity>
        <View style={styles.swipeTextContainer}>
          <Text style={styles.instructionsText}>Swipe</Text>
          <Text style={styles.instructionsText}>left / right</Text>
        </View>
        <TouchableOpacity
          style={styles.indicatorContainer}
          onPress={() => forceSwipe('right')}
          activeOpacity={0.7}
        >
          <IconSymbol name="checkmark-circle" size={43} color="#666" style={styles.swipeIcons} />
          <Text style={styles.instructionsText}>REAL</Text>
        </TouchableOpacity>
      </View>
      {currentResult && (
        <SwipeResultModal
          visible={showResultModal}
          onClose={handleModalClose}
          result={currentResult.result}
          title={currentResult.title}
          explanation={currentResult.explanation}
          sources={currentResult.sources}
          onSeeThread={handleSeeThread}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#f3f0ff',
    paddingBottom: 90,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },
  card: {
    position: 'absolute',
    width: screenWidth * 0.85,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    left: screenWidth * 0.075,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },

  // Image Section Styles
  imageSection: {
    height: 150,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },

  // Article Section Styles
  articleSection: {
    padding: 12,
    flex: 1,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'AnonymousPro-Bold',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9C27B0',
  },
  icons: {
    fontSize: 16,
    color: "#662D91"
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 10,
  },
  statText: {
    fontSize: 10,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  articleContent: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  authorInitials: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  authorDetails: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  authorMeta: {
    fontSize: 13,
    color: '#666',
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
  // Swipe Indicators
  swipeIndicator: {
    position: 'absolute',
    top: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  likeIndicator: {
    right: 20,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  passIndicator: {
    left: 20,
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },

  // End state
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'AnonymousPro-Bold',
  },
  noMoreSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 14,
    fontFamily: 'AnonymousPro-Bold',
  },

  // Instructions
  instructionsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  swipeIcons: {

  },
  swipeTextContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  instructionsText: {
    fontSize: 17,
    color: '#666',
    marginBottom: 3,
    fontFamily: 'AnonymousPro-Bold',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendDotRed: {
    backgroundColor: '#ef4444',
  },
  legendDotGreen: {
    backgroundColor: '#22c55e',
  },
  legendText: {
    fontSize: 10,
    color: '#666',
  },
  cardTouchable: {
    flex: 1,
  },
});

export default SwipeableCards;