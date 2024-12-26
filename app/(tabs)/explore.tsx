import React, { useState } from "react";
import { View, Text, Button, StyleSheet, FlatList } from "react-native";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useStorage } from "@/hooks/useStorage";
import { useDownloadQueue } from "@/hooks/useDownloadQueue";
import SongItem from "@/components/song-item";

const OfflineModeApp = () => {
  const [downloadedSongs, setDownloadedSongs] = useState([]);
  const isOffline = useNetworkStatus();
  const { usedStorage, totalStorage } = useStorage(downloadedSongs);
  const { enqueueDownload, processQueue, isDownloading, currentDownload } =
    useDownloadQueue(downloadedSongs, setDownloadedSongs);

  const downloadAllSongs = async (songs, downloadedSongs, enqueueDownload) => {
    songs.forEach(song => {
      const isAlreadyDownloaded = downloadedSongs.some(
        item => item.title === song.title
      );
      if (!isAlreadyDownloaded) {
        enqueueDownload(song);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Offline Songs</Text>
      <View style={styles.storageInfo}>
        <Text style={styles.storageText}>Used Storage: {usedStorage}</Text>
        <Text style={styles.storageText}>Total Storage: {totalStorage}</Text>
      </View>
      <FlatList
        data={songs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SongItem
            song={item}
            downloadedSongs={downloadedSongs}
            isDownloading={isDownloading}
            currentDownload={currentDownload}
            isOffline={isOffline}
            enqueueDownload={enqueueDownload}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  storageInfo: { marginBottom: 16 },
  storageText: { fontSize: 14 },
});

export default OfflineModeApp;
