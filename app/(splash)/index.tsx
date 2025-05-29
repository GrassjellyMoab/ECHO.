import { ThemedText } from '@components/ThemedText';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const TYPING_SEQUENCE = ['E', 'EC', 'ECH', 'ECHO', 'ECHO.'];
const TYPING_INTERVAL = 600; // Time between each sequence
const FINAL_PAUSE = 3000; // Time to wait after complete sequence

export default function SplashScreen() {
  console.log('=== SPLASH SCREEN MOUNTED ===');
  const [currentText, setCurrentText] = useState('INITIAL');  // Changed to see if state works
  const [sequenceIndex, setSequenceIndex] = useState(0);  // Start from 0
  const router = useRouter();

  // Debug log function
  const debugLog = (message: string) => {
    console.log(`DEBUG: ${message}`);
  };

  useEffect(() => {
    debugLog('Effect running');
    debugLog(`Index: ${sequenceIndex}, Text: ${currentText}`);

    const timer = setTimeout(() => {
      debugLog('Timer fired');
      if (sequenceIndex < TYPING_SEQUENCE.length) {
        debugLog(`Updating to: ${TYPING_SEQUENCE[sequenceIndex]}`);
        setCurrentText(TYPING_SEQUENCE[sequenceIndex]);
        setSequenceIndex(prev => prev + 1);
      } else {
        debugLog('Sequence complete, navigating...');
        router.replace('/(auth)');
      }
    }, sequenceIndex === 0 ? 100 : TYPING_INTERVAL);

    return () => {
      debugLog('Cleanup timer');
      clearTimeout(timer);
    };
  }, [sequenceIndex]);

  return (
    <View style={styles.container}>
      <Image
        source={require('@assets/Landing.png')}
        style={[styles.backgroundImage, { opacity: 0.3 }]}
        contentFit="cover"
      />
      <View style={styles.content}>
        {/* Debug info */}
        <Text style={styles.debugText}>Debug Info:</Text>
        <Text style={styles.debugText}>Index: {sequenceIndex}</Text>
        <Text style={styles.debugText}>Current: {currentText}</Text>
        
        {/* Main animated text */}
        <Animated.View 
          entering={FadeIn.duration(500)}
          style={styles.textContainer}
        >
          <ThemedText style={styles.text}>{currentText}</ThemedText>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginTop: 20,
  },
  text: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
  },
  debugText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 999,
  },
}); 