import config from './config';
import Mock from './mock/index';
import createBus from './utils/eventBus';
import {
  connectSocket,
  fetchUnreadNum
} from './mock/chat';

if (config.isMock) {
  Mock();
}

App({
  onLaunch() {
    const updateManager = wx.getUpdateManager();

    console.log("a");
    //getsaveedfile获取store文件，unlink+wx.env.USER_DATA_PATH获取用户文件，缓存文件temp无法删除，只能先保存，再删除
    console.log("b");

    updateManager.onCheckForUpdate((res) => {
      // console.log(res.hasUpdate)
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });

    this.getUnreadNum();
    this.connect();
  },
  globalData: {
    userInfo: null,
    unreadNum: 0, // 未读消息数量
    socket: null, // SocketTask 对象
   url : "http://127.0.0.1:5000/",
   //url : "http://47.115.219.232:80/",
  },
  /**
   * 将 ArrayBuffer 转换为十六进制字符串
   * @param {ArrayBuffer} buffer - 待转换的 ArrayBuffer
   * @returns {string} - 转换后的十六进制字符串
   */
  buf2hex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },

  hexToStr(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  },
  /** 全局事件总线 */
  eventBus: createBus(),

  /** 初始化WebSocket */
  connect() {
    const socket = connectSocket();
    socket.onMessage((data) => {
      data = JSON.parse(data);
      if (data.type === 'message' && !data.data.message.read) this.setUnreadNum(this.globalData.unreadNum + 1);
    });
    this.globalData.socket = socket;
  },

  /** 获取未读消息数量 */
  getUnreadNum() {
    fetchUnreadNum().then(({
      data
    }) => {
      this.globalData.unreadNum = data;
      this.eventBus.emit('unread-num-change', data);
    });
  },

  /** 设置未读消息数量 */
  setUnreadNum(unreadNum) {
    this.globalData.unreadNum = unreadNum;
    this.eventBus.emit('unread-num-change', unreadNum);
  },
});