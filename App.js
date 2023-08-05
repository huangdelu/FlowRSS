import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  Button,
  AppState, Image, Modal
} from "react-native";
import * as rssParser from "react-native-rss-parser";
import { FlashList } from "@shopify/flash-list";
import RSSItem from "./components/RSSItem";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from 'expo-font';
import * as WebBrowser from "expo-web-browser";
const cheerio = require('cheerio');

/**
 * 当前列表滚动的距离
 */
let curOffsetY = 0;

/**
 * RSS链接集合
 */
const rssLinks = [
  "https://chentiansaber.top/sspai/index", //少数派
  // "http://www.ruanyifeng.com/blog/atom.xml", // 阮一峰
  // "https://chentiansaber.top/bilibili/weekly?limit=20", // BiliBili - 每周热门
  // "https://chentiansaber.top/v2ex/topics/hot", //V2EX - 最热
  // "https://chentiansaber.top/v2ex/tab/creative", //V2EX - 创造
  // "https://chentiansaber.top/v2ex/tab/play", //V2EX - 好玩
  // "https://chentiansaber.top/v2ex/tab/tech", //V2EX - 技术
  // "https://chentiansaber.top/hackernews/best", // HackNews
  "https://chentiansaber.top/wechat/ce/5b6871ddaf33fe067f22dbd3", // 差评公众号
  // "https://chentiansaber.top/gamersky/news?limit=20", // 游民星空
  // "https://chentiansaber.top/douban/list/subject_real_time_hotest", // 豆瓣
  // 即刻
  // Twitter，Instergram，youtube，微博
];

async function requestRSSData(rssLink) {
  return new Promise((resolve) => {
    fetch(rssLink)
      .then((response) => response.text())
      .then((responseData) => rssParser.parse(responseData))
      .then((rss) => {
        // console.log(`[link:${rssLink}] , [${rss}]`);
        resolve(rss);
      });
  });
}

/**
 * 处理RSS原始数据
 */
async function processRSSData(rss) {
  let tempList = [];
  for (let i = 0; i < rss.items.length; i++) {
    let rssItem = rss.items[i];

    // 找出所有图片
    let imageList = []
    let content = (rssItem.content && rssItem.content.length > rssItem.description.length) ? rssItem.content : rssItem.description
    const $ = cheerio.load(content);
    const imgTags = $('img');

    imgTags.each((index, element) => {
      imageList.push($(element).attr('src'))
    });
    // console.log('imageList --> ', imageList);

    // 删除无用的标签
    $('img').remove();
    $('figure').remove();
    $('hr').remove();
    $('iframe').remove();

    // // 提取<p>标签的文本并保留标签
    // const pText = $('p').html();
    // 提取前三个<p>标签的内容
    let pContents = ``;
    $('p').slice(3, 7).each((index, element) => {
      pContents = pContents + ($(element).html()) + (index == 3 ? '' : `<br>`);
    });

    // 截取description前500个
    // let description = pText.length <= 500 ? pText : `${pText.substr(0, 500)}...`
    let description = pContents;

    // 请求头像
    let avatarData = await fetch(`https://source.unsplash.com/random/200x200?city`)

    // 请求首张图的宽高
    let imageSize = { width: 0, height: 0 }
    if (imageList.length > 3) {
      imageSize = await new Promise((resolve, reject) => {
        Image.getSize(imageList[imageList.length - 3], (width, height) => {
          resolve({ width, height });
        }, reject);
      });
    }

    tempList.push({
      id: 0,
      channel: {
        title: rss.title,
        link: rss.links[0].url,
      },
      title: rssItem.title,
      link: rssItem.links[0].url,
      author: rssItem.authors.length > 0 ? rssItem.authors[0].name : "blank",
      avatarUrl: avatarData.url,
      description: description,
      content: content,
      imageList: imageList,
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      published: rssItem.published,
    });
  }

  return tempList;
}

/**
 * 保存RSS数据
 */
async function saveData(value) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem("rsslist", jsonValue);
    console.log("保存成功");
  } catch (e) {
    alert("保存失败");
  }
}

/**
 * 保存已看的数据
 */
async function saveReadList(value) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem("hasReadList", jsonValue);
    console.log("已读保存成功", jsonValue);
  } catch (e) {
    alert("已读保存失败");
  }
}

const handleAppStateChange = async (nextAppState) => {
  console.log("nextAppState", nextAppState);
  if (nextAppState == "inactive") {
    console.log("保存列表滑动位置");
    await AsyncStorage.setItem("listOffSetY", `${curOffsetY}`);
  }
};

export default function App() {
  const [itemList, setItemList] = useState([]);

  const [log, setLog] = useState("");
  const [showLog, setShowLog] = useState(false)

  const [fontsLoaded] = useFonts({
    'Billabong': require('./assets/fonts/Billabong.ttf'),
  });

  useEffect(() => {
    async function readData() {
      const jsonValue = await AsyncStorage.getItem("rsslist");
      let data = [];
      if (jsonValue != null) {
        data = JSON.parse(jsonValue);
      }
      console.log("useEffect-->", data.length);
      if (data != null || data != undefined) {
        setItemList(data);
      }
    }
    readData();

    // 监听APP前后台变化
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      console.log("unmounted");
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    async function recoverListPosition() {
      if (itemList.length > 0) {
        // 恢复列表位置
        curOffsetY = await AsyncStorage.getItem("listOffSetY");
        // console.log("recoverListPosition", curOffsetY, this.listView);
        this.listView && this.listView.scrollToOffset({ offset: curOffsetY });
      }
    }
    recoverListPosition();
  }, [itemList]);

  function updateLog(info) {
    setLog(`${info}\n${log}`)
  }

  async function requestAll() {
    setLog('')
    // // 滑动位置复位
    // await AsyncStorage.setItem("listOffSetY", `${0}`);
    // // // 每次请求新数据前，先把旧数据保存起来，用来判断已读
    const readList = new Set();
    // const tempItemList = [];
    // tempItemList.push(...itemList);
    // tempItemList.forEach((value) => {
    //   readList.add(value.title);
    // });
    // console.log("read1 ->", readList.size);
    // let jsonValue = await AsyncStorage.getItem("hasReadList");
    // // console.log("hasReadList ->", jsonValue);
    // let lastData = [];
    // if (jsonValue != null) {
    //   lastData = JSON.parse(jsonValue);
    //   console.log("read2 ->", lastData);
    //   lastData.list.forEach((value) => {
    //     readList.add(value);
    //   });
    // }
    // // console.log("readList.length ->", readList);
    // if (readList.size > 0) {
    //   await saveReadList({ list: Array.from(readList) });
    // }
    // updateLog("已读数据已处理");

    const tempList = [];
    for (let i = 0; i < rssLinks.length; i++) {
      console.log(`[link --> ${rssLinks[i]}]`);
      updateLog(`[link[${i + 1}/${rssLinks.length}] --> ${rssLinks[i]}]`);
      let result = await requestRSSData(rssLinks[i]);
      console.log(result.items[0]);
      let list = await processRSSData(result);
      console.log("processRSSData-->", list.length);
      list.forEach((value) => {
        if (readList.has(value.title) == false) {
          tempList.push(value);
        }
      });
      console.log("forEach-->", tempList.length);
    }
    updateLog(`加载结束`);

    // 打乱数据
    tempList.sort(() => Math.random() - 0.5);

    tempList.push({ id: 1 })

    saveData(tempList);
    setItemList(tempList);
  }

  const handleItemClick = () => {
    requestAll()
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLog}
        onRequestClose={() => {
          setShowLog(false);
        }}>
        <View style={{ flex: 1, justifyContent: "flex-end" }} onPress={() => {
          setShowLog(false)
        }}>
          <Pressable style={{ flex: 1 }} onPress={() => {
            setShowLog(false)
          }} />
          <View style={{
            width: '100%',
            height: 300,
            backgroundColor: 'white',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            borderWidth: 2,
            borderColor: '#f5f5f5'
          }}>
            <Text style={{ flex: 1, padding: 16 }}>
              {log}
            </Text>
          </View>
        </View>
      </Modal>
      <Pressable style={{
        height: 50,
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: 16,
        paddingRight: 16
      }} onPress={() => {
        requestAll()
      }} onLongPress={() => {
        setShowLog(true)
      }}>
        <Text style={{ fontFamily: 'Billabong', fontSize: 30 }}>{"Rssgrame"}</Text>
        <View style={{ flexDirection: 'row' }}>
          <Pressable style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }} >
            <Image source={require('./res/readlater.png')} style={{ width: 24, height: 24 }} />
          </Pressable>
          <Pressable style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center', marginLeft: 6 }} onPress={async () => {
            let result = await WebBrowser.openBrowserAsync('https://web.okjike.com/recommend');
            console.log(result);
          }}>
            <Image source={require('./res/Jike.png')} style={{ width: 24, height: 24 }} />
          </Pressable>
        </View>
      </Pressable>
      <View style={{ height: 1.5, width: '100%', backgroundColor: '#f5f5f5' }} />
      <View style={styles.itemList}>
        <FlashList
          ref={(ref) => (this.listView = ref)}
          data={itemList}
          renderItem={({ item }) => <RSSItem item={item} onClick={handleItemClick} />}
          estimatedItemSize={200}
          onScroll={(event) => {
            curOffsetY = event.nativeEvent.contentOffset.y;
          }}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 52,
  },
  itemList: {
    flex: 1,
    backgroundColor: '#f2f4f7'
  },
});
