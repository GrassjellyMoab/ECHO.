import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useImagesStore } from '@/src/store/imgStore';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Discussion {
  id: number;
  title: string;
  author: string;
  timeAgo: string;
  voters: number;
  avatar: string;
}

interface TopicsProps {
  topic: string;
  onBack?: () => void;
}

const health_titles = ["Has our Singhealth data been leaked?", "MOH has raised the dengue alert to...", "Bubble Tea Shops Face Tax Hike ...", "Sleep Position Tied to Parkinson's", "Avocados Contain Natural Stress ..."];
const politics_titles = ["Did PAP win Sengkang GRC?", "Worker's Party running against PM ...", "Lawrence Wong the new Prime Minister?", "Did PAP win Sengkang GRC?", "Worker's Party running against PM ...", "Lawrence Wong the new Prime Minister?"];
const finance_titles = ["Invest now! Guaranteed returns, ...", "Your account frozen. Verify ...", "Last chance: Double your money ...", "Urgent: Pay tax penalty or face ...", "Congratulations! You've won million ..."];
const technology_titles = ["Congratulations! You won million ...", "Your account expires tomorrow. ...", "Whatsapp update: Add music to status.", "Is Whatsapp secretly tracking us?", "WhatsApp will charge fees unless ..."];
const cybersecurity_titles = ["Hackers can remotely access your ...", "Government secretly installs ...", "Using incognito mode makes you ...", "Cybercriminals can steal passwords", "5G towers automatically download ..."];

const Topics = ({ topic, onBack }: TopicsProps) => {
  const [selectedSort, setSelectedSort] = useState('MOST VOTERS');
  const getImagesByFolder = useImagesStore(state => state.getImagesByFolder);
  const userImages = getImagesByFolder('users');

  let titles: string[] = [];
  let num_vigilants = 0;

  switch (topic) {
    case "Health":
      titles = health_titles;
      num_vigilants = 401;
      break;
    case "Politics":
      titles = politics_titles;
      num_vigilants = 320;
      break;
    case "Finance":
      titles = finance_titles;
      num_vigilants = 506;
      break;
    case "Technology":
      titles = technology_titles;
      num_vigilants = 490;
      break;
    case "Cybersecurity":
      titles = cybersecurity_titles;
      num_vigilants = 506;
      break;
  }

  const discussions: Discussion[] = [
    {
      id: 1,
      title: titles[0],
      author: "johndoe",
      timeAgo: "9 days ago",
      voters: 987,
      avatar: require('@/src/assets/avatars/johndoe.png')
    },
    {
      id: 2,
      title: titles[1],
      author: "echoooo",
      timeAgo: "6 days ago",
      voters: 793,
      avatar: require('@/src/assets/avatars/echoooo.png')
    },
    {
      id: 3,
      title: titles[2],
      author: "notascammer",
      timeAgo: "2 days ago",
      voters: 734,
      avatar: require('@/src/assets/avatars/notascammer.png')
    },
    {
      id: 4,
      title: titles[3],
      author: "amychong23",
      timeAgo: "3 days ago",
      voters: 696,
      avatar: require('@/src/assets/avatars/amychong23.png')
    },
    {
      id: 5,
      title: titles[4],
      author: "chloe_tech",
      timeAgo: "9 days ago",
      voters: 650,
      avatar: require('@/src/assets/avatars/chloe_tech.png')
    },
];
  const getActivityAvatarUrl = (username: string) => {
    const cleanUsername = username.replace("@", "");
    return userImages.find(img => img.name === `${cleanUsername}.png`)?.url || `https://via.placeholder.com/40x40/4A5568/ffffff?text=${cleanUsername.slice(0, 2).toUpperCase()}`;
  };

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navigationHeader}>
        <View style={styles.headerContent}>
          <IconSymbol name={topic.toLowerCase()} size={20} color="#666" style={styles.headerIcon} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{topic}</Text>
            <View style={styles.headerSubtitleContainer}>
              <View style={styles.dot} />
              <Text style={styles.headerSubtitle}>{num_vigilants} vigilants</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sort Filter */}
      <View style={styles.sortFilter}>
        <IconSymbol name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {/* Handle sort change */ }}
        >
          <Text style={styles.sortText}>{selectedSort}</Text>
          <IconSymbol name="chevron.down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Discussion List */}
      <ScrollView style={styles.discussionList}>
        {discussions.map((discussion: Discussion, index: number) => (
          <TouchableOpacity key={discussion.id} style={styles.discussionItem}>
            <Text style={styles.discussionTitle}>
              {discussion.title}
            </Text>
            <View style={styles.discussionMeta}>
              <Image
                source={{ uri: getActivityAvatarUrl(discussion.author) }}
                style={styles.avatar}
                cachePolicy="memory-disk"
              />
              <View style={styles.metaText}>
                <Text style={styles.metaItem}>{discussion.timeAgo}</Text>
                <Text style={styles.metaItem}> | </Text>
                <Text style={styles.metaItem}>{topic}</Text>
                <Text style={styles.metaItem}> | </Text>
                <Text style={styles.metaItem}>{discussion.voters} voters</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerIcon: {
    fontSize: 40,
    color: '#662D91',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#662D91',
    marginRight: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'AnonymousPro-Bold',
  },
  sortFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
    fontFamily: 'AnonymousPro-Bold',
  },
  discussionList: {
    flex: 1,
  },
  discussionItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'AnonymousPro-Bold',
  },
  discussionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  metaText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaItem: {
    fontSize: 14,
    color: '#666',
  },
});

export default Topics;