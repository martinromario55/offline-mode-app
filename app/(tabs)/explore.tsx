import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import NetInfo from "@react-native-community/netinfo";
import SongItem from "@/components/song-item";

const DownloadedSongs = () => {
  const [downloadedSongs, setDownloadedSongs] = useState([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    loadDownloadedMetadata();
    return () => unsubscribe();
  }, []);

  // Load previously downloaded files' metadata
  const loadDownloadedMetadata = async () => {
    try {
      const metadata = await AsyncStorage.getItem("downloadedSongs");
      if (metadata) setDownloadedSongs(JSON.parse(metadata));
    } catch (error) {
      console.error("Failed to load metadata:", error);
    }
  };

  const deleteSong = async songTitle => {
    const fileUri = FileSystem.documentDirectory + songTitle + ".mp3";
    try {
      await FileSystem.deleteAsync(fileUri);
      const updatedSongs = downloadedSongs.filter(
        song => song.title !== songTitle
      );
      await saveDownloadedMetadata(updatedSongs);
      Alert.alert("Deleted", `${songTitle} has been deleted.`);
    } catch (error) {
      Alert.alert("Error", "Failed to delete the file.");
    }
  };

  // Delete all downloaded songs
  const deleteAllSongs = async () => {
    try {
      for (const song of downloadedSongs) {
        const fileUri = FileSystem.documentDirectory + song.title + ".mp3";
        await FileSystem.deleteAsync(fileUri);
      }
      await saveDownloadedMetadata([]);
      Alert.alert("Deleted All", "All downloaded songs have been deleted.");
    } catch (error) {
      Alert.alert("Error", "Failed to delete all files.");
    }
  };

  // Save metadata
  const saveDownloadedMetadata = async updatedSongs => {
    try {
      await AsyncStorage.setItem(
        "downloadedSongs",
        JSON.stringify(updatedSongs)
      );
      setDownloadedSongs(updatedSongs);
    } catch (error) {
      console.error("Failed to save metadata:", error);
    }
  };

  // Play a song
  const playSong = async uri => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      Alert.alert("Playback Error", error.message);
    }
  };

  // Render downloaded tracks
  const renderDownloadedItem = ({ item }) => (
    <View style={styles.songItem}>
      <Text style={styles.songTitle}>{item.title}</Text>
      <Button title="Play" onPress={() => playSong(item.uri)} />
      <Button
        title="Delete"
        color="red"
        onPress={() => deleteSong(item.title)}
      />
    </View>
  );
  return (
    <View>
      <Text style={styles.subHeader}>Downloaded Tracks</Text>
      {downloadedSongs.length > 0 && (
        <Button title="Delete All" color="red" onPress={deleteAllSongs} />
      )}
      <FlatList
        data={downloadedSongs}
        keyExtractor={item => item.title}
        renderItem={({ item }) => (
          <SongItem song={item} downloadedSongs={downloadedSongs} />
        )}
      />
    </View>
  );
};

export default DownloadedSongs;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  subHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
});
