import { useSessionDataStore } from '@/src/store/sessionDataStore';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';

interface VoteData {
  real: number;
  fake: number;
  userVote: 'real' | 'fake' | null;
}

interface VotingSectionProps {
  voteData: VoteData;
  onVote: (vote: 'real' | 'fake') => void;
  hasVoted: boolean;
  aiVerdict?: string;
  threadId: string;
}

const VotingSection: React.FC<VotingSectionProps> = ({ voteData, onVote, hasVoted, aiVerdict, threadId }) => {
  // Session data store for checking vote status
  const { hasUserVoted } = useSessionDataStore();
  
  // Check if user has voted in session or originally
  const userHasVotedInSession = hasUserVoted(threadId);
  const shouldShowResults = userHasVotedInSession || hasVoted;
  
  const [showResults, setShowResults] = useState(shouldShowResults);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Update showResults when session vote status changes
  useEffect(() => {
    setShowResults(shouldShowResults);
  }, [shouldShowResults]);

  // Helper function to handle AI verdict display
  const getAiVerdictText = (verdict?: string): string => {
    if (!verdict || verdict.trim() === '' || verdict === 'NaN' || verdict === 'undefined' || verdict === 'null') {
      return 'No AI verdict generated yet. Please check back later.';
    }
    return verdict;
  };

  // Helper function to check if AI verdict should be shown
  const shouldShowAiVerdict = (verdict?: string): boolean => {
    // Always show the AI section if there's any verdict (including fallback message)
    return true;
  };

  console.log(voteData);
  const totalVotes = voteData.real + voteData.fake;
  const realPercentage = totalVotes > 0 ? (voteData.real / totalVotes) * 100 : 0;
  const fakePercentage = totalVotes > 0 ? (voteData.fake / totalVotes) * 100 : 0;
  const isReal = realPercentage > 50;
  const verdictText = isReal ? "REAL." : "FAKE.";
  const verdictStyle = isReal ? styles.realText : styles.fakeText;

  // Add safety checks for NaN values
  const safeRealPercentage = isNaN(realPercentage) ? 0 : realPercentage;
  const safeFakePercentage = isNaN(fakePercentage) ? 0 : fakePercentage;

  const handleVote = (vote: 'real' | 'fake') => {
    // Start fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      // After fade out completes, update vote and show results
      onVote(vote);
      setShowResults(true);
      
      // Fade back in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  };

  // Dynamic overlay style that ensures full coverage
  const overlayStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.96)',
    zIndex: 10,
    padding: 20,
    borderRadius: 12,
    justifyContent: 'flex-start' as const,
    alignItems: 'stretch' as const,
    minHeight: '100%' as const,
  };

  if (!showResults) {
    // Show the "Want to see results" prompt
    return (
      <Animated.View style={[styles.votingSectionContainer, { opacity: fadeAnim }]}>
        {/* Hidden content underneath - rendered to maintain consistent sizing */}
        <View style={styles.resultsSection}>
            <Text style={styles.votingResults}>
                Overall Votes: <Text style={verdictStyle}>{verdictText}</Text>
            </Text>
            <Text style={styles.votingDecision}>
              You voted {voteData.userVote ? voteData.userVote.toUpperCase() : 'UNKNOWN'}.
            </Text>

          <View style={styles.voteBarContainer}>
            <View style={styles.voteBar}>
              <View style={[styles.realBar, { width: `${safeRealPercentage}%` }]}>
                {safeRealPercentage > 15 && (
                  <Text style={styles.realPercentageTextInside}>{Math.round(safeRealPercentage)}%</Text>
                )}
              </View>
              <View style={[styles.fakeBar, { width: `${safeFakePercentage}%` }]}>
                {safeFakePercentage > 15 && (
                  <Text style={styles.fakePercentageTextInside}>{Math.round(safeFakePercentage)}%</Text>
                )}
              </View>
            </View>
          </View>

        </View>

        {/* AI Verdict placeholder - Always rendered to maintain consistent sizing */}
        {shouldShowAiVerdict(aiVerdict) && (
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <IconSymbol name="info" style={styles.aiIcon} />
              <Text style={styles.aiTitle}>AI Verdict</Text>
            </View>
            <Text style={styles.aiText}>{getAiVerdictText(aiVerdict)}</Text>
          </View>
        )}

        {/* Overlay - Covers both voting results and AI verdict */}
        <View style={overlayStyle}>
          <Text style={styles.votingPrompt}>Want to see the results?</Text>
          <Text style={styles.votingSubtext}>Vote for what you think.</Text>

          <View style={styles.voteOptions}>
            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => handleVote('fake')}
            >
              <View style={styles.voteButtonContent}>
                <Text style={styles.voteButtonIcon}>✕</Text>
                <Text style={styles.voteButtonText}>FAKE.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => handleVote('real')}
            >
              <View style={styles.voteButtonContent}>
                <Text style={styles.voteButtonIcon}>✓</Text>
                <Text style={styles.voteButtonText}>REAL.</Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>
      </Animated.View>
    );
  }
  // Show the results after voting or if already voted
  return (
    <Animated.View style={[styles.votingSectionContainer, { opacity: fadeAnim }]}>

      {/* Voting Results Section */}
      <View style={styles.resultsSection}>
        <Text style={styles.votingResults}>
            Overall Votes: <Text style={verdictStyle}>{verdictText}</Text>
        </Text>
        <Text style={styles.votingDecision}>
          You voted {voteData.userVote ? voteData.userVote.toUpperCase() : 'UNKNOWN'}.
        </Text>

        <View style={styles.voteBar}>
          <View style={[styles.realBar, { width: `${safeRealPercentage}%` }]}>
            {safeRealPercentage > 15 && (
              <Text style={styles.realPercentageTextInside}>{Math.round(safeRealPercentage)}%</Text>
            )}
          </View>
          <View style={[styles.fakeBar, { width: `${safeFakePercentage}%` }]}>
            {safeFakePercentage > 15 && (
              <Text style={styles.fakePercentageTextInside}>{Math.round(safeFakePercentage)}%</Text>
            )}
          </View>
        </View>
      </View>

      {/* AI Verdict Section - Only show if user has voted and aiVerdict is provided */}
      {shouldShowAiVerdict(aiVerdict) && (
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <IconSymbol name="info" style={styles.aiIcon} />
            <Text style={styles.aiTitle}>AI Verdict</Text>
          </View>
          <Text style={styles.aiText}>{getAiVerdictText(aiVerdict)}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  votingSectionContainer: {
    position: 'relative',
    marginBottom: 20,
    minHeight: Dimensions.get('window').height * 0.3,
  },
  votingPrompt: {
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'AnonymousPro-Bold',
    textAlign: 'center',
    marginTop: -20
  },
  votingSubtext: {
    fontSize: 20,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'AnonymousPro-Bold',
    textAlign: 'center',
  },
  voteOptions: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  voteButton: {
    marginBottom: 6,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#662D91',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  voteButtonIcon: {
    color: '#FFFFFF',
  },
  voteButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'AnonymousPro-Bold',
  },
  resultsSection: {
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center'
  },
  votingDecision: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
    fontFamily: 'AnonymousPro-Bold',
  },
  fakeText: {
    color: '#C73535',
    fontWeight: 'bold',
  },
  realText: {
    color: '#059669',
    fontWeight: 'bold',
  },
  votingResults: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    fontFamily: 'AnonymousPro-Bold',
  },
  voteBarContainer: {
    width: '100%',
    marginBottom: 8,
  },
  voteBar: {
    flexDirection: 'row',
    height: 35,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#662D91',
    position: 'relative',
  },
  realBar: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fakeBar: {
    backgroundColor: '#662D91',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  realPercentageTextInside: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#662D91',
    fontFamily: 'AnonymousPro-Bold',
    position: 'absolute',
    alignSelf: 'center',
  },
  fakePercentageTextInside: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'AnonymousPro-Bold',
    position: 'absolute',
    alignSelf: 'center',
  },
  votePercentages: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },

  // AI Verdict styles
  aiSection: {
    backgroundColor: 'rgba(93, 52, 157, 0.16)',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiIcon: {
    color: '#662D91',
    marginRight: 8,
  },
  aiTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  aiText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    fontFamily: 'AnonymousPro',
  },
});

export default VotingSection;