import { create } from 'zustand';

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

interface NewThreadStore {
  newThreads: ThreadData[];
  addNewThread: (thread: ThreadData) => void;
  clearNewThreads: () => void;
}

export const useNewThreadStore = create<NewThreadStore>((set) => ({
  newThreads: [],
  addNewThread: (thread) => set((state) => ({
    newThreads: [thread, ...state.newThreads]
  })),
  clearNewThreads: () => set({ newThreads: [] }),
}));