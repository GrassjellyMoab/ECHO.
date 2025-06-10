import SortFilterComponent, { additionalStyles } from '@/src/components/moderate/SortFilter';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { getTextColorForTag, tagColors } from '@/src/constants/posts';
import { db } from '@/src/firebase/config';
import { useCollectionData } from '@/src/store/dataStore';
import { useImagesStore } from '@/src/store/imgStore';
import { useRouter } from 'expo-router';
import { deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ThreadData {
    id: string;
    author: string;
    title: string;
    timeAgo: string;
    dateCreated: Timestamp;
    readTime: string;
    views: string;
    comments: string;
    votes: string;
    tags: string[];
    hasImage?: boolean;
    isVerified?: boolean;
    avatar?: string;
    threadImageUrl?: string;
    content?: string;
    real_ratio: number;
    ai_verdict?: string;
    hasVoted: boolean;
}

interface FlaggedCommentData {
    id: string;
    date: Date;
    is_flagged: boolean;
    is_pinned: boolean;
    num_likes: number;
    num_replies: number;
    reply_cid: string;
    text: string;
    tid: string;
    topic_id: string;
    uid: string;
    thread?: ThreadData; // Add thread data
}

const getFlaggedComments = () => {
    const commentsData = useCollectionData('comments');
    const threads = useCollectionData('threads');
    const topics = useCollectionData('topics');
    const users = useCollectionData('users');

    const getImagesByFolder = useImagesStore(state => state.getImagesByFolder);
    const userImages = getImagesByFolder('users');
    const threadImages = getImagesByFolder('threads');

    const userMap = new Map(users.map(user => [user.id, user]));
    const topicMap = new Map(topics.map(topic => [topic.id, topic]));
    const threadMap = new Map(threads.map(thread => [thread.id, thread]));

    const userImageMap = new Map(
        userImages.map(img => {
            const username = img.name.replace('.png', '').toLowerCase();
            return [username, img.url];
        })
    );

    const threadImageMap = new Map(
        threadImages.map(img => {
            const threadId = img.name.replace('.png', '');
            return [threadId, img.url];
        })
    );

    // Filter flagged comments and get their thread info
    return commentsData
        .filter(comment => comment.is_flagged === true)
        .map(comment => {
            const thread = threadMap.get(comment.tid);
            if (!thread) return null;

            const user = userMap.get(thread.uid);
            if (!user) return null;

            const threadTopics = thread.topics?.map((topicId: string) => {
                const topic = topicMap.get(topicId);
                return topic?.topic || { name: 'Unknown Topic', id: topicId };
            }) || [];

            const authorUsername = user.username || 'unknown';
            const authorKey = authorUsername.toLowerCase().replace('@', '');

            const avatar = userImageMap.get(authorKey) ||
                `https://via.placeholder.com/80x80/4FC3F7/ffffff?text=${authorUsername.charAt(0).toUpperCase()}`;

            const threadImageUrl = threadImageMap.get(thread.id);

            const timeAgo = thread.posted_datetime
                ? calculateTimeAgo(thread.posted_datetime.toDate())
                : 'Unknown time';

            // Return FlaggedCommentData structure
            return {
                // Comment properties matching FlaggedCommentData interface
                id: comment.id,
                date: comment.date,
                is_flagged: comment.is_flagged,
                is_pinned: comment.is_pinned,
                num_likes: comment.num_likes || 0,
                num_replies: comment.num_replies || 0,
                reply_cid: comment.reply_cid || '',
                text: comment.text || '',
                tid: comment.tid,
                topic_id: comment.topic_id,
                uid: comment.uid,

                // Thread info embedded
                thread: {
                    id: thread.id,
                    author: authorUsername.startsWith('@') ? authorUsername : '@' + authorUsername,
                    title: thread.title || 'Untitled Thread',
                    timeAgo,
                    dateCreated: thread.posted_datetime,
                    readTime: `${thread.read_duration} mins read`,
                    views: String(thread.num_views ?? 0),
                    comments: String(thread.num_comments ?? 0),
                    votes: String(thread.num_votes ?? 0),
                    tags: threadTopics,
                    hasImage: Boolean(threadImageUrl),
                    isVerified: user.role === 'admin' || user.role === 'moderator',
                    avatar,
                    threadImageUrl,
                    content: thread.description,
                    real_ratio: thread.real_ratio,
                    ai_verdict: thread.ai_verdict,
                    hasVoted: false
                } as ThreadData
            } as FlaggedCommentData;
        })
        .filter((item): item is FlaggedCommentData => item !== null)
        .sort((a, b) => (b.thread?.dateCreated?.seconds ?? 0) - (a.thread?.dateCreated?.seconds ?? 0));
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
}

const TagComponent = ({ tag }: { tag: string }) => {
    const getTagColor = (tagName: string) => {
        return tagColors[tagName.toLowerCase()] || tagColors.default;
    };

    const backgroundColor = getTagColor(tag);
    const textColor = getTextColorForTag(backgroundColor);

    return (
        <View style={[styles.tag, { backgroundColor }]}>
            <Text style={[styles.tagText, { color: textColor }]}>{tag}</Text>
        </View>
    );
};

export default function VerifyScreen() {
    const router = useRouter();

    const flaggedComments = getFlaggedComments();

    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [displayedComments, setDisplayedComments] = useState<FlaggedCommentData[]>(flaggedComments);
    const [comments, setComments] = useState<FlaggedCommentData[]>(flaggedComments);

    const navigateToThreadPage = (thread: ThreadData) => {
        router.push({
            pathname: '/home/thread',
            params: { thread: JSON.stringify(thread) },
        });
    }

    const toggleExpanded = (commentId: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
    };
    
    const handleAllow = async (commentId: string) => {
        try {
            const commentRef = doc(db, 'comments', commentId);
            await updateDoc(commentRef, {
                is_flagged: false
            });
            // Update local state
            setComments(prev => prev.filter(comment => comment.id !== commentId));
            setDisplayedComments(prev => prev.filter(comment => comment.id !== commentId));
            // handleCollectionUpdate will be triggered automatically via the listener
        } catch (error) {
            console.error('Error updating comment flag:', error);
            throw error;
        }
    };

    const handleDeny = async (commentId: string) => {
        try {
            const commentRef = doc(db, 'comments', commentId);
            await deleteDoc(commentRef);
            // Update local state
            setComments(prev => prev.filter(comment => comment.id !== commentId));
            setDisplayedComments(prev => prev.filter(comment => comment.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    };

    const renderItem = ({ item: comment }: { item: FlaggedCommentData }) => {
        const isExpanded = expandedItems.has(comment.id);
        const thread = comment.thread;

        return (
            <View style={styles.threadCard}>
                {/* Collapsed View */}
                <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => toggleExpanded(comment.id)}
                >
                    <View style={styles.headerLeft}>
                        <Image
                            source={{ uri: thread?.avatar }}
                            style={styles.avatar}
                        />
                        <View style={styles.headerInfo}>
                            <Text style={styles.username}>{comment.thread?.author}</Text>
                            <TouchableOpacity
                                onPress={() => thread && navigateToThreadPage(thread)}
                            >
                                <Text style={styles.threadTitle}>{thread?.title || 'Thread Title'}</Text>
                            </TouchableOpacity>
                            <View style={styles.tagsContainer}>
                                {thread?.tags?.map((tag, index) => (
                                    <TagComponent key={index} tag={tag} />
                                ))}
                            </View>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <IconSymbol
                            name={isExpanded ? "chevron.up" : "chevron.down"}
                            size={24}
                            color="#666"
                        />
                    </View>
                </TouchableOpacity>

                {/* Expanded View */}
                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {/* Flagged Comment Section */}
                        <View style={styles.flaggedSection}>
                            <Text style={styles.sectionTitle}>Flagged Comment</Text>
                            <Text style={styles.flaggedComment}>"{comment.text}"</Text>
                        </View>

                        {/* Thread Image */}
                        {thread?.threadImageUrl && (
                            <Image
                                source={{ uri: thread.threadImageUrl }}
                                style={styles.threadImage}
                            />
                        )}

                        {/* Description */}
                        {comment.thread?.content && (
                            <View style={styles.descriptionSection}>
                                <Text style={styles.description}>{comment.thread.content}</Text>
                            </View>
                        )}

                        {/* AI Verdict */}
                        <View style={styles.aiVerdictSection}>
                            <View style={styles.aiVerdictHeader}>
                                <IconSymbol name="info" size={16} color="#666" />
                                <Text style={styles.aiVerdictTitle}>AI Verdict</Text>
                            </View>
                            <Text style={styles.aiVerdict}>{comment.thread?.ai_verdict}</Text>
                        </View>

                        {/* Extracted Sources */}
                        <View style={styles.sourcesSection}>
                            <Text style={styles.sourcesTitle}>Extracted from Sources</Text>
                            <View style={styles.sourceTags}>
                                <View style={styles.sourceTag}>
                                    <Text style={styles.sourceTagText}>CNA</Text>
                                </View>
                                <View style={styles.sourceTag}>
                                    <Text style={styles.sourceTagText}>Strait Times</Text>
                                </View>
                                <View style={styles.sourceTag}>
                                    <Text style={styles.sourceTagText}>SingHealth</Text>
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.allowButton}
                                onPress={() => handleAllow(comment.id)}
                            >
                                <Text style={styles.allowButtonIcon}>✓</Text>
                                <Text style={styles.allowButtonText}>Allow</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.denyButton}
                                onPress={() => handleDeny(comment.id)}
                            >
                                <Text style={styles.denyButtonIcon}>✕</Text>
                                <Text style={styles.denyButtonText}>Deny</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
            <AppHeader />
            <View style={styles.content}>
                {/* Dashboard Cards */}
                <View style={styles.dashboard}>
                    <View style={styles.dashboardCard}>
                        <Text style={styles.dashboardStats}>{comments.length}</Text>
                        <Text style={styles.dashboardDesc}>To Review</Text>
                    </View>

                    <View style={styles.dashboardCard}>
                        <Text style={styles.dashboardStats}>11</Text>
                        <Text style={styles.dashboardDesc}>Reviewed</Text>
                    </View>
                </View>

                {/* Sort and Filter Buttons */}
                <SortFilterComponent
                    comments={flaggedComments} // Original unfiltered comments
                    onCommentsChange={setDisplayedComments} // Update displayed comments
                    styles={{ ...styles, ...additionalStyles }} // Merge your existing styles
                />

                {/* Comments List */}
                <FlatList
                    data={displayedComments}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    scrollEnabled={false}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: 16,
    },
    dashboard: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    dashboardCard: {
        flex: 1,
        backgroundColor: "#662D91",
        borderRadius: 8,
        padding: 16,
        textAlign: 'left',
    },
    dashboardStats: {
        color: "#FFFFFF",
        fontFamily: 'AnonymousPro-Bold',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    dashboardDesc: {
        color: "#FFFFFF",
        fontFamily: 'AnonymousPro-Bold',
        fontSize: 20,
        marginTop: 4,
    },
    listBtns: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#662D91',
    },
    filterIcon: {
        color: '#FFFFFF',
    },
    filterBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    list: {
        gap: 12
    },
    threadCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#662D91',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    username: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    threadTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    headerRight: {
        paddingLeft: 8,
        alignItems: 'flex-end',
        gap: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 6,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    expandedContent: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    flaggedSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    flaggedComment: {
        fontSize: 14,
        color: '#333',
        fontStyle: 'italic',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#FF6B6B',
    },
    threadImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    descriptionSection: {
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    aiVerdictSection: {
        marginBottom: 16,
    },
    aiVerdictHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    aiVerdictTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    aiVerdict: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        backgroundColor: '#f0f8ff',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#4169E1',
    },
    sourcesSection: {
        marginBottom: 20,
    },
    sourcesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    sourceTags: {
        flexDirection: 'row',
        gap: 8,
    },
    sourceTag: {
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    sourceTagText: {
        fontSize: 12,
        color: '#4338ca',
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    allowButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#10B981',
        paddingVertical: 12,
        borderRadius: 8,
    },
    allowButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    allowButtonIcon: {
        color: '#FFFFFF',
    },
    denyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#EF4444',
        paddingVertical: 12,
        borderRadius: 8,
    },
    denyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    denyButtonIcon: {
        color: '#FFFFFF',
    },
});