import React, { useState, useRef } from 'react';
import { View, Text, PanResponder, Animated, Dimensions, StyleSheet } from 'react-native';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { SwipeResultModal, exampleResultData } from '@/src/components/explore/Justification';

interface Card {
  id: number;
  chatMessages: Array<{
    name: string;
    avatar: string;
    message: string;
    time: string;
    isGroup?: boolean;
  }>;
  article: {
    title: string;
    views: string;
    comments: string;
    votes: string;
    tags: string[];
    content: string;
    author: string;
    timeAgo: string;
    readTime: string;
  };
}

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;
const SWIPE_OUT_DURATION = 250;

const SwipeableCards: React.FC = () => {
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentResult, setCurrentResult] = useState<{
    result: 'REAL' | 'FAKE';
    title: string;
    explanation: string;
    sources: string[];
  } | null>(null);
  const [cards] = useState<Card[]>([
    {
      id: 1,
      chatMessages: [
        {
          name: "Spotify Music Group TS",
          avatar: "🎵",
          message: "This is also what I want to speak",
          time: "10:23 AM",
          isGroup: true
        },
        {
          name: "Sakura Handayani",
          avatar: "👤",
          message: "What is done here?",
          time: "10:24 AM"
        },
        {
          name: "Lye Hao Qiang",
          avatar: "👤", 
          message: "It seems to have something to do with music.",
          time: "10:25 AM"
        },
        {
          name: "Spo_tify",
          avatar: "🎵",
          message: "This is the Spotify Artisanal Benefits Group, and we need a lot of real users to help Spotify artists like specific songs to increase the popularity of artists' songs! You will be paid SGD15 for completing the task and subsequent tasks. Simply click like and we will pay you SGD15.",
          time: "10:26 AM"
        }
      ],
      article: {
        title: "Was our Singhealth Data leaked?",
        views: "1.2k Views",
        comments: "354 Comments", 
        votes: "539 Votes",
        tags: ["Health", "Cybersecurity", "WhatsApp"],
        content: "A user sent me this viral rumour that has been spreading about WhatsApp chat groups about Singhealth data leaks. What are your thoughts?",
        author: "@ongyekung",
        timeAgo: "3 days ago",
        readTime: "3 mins read"
      }
    },
    {
      id: 2,
      chatMessages: [
        {
          name: "Crypto Investment Group",
          avatar: "₿",
          message: "Amazing opportunity for early investors!",
          time: "2:15 PM",
          isGroup: true
        },
        {
          name: "Mike Chen",
          avatar: "👤",
          message: "Is this legitimate?",
          time: "2:16 PM"
        },
        {
          name: "Sarah Wong",
          avatar: "👤",
          message: "Seems too good to be true...",
          time: "2:17 PM"
        }
      ],
      article: {
        title: "New Cryptocurrency Scam Alert",
        views: "892 Views",
        comments: "156 Comments",
        votes: "234 Votes", 
        tags: ["Finance", "Scam", "Cryptocurrency"],
        content: "Be aware of fake investment groups promising unrealistic returns. Always verify before investing your money.",
        author: "@cryptowatch",
        timeAgo: "1 day ago",
        readTime: "2 mins read"
      }
    },
    {
      id: 3,
      chatMessages: [
        {
          name: "Tech Support Team",
          avatar: "🔧",
          message: "Your computer needs immediate attention!",
          time: "9:30 AM",
          isGroup: true
        },
        {
          name: "John Doe",
          avatar: "👤",
          message: "I didn't request any support...",
          time: "9:31 AM"
        }
      ],
      article: {
        title: "Tech Support Scam Warning",
        views: "2.1k Views", 
        comments: "89 Comments",
        votes: "445 Votes",
        tags: ["Technology", "Scam", "Safety"],
        content: "Legitimate tech companies will never contact you unsolicited. Learn how to identify and avoid tech support scams.",
        author: "@techsafety",
        timeAgo: "5 days ago",
        readTime: "4 mins read"
      }
    }
  ]);

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
    
    // Get the appropriate result data (you can expand this logic)
    let resultData;
    if (item.id === 1) {
      resultData = exampleResultData.singhealth;
    } else if (item.id === 2) {
      resultData = exampleResultData.crypto;
    } else {
      resultData = exampleResultData.techSupport;
    }
  
    // Show the result modal
    setCurrentResult({
      ...resultData,
      title: item.article.title,
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
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (evt, gestureState) => {
      console.log('Released with dx:', gestureState.dx);
      if (gestureState.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
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
        <View style={styles.chatSection}>
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderContent}>
              <Text style={styles.avatar}>{card.chatMessages[0].avatar}</Text>
              <Text style={styles.groupName}>{card.chatMessages[0].name}</Text>
              <Text style={styles.time}>{card.chatMessages[0].time}</Text>
            </View>
          </View>
          
          <View style={styles.messagesContainer}>
            {card.chatMessages.slice(1, 3).map((msg, idx) => (
              <View key={idx} style={styles.messageRow}>
                <View style={styles.messageContent}>
                  <Text style={styles.messageAvatar}>{msg.avatar}</Text>
                  <View style={styles.messageTextContainer}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageName}>{msg.name}</Text>
                      <Text style={styles.messageTime}>{msg.time}</Text>
                    </View>
                    <Text style={styles.messageText} numberOfLines={2}>{msg.message}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Article Section */}
        <View style={styles.articleSection}>
          <Text style={styles.articleTitle} numberOfLines={2}>{card.article.title}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👁</Text>
              <Text style={styles.statText}>{card.article.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statText}>{card.article.comments}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👍</Text>
              <Text style={styles.statText}>{card.article.votes}</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {card.article.tags.slice(0, 3).map((tag, idx) => (
              <View
                key={idx}
                style={[
                  styles.tag,
                  idx === 0 ? styles.tagRed :
                  idx === 1 ? styles.tagYellow :
                  styles.tagBlue
                ]}
              >
                <Text style={[
                  styles.tagText,
                  idx === 0 ? styles.tagTextRed :
                  idx === 1 ? styles.tagTextYellow :
                  styles.tagTextBlue
                ]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.articleContent} numberOfLines={3}>{card.article.content}</Text>

          <View style={styles.authorSection}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorInitials}>OY</Text>
              </View>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{card.article.author}</Text>
                <Text style={styles.authorMeta}>{card.article.timeAgo} • {card.article.readTime}</Text>
              </View>
            </View>
            <View style={styles.subscribeButton}>
              <Text style={styles.subscribeText}>Subscribe</Text>
            </View>
          </View>
        </View>

        {/* Swipe Indicators */}
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
        <View style={styles.indicatorContainer}>
          <IconSymbol name="close-circle" size={43} color="#666" style={styles.swipeIcons} />
          <Text style={styles.instructionsText}>FAKE</Text>
        </View>
        <View style={styles.swipeTextContainer}>
          <Text style={styles.instructionsText}>Swipe</Text>
          <Text style={styles.instructionsText}>left / right</Text>
        </View>
        <View style={styles.indicatorContainer}>
          <IconSymbol name="checkmark-circle" size={43} color="#666" style={styles.swipeIcons} />
          <Text style={styles.instructionsText}>REAL</Text>
        </View>
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
    backgroundColor: '#f3f0ff',
    paddingBottom: 90,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  card: {
    position: 'absolute',
    width: screenWidth * 0.85,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    left: screenWidth * 0.075,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  
  // Chat Section Styles
  chatSection: {
    backgroundColor: '#e0b3d9',
    padding: 12,
    flexShrink: 0,
  },
  chatHeader: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    fontSize: 12,
  },
  groupName: {
    fontWeight: 'bold',
    fontSize: 10,
    flex: 1,
  },
  time: {
    fontSize: 10,
    color: '#666',
  },
  messagesContainer: {
    maxHeight: 80,
  },
  messageRow: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageAvatar: {
    fontSize: 10,
  },
  messageTextContainer: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageName: {
    fontWeight: '500',
    fontSize: 10,
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
  },
  messageText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
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
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  tagRed: {
    backgroundColor: '#fee2e2',
  },
  tagYellow: {
    backgroundColor: '#fef3c7',
  },
  tagBlue: {
    backgroundColor: '#dbeafe',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  tagTextRed: {
    color: '#dc2626',
  },
  tagTextYellow: {
    color: '#d97706',
  },
  tagTextBlue: {
    color: '#2563eb',
  },
  articleContent: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
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
    gap: 8,
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInitials: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  authorDetails: {
    flex: 1,
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
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subscribeText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
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
  },
  noMoreSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
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
});

export default SwipeableCards;