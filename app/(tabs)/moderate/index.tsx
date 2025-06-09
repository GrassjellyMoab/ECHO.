import { AppHeader } from '@/src/components/ui/AppHeader';
import { useNavigation } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type FlaggedComment = {
  id: string;
  thread: string;
  user: string;
  comment: string;
};

const flaggedComments = [
  {
    id: '1',
    thread: 'Rising Sea Levels in Southeast Asia',
    user: 'john_doe',
    comment: 'This is ridiculous and fake news!',
  },
  // Add more test data here
];

export default function VerifyScreen() {
  const navigation = useNavigation();

    const renderItem = ({ item }: { item: FlaggedComment }) => (
    <TouchableOpacity
        style={styles.card}
        // onPress={() => navigation.navigate('CommentDetail', { commentData: item })}
    >
        <Text style={styles.thread}>Thread: {item.thread}</Text>
        <Text style={styles.user}>User: {item.user}</Text>
        <Text numberOfLines={2} style={styles.comment}>Comment: {item.comment}</Text>
    </TouchableOpacity>
    );
    // TBC
    return (
        <View style={styles.container}>
            <View style={styles.appHeaderWrapper}>
                <AppHeader />
            </View>

            <View>
                <Text style={styles.title}>Flagged Comments</Text>
                <FlatList
                    data={flaggedComments}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            </View>

        </View>
    );
}

// Your existing styles remain the same

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    appHeaderWrapper: {
        position: 'relative',
        backgroundColor: 'white'
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12
    },
    list: {
        gap: 10
    },
    card: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'white',
        elevation: 2,
    },
    thread: {
        fontWeight: 'bold',
        fontSize: 14
    },
    user: {
        fontSize: 13,
        marginTop: 4,
        color: 'gray'
    },
    comment: {
        marginTop: 6,
        fontSize: 14
    },
});