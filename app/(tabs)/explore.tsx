import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList } from "react-native";
import SongItem from "@/components/song-item";
import { useStore } from "@/hooks/useStore";
import { useStorage } from "@/hooks/useStorage";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const songs = {
  "Christmas-songs": [
    {
      id: "1",
      title: "It's Beginning to Look like Christmas",
      author: "Michael Buble",
      duration: "3:26 mins",
      image:
        "https://img.freepik.com/free-vector/electronic-audio-sound-equalizer-bar-background-design_1017-51572.jpg?t=st=1735039501~exp=1735043101~hmac=8d40986bd4d05fd5ddc597b1e70bf3b141f3ef2144d707fbbdf0fe50f8b64264&w=996",
      url: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
    },
    {
      id: "2",
      title: "Rockin' Around the Christmas Tree",
      author: "Brenda Lee",
      duration: "2:37 mins",
      image:
        "https://img.freepik.com/free-vector/electronic-audio-sound-equalizer-bar-background-design_1017-51572.jpg?t=st=1735039501~exp=1735043101~hmac=8d40986bd4d05fd5ddc597b1e70bf3b141f3ef2144d707fbbdf0fe50f8b64264&w=996",
      url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
    },
    {
      id: "3",
      title: "All I want for Christmas Is You",
      author: "Mariah Careh",
      duration: "4:02 mins",
      image:
        "https://img.freepik.com/free-vector/electronic-audio-sound-equalizer-bar-background-design_1017-51572.jpg?t=st=1735039501~exp=1735043101~hmac=8d40986bd4d05fd5ddc597b1e70bf3b141f3ef2144d707fbbdf0fe50f8b64264&w=996",
      url: "https://reckhorn.com/media/music/08/bb/8a/Doppelbass-1.mp3",
    },
    {
      id: "4",
      title: "Driving Home for Christmas",
      author: "Chris Rea",
      duration: "3:52 mins",
      image:
        "https://img.freepik.com/free-vector/electronic-audio-sound-equalizer-bar-background-design_1017-51572.jpg?t=st=1735039501~exp=1735043101~hmac=8d40986bd4d05fd5ddc597b1e70bf3b141f3ef2144d707fbbdf0fe50f8b64264&w=996",
      url: "https://reckhorn.com/media/music/7a/6f/e8/Test-2.mp3",
    },
    {
      id: "5",
      title: "Snowman",
      author: "Sia",
      duration: "2:45 mins",
      image:
        "https://img.freepik.com/free-vector/electronic-audio-sound-equalizer-bar-background-design_1017-51572.jpg?t=st=1735039501~exp=1735043101~hmac=8d40986bd4d05fd5ddc597b1e70bf3b141f3ef2144d707fbbdf0fe50f8b64264&w=996",
      url: "https://reckhorn.com/media/music/58/95/5f/Test-3.mp3",
    },
  ],
  "Pop-songs": [
    {
      id: "1",
      title: "Call Me Maybe",
      author: "Carly Rae Jepsen",
      duration: "3:27 mins",
      image:
        "https://img.freepik.com/free-vector/abstract-music-background_1394-559.jpg?t=st=1735210817~exp=1735214417~hmac=4412fe15c2e6b85b36870a6755d4d381ff81f9be225d0af78c57a502cd3c3fdd&w=826",
      url: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
    },
    {
      id: "2",
      title: "Somebody I used to know",
      author: "Gotye",
      duration: "4:37 mins",
      image:
        "https://img.freepik.com/free-vector/abstract-background-design_1314-191.jpg?t=st=1735211074~exp=1735214674~hmac=06b5b18045545eb489e71c5ff7e1fffadcf472137afc030ffeabde4d8e8b71b5&w=826",
      url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
    },
    {
      id: "3",
      title: "Into the Sky",
      author: "Owl City",
      duration: "3:52 mins",
      image:
        "https://img.freepik.com/free-vector/vinyl-record-background-with-copyspace_98292-4132.jpg?t=st=1735211146~exp=1735214746~hmac=f456cd4c77006c5307e0f44fccf899d84353e682792d484befdd78bf345ca889&w=826",
      url: "https://reckhorn.com/media/music/08/bb/8a/Doppelbass-1.mp3",
    },
    {
      id: "4",
      title: "Blank Space",
      author: "Taylor Swift",
      duration: "3:52 mins",
      image:
        "https://img.freepik.com/free-vector/grunge-style-music-background-with-speakers_1048-2513.jpg?t=st=1735211184~exp=1735214784~hmac=6bd06cee00ce55328b61e8c391801842a5a605382dcc5e808a9302058cfaf804&w=826",
      url: "https://reckhorn.com/media/music/7a/6f/e8/Test-2.mp3",
    },
    {
      id: "5",
      title: "Tennis Court",
      author: "Lorde",
      duration: "3:52 mins",
      image:
        "https://img.freepik.com/free-vector/music-icon-set_1284-34557.jpg?t=st=1735211226~exp=1735214826~hmac=1167f02295a0f4fb91737cc3fd7eaaf2f51056e49266a093e8107f9145280623&w=826",
      url: "https://reckhorn.com/media/music/58/95/5f/Test-3.mp3",
    },
  ],
};

const OfflineModeApp = () => {
  const {
    metadata,
    enqueueDownload,
    isDownloading,
    currentDownload,
    downloadAllSongs,
    deleteSong,
    deleteAllSongsInCategory,
  } = useStore();
  const isOffline = useNetworkStatus();
  const { usedStorage, totalStorage } = useStorage(metadata);

  // console.log("Metadata", metadata);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Offline Songs</Text>
      <View style={styles.storageInfo}>
        <Text style={styles.storageText}>Used Storage: {usedStorage}</Text>
        <Text style={styles.storageText}>Total Storage: {totalStorage}</Text>
      </View>

      {Object.keys(songs).map(category => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.subHeader}>{category}</Text>
          <FlatList
            data={songs[category]}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <SongItem
                song={item}
                downloadedSongs={metadata[category] || []}
                isDownloading={isDownloading}
                currentDownload={currentDownload}
                isOffline={isOffline}
                enqueueDownload={enqueueDownload}
                category={category}
                deleteSong={deleteSong}
              />
            )}
            horizontal
          />
          <View style={styles.actionButtons}>
            <Button
              title={`Download All ${category}`}
              onPress={() => {
                console.log(
                  `[DEBUG] Triggering downloadAllSongs for category: ${category}`
                );
                downloadAllSongs(songs[category], category);
              }}
            />
            <Button
              title={`Delete All ${category}`}
              color="red"
              onPress={() => {
                console.log(
                  `[DEBUG] Triggering deleteAllSongsInFolder for category: ${category}`
                );
                deleteAllSongsInCategory(category);
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  storageInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  storageText: { fontSize: 14, color: "#333", marginBottom: 8 },
  categoryContainer: { marginBottom: 20 },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
  },
});

export default OfflineModeApp;
