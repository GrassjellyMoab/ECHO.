import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform, Pressable } from 'react-native';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink(props: ExternalLinkProps) {
  return (
    <Link
      href={props.href}
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native
          e.preventDefault();
          // Open the link in an in-app browser
          WebBrowser.openBrowserAsync(props.href);
        }
      }}>
      <Pressable>{props.children}</Pressable>
    </Link>
  );
}
