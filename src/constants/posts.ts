// Dummy post data array for easy future database integration
export const dummyPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1611915387288-fd8d2f5f928b?auto=format&fit=crop&w=600&q=80',
    title: "Was our Singhealth Data leaked?",
    views: 1200,
    comments: 354,
    votes: 539,
    tags: ['Health', 'Cybersecurity', 'WhatsApp'],
    excerpt: "A user sent me this viral rumour that has been spreading about WhatsApp chat groups about Singhealth data leaks. What are your thoughts?",
    author: {
      name: "@ongyekung",
      verified: true,
      avatar: "https://avatar.iran.liara.run/public/32",
      timeAgo: "3 days ago",
      readTime: "3 mins read"
    },
    groundTruth: "FAKE" as const,
    explanation: "There is no evidence of a breach in the government's secure health systems. Independent security audits show no unauthorized access or anomalies. Additionally, the supposed leaked data contains fabricated entries that do not match real patient records.",
    sources: ["CNA", "Strait Times", "SingHealth"]
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=600&q=80',
    title: "New AI breakthrough in healthcare diagnostics",
    views: 890,
    comments: 234,
    votes: 456,
    tags: ['Technology', 'Health', 'AI'],
    excerpt: "Researchers have developed a new AI system that can diagnose diseases with 95% accuracy. This could revolutionize healthcare as we know it.",
    author: {
      name: "@techguru",
      verified: false,
      avatar: "https://avatar.iran.liara.run/public/45",
      timeAgo: "1 day ago",
      readTime: "5 mins read"
    },
    groundTruth: "REAL" as const,
    explanation: "This breakthrough has been peer-reviewed and published in Nature Medicine. Multiple independent studies confirm the AI system's accuracy rates, and it's already being tested in several major hospitals worldwide.",
    sources: ["Nature Medicine", "MIT News", "Reuters"]
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    title: "Cryptocurrency market crash - What's next?",
    views: 2100,
    comments: 789,
    votes: 1234,
    tags: ['Finance', 'Crypto', 'Economy'],
    excerpt: "The recent cryptocurrency market crash has left many investors wondering about the future. Let's discuss the potential implications and recovery strategies.",
    author: {
      name: "@cryptoanalyst",
      verified: true,
      avatar: "https://avatar.iran.liara.run/public/67",
      timeAgo: "5 hours ago",
      readTime: "7 mins read"
    },
    groundTruth: "REAL" as const,
    explanation: "Market data from multiple exchanges confirms the significant price drops. Financial analysts from major institutions have documented the crash patterns and provided verified trading volume data.",
    sources: ["Bloomberg", "CoinDesk", "Financial Times"]
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    title: "Climate change summit reaches breakthrough",
    views: 1560,
    comments: 423,
    votes: 892,
    tags: ['Environment', 'Politics', 'Climate'],
    excerpt: "World leaders announce new commitments to reduce carbon emissions by 50% within the next decade.",
    author: {
      name: "@climatewatch",
      verified: true,
      avatar: "https://avatar.iran.liara.run/public/89",
      timeAgo: "2 hours ago",
      readTime: "4 mins read"
    },
    groundTruth: "FAKE" as const,
    explanation: "While climate discussions did occur, no formal commitments for 50% emission reductions were made. Official summit documents show more modest targets, and several key nations did not sign any binding agreements.",
    sources: ["UN Climate", "BBC News", "Associated Press"]
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=600&q=80',
    title: "Space exploration milestone achieved",
    views: 3200,
    comments: 567,
    votes: 1455,
    tags: ['Science', 'Space', 'Technology'],
    excerpt: "NASA's latest mission successfully lands on Mars and begins collecting samples for future Earth return.",
    author: {
      name: "@spacenews",
      verified: false,
      avatar: "https://avatar.iran.liara.run/public/12",
      timeAgo: "6 hours ago",
      readTime: "6 mins read"
    },
    groundTruth: "REAL" as const,
    explanation: "NASA has officially confirmed the successful landing and sample collection. Live telemetry data and images from the Mars rover have been verified by international space agencies.",
    sources: ["NASA", "ESA", "Space.com"]
  }
];

export const tagColors: { [key: string]: string } = {
  'Health': '#FF9999',
  'Cybersecurity': '#FFD700',
  'WhatsApp': '#87CEEB',
  'Technology': '#98FB98',
  'AI': '#DDA0DD',
  'Finance': '#F0E68C',
  'Crypto': '#FFB6C1',
  'Economy': '#B0E0E6',
  'Environment': '#90EE90',
  'Politics': '#F0E68C',
  'Climate': '#87CEEB',
  'Science': '#DDA0DD',
  'Space': '#FFB6C1'
}; 