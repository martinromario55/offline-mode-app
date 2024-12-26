import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";

export const useStorage = downloadedSongs => {
  const [usedStorage, setUsedStorage] = useState(0);
  const [totalStorage, setTotalStorage] = useState("Unknown");

  useEffect(() => {
    const calculateUsedStorage = async () => {
      try {
        let totalSize = 0;

        // Ensure downloadedSongs is an object with categories
        if (downloadedSongs && typeof downloadedSongs === "object") {
          for (const category in downloadedSongs) {
            if (Array.isArray(downloadedSongs[category])) {
              for (const song of downloadedSongs[category]) {
                const fileUri =
                  FileSystem.documentDirectory + song.title + ".mp3";
                const fileInfo = await FileSystem.getInfoAsync(fileUri);
                if (fileInfo.exists) {
                  totalSize += fileInfo.size; // Add the file size (in bytes)
                }
              }
            }
          }
        }

        setUsedStorage(totalSize);
      } catch (error) {
        console.error("Failed to calculate used storage:", error);
      }
    };

    const fetchTotalStorage = async () => {
      try {
        const freeDiskStorage = await FileSystem.getFreeDiskStorageAsync();
        setTotalStorage(freeDiskStorage);
      } catch (error) {
        console.error("Failed to fetch total storage:", error);
      }
    };

    calculateUsedStorage();
    fetchTotalStorage();
  }, [downloadedSongs]);

  const formatBytes = bytes => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return {
    usedStorage: formatBytes(usedStorage),
    totalStorage: formatBytes(totalStorage),
  };
};
