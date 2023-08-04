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
        {item.imageList.length > 0 ? <Image
          style={{ width: 300, height: 300 / 5 * 3, borderRadius: 4 }}
          source={{
            uri: item.imageList[0],
          }}
        /> : null}
      </View>
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
