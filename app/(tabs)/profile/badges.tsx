import { IconSymbol } from '@/src/components';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { useImagesStore } from '@/src/store/imgStore';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Badge {
    id: string;
    name: string;
    description: string;
    image?: string;
    earned: boolean;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}


const BadgeCard: React.FC<{ badge: Badge }> = ({ badge }) => {
    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return '#4CAF50';
            case 'rare': return '#2196F3';
            case 'epic': return '#9C27B0';
            case 'legendary': return '#FF9800';
            default: return '#757575';
        }
    };

    const getRarityGlow = (rarity: string) => {
        switch (rarity) {
            case 'epic': return styles.epicGlow;
            case 'legendary': return styles.legendaryGlow;
            default: return {};
        }
    };

    return (
        <View style={[styles.badgeCard, getRarityGlow(badge.rarity)]}>
            <View style={{ borderColor: getRarityColor(badge.rarity) }}>
                <Image 
                    source={badge.image || 'https://via.placeholder.com/120x120/757575/ffffff?text=Badge'} 
                    style={styles.badgeImage}
                    cachePolicy="memory-disk"
                />
            </View>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
        </View>
    );
};

export default function BadgesScreen() {
    const router = useRouter();

    const getImagesByFolder = useImagesStore(state => state.getImagesByFolder);
    const badgeImages = getImagesByFolder('badges');

    const badgesData: Badge[] = [
        {
            id: '1',
            name: 'TRUTH TURTLE',
            description: 'Correctly voted 100 times whether information is true or false.',
            image: badgeImages.find(img => img.name === 'truth_turtle.png')?.url,
            earned: true,
            rarity: 'common'
        },
        {
            id: '2',
            name: 'UPVOTE SHARK',
            description: 'Comments or posts have been voted 100 times for providing clear, factual insights.',
            image: badgeImages.find(img => img.name === 'upvote_shark.png')?.url,
            earned: true,
            rarity: 'rare'
        },
        {
            id: '3',
            name: 'SMARTY PENGZ',
            description: 'Among the first 10% of correct voters on 50 posts that were later confirmed as misinformation.',
            image: badgeImages.find(img => img.name === 'smarty_pengz.png')?.url,
            earned: true,
            rarity: 'epic'
        },
        {
            id: '4',
            name: 'ULTRA UPVOTE SHARK',
            description: 'Comments or posts have been upvoted 200 times for providing clear, factual insights.',
            image: badgeImages.find(img => img.name === 'ultra_upvote_shark.png')?.url,
            earned: true,
            rarity: 'legendary'
        },
        {
            id: '5',
            name: 'DOLPHIN',
            description: 'Among the first 10% of correct voters on 50 posts that were later confirmed as misinformation.',
            image: badgeImages.find(img => img.name === 'dolphin.png')?.url,
            earned: true,
            rarity: 'epic'
        },
        {
            id: '6',
            name: 'OCTOPUS',
            description: 'Comments or posts have been upvoted 200 times for providing clear, factual insights.',
            image: badgeImages.find(img => img.name === 'octopus.png')?.url,
            earned: true,
            rarity: 'legendary'
        },
    ];

    const handleBackPress = () => {
        router.back();
    };

    const renderBadgeRow = (badges: Badge[], startIndex: number) => {
        return (
            <View style={styles.badgeRow} key={startIndex}>
                {badges.slice(startIndex, startIndex + 2).map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBackPress}>
                <IconSymbol name="arrow-back" size={23} color="#662D91" />
            </TouchableOpacity>

            {/* Badges Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>BADGES</Text>
            </View>

            {/* Badges Grid */}
            <View style={styles.badgesContainer}>
                {Array.from({ length: Math.ceil(badgesData.length / 2) }, (_, i) =>
                    renderBadgeRow(badgesData, i * 2)
                )}
            </View>
        </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    titleContainer: {
        alignItems: 'center',
        paddingBottom: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        color: '#333',
        letterSpacing: 2,
        fontFamily: 'AnonymousPro-Bold',
    },
    badgesContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    badgeCard: {
        flex: 0.48,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    badgeImage: {
        width: 120,
        height: 120,
        borderRadius: 30,
        marginBottom: 10,
    },
    badgeName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    badgeDescription: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        lineHeight: 16,
    },
    backBtn: {
    paddingHorizontal: 20,
    paddingBottom: 5,
    backgroundColor: '#f5f5f5'
    },
    epicGlow: {
        shadowColor: '#9C27B0',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    legendaryGlow: {
        shadowColor: '#FF9800',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
});