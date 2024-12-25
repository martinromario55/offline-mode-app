import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";

const SongItem = ({
  song,
  downloadedSongs,
  isDownloading,
  currentDownload,
  isOffline,
  enqueueDownload,
  deleteSong,
}) => {
  const isDownloaded = downloadedSongs.some(item => item.title === song.title);
  const downloadedFile = downloadedSongs.find(
    item => item.title === song.title
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundObject, setSoundObject] = useState<Audio.Sound | null>(null);

  const togglePlayPause = async uri => {
    try {
      if (!soundObject) {
        const sound = new Audio.Sound();
        await sound.loadAsync({ uri });
        await sound.playAsync();
        setSoundObject(sound);
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          await soundObject.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundObject.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error: any) {
      Alert.alert("Playback Error", error.message);
    }
  };

  if (isOffline) {
    if (downloadedFile) {
      return (
        <View style={styles.songItem}>
          {/* Image */}
          <Image
            source={{ uri: downloadedFile.image }}
            style={styles.thumbnail}
          />

          {/* Info */}
          <View style={styles.songInfo}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {downloadedFile.title}
            </Text>
            <Text style={styles.songAuthor}>{downloadedFile.author}</Text>
            <Text style={styles.songDuration}>{downloadedFile.duration}</Text>

            {/* Action Buttons */}
            <View style={styles.songActions}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => togglePlayPause(downloadedFile.uri)}
              >
                <MaterialIcons
                  name={isPlaying ? "pause" : "play-arrow"}
                  size={20}
                  color={"#0ff"}
                />
                <Text style={{ color: "#fff", fontSize: 15, marginLeft: 5 }}>
                  {isPlaying ? "Pause" : "Play"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (isDownloaded) {
                    deleteSong(downloadedFile.title);
                  } else {
                    // enqueueDownload(song);
                    alert("You are offline!");
                  }
                }}
              >
                {isDownloading && currentDownload === song.title ? (
                  <ActivityIndicator size="small" color="#0ff" />
                ) : (
                  <MaterialIcons
                    name={isDownloaded ? "file-download-done" : "file-download"}
                    size={26}
                    color={isDownloaded ? "green" : "gray"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.offlineContainer}>
          <MaterialIcons name="signal-cellular-no-sim" size={30} color="#999" />
          <Text style={{ marginTop: 10, color: "#999" }}>
            You are offline. Please check your internet connection.
          </Text>
        </View>
      );
    }
  }

  //   console.log("Downloaded File", downloadedFile);

  return (
    <View style={styles.songItem}>
      {/* Image */}
      <Image source={{ uri: song.image }} style={styles.thumbnail} />

      {/* Info */}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.songAuthor}>{song.author}</Text>
        <Text style={styles.songDuration}>{song.duration}</Text>

        {/* Action Buttons */}
        <View style={styles.songActions}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => togglePlayPause(song.url)}
          >
            <MaterialIcons
              name={isPlaying ? "pause" : "play-arrow"}
              size={20}
              color={"#0ff"}
            />
            <Text style={{ color: "#fff", fontSize: 15, marginLeft: 5 }}>
              {isPlaying ? "Pause" : "Play"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (isDownloaded) {
                deleteSong(song.title);
              } else {
                enqueueDownload(song);
              }
            }}
          >
            {isDownloading && currentDownload === song.title ? (
              <ActivityIndicator size="small" color="#0ff" />
            ) : (
              <MaterialIcons
                name={isDownloaded ? "file-download-done" : "file-download"}
                size={26}
                color={isDownloaded ? "green" : "gray"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SongItem;

const styles = StyleSheet.create({
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
    elevation: 2, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  songAuthor: {
    fontSize: 14,
    color: "#666",
  },
  songDuration: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  songActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  playButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    borderRadius: 16,
    padding: 8,
    marginRight: 8,
    width: 90,
  },
  offlineContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    elevation: 2, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
});
