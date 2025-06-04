import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  PanResponderInstance,
} from 'react-native';

interface Card {
  id: number;
  title: string;
  color: string;
}

type SwipeDirection = 'left' | 'right';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;
const SWIPE_OUT_DURATION = 250;

const SwipeableCards: React.FC = () => {
  const [cards] = useState<Card[]>([
    { id: 1, title: 'Card 1', color: '#FF6B6B' },
    { id: 2, title: 'Card 2', color: '#4ECDC4' },
    { id: 3, title: 'Card 3', color: '#45B7D1' },
    { id: 4, title: 'Card 4', color: '#96CEB4' },
    { id: 5, title: 'Card 5', color: '#FFEAA7' },
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

  const forceSwipe = (direction: SwipeDirection): void => {
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

  const onSwipeComplete = (direction: SwipeDirection): void => {
    const item = cards[currentIndex];
    console.log(`Swiped ${direction} on:`, item.title);

    setCurrentIndex(prev => prev + 1);
    position.setValue({ x: 0, y: 0 });
    rotate.setValue(0);
    opacity.setValue(1);
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
    const translateY = (index - currentIndex) * 5;

    return {
      transform: [{ scale }, { translateY }],
      opacity: index <= currentIndex + 2 ? 1 : 0,
    };
  };

  const panResponder: PanResponderInstance = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderGrant: (evt, gestureState) => {
      console.log('Pan responder granted');
    },
    onPanResponderMove: (evt, gestureState) => {
      position.setValue({ x: gestureState.dx, y: gestureState.dy });
      rotate.setValue(gestureState.dx);
    },
    onPanResponderTerminationRequest: (evt, gestureState) => false,
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
    onPanResponderTerminate: (evt, gestureState) => {
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
          { backgroundColor: card.color },
          getCardStyle(index),
          { zIndex: cards.length - index },
        ]}
        {...(isCurrentCard ? panResponder.panHandlers : {})}
      >
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardSubtitle}>Swipe left or right</Text>

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
              <Text style={styles.indicatorText}>LIKE</Text>
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
              <Text style={styles.indicatorText}>PASS</Text>
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
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {cards.map((card, index) => renderCard(card, index)).reverse()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    left: screenWidth * 0.075,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 3,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
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
});

export default SwipeableCards;