import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // For the icons

// Sample song list (as provided earlier)
const songs = [
  {
    id: "1",
    title: "Deep Dive | How to Quit Your Job the Right Way",
    author: "Apple Talk",
    duration: "52:27 mins",
    image: "https://via.placeholder.com/100", // Replace with actual thumbnail URLs
  },
  {
    id: "2",
    title: "Finding a Missing Person in the Middle East",
    author: "Office Ladies",
    duration: "21:37 mins",
    image: "https://via.placeholder.com/100",
  },
  {
    id: "3",
    title: "The Winning Example of Extreme Ownership",
    author: "Stuff You Should Know",
    duration: "35:52 mins",
    image: "https://via.placeholder.com/100",
  },
  // Add more songs as needed
];

// Function to check if a song is downloaded
const isSongDownloaded = title => {
  return downloadedSongs.some(song => song.title === title);
};

// Render Song Item (Matching the Design)
const renderSongItem = ({ item }) => {
  const downloaded = isSongDownloaded(item.title);

  return (
    <View style={styles.songItem}>
      {/* Song Thumbnail */}
      <Image source={{ uri: item.image }} style={styles.thumbnail} />
      {/* Song Info */}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.songAuthor}>{item.author}</Text>
        <Text style={styles.songDuration}>{item.duration}</Text>
      </View>
      {/* Action Buttons */}
      <View style={styles.songActions}>
        {/* Play Button */}
        <TouchableOpacity style={styles.playButton}>
          <MaterialIcons name="play-arrow" size={24} color="white" />
        </TouchableOpacity>
        {/* Download/Downloaded Icon */}
        <TouchableOpacity
          onPress={() =>
            downloaded ? deleteSong(item.title) : enqueueDownload(item)
          }
        >
          <MaterialIcons
            name={downloaded ? "file-download-done" : "file-download"}
            size={24}
            color={downloaded ? "green" : "gray"}
          />
        </TouchableOpacity>
        {/* Overflow Menu Placeholder */}
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main Component
export default function SongListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>New Updates</Text>
      <FlatList
        data={songs}
        keyExtractor={item => item.id}
        renderItem={renderSongItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Styles for the Component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  },
  playButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    padding: 8,
    marginRight: 8,
  },
});
