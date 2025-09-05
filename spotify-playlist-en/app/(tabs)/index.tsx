import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import ChatBox from '../../components/chatbox';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#000000', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/Spotify_Primary_Logo_RGB_Green.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle"> Spotify Song Recommendation 'AI' Chatbot </ThemedText>
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
    height: 250,
    width: 290,
    bottom: 0,
    left: 50,
    position: 'absolute',
  },
});
