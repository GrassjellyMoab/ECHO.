import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const TYPING_INTERVAL = 100;
const WELCOME_TEXT = 'Welcome to Echo';

export default function SplashScreen() {
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < WELCOME_TEXT.length) {
      const timer = setTimeout(() => {
        setTypedText(prev => prev + WELCOME_TEXT[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, TYPING_INTERVAL);

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      <Image
        source={require('@assets/images/Landing.png')}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <Animated.View 
        entering={FadeIn.duration(1000)}
        style={styles.content}
      >
        <Text style={styles.text}>{typedText}</Text>
      </Animated.View>
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
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
}); 