# ECHO. 

A React Native Expo forum app built with TypeScript.

## Features

- 🔐 User Authentication (Login/Register)
- 🏠 Forum-style Home Feed with posts and engagement
- 🔍 Search functionality with popular topics
- ✏️ Thread creation with media upload
- 🏆 Leaderboard with user rankings
- 👤 User profiles with activity tracking
- 🎨 Modern UI with Anonymous Pro font
- 📱 Optimized for iPhone 16 Pro Max

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Zustand** for state management
- **AsyncStorage** for data persistence

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Project Structure

```
app/
├── (auth)/           # Authentication screens
├── (splash)/         # Splash screen
├── (tabs)/           # Main app tabs (Home, Search, Create, Leaderboard, Profile)
└── _layout.tsx       # Root layout with navigation logic

src/
├── components/       # Reusable UI components
└── store/           # Zustand state management
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
