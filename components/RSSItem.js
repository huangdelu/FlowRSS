import {
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import moment from "moment";
import RenderHtml from "react-native-render-html";

export default function RSSItem({ item }) {
  const { width } = useWindowDimensions();
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
          <View style={styles.avatar} />
          <Text style={styles.author}>{item.author}</Text>
          <Text style={styles.channelTitle}>@{item.channel.title}</Text>
          <Text style={styles.time}>· {moment(item.published).fromNow()}</Text>
        </View>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={{ width: "100%", maxHeight: 300 ,backgroundColor:'gray'}}>
          <RenderHtml source={{ html: item.content }} contentWidth={width} />
        </View>
        <View style={item.splitLine} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
    backgroundColor: "white",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 30,
    backgroundColor: "red",
  },
  author: {
    fontSize: 14,
    color: "#1f1f1f",
    marginLeft: 8,
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
    fontWeight: "bold",
    fontSize: 16,
  },
  splitLine: {
    backgroundColor: "#f4f4f4",
    width: "100%",
    height: 1,
    marginTop: 16,
  },
});
