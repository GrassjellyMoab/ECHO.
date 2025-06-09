import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
}

const VotingSection: React.FC<VotingSectionProps> = ({ voteData, onVote, hasVoted, aiVerdict }) => {
  const [showResults, setShowResults] = useState(hasVoted);

  const totalVotes = voteData.real + voteData.fake;
  const realPercentage = totalVotes > 0 ? (voteData.real / totalVotes) * 100 : 0;
  const fakePercentage = totalVotes > 0 ? (voteData.fake / totalVotes) * 100 : 0;

  const handleVote = (vote: 'real' | 'fake') => {
    onVote(vote);
    setShowResults(true);
  };

  const screenHeight = Dimensions.get('window').height;

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
      <View style={styles.votingSectionContainer}>
        {/* Hidden content underneath - rendered to maintain consistent sizing */}
        <View style={styles.resultsSection}>
          <Text style={styles.votingDecision}>
            You voted <Text style={styles.fakeText}>{voteData.userVote?.toUpperCase()}.</Text>
          </Text>
          <Text style={styles.overallVotes}>Overall Votes:</Text>

          <View style={styles.voteBarContainer}>
            <View style={styles.voteBar}>
              <View style={[styles.realBar, { width: `${realPercentage}%` }]} />
              <View style={[styles.fakeBar, { width: `${fakePercentage}%` }]} />
            </View>
            <View style={styles.votePercentages}>
              <Text>{Math.round(realPercentage)}%</Text>
              <Text>{Math.round(fakePercentage)}%</Text>
            </View>
          </View>

        </View>

        {/* AI Verdict placeholder - Always rendered to maintain consistent sizing */}
        {aiVerdict && (
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <IconSymbol name="info" style={styles.aiIcon} />
              <Text style={styles.aiTitle}>AI Verdict</Text>
            </View>
            <Text style={styles.aiText}>{aiVerdict}</Text>
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
      </View>
    );
  }

  // Show the results after voting or if already voted
  return (
    <View style={styles.votingSectionContainer}>
      {/* Voting Results Section */}
      <View style={styles.resultsSection}>
        <Text style={styles.votingDecision}>
          You voted <Text style={styles.fakeText}>{voteData.userVote?.toUpperCase()}.</Text>
        </Text>
        <Text style={styles.overallVotes}>Overall Votes:</Text>

        <View style={styles.voteBar}>
          <View style={[styles.realBar, { width: `${realPercentage}%` }]} />
          <View style={[styles.fakeBar, { width: `${fakePercentage}%` }]} />
        </View>

        <View style={styles.votePercentages}>
          <Text>{Math.round(realPercentage)}%</Text>
          <Text>{Math.round(fakePercentage)}%</Text>
        </View>
      </View>

      {/* AI Verdict Section - Only show if user has voted and aiVerdict is provided */}
      {aiVerdict && (
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <IconSymbol name="info" style={styles.aiIcon} />
            <Text style={styles.aiTitle}>AI Verdict</Text>
          </View>
          <Text style={styles.aiText}>{aiVerdict}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  votingSectionContainer: {
    position: 'relative',
    marginBottom: 20,
    minHeight: Dimensions.get('window').height * 0.3,
  },
  // Removed overlay from StyleSheet since it's now dynamic
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
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
    fontFamily: 'AnonymousPro-Bold',
  },
  fakeText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  overallVotes: {
    fontSize: 16,
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
  },
  realBar: {
    backgroundColor: '#fff',
  },
  fakeBar: {
    backgroundColor: '#662D91',
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
    marginTop: 4,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'AnonymousPro-Bold',
  },
  aiText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontFamily: 'AnonymousPro',
  },
});

export default VotingSection;