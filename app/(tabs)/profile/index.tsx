import { AppHeader } from '@/src/components/ui/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useCollectionData } from '@/src/store/dataStore';
import { useImagesStore } from '@/src/store/imgStore';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../../src/store/authStore';

interface ActivityItem {
  id: string;
  type: 'like' | 'comment' | 'thread';
  user: string;
  action: string;
  thread?: string;
  timeAgo: string;
  avatar: number;
}

interface ThreadItem {
  id: string;
  title: string;
  timeAgo: string;
  readTime: string;
  content: string;
  image?: string;
}

const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'like',
    user: '@johndoe',
    action: 'and others liked your thread',
    thread: '"Lady Gaga touring all over Asia??"',
    timeAgo: '1w',
    avatar: require('@/src/assets/avatars/johndoe.png')
  },
  {
    id: '2',
    type: 'thread',
    user: '@echoooo',
    action: 'posted a thread you might be interested in!',
    timeAgo: '1w',
    avatar: require('@/src/assets/avatars/echoooo.png')
  },
  {
    id: '3',
    type: 'like',
    user: '@notascammer',
    action: 'and others liked your thread',
    thread: '"Ez-link ...."',
    timeAgo: '1w',
    avatar: require('@/src/assets/avatars/notascammer.png')
  },
  {
    id: '4',
    type: 'comment',
    user: '@amychong23',
    action: 'commented on your thread',
    thread: '"Thanks for sharing!"',
    timeAgo: '1w',
    avatar: require('@/src/assets/avatars/amychong23.png')
  },
  {
    id: '5',
    type: 'comment',
    user: '@chloe_tech',
    action: 'commented on your thread',
    thread: '"Very reliable sources!"',
    timeAgo: '1w',
    avatar: require('@/src/assets/avatars/chloe_tech.png')
  }
];

const mockThreads: ThreadItem[] = [
  {
    id: 't0003',
    title: 'Lady Gaga coming to Singapore??',
    timeAgo: '3 days ago',
    readTime: '1 mins read',
    content: 'Heard Lady Gaga is finally coming to Singapore!! I\'m so excited Is this true?',
    image: 'https://via.placeholder.com/350x200/662D91/ffffff?text=Lady+Gaga'
  }
];

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'threads' | 'activity'>('activity');
  const [debugTaps, setDebugTaps] = useState(0);
  const getImagesByFolder = useImagesStore(state => state.getImagesByFolder);

  const users = useCollectionData('users');
  const threadImages = getImagesByFolder('threads');
  const userImages = getImagesByFolder('users');

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
          }
        }
      ]
    );
  };

  const ActivitySection = () => {
    // Pre-compute image URLs to prevent re-computation on every render
    const getActivityAvatarUrl = (username: string) => {
      const cleanUsername = username.replace("@", "");
      return userImages.find(img => img.name === `${cleanUsername}.png`)?.url || `https://via.placeholder.com/40x40/4A5568/ffffff?text=${cleanUsername.slice(0, 2).toUpperCase()}`;
    };

    return (
      <View style={styles.activityContainer}>
        <Text style={styles.timeSection}>Last 7 days</Text>
        {mockActivity.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.activityItem}>
            <Image 
              source={getActivityAvatarUrl(item.user)} 
              style={styles.activityAvatar}
              cachePolicy="memory-disk"
            />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                <Text style={styles.activityUser}>{item.user}</Text> {item.action}
                {item.thread && <Text style={styles.activityThread}> {item.thread}</Text>}
              </Text>
              <Text style={styles.activityTime}>{item.timeAgo}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.timeSection}>Last 30 days</Text>
        {mockActivity.slice(3).map((item) => (
          <View key={item.id} style={styles.activityItem}>
            <Image 
              source={getActivityAvatarUrl(item.user)} 
              style={styles.activityAvatar}
              cachePolicy="memory-disk"
            />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                <Text style={styles.activityUser}>{item.user}</Text> {item.action}
                {item.thread && <Text style={styles.activityThread}> {item.thread}</Text>}
              </Text>
              <Text style={styles.activityTime}>{item.timeAgo}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const ThreadsSection = () => {
    // Pre-compute thread image URLs
    const getThreadImageUrl = (threadId: string) => {
      return threadImages.find(img => img.name === `${threadId}.png`)?.url;
    };

    return (
      <View style={styles.threadsContainer}>
        {mockThreads.map((thread) => (
          <TouchableOpacity key={thread.id} style={styles.threadCard}>
            {thread.image && (
              <Image 
                source={getThreadImageUrl(thread.id)} 
                style={styles.threadImage}
                cachePolicy="memory-disk"
              />
            )}
            <View style={styles.threadContent}>
              <Text style={styles.threadTitle}>{thread.title}</Text>
              <Text style={styles.threadMeta}>{thread.timeAgo} • {thread.readTime}</Text>
              <Text style={styles.threadText}>{thread.content}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Show loading or fallback if no user data
  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>No user data available</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
      {/* Header with settings */}
      <AppHeader />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <IconSymbol name="logout" size={24} color="#000" />
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image
            source={userImages.find(img => img.name === `${user.username.toLowerCase()}.png`)?.url || 'https://via.placeholder.com/120x120/4FC3F7/ffffff?text=User'}
            style={styles.profileImage}
            cachePolicy="memory-disk"
          />
        </View>

        <View style={styles.usernameContainer}>
          <Text style={styles.username}>{'@' + user.username}</Text>
          {user.isVerified && (
            <IconSymbol name="checkmark.circle.fill" size={20} color="#662D91" />
          )}
        </View>

        <Text style={styles.displayName}>{user.first_name + ' ' + user.last_name || 'User'}</Text>

        {/* Followers/Following */}
        <View style={styles.followContainer}>
          <View style={styles.followItem}>
            <Text style={styles.followNumber}>{user.followers}</Text>
            <Text style={styles.followLabel}>followers</Text>
          </View>
          <View style={styles.followItem}>
            <Text style={styles.followNumber}>{user.followees}</Text>
            <Text style={styles.followLabel}>following</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/profile/badges')}
          >
            <Text style={styles.actionButtonText}>View Badges</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'threads' && styles.activeTab]}
          onPress={() => setActiveTab('threads')}
        >
          <Text style={[styles.tabText, activeTab === 'threads' && styles.activeTabText]}>
            Threads
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'activity' ? <ActivitySection /> : <ThreadsSection />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  logoutButton: {
    position: 'absolute',
    top: 90,
    right: 20,
    zIndex: 10,
    padding: 4,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    fontFamily: 'AnonymousPro-Bold',
  },
  followContainer: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 20,
  },
  followItem: {
    alignItems: 'center',
  },
  followNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  followLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#662D91',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: '#662D91',
    fontSize: 14,
    fontFamily: 'AnonymousPro-Bold',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#662D91',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
  },
  activeTabText: {
    color: '#662D91',
    fontWeight: 'bold',
  },
  content: {
    backgroundColor: '#FFFFFF',
    minHeight: 400,
  },
  activityContainer: {
    padding: 20,
  },
  timeSection: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    marginTop: 16,
    fontFamily: 'AnonymousPro-Bold',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    fontFamily: 'AnonymousPro-Bold',
  },
  activityUser: {
    fontWeight: 'bold',
    color: '#000',
  },
  activityThread: {
    color: '#662D91',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'AnonymousPro-Bold',
  },
  threadsContainer: {
    padding: 20,
  },
  threadCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    boxShadow: '-4px 4px 8px #BEBEBE, 4px -4px 8px #FFFFFF',
  },
  threadImage: {
    width: '100%',
    height: 200,
  },
  threadContent: {
    padding: 16,
  },
  threadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'AnonymousPro-Bold',
  },
  threadMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'AnonymousPro-Bold',
  },
  threadText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    fontFamily: 'AnonymousPro-Bold',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'AnonymousPro-Bold',
  },
}); 