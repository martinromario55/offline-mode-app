import { useState, useRef } from "react";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-notifications";

export const useDownloadQueue = (downloadedSongs, setDownloadedSongs) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentDownload, setCurrentDownload] = useState(null);
  const [queue, setQueue] = useState([]);
  const queueRef = useRef([]);

  const enqueueDownload = song => {
    queueRef.current = [...queueRef.current, song];
    setQueue([...queueRef.current]);
  };

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
      console.error("Download Failed:", error);
    } finally {
      setIsDownloading(false);
      setCurrentDownload(null);
      processQueue();
    }
  };

  const saveDownloadedMetadata = async updatedSongs => {
    try {
      await AsyncStorage.setItem(
        "downloadedSongs",
        JSON.stringify(updatedSongs)
      );
    } catch (error) {
      console.error("Failed to save metadata:", error);
    }
  };

  return { enqueueDownload, processQueue, isDownloading, currentDownload };
};
