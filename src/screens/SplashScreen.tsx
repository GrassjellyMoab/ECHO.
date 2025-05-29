import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomWave, TopWave } from '../components/WaveBackground';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const ECHO_TEXT = "ECHO";
const TYPING_SPEED = 300; // milliseconds per character

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const [displayText, setDisplayText] = useState('');
  const [showDot, setShowDot] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    
    // Type out each character
    const typingInterval = setInterval(() => {
      if (currentIndex < ECHO_TEXT.length) {
        setDisplayText(prev => prev + ECHO_TEXT[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Show the dot after typing is complete
        setShowDot(true);
        // Navigate after a delay
        setTimeout(() => {
          navigation.replace('Auth');
        }, 1000);
      }
    }, TYPING_SPEED);

    return () => clearInterval(typingInterval);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <TopWave color="#E6D5E8" style={styles.topWave} />
      <Text style={styles.text}>
        {displayText}
        {showDot && '.'}
      </Text>
      <BottomWave color="#4A3D4F" style={styles.bottomWave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  topWave: {
    top: 0,
  },
  bottomWave: {
    bottom: 0,
  },
  text: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});

export default SplashScreen; 