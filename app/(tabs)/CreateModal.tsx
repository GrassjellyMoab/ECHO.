import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { NavigatorScreenParams, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Image } from 'react-native';
import { SwipeResultModal } from '@/src/components/create/verdict';
import ThreadModal from '@/src/components/ThreadModal';


type TabsParamList = {
  home: undefined;
  profile: undefined;
  settings: undefined;
};

type RootStackParamList = {
  '(tabs)': NavigatorScreenParams<TabsParamList>;
  '(auth)/index': undefined;
  '(splash)/index': undefined;
  splash: undefined;
  _sitemap: undefined;
  '+not-found': undefined;
};

const { height: screenHeight } = Dimensions.get('window');

interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ThreadData {
  id: string;
  author: string;
  title: string;
  timeAgo: string;
  readTime: string;
  views: string;
  comments: string;
  votes: string;
  tags: string[];
  hasImage?: boolean;
  isVerified?: boolean;
  avatar?: string;
  threadImageUrl?: string;
  content: string;
  real_ratio: number;
  ai_verdict?: string;
  hasVoted: boolean;
}

export default function CreateModal({ visible, onClose }: CreateModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slideAnim] = useState(new Animated.Value(screenHeight));
  const [imageUri, setImageUri] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [selectedThreadData, setSelectedThreadData] = useState<ThreadData | null>(null);  
  const [currentResult, setCurrentResult] = useState<{
    title: string;
    claim?: string;
    imageUri?: string;
    content?: string;
  } | null>(null);
  const topics = ['Health', 'Politics', 'Finance', 'Technology', 'Cybersecurity','Whatsapp','Concerts','Climate', 'Crypto', 'Science'];

  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(screenHeight);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setTitle('');
      setContent('');
      setImageUri('');
    });
  };

  const handlePost = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please add a title');
      return;
    }
  
    Alert.alert('Success', 'Thread posted successfully!', [
      {
        text: 'OK',
        onPress: () => {
          const postTitle = title;
  
          // Handle navigation and cleanup
          Animated.timing(slideAnim, {
            toValue: screenHeight,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            navigation.navigate('(tabs)', { screen: 'profile' });
            
            setTimeout(() => {
              // Pass title as the claim to fact-check
              setCurrentResult({
                title: postTitle,
                claim: postTitle,        // ← Title IS the claim
                imageUri: imageUri,      // ← Pass image if any
                content: content,        // ← Pass the description/content
              });
              setShowResultModal(true);
            }, 500);
            
            setTitle('');
            setContent('');
            setImageUri('');
          });
        }
      }
    ]);
  };

  const handleModalClose = () => {
    setShowResultModal(false);
    setCurrentResult(null);
  };

  const handleSeeThread = (threadData: ThreadData) => {
    handleModalClose();
    
    // Mark this as a fact-checked thread that should skip voting
    const threadDataWithSkipVoting = {
      ...threadData,
      votes: '0', // Ensure votes is 0
      hasVoted: false, // Ensure no vote recorded
      // Keep the ai_verdict to show the result
    };
    
    setSelectedThreadData(threadDataWithSkipVoting);
    setShowThreadModal(true);
  };

  const isPostEnabled = title.trim().length > 0 && content.trim().length > 0 && selectedTopics.length >0;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media access to pick an image.');
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
    } // TODO: handle the selected image (upload, preview, etc.)
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ translateY: slideAnim }],
                paddingTop: insets.top - 10,
                paddingBottom: insets.bottom,
              }
            ]}
          >
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={0}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <IconSymbol name="close" size={28} color="#662D91" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.postButton, !isPostEnabled && styles.postButtonDisabled]}
                  onPress={handlePost}
                  disabled={!isPostEnabled}
                >
                  <Text style={[styles.postButtonText, !isPostEnabled && styles.postButtonTextDisabled]}>
                    Post
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                  <TextInput
                    style={styles.titleInput}
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                    multiline
                    placeholderTextColor="#777"
                  />
                  
                  <TextInput
                    style={styles.contentInput}
                    placeholder="description"
                    value={content}
                    onChangeText={setContent}
                    multiline
                    placeholderTextColor="#777"
                  />
                  <TouchableOpacity
                    style={[styles.imagePickerBox, imageUri && styles.imagePickerBoxWithImage]}
                    onPress={handlePickImage}
                    activeOpacity={0.7}
                  >
                    {imageUri ? (
                      <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => setImageUri('')}
                        >
                          <Text style={styles.removeImageText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={styles.imagePickerText}>+ Tap to add an image</Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.topicSection}>
                    <Text style={styles.topicTitle}>Select Topics</Text>
                    <View style={styles.topicList}>
                      {topics.map((item) => {
                        const isSelected = selectedTopics.includes(item);
                        return (
                          <TouchableOpacity
                            key={item}
                            style={[styles.topicChip, isSelected && styles.topicChipSelected]}
                            onPress={() => {
                              if (isSelected) {
                                setSelectedTopics(prev => prev.filter(t => t !== item));
                              } else {
                                setSelectedTopics(prev => [...prev, item]);
                              }
                            }}
                          >
                            <Text style={[styles.topicChipText, isSelected && styles.topicChipTextSelected]}>
                              {item}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </ScrollView>
              
            </KeyboardAvoidingView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
      {currentResult && (
        <SwipeResultModal
          visible={showResultModal}
          onClose={handleModalClose}
          title={currentResult.title}
          claim={currentResult.claim}    // ← Pass the claim text
          imageUri={currentResult.imageUri}  
          content={currentResult.content}
          onSeeThread={handleSeeThread}
        />
      )}
      {selectedThreadData && (
        <ThreadModal
          visible={showThreadModal}
          threadData={selectedThreadData}
          onClose={() => {
            setShowThreadModal(false);
            setSelectedThreadData(null);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // distributes space evenly
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
  },
  closeButton: {
    width: 40, // fixed width to help center title
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold'

  },
  placeholder: {
    width: 40, // same as closeButton to balance the layout
  },
  postButton: {
    backgroundColor: '#662D91',
    marginTop:15,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center'
  },
  postButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'AnonymousPro-Bold',
  },
  postButtonTextDisabled: {
    color: '#999',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 7,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'SpaceMono-Regular',
    marginBottom: 7,
    lineHeight: 17,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  contentInput: {
    padding: 10,
    fontSize: 16,
    color: '#000',
    fontFamily: 'SpaceMono-Regular',
    marginTop:7,
    lineHeight: 17,
    minHeight: 200,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  topicSection: {
    marginTop: 10
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'AnonymousPro-Bold',
    color: '#000',
  },
  topicList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  topicChipSelected: {
    backgroundColor: '#662D91',
  },
  topicChipText: {
    color: '#777',
    fontSize: 14,
  },
  topicChipTextSelected: {
    color: '#fff',
  },
  imagePickerBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    height: 200,
    backgroundColor: '#f9f9f9',
},
imagePickerBoxWithImage: {
  borderWidth: 0,
  padding: 0,
  backgroundColor: 'transparent',
},
imagePickerText: {
  color: '#999',
  fontSize: 16,
  fontStyle: 'italic',
},
selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
},
imageContainer: {
  position: 'relative',
  width: '100%',
  height: 200,
  borderRadius: 10,
  overflow: 'hidden',
},
removeImageButton: {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: 'rgba(0,0,0,0.6)',
  borderRadius: 12,
  width: 24,
  height: 24,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},
removeImageText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  lineHeight: 20,
}
});
