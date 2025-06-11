import { db } from '@/src/firebase/config';
import { useAuthStore } from '@/src/store/authStore';
import { useCollectionData, useDataStore } from '@/src/store/dataStore';
import { useImagesStore } from '@/src/store/imgStore';
import { addDoc, collection } from "firebase/firestore";
import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';

interface Comment {
  id: string;
  date: Date | string;
  is_flagged: boolean;
  is_reviewed: boolean;
  is_pinned: boolean;
  num_likes: number;
  num_replies: number;
  reply_cid: string;
  text: string;
  tid: string;
  topic_id: string;
  uid: string;
}

interface User {
  id: string;
  username: string;
  role?: 'admin' | 'moderator' | 'user';
}

interface CommentsProps {
  maxHeight?: number;
  threadId?: string;
  getUserById?: (uid: string) => { username: string; avatar?: string; isVerified?: boolean };
  userLikes?: string[];
}

const CommentsSection: React.FC<CommentsProps> = ({
  maxHeight = 400,
  threadId,
  getUserById,
  userLikes = []
}) => {
  const { user, isAuthenticated, uid } = useAuthStore();
  const refreshCollection = useDataStore(state => state.refreshCollection);
  const users = useCollectionData('users') as User[];
  const comments = useCollectionData('comments') as Comment[];
  const getImagesByFolder = useImagesStore(state => state.getImagesByFolder);
  const userImages = React.useMemo(() => getImagesByFolder('users'), [getImagesByFolder]);

  const [newComment, setNewComment] = useState('');
  const [likedComments, setLikedComments] = useState<string[]>(userLikes);
  const [isExpanded, setIsExpanded] = useState(false);
  const [avatarErrors, setAvatarErrors] = useState<Set<string>>(new Set()); // Track failed avatars
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render for timestamp updates
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Refresh comments when component mounts and periodically update timestamps
  React.useEffect(() => {
    // Initial refresh when component mounts
    const refreshCommentsOnMount = async () => {
      try {
        console.log('🔄 Refreshing comments on component mount...');
        await refreshCollection('comments');
        console.log('✅ Comments refreshed on mount');
      } catch (error) {
        console.error('❌ Error refreshing comments on mount:', error);
      }
    };

    refreshCommentsOnMount();

    // Set up interval to update timestamps every minute
    const timestampInterval = setInterval(() => {
      setRefreshKey(prev => prev + 1); // Force re-render to update relative timestamps
    }, 60000); // Update every 60 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(timestampInterval);
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Filter and sort comments based on threadId and date
  const filteredComments = React.useMemo(() => {
    if (!comments || comments.length === 0) {
      return [];
    }

    let filtered = comments;
    
    // Filter out flagged comments
    filtered = filtered.filter(comment => comment.is_flagged === false);
    
    if (threadId) {
      filtered = filtered.filter(comment => comment.tid === threadId);
    }
    
    // Sort comments: pinned first, then by date (newest first)
    return filtered.sort((a, b) => {
      // Pinned comments always come first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
      // For dates, handle both Date objects and ISO strings
      let dateA: Date;
      let dateB: Date;
      
      if (a.date instanceof Date) {
        dateA = a.date;
      } else if (typeof a.date === 'string') {
        dateA = new Date(a.date);
      } else {
        dateA = new Date(); // fallback
      }
      
      if (b.date instanceof Date) {
        dateB = b.date;
      } else if (typeof b.date === 'string') {
        dateB = new Date(b.date);
      } else {
        dateB = new Date(); // fallback
      }
      
      // Sort by date: newest first (dateB - dateA gives descending order)
      return dateB.getTime() - dateA.getTime();
    });
  }, [comments, threadId]);

  const onAddComment = async (content: string) => {
    console.log('🚀 onAddComment called with content:', content);
    console.log('🔐 Auth status:', { isAuthenticated, uid });
    
    if (!isAuthenticated || !uid) {
      console.error('User must be authenticated to add a comment');
      return;
    }

    console.log('✅ User is authenticated, proceeding...');

    try {
      const commentsRef = collection(db, 'comments');
      console.log('📝 Comments collection reference created');
      
      const newCommentObj = {
        date: new Date().toISOString(),
        is_flagged: false,
        is_pinned: false,
        is_reviewed: false,
        num_likes: 0,
        num_replies: 0,
        reply_cid: '',
        text: content,
        tid: threadId,
        topic_id: 'topic_healthcare',
        uid: uid
      };
      
      console.log('📦 Comment object created:', newCommentObj);
      console.log("🔄 Attempting to add comment to Firestore...");
      
      const docRef = await addDoc(commentsRef, newCommentObj);
      console.log('✅ Comment added successfully! Doc ID:', docRef.id);
      
      // Refresh the comments collection to ensure UI updates
      console.log('🔄 Refreshing comments collection...');
      await refreshCollection('comments');
      console.log('✅ Comments collection refreshed');
      
    } catch (error: any) {
      console.error('❌ Error adding comment:', error);
      console.error('❌ Error details:', {
        message: error?.message || 'Unknown error',
        code: error?.code || 'No code',
        stack: error?.stack || 'No stack'
      });
    }
  };

  const handleLikeComment = (commentId: string) => {
    setLikedComments(prev => {
      if (prev.includes(commentId)) {
        return prev.filter(id => id !== commentId);
      } else {
        return [...prev, commentId];
      }
    });

    console.log('Toggling like for comment:', commentId);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
     
      setNewComment('');
    }
  };

  const calculateTimeAgo = (timestamp: number | string | Date) => {
      const now = new Date();
      const time = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
      const diffInMs = now.getTime() - time.getTime();

      const minutes = Math.floor(diffInMs / (1000 * 60));
      const hours = Math.floor(diffInMs / (1000 * 60 * 60));
      const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30.44); // Average days per month
      const years = Math.floor(days / 365.25); // Account for leap years

      if (years > 0) return `${years} year${years === 1 ? '' : 's'} ago`;
      if (months > 0) return `${months} month${months === 1 ? '' : 's'} ago`;
      if (weeks > 0) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
      if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
      if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
      if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
      return 'Just now';
  };

  // Improved user data retrieval with better avatar handling
const getUserFromStore = (uid: string) => {
  if (!users || users.length === 0) {
    return { 
      username: `user_${uid}`, 
      avatar: null,
      isVerified: false 
    };
  }

  const user = users.find(u => u.id === uid);
  if (user) {
    // Clean username for image matching - remove @ symbol and convert to lowercase
    const cleanUsername = user.username.replace('@', '').toLowerCase();
    
    // Try to find matching avatar image from assets/avatars folder
    const avatarImage = userImages.find(img => {
      // Extract filename without extension
      const imageName = img.name.toLowerCase().replace('.png', '');      
      // Match exact username with .png extension
      return imageName === cleanUsername;
    });

    // Alternative: If images are stored with full path, use this instead:
    // const avatarImage = userImages.find(img => {
    //   const fileName = img.name.toLowerCase();
    //   const expectedFileName = `${cleanUsername}.png`;
    //   return fileName === expectedFileName || fileName.endsWith(`/${expectedFileName}`);
    // });

    return {
      username: user.username,
      avatar: avatarImage?.url || null,
      isVerified: user.role === 'admin' || user.role === 'moderator'
    };
  }
  
  return { 
    username: `user_${uid}`, 
    avatar: null, 
    isVerified: false 
  };
};

  // Handle avatar error
  const handleAvatarError = (userId: string) => {
    console.log('Avatar failed to load for user:', userId);
    setAvatarErrors(prev => new Set([...prev, userId]));
  };

  // Generate fallback avatar text
  const getAvatarFallbackText = (username: string) => {
    const cleanUsername = username.replace('@', '');
    return cleanUsername.charAt(0).toUpperCase();
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const user = getUserById ? getUserById(item.uid) : getUserFromStore(item.uid);
    const isLiked = likedComments.includes(item.id);

    const hasAvatarError = avatarErrors.has(item.uid);

    return (
      <Animated.View style={[styles.commentContainer, { opacity: fadeAnim }]}>
        {item.is_pinned && (
          <View style={styles.pinnedIndicator}>
            <IconSymbol name="pin" style={styles.pinnedIcon} />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}
        
        <View style={styles.commentHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {user.avatar && !hasAvatarError ? (
                <Image 
                  source={{ uri: user.avatar }} 
                  style={styles.avatarImage}
                  onError={() => handleAvatarError(item.uid)}
                />
              ) : (
                // Fallback avatar with user's initial
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatarText}>
                    {getAvatarFallbackText(user.username)}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.userDetails}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>@{user.username}</Text>
                {user.isVerified && (
                  <IconSymbol name="checkmark.circle.fill" style={styles.verifiedIcon} />
                )}
              </View>
              <Text style={styles.timestamp}>{calculateTimeAgo(item.date)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.commentContent}>{item.text}</Text>

        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikeComment(item.id)}
          >
            <IconSymbol 
              name={isLiked ? "heart.fill" : "heart"} 
              style={[styles.actionIcon, isLiked && styles.likedIcon]}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="bubble.left" style={styles.actionIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="arrowshape.turn.up.right" style={styles.actionIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <IconSymbol name="exclamationmark.triangle" style={styles.actionIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{item.num_replies}</Text>
            <Text style={styles.statLabel}>replies</Text>
          </View>
          <Text style={styles.statSeparator}>•</Text>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{item.num_likes}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Show loading or empty state if no data
  if (!comments || !users) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Comments</Text>
        </View>
        <Text style={styles.emptyState}>Loading comments...</Text>
      </View>
    );
  }

  // Show empty state if no comments match the filters
  if (filteredComments.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Comments</Text>
        </View>

        <View style={styles.addCommentSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="join the conversation"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={280}
              textAlignVertical="center"
            />
            {newComment.trim().length > 0 && (
              <TouchableOpacity 
                style={styles.postButton}
                onPress={handleAddComment}
              >
                <IconSymbol name="arrow.up2" style={styles.postIcon} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.emptyState}>
          {threadId 
            ? "No comments found for this thread." 
            : "No comments yet. Be the first to comment!"
          }
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comments</Text>
      </View>

      <View style={styles.addCommentSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Join the conversation"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={280}
            textAlignVertical="center"
          />
          {newComment.trim().length > 0 && (
            <TouchableOpacity 
              style={styles.postButton}
              onPress={handleAddComment}
            >
              <IconSymbol name="arrow.up2" style={styles.postIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredComments.map((item, index) => (
        <View key={item.id}>
          {renderComment({ item })}
          {index < filteredComments.length - 1 && <View style={styles.separator} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 10,
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  addCommentSection: {
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 50,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'AnonymousPro',
    color: '#666',
    backgroundColor: '#f8f8f8',
    minHeight: 44,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  postButton: {
    position: 'absolute',
    right: 6,
    top: '50%',
    transform: [{ translateY: -18 }],
    backgroundColor: '#662D91',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postIcon: {
    color: '#fff',
    fontSize: 18,
  },
  commentsList: {
    paddingHorizontal: 20,
  },
  commentContainer: {
    paddingVertical: 16,
  },
  pinnedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinnedIcon: {
    color: '#662D91',
    marginRight: 4,
    fontSize: 12,
  },
  pinnedText: {
    color: '#662D91',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'AnonymousPro-Bold',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#662D91',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'AnonymousPro-Bold',
  },
  userDetails: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
    marginRight: 4,
  },
  verifiedIcon: {
    color: '#662D91',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'AnonymousPro',
    marginTop: 2,
  },
  commentContent: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: 'AnonymousPro',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButton: {
    marginRight: 20,
    padding: 4,
  },
  actionIcon: {
    color: '#666',
    fontSize: 18,
  },
  likedIcon: {
    color: '#C73535',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
    marginRight: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'AnonymousPro',
  },
  statSeparator: {
    color: '#ccc',
    marginHorizontal: 8,
    fontFamily: 'AnonymousPro',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  emptyState: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    fontFamily: 'AnonymousPro',
    paddingVertical: 20,
  },
});

export default CommentsSection;