import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet, FlatList, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SongItem from "@/components/song-item";
import { Toast } from "react-native-toast-notifications";

const songs = [
  {
    id: "1",
    title: "Deep Dive | How to Quit Your Job the Right Way",
    author: "Apple Talk",
    duration: "52:27 mins",
    image:
      "https://img.freepik.com/free-vector/electronic-audio-sound-equalizer-bar-background-design_1017-51572.jpg?t=st=1735039501~exp=1735043101~hmac=8d40986bd4d05fd5ddc597b1e70bf3b141f3ef2144d707fbbdf0fe50f8b64264&w=996",
    url: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
  },
  {
    id: "2",
    title: "Finding a Missing Person in the Middle East",
    author: "Office Ladies",
    duration: "21:37 mins",
    image:
      "https://img.freepik.com/free-vector/electronic-audio-sound-equalizer-bar-background-design_1017-51572.jpg?t=st=1735039501~exp=1735043101~hmac=8d40986bd4d05fd5ddc597b1e70bf3b141f3ef2144d707fbbdf0fe50f8b64264&w=996",
    url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
  },
  {
    id: "3",
    title: "The Winning Example of Extreme Ownership",
    author: "Stuff You Should Know",
    duration: "35:52 mins",
    image:
      "https://img.freepik.com/free-vector/electronic-audio-sound-equalizer-bar-background-design_1017-51572.jpg?t=st=1735039501~exp=1735043101~hmac=8d40986bd4d05fd5ddc597b1e70bf3b141f3ef2144d707fbbdf0fe50f8b64264&w=996",
    url: "https://reckhorn.com/media/music/08/bb/8a/Doppelbass-1.mp3",
  },
  {
    id: "4",
    title: "Tale of Two Cities",
    author: "Charles Dickens",
    duration: "35:52 mins",
    image:
      "https://img.freepik.com/free-vector/electronic-audio-sound-equalizer-bar-background-design_1017-51572.jpg?t=st=1735039501~exp=1735043101~hmac=8d40986bd4d05fd5ddc597b1e70bf3b141f3ef2144d707fbbdf0fe50f8b64264&w=996",
    url: "https://reckhorn.com/media/music/7a/6f/e8/Test-2.mp3",
  },
  {
    id: "5",
    title: "The Messager",
    author: "Bobie Wine",
    duration: "35:52 mins",
    image:
      "https://img.freepik.com/free-vector/electronic-audio-sound-equalizer-bar-background-design_1017-51572.jpg?t=st=1735039501~exp=1735043101~hmac=8d40986bd4d05fd5ddc597b1e70bf3b141f3ef2144d707fbbdf0fe50f8b64264&w=996",
    url: "https://reckhorn.com/media/music/58/95/5f/Test-3.mp3",
  },
];

export default function OfflineModeApp() {
  const [downloadedSongs, setDownloadedSongs] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentDownload, setCurrentDownload] = useState(null);

  const [usedStorage, setUsedStorage] = useState(0);
  const [totalStorage, setTotalStorage] = useState("Unknown");

  const [queue, setQueue] = useState([]);
  const queueRef = useRef([]);

  useEffect(() => {
    // clear Async
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

  useEffect(() => {
    calculateUsedStorage();
    fetchTotalStorage();
  }, [downloadedSongs]);

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
    const imageUri = FileSystem.documentDirectory + song.title + ".jpg";

    setCurrentDownload(song.title);

    try {
      const { uri: audioUri } = await FileSystem.downloadAsync(
        song.url,
        fileUri
      );
      const { uri: downloadedImageUri } = await FileSystem.downloadAsync(
        song.image,
        imageUri
      );
      setDownloadedSongs(prevSongs => {
        const updatedSongs = [
          ...prevSongs,
          {
            id: song.id,
            title: song.title,
            author: song.author,
            duration: song.duration,
            image: downloadedImageUri,
            uri: audioUri,
          },
        ];
        saveDownloadedMetadata(updatedSongs);
        return updatedSongs;
      });

      Toast.show(`Downloaded ${song.title}`, {
        type: "success",
        placement: "top",
        duration: 1500,
      });
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
    const imageUri = FileSystem.documentDirectory + songTitle + ".jpg";
    try {
      await FileSystem.deleteAsync(fileUri);
      await FileSystem.deleteAsync(imageUri);

      const updatedSongs = downloadedSongs.filter(
        song => song.title !== songTitle
      );
      await saveDownloadedMetadata(updatedSongs);

      Toast.show(`${songTitle} has been deleted.`, {
        type: "success",
        placement: "top",
        duration: 3000,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to delete the file.");
    }
  };

  // Delete all downloaded songs
  const deleteAllSongs = async () => {
    try {
      for (const song of downloadedSongs) {
        const fileUri = FileSystem.documentDirectory + song.title + ".mp3";
        const imageUri = FileSystem.documentDirectory + song.title + ".jpg";
        await FileSystem.deleteAsync(fileUri);
        await FileSystem.deleteAsync(imageUri);
      }
      await saveDownloadedMetadata([]);
      // Alert.alert("Deleted All", "All downloaded songs have been deleted.");
      Toast.show("All downloaded songs have been deleted", {
        type: "success",
        placement: "top",
        duration: 5000,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to delete all files.");
    }
  };

  // Calculate used storage
  const calculateUsedStorage = async () => {
    try {
      let totalSize = 0;

      for (const song of downloadedSongs) {
        const fileUri = FileSystem.documentDirectory + song.title + ".mp3";
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          totalSize += fileInfo.size; // Add the file size (in bytes)
        }
      }

      setUsedStorage(totalSize); // Set the used storage
    } catch (error) {
      console.error("Failed to calculate used storage:", error);
    }
  };

  // Fetch total storage
  const fetchTotalStorage = async () => {
    try {
      const freeDiskStorage = await FileSystem.getFreeDiskStorageAsync();
      setTotalStorage(freeDiskStorage);
    } catch (error) {
      console.error("Failed to fetch total storage:", error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Offline Songs</Text>
      <View style={styles.storageInfo}>
        <Text style={styles.storageText}>
          Used Storage: {formatBytes(usedStorage)}
        </Text>
        <Text style={styles.storageText}>
          Total Storage:{" "}
          {totalStorage !== "Unknown" ? formatBytes(totalStorage) : "Unknown"}
        </Text>
      </View>

      {downloadedSongs.length !== songs.length && (
        <Button title="Download All" onPress={downloadAllSongs} />
      )}
      {downloadedSongs.length > 0 && (
        <View style={{ marginTop: 5 }}>
          <Button title="Delete All" color="red" onPress={deleteAllSongs} />
        </View>
      )}
      <FlatList
        data={songs}
        keyExtractor={item => item.id}
        // renderItem={renderSongItem}
        renderItem={({ item }) => (
          <SongItem
            song={item}
            key={item.id}
            downloadedSongs={downloadedSongs}
            isDownloading={isDownloading}
            currentDownload={currentDownload}
            isOffline={isOffline}
            enqueueDownload={enqueueDownload}
            deleteSong={deleteSong}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  songItem: { marginBottom: 20 },
  songTitle: { fontSize: 18, marginBottom: 10 },
  storageInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    elevation: 2, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storageText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
});
