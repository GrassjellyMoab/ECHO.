import { ThemedText } from '@components/ThemedText';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const TYPING_SEQUENCE = ['E', 'EC', 'ECH', 'ECHO', 'ECHO.'];
const TYPING_INTERVAL = 300; // Time between each character
const FINAL_PAUSE = 1000; // Time to wait after complete sequence

export default function SplashScreen() {
  const [currentText, setCurrentText] = useState('');
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (sequenceIndex < TYPING_SEQUENCE.length) {
      timer = setTimeout(() => {
        setCurrentText(TYPING_SEQUENCE[sequenceIndex]);
        setSequenceIndex(prev => prev + 1);
      }, sequenceIndex === 0 ? 300 : TYPING_INTERVAL); // Initial delay
    } else if (!animationComplete) {
      // Mark animation as complete and wait before navigating
      setAnimationComplete(true);
      timer = setTimeout(() => {
        router.replace('/(auth)');
      }, FINAL_PAUSE);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [sequenceIndex, animationComplete, router]);

  return (
    <View style={styles.container}>
      <Image
        source={require('@assets/Landing.png')}
        style={[styles.backgroundImage, { opacity: 0.3 }]}
        contentFit="cover"
      />
      <View style={styles.content}>
        <Animated.View 
          entering={FadeIn.duration(300)}
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
    minHeight: 60, // Prevent layout shift
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
    fontFamily: 'AnonymousPro-Bold',
  },
}); 