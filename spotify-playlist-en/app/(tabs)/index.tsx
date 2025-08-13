import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import ChatBox from './chatbox';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Try Talk to the AI Chatbot About Spotify songs</ThemedText>
        <p style={{margin: '1px'}}>
          For now, the playlist only supports: 
          <a href={"https://open.spotify.com/playlist/6UeSakyzhiEt4NB3UAd6NQ"} target="_blank" rel="noopener noreferrer">
            Billboard top 100
          </a>
          . Developer will expand to more playlists in the future...
        </p>
        <ThemedText numberOfLines={2} >
          Format: get ... playlist ... [YOUR_CHOICE_OF_GENRE:  Pop, Hip pop, Country, Afro, etc]     
        </ThemedText>
        <ChatBox/>

      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 3,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
