import { Alert } from "react-native";
import { Toast } from "react-native-toast-notifications";
import * as FileSystem from "expo-file-system";

export const downloadAllSongs = async (
  songs,
  downloadedSongs,
  enqueueDownload
) => {
  songs.forEach(song => {
    const isAlreadyDownloaded = downloadedSongs.some(
      item => item.title === song.title
    );
    if (!isAlreadyDownloaded) {
      enqueueDownload(song); // Add song to the download queue
    }
  });
};

export const deleteSong = async (
  songTitle,
  downloadedSongs,
  setDownloadedSongs
) => {
  const fileUri = FileSystem.documentDirectory + songTitle + ".mp3";
  const imageUri = FileSystem.documentDirectory + songTitle + ".jpg";

  try {
    // Delete the audio file
    await FileSystem.deleteAsync(fileUri);
    // Delete the image file
    await FileSystem.deleteAsync(imageUri);

    // Update the downloaded songs list
    const updatedSongs = downloadedSongs.filter(
      song => song.title !== songTitle
    );
    setDownloadedSongs(updatedSongs);

    Toast.show(`${songTitle} has been deleted.`, {
      type: "success",
      placement: "top",
      duration: 3000,
    });
  } catch (error) {
    Alert.alert("Error", "Failed to delete the file.");
  }
};

export const deleteAllSongs = async (downloadedSongs, setDownloadedSongs) => {
  try {
    for (const song of downloadedSongs) {
      const fileUri = FileSystem.documentDirectory + song.title + ".mp3";
      const imageUri = FileSystem.documentDirectory + song.title + ".jpg";

      // Delete the audio and image files
      await FileSystem.deleteAsync(fileUri);
      await FileSystem.deleteAsync(imageUri);
    }

    // Clear the downloaded songs list
    setDownloadedSongs([]);

    Toast.show("All downloaded songs have been deleted", {
      type: "success",
      placement: "top",
      duration: 5000,
    });
  } catch (error) {
    Alert.alert("Error", "Failed to delete all files.");
  }
};
