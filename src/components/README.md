# Components Directory Structure

This directory contains all reusable React components organized by purpose and functionality.

## 📁 Directory Structure

```
src/components/
├── index.ts              # Main export file for all components
├── ThemedText.tsx         # Text component with theme support
├── ThemedView.tsx         # View component with theme support
├── ui/                    # UI-specific components
│   ├── index.ts          # UI components exports
│   ├── AppHeader.tsx     # Main app header with wave design
│   ├── IconSymbol.tsx    # Unified icon component
│   ├── TabBarBackground.tsx # Tab bar styling
│   ├── ThemedInput.tsx   # Themed input component
│   ├── ThreadCards.tsx   # Swipeable cards for threads
│   ├── PopularTopics.tsx # Popular topics display
│   └── RecentSearches.tsx # Recent searches display
├── explore/              # Explore feature components
│   ├── index.ts          # Explore components exports
│   ├── EmptyState.tsx    # Empty state display
│   ├── ExploreCard.tsx   # Individual explore cards
│   └── FeedbackModal.tsx # Feedback modal
└── leaderboard/          # Leaderboard feature components
    ├── index.ts          # Leaderboard components exports
    ├── PodiumUser.tsx    # Individual podium user with crown
    ├── ListUser.tsx      # List view user component
    ├── HorizontalLine.tsx # Separator line component
    └── Podium.tsx        # Complete podium section
```

## 🚀 Usage

### Import from main index (recommended):
```typescript
import { ThemedText, AppHeader, IconSymbol } from '@/src/components';
```

### Import from specific directories:
```typescript
import { AppHeader, IconSymbol } from '@/src/components/ui';
import { EmptyState } from '@/src/components/explore';
```

### Import individual components:
```typescript
import { ThemedText } from '@/src/components/ThemedText';
```

## 🎯 Component Categories

### **Theme Components**
Base components that support theming and styling.
- `ThemedText` - Text with theme support
- `ThemedView` - View with theme support

### **UI Components**
Reusable UI elements used across the app.
- `AppHeader` - Main application header
- `IconSymbol` - Unified icon system
- `TabBarBackground` - Tab navigation styling
- `ThemedInput` - Themed text input
- `ThreadCards` - Swipeable thread cards
- `PopularTopics` - Topics display component
- `RecentSearches` - Recent searches list

### **Feature Components**
Components organized by feature area.

**Explore Feature:**
- `EmptyState` - Empty state handling
- `ExploreCard` - Explore content cards
- `FeedbackModal` - User feedback modal

**Leaderboard Feature:**
- `PodiumUser` - Individual podium user with crown backgrounds
- `ListUser` - List view user component
- `HorizontalLine` - Separator line component
- `Podium` - Complete podium section with title and users

## 🧹 Cleanup Applied

The following unused components were removed:
- `HapticTab.tsx` - Unused haptic feedback component
- `WaveBackground.tsx` - Unused wave background
- `HelloWave.tsx` - Unused hello wave animation
- `ParallaxScrollView.tsx` - Unused parallax scroll
- `Collapsible.tsx` - Unused collapsible component
- `ExternalLink.tsx` - Unused external link component 