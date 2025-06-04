import { EmptyState, ExploreCard, FeedbackModal, Post } from '@/src/components/explore';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { dummyPosts, tagColors } from '@/src/constants/posts';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewedPosts, setViewedPosts] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    userChoice: 'FAKE' | 'REAL';
    isCorrect: boolean;
    post: Post;
  } | null>(null);
  
  // Animation state
  const [animationKey, setAnimationKey] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const availablePosts = dummyPosts.filter(post => !viewedPosts.includes(post.id));
  const currentPost = availablePosts[0];
  const nextPost = availablePosts[1];

  // Reset animations whenever current post changes
  const forceResetAnimations = () => {
    translateX.setValue(0);
    translateY.setValue(0);
    scale.setValue(1);
    setAnimationKey(prev => prev + 1);
  };

  useEffect(() => {
    forceResetAnimations();
  }, [currentPost?.id]);

  // Gesture handlers
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (isAnimating) return;
    
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      const swipeThreshold = screenWidth * 0.3;
      const velocityThreshold = 600;
      
      if (Math.abs(translationX) > swipeThreshold || Math.abs(velocityX) > velocityThreshold) {
        setIsAnimating(true);
        const direction = translationX > 0 ? 'right' : 'left';
        handleSwipe(direction);
        animateCardOffScreen(direction);
      } else {
        animateCardToCenter();
      }
    }
  };

  // Swipe logic
  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentPost) return;
    
    const userChoice = direction === 'left' ? 'FAKE' : 'REAL';
    const isCorrect = userChoice === currentPost.groundTruth;
    
    // Store the feedback data but don't show modal yet
    setFeedbackData({ userChoice, isCorrect, post: currentPost });
  };

  // Animation functions
  const animateCardOffScreen = (direction: 'left' | 'right') => {
    const rotateValue = direction === 'right' ? 30 : -30;
    
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsAnimating(false);
      nextPostAction();
      forceResetAnimations();
      // Show modal only after animation completes
      setShowFeedback(true);
    });
  };

  const animateCardToCenter = () => {
    setIsAnimating(true);
    
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsAnimating(false);
      forceResetAnimations();
    });
  };

  // Action handlers
  const nextPostAction = () => {
    if (currentPost) {
      setViewedPosts(prev => [...prev, currentPost.id]);
    }
  };

  const handleFakePress = () => {
    if (!currentPost || isAnimating) return;
    
    setIsAnimating(true);
    handleSwipe('left');
    animateCardOffScreen('left');
  };

  const handleRealPress = () => {
    if (!currentPost || isAnimating) return;
    
    setIsAnimating(true);
    handleSwipe('right');
    animateCardOffScreen('right');
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleRestart = () => {
    setViewedPosts([]);
    forceResetAnimations();
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    setFeedbackData(null);
    // Check if there are more posts after closing the modal
    // This ensures the modal shows even for the last card
  };

  const handleSeeThread = () => {
    // TODO: Navigate to thread details
    console.log('Navigate to thread');
  };

  // Render empty state only if no posts available AND no feedback is showing
  if (!currentPost && !showFeedback) {
    return (
      <EmptyState 
        onRestart={handleRestart}
        onBack={handleBackPress}
      />
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

      {/* Card Stack Container */}
      <View style={styles.cardStackContainer}>
        {/* Next Card (Behind) */}
        {nextPost && (
          <ExploreCard
            post={nextPost}
            isNext={true}
            tagColors={tagColors}
          />
        )}
        
        {/* Current Card (On Top, Swipable) - Only render if currentPost exists */}
        {currentPost && (
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <ExploreCard
              post={currentPost}
              animationKey={animationKey}
              translateX={translateX}
              translateY={translateY}
              scale={scale}
              tagColors={tagColors}
            />
          </PanGestureHandler>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.fakeButton} onPress={handleFakePress}>
          <IconSymbol name="xmark" size={40} color="#000" />
          <Text style={styles.actionLabel}>FAKE</Text>
        </TouchableOpacity>
        
        <View style={styles.swipeInstructions}>
          <Text style={styles.swipeText}>swipe</Text>
          <Text style={styles.swipeDirection}>left/right.</Text>
        </View>
        
        <TouchableOpacity style={styles.realButton} onPress={handleRealPress}>
          <IconSymbol name="checkmark" size={40} color="#000" />
          <Text style={styles.actionLabel}>REAL</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Modal */}
      {feedbackData && (
        <FeedbackModal
          visible={showFeedback}
          userChoice={feedbackData.userChoice}
          isCorrect={feedbackData.isCorrect}
          post={feedbackData.post}
          onClose={handleCloseFeedback}
          onSeeThread={handleSeeThread}
        />
      )}
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
    paddingBottom: 15,
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  cardStackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 30,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  fakeButton: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  realButton: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  swipeInstructions: {
    alignItems: 'center',
    flex: 1,
  },
  swipeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  swipeDirection: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
  },
});