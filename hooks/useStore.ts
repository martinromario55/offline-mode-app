import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

export const useStore = create((set, get) => ({
  // Metadata for downloaded songs
  metadata: {},
  loadMetadata: async () => {
    try {
      const storedData = await AsyncStorage.getItem("downloadedSongs");
      const parsedData = storedData ? JSON.parse(storedData) : {};
      console.log("[ZUSTAND] Loaded Metadata:", parsedData);
      set({ metadata: parsedData });
    } catch (error) {
      console.error("[ZUSTAND] Failed to load metadata:", error);
    }
  },
  saveMetadata: async updatedMetadata => {
    if (
      !updatedMetadata ||
      typeof updatedMetadata !== "object" ||
      Array.isArray(updatedMetadata)
    ) {
      console.warn(
        "[ZUSTAND] Attempted to save invalid metadata:",
        updatedMetadata
      );
      return;
    }

    try {
      console.log("[ZUSTAND] Persisting Metadata:", updatedMetadata);
      await AsyncStorage.setItem(
        "downloadedSongs",
        JSON.stringify(updatedMetadata)
      );
      set({ metadata: updatedMetadata });
    } catch (error) {
      console.error("[ZUSTAND] Failed to save metadata:", error);
    }
  },

  // Download queue
  queue: [],
  enqueueDownload: (song, folderKey) => {
    const state = get();
    const isAlreadyInQueue = state.queue.some(item => item.song.id === song.id);
    if (isAlreadyInQueue) {
      console.warn(
        "[ZUSTAND] Attempted to enqueue duplicate song:",
        song.title
      );
      return;
    }

    console.log(
      `[ZUSTAND] Enqueuing song: ${song.title} in folder: ${folderKey}`
    );
    set(state => ({
      queue: [...state.queue, { song, folderKey }],
    }));

    state.processQueue();
  },
  dequeue: () => {
    set(state => {
      const queue = [...state.queue];
      const nextItem = queue.shift();
      return { queue, currentDownload: nextItem };
    });
  },

  // Downloading state
  isDownloading: false,
  currentDownload: null,
  setDownloading: isDownloading => set({ isDownloading }),
  setCurrentDownload: currentDownload => set({ currentDownload }),

  // Process the queue
  processQueue: async () => {
    const {
      queue,
      isDownloading,
      dequeue,
      setDownloading,
      setCurrentDownload,
      saveMetadata,
      metadata,
    } = get();

    if (isDownloading || queue.length === 0) {
      console.log(
        "[ZUSTAND] Skipping processQueue: Already downloading or queue is empty"
      );
      return;
    }

    const { song, folderKey } = queue[0];
    dequeue();
    setDownloading(true);

    const fileUri = FileSystem.documentDirectory + song.title + ".mp3";
    const imageUri = FileSystem.documentDirectory + song.title + ".jpg";

    setCurrentDownload(song.title);

    try {
      console.log(`[ZUSTAND] Downloading files for song: ${song.title}`);
      const { uri: audioUri } = await FileSystem.downloadAsync(
        song.url,
        fileUri
      );
      const { uri: downloadedImageUri } = await FileSystem.downloadAsync(
        song.image,
        imageUri
      );

      // Update metadata
      const updatedFolderSongs = [
        ...(metadata[folderKey] || []),
        {
          id: song.id,
          title: song.title,
          author: song.author,
          duration: song.duration,
          image: downloadedImageUri,
          uri: audioUri,
        },
      ];

      const updatedMetadata = {
        ...metadata,
        [folderKey]: updatedFolderSongs,
      };

      console.log("[ZUSTAND] Saving updated metadata:", updatedMetadata);
      await saveMetadata(updatedMetadata);

      console.log(`[ZUSTAND] Downloaded ${song.title} successfully`);
    } catch (error) {
      console.error(`[ZUSTAND] Download Failed for ${song.title}:`, error);
    } finally {
      setDownloading(false);
      setCurrentDownload(null);
      get().processQueue(); // Continue processing
    }
  },
  downloadAllSongs: async (songs, category) => {
    const { metadata, enqueueDownload } = get();

    console.log("[DEBUG] Triggering downloadAllSongs for category:", category);

    songs.forEach(song => {
      const folderDownloads = metadata[category] || [];
      const isAlreadyDownloaded = folderDownloads.some(
        item => item.id === song.id
      );

      if (!isAlreadyDownloaded) {
        console.log(`[DEBUG] Enqueuing download for song: ${song.title}`);
        enqueueDownload(song, category);
      } else {
        console.log(`[DEBUG] Skipping already downloaded song: ${song.title}`);
      }
    });
  },
  deleteSong: async (songTitle, folderKey) => {
    try {
      const { metadata, saveMetadata } = get();

      // Remove the song from the metadata
      const folderSongs = metadata[folderKey] || [];
      const updatedFolderSongs = folderSongs.filter(
        song => song.title !== songTitle
      );

      const updatedMetadata = {
        ...metadata,
        [folderKey]: updatedFolderSongs,
      };

      console.log("[ZUSTAND] Deleting song:", songTitle);
      console.log("[ZUSTAND] Updated Metadata:", updatedMetadata);

      // Update AsyncStorage and store
      await saveMetadata(updatedMetadata);

      // Remove the song file and image from device storage
      const songToDelete = folderSongs.find(song => song.title === songTitle);
      if (songToDelete) {
        await FileSystem.deleteAsync(songToDelete.uri, { idempotent: true });
        await FileSystem.deleteAsync(songToDelete.image, { idempotent: true });
        console.log(
          "[ZUSTAND] Deleted song files from storage:",
          songToDelete.title
        );
      }
    } catch (error) {
      console.error("[ZUSTAND] Failed to delete song:", error);
    }
  },

  deleteAllSongsInCategory: async folderKey => {
    try {
      const { metadata, saveMetadata } = get();

      // Get all songs in the category
      const folderSongs = metadata[folderKey] || [];

      // Remove files from device storage
      for (const song of folderSongs) {
        await FileSystem.deleteAsync(song.uri, { idempotent: true });
        await FileSystem.deleteAsync(song.image, { idempotent: true });
        console.log("[ZUSTAND] Deleted song files from storage:", song.title);
      }

      // Remove the category from metadata
      const updatedMetadata = { ...metadata };
      delete updatedMetadata[folderKey];

      console.log("[ZUSTAND] Deleting all songs in category:", folderKey);
      console.log("[ZUSTAND] Updated Metadata:", updatedMetadata);

      // Update AsyncStorage and store
      await saveMetadata(updatedMetadata);
    } catch (error) {
      console.error("[ZUSTAND] Failed to delete all songs in category:", error);
    }
  },
}));
