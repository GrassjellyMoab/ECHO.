import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ThreadModal from '../ThreadModal';

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
  sources: string[];  
}

interface SwipeResultModalProps {
    visible: boolean;
    onClose: () => void;
    result: 'REAL' | 'FAKE';
    title: string;
    explanation: string;
    sources: string[];
    onSeeThread?: () => void;
    showThreadContent?: boolean;
    onBackToJustification?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SwipeResultModal: React.FC<SwipeResultModalProps> = ({
    visible,
    onClose,
    result,
    title,
    explanation,
    sources,
    onSeeThread,
    showThreadContent = false,
    threadData,
    onBackToJustification
}) => {
    const isCorrect = result === 'FAKE';
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>

                    {/* Conditionally render thread content or justification content */}
                    {showThreadContent && threadData ? (
                        <ThreadModal
                            visible={true}
                            threadData={threadData}
                            onClose={onBackToJustification || (() => { })}
                        />
                    ) : (
                        <>
                            {/* Close Button */}
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <IconSymbol name="close" size={32} color="#666" />
                            </TouchableOpacity>

                            {/* Icon */}
                            <View style={styles.iconContainer}>
                                <Image
                                    source={require('../../assets/Judge.png')}
                                    style={{ width: 70, height: 70, tintColor: 'black' }}
                                />
                            </View>

                            {/* Title */}
                            <Text style={styles.title}>{title}</Text>

                            {/* Result */}
                            <View style={styles.resultContainer}>
                                <View style={styles.resultIconBackground}>
                                    <Image
                                        source={result === 'FAKE'
                                            ? require('../../assets/cross.png')
                                            : require('../../assets/tick.png')
                                        }
                                        style={styles.backgroundIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={[
                                        styles.resultText,
                                        { color: result === 'FAKE' ? '#000' : '#000' }
                                    ]}>
                                        {result}.
                                    </Text>
                                </View>
                            </View>

                            {/* Why Section */}
                            <Text style={styles.whyTitle}>WHY?</Text>
                            <Text style={styles.explanation}>{explanation}</Text>

                            {/* Sources */}
                            <Text style={styles.sourcesTitle}>SOURCES:</Text>
                            <View style={styles.sourcesContainer}>
                                {sources.map((source, index) => (
                                    <View key={index} style={styles.sourceTag}>
                                        <Text style={styles.sourceText}>{source}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* See Thread Button */}
                            {onSeeThread && (
                                <TouchableOpacity
                                    style={styles.seeThreadButton}
                                    onPress={() => {
                                        onSeeThread();
                                    }}
                                >
                                    <Text style={styles.seeThreadText}>SEE THREAD</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: screenWidth * 0.9,
        maxHeight: screenHeight * 0.8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        zIndex: 1,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'AnonymousPro-Bold',
    },
    resultContainer: {
        marginBottom: 24,
    },
    resultIconBackground: {
        width: 200,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    backgroundIcon: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    resultText: {
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'AnonymousPro-Bold',
        zIndex: 1,
    },
    whyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        fontFamily: 'AnonymousPro-Bold',
    },
    explanation: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        fontFamily: 'AnonymousPro',
    },
    sourcesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        fontFamily: 'AnonymousPro-Bold',
    },
    sourcesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
    },
    sourceTag: {
        backgroundColor: '#662D91',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    sourceText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
        fontFamily: 'AnonymousPro-Bold',
    },
    seeThreadButton: {
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingBottom: 2,
    },
    seeThreadText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'AnonymousPro-Bold',
    },
});

// mock data
export const exampleResultData = {
    singhealth: {
        result: 'FAKE' as const,
        title: "Was our Singhealth data leaked?",
        explanation: "There is no evidence of a breach in the government's secure health systems. Independent security audits show no unauthorized access or anomalies. Additionally, the supposed leaked data contains fabricated entries that do not match real patient records.",
        sources: ["CNA", "Strait Times", "SingHealth"],
    },
    crypto: {
        result: 'FAKE' as const,
        title: "New Cryptocurrency Investment Opportunity",
        explanation: "This appears to be a classic investment scam. The promised returns are unrealistic, the company has no verified credentials, and similar schemes have been reported as fraudulent by financial authorities.",
        sources: ["MAS", "SPF", "ScamAlert"],
    },
    techSupport: {
        result: 'FAKE' as const,
        title: "Tech Support Urgent Warning",
        explanation: "Legitimate tech companies never contact customers unsolicited about computer problems. This is a common tech support scam designed to gain remote access to your device and steal personal information.",
        sources: ["Microsoft", "Apple", "ACCC"],
    },
};