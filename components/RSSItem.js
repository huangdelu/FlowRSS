import {
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
  Image,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import moment from "moment";
import RenderHtml from "react-native-render-html";
import { useEffect, useState } from "react";

export default function RSSItem({ item }) {
  const { width } = useWindowDimensions();

  const tagStyles = {
    strong: {
      fontWeight: '500'
    },
    p: {
      marginTop: 10,
      marginBottom: 0
    },
    a: {
      color: '#1f1f1f'
    },
    li: {
      marginLeft: 6,
      fontSize: 16,
      marginBottom: 6,
    }
  }

  const baseStyle = {
    fontSize: 16,
    color: '#1f1f1f',
    lineHeight: 23,
    whiteSpace: 'normal'
  }

  useEffect(() => {

  }, [])

  return (
    <Pressable
      onPress={async () => {
        console.log(`open --> [${item.link}]`);
        if (item.link != undefined) {
          let result = await WebBrowser.openBrowserAsync(item.link);
          console.log(result);
        }
      }}
    >
      {item.id == 0 ?
        <View style={styles.container}>
          <View style={styles.header}>
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            <View>
              <Text style={styles.author}>{item.author}</Text>
              <View style={{ flexDirection: 'row', marginTop: 2 }}>
                <Text style={styles.channelTitle}>@{item.channel.title}</Text>
                <Text style={styles.time}>· {moment(item.published).fromNow()}</Text>
              </View>
            </View>
          </View>
          {item.title && item.title.length > 0 ? <Text style={styles.itemTitle}>{item.title}</Text> : null}
          <View style={{ width: "100%", marginTop: 2 }}>
            <RenderHtml source={{ html: item.description }} contentWidth={width} baseStyle={baseStyle} tagsStyles={tagStyles} enableExperimentalGhostLinesPrevention={true} />
          </View>
          {item.imageList.length > 3 ? <Image
            style={{ width: (item.imageWidth > item.imageHeight ? 200 : 200 * item.imageWidth / item.imageHeight), height: (item.imageWidth > item.imageHeight ? 200 * item.imageHeight / item.imageWidth : 200), borderRadius: 4 }}
            source={{
              uri: item.imageList[item.imageList.length - 3],
            }}
          /> : null}
        </View> :
        <Pressable onPress={() => {
          alert('刷新')
        }}>
          <View style={{ width: '100%', height: 50 }}>
            <Text>{"换一批"}</Text>
          </View>
        </Pressable>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
    marginBottom: 10
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#101828',
    backgroundColor: "white",
  },
  author: {
    fontSize: 15,
    color: "#1f1f1f",
    marginLeft: 8,
    fontWeight: 'bold'
  },
  channelTitle: {
    marginLeft: 6,
    color: "#101828",
  },
  time: {
    marginLeft: 6,
    color: "#101828",
  },
  itemTitle: {
    marginTop: 16,
    fontWeight: "500",
    fontSize: 17,
    lineHeight: 22,
  },
});
