import { IconSymbol } from '@/src/components/ui/IconSymbol';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Post {
  id: number;
  title: string;
  groundTruth: 'FAKE' | 'REAL';
  explanation: string;
  sources: string[];
}

interface FeedbackModalProps {
  visible: boolean;
  userChoice: 'FAKE' | 'REAL';
  isCorrect: boolean;
  post: Post;
  onClose: () => void;
  onSeeThread?: () => void;
}

export default function FeedbackModal({
  visible,
  userChoice,
  isCorrect,
  post,
  onClose,
  onSeeThread,
}: FeedbackModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in: scale from 0 to 1
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when modal becomes invisible
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  const resultIcon = userChoice === 'FAKE' ? 'xmark' : 'checkmark';
  const resultColor = userChoice === 'FAKE' ? '#FF6B6B' : '#51CF66';

  return (
    <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
      <Animated.View 
        style={[
          styles.modalContent,
          {
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <IconSymbol name="xmark" size={24} color="#666" />
        </TouchableOpacity>

        {/* Header icon */}
        <View style={styles.modalIconContainer}>
          <IconSymbol name="gavel.fill" size={40} color="#666" />
        </View>

        {/* Title */}
        <Text style={styles.modalTitle}>{post.title}</Text>

        {/* Result */}
        <View style={styles.resultContainer}>
          <View style={[styles.resultIconContainer, { backgroundColor: resultColor }]}>
            <IconSymbol name={resultIcon} size={40} color="#FFF" />
          </View>
          <Text style={[styles.resultText, { color: resultColor }]}>{userChoice}.</Text>
        </View>

        {/* Feedback */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackHeader}>
            {isCorrect ? '✅ CORRECT!' : '❌ INCORRECT!'}
          </Text>
          <Text style={styles.whyText}>WHY?</Text>
          <Text style={styles.explanationText}>{post.explanation}</Text>
        </View>

        {/* Sources */}
        <View style={styles.sourcesSection}>
          <Text style={styles.sourcesHeader}>SOURCES:</Text>
          <View style={styles.sourcesContainer}>
            {post.sources.map((source, index) => (
              <View key={index} style={styles.sourceTag}>
                <Text style={styles.sourceText}>{source}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* See Thread button */}
        <TouchableOpacity style={styles.seeThreadButton} onPress={onSeeThread}>
          <Text style={styles.seeThreadText}>SEE THREAD</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced shadow for the modal
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 25,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 1,
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'AnonymousPro-Bold',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Add shadow to the result icon
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  resultText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 20,
    fontFamily: 'AnonymousPro-Bold',
  },
  feedbackSection: {
    marginBottom: 20,
    width: '100%',
  },
  feedbackHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'AnonymousPro-Bold',
  },
  whyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'AnonymousPro-Bold',
  },
  explanationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'AnonymousPro-Bold',
  },
  sourcesSection: {
    marginBottom: 20,
    width: '100%',
  },
  sourcesHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'AnonymousPro-Bold',
  },
  sourcesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  sourceTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#9C27B0',
    borderRadius: 20,
  },
  sourceText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
  },
  seeThreadButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  seeThreadText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
    textDecorationLine: 'underline',
  },
}); 