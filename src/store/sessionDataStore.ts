import { create } from 'zustand';

export interface UserVote {
  threadId: string;
  vote: 'real' | 'fake';
  timestamp: number;
}

interface SessionDataState {
  // Vote tracking
  userVotes: UserVote[];
  
  // Core actions
  addVote: (threadId: string, vote: 'real' | 'fake') => void;
  getUserVote: (threadId: string) => 'real' | 'fake' | null;
  hasUserVoted: (threadId: string) => boolean;
}

export const useSessionDataStore = create<SessionDataState>()((set, get) => ({
  // Initial state
  userVotes: [],

  // Add or update a vote for a thread
  addVote: (threadId: string, vote: 'real' | 'fake') => {
    const { userVotes } = get();
    
    // Remove existing vote for this thread if it exists
    const filteredVotes = userVotes.filter(v => v.threadId !== threadId);
    
    // Add new vote
    const newVote: UserVote = {
      threadId,
      vote,
      timestamp: Date.now()
    };
    
    set({
      userVotes: [...filteredVotes, newVote]
    });
  },

  // Get user's vote for a specific thread
  getUserVote: (threadId: string) => {
    const { userVotes } = get();
    const vote = userVotes.find(v => v.threadId === threadId);
    return vote ? vote.vote : null;
  },

  // Check if user has voted on a specific thread
  hasUserVoted: (threadId: string) => {
    const { userVotes } = get();
    return userVotes.some(v => v.threadId === threadId);
  },
})); 