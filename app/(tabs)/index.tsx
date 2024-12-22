import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const songs = [
  {
    id: "1",
    title: "Song A",
    url: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
  },
  {
    id: "2",
    title: "Song B",
    url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
  },
  {
    id: "3",
    title: "Song C",
    url: "https://reckhorn.com/media/music/08/bb/8a/Doppelbass-1.mp3",
  },
  {
    id: "4",
    title: "Song D",
    url: "https://reckhorn.com/media/music/7a/6f/e8/Test-2.mp3",
  },
  {
    id: "5",
    title: "Song E",
    url: "https://reckhorn.com/media/music/58/95/5f/Test-3.mp3",
  },
];

export default function OfflineModeApp() {
  const [downloadedSongs, setDownloadedSongs] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentDownload, setCurrentDownload] = useState(null);
  const [queue, setQueue] = useState([]);
  const queueRef = useRef([]);

  useEffect(() => {
    // Clear async storage
    // AsyncStorage.clear();
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    loadDownloadedMetadata();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (queue.length > 0) {
      processQueue();
    }
  }, [queue]);

  // Load previously downloaded files' metadata
  const loadDownloadedMetadata = async () => {
    try {
      const metadata = await AsyncStorage.getItem("downloadedSongs");
      if (metadata) setDownloadedSongs(JSON.parse(metadata));
    } catch (error) {
      console.error("Failed to load metadata:", error);
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

  // Add download task to the queue
  const enqueueDownload = song => {
    queueRef.current = [...queueRef.current, song];
    setQueue([...queueRef.current]);
  };

  // Process the download queue
  const processQueue = async () => {
    if (isDownloading || queueRef.current.length === 0) return;

    setIsDownloading(true);
    const song = queueRef.current.shift();
    setQueue([...queueRef.current]);

    const fileUri = FileSystem.documentDirectory + song.title + ".mp3";
    setCurrentDownload(song.title);

    try {
      const { uri } = await FileSystem.downloadAsync(song.url, fileUri);
      setDownloadedSongs(prevSongs => {
        const updatedSongs = [...prevSongs, { title: song.title, uri }];
        saveDownloadedMetadata(updatedSongs);
        return updatedSongs;
      });

      Alert.alert(
        "Download Complete",
        `${song.title} is now available offline.`
      );
    } catch (error) {
      if (error.code === "E_FILESYSTEM_ERROR") {
        Alert.alert("Storage Error", "Storage full or unavailable.");
      } else {
        Alert.alert("Download Failed", `Failed to download ${song.title}.`);
      }
    } finally {
      setIsDownloading(false);
      setCurrentDownload(null);
      processQueue(); // Continue processing the next in queue
    }
  };

  // Download a single song
  const downloadSong = async (song, retry = false) => {
    const fileUri = FileSystem.documentDirectory + song.title + ".mp3";
    setIsDownloading(true);
    setCurrentDownload(song.title);

    try {
      const { uri } = await FileSystem.downloadAsync(song.url, fileUri);
      const updatedSongs = [...downloadedSongs, { title: song.title, uri }];
      await saveDownloadedMetadata(updatedSongs);
      Alert.alert(
        "Download Complete",
        `${song.title} is now available offline.`
      );
    } catch (error) {
      if (error.code === "E_FILESYSTEM_ERROR") {
        Alert.alert("Storage Error", "Storage full or unavailable.");
      } else {
        Alert.alert("Download Failed", `Failed to download ${song.title}.`);
      }
    } finally {
      setIsDownloading(false);
      setCurrentDownload(null);
    }
  };

  // Download all songs
  const downloadAllSongs = async () => {
    songs.forEach(song => {
      const isAlreadyDownloaded = downloadedSongs.some(
        s => s.title === song.title
      );
      if (!isAlreadyDownloaded) enqueueDownload(song);
    });
  };

  // Delete a song
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

  console.log(downloadedSongs);

  // Render song item
  const renderSongItem = ({ item }) => {
    const isDownloaded = downloadedSongs.some(
      song => song.title === item.title
    );
    const downloadedFile = downloadedSongs.find(
      song => song.title === item.title
    );

    return (
      <View style={styles.songItem}>
        <Text style={styles.songTitle}>{item.title}</Text>
        {isDownloading && currentDownload === item.title ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <>
            {!isOffline && !isDownloaded && (
              <Button title="Download" onPress={() => enqueueDownload(item)} />
            )}
            {isDownloaded && (
              <>
                <Button
                  title="Play Offline"
                  onPress={() => playSong(downloadedFile.uri)}
                />
                <Button
                  title="Delete"
                  color="red"
                  onPress={() => deleteSong(item.title)}
                />
              </>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Offline Songs</Text>
      <Button title="Download All" onPress={downloadAllSongs} />
      <FlatList
        data={songs}
        keyExtractor={item => item.id}
        renderItem={renderSongItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  songItem: { marginBottom: 20 },
  songTitle: { fontSize: 18, marginBottom: 10 },
});
