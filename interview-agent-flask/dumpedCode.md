// requestStream(message) {
  //   const that = this;
  //   let fullResponse = '';
    
  //   // 创建EventSource连接
  //   const eventSource = wx.connectSocket({
  //     url: 'http://127.0.0.1:5000/practice/evaluate_v2',
  //     method: 'GET',
  //     header: {
  //       'content-type': 'application/json'
  //     },
  //     data: JSON.stringify({ message: message })
  //   });
    
  //   // 监听消息
  //   wx.onSocketMessage(function(res) {
  //     if (res.data.startsWith('data: ')) {
  //       const content = res.data.substring(6).trim();
  //       fullResponse += content;
        
  //       // 更新最后一条助手消息
  //       that.setData({
  //         currentAssistantMessage: fullResponse,
  //         messages: [
  //           ...that.data.messages.filter(m => m.role !== 'assistant'),
  //           { id: 'assistant', role: 'assistant', content: fullResponse }
  //         ]
  //       });
  //     }
  //   });
    
  //   // 监听关闭
  //   wx.onSocketClose(function() {
  //     that.setData({ isLoading: false });
  //   });
    
  //   // 监听错误
  //   wx.onSocketError(function() {
  //     that.setData({ 
  //       isLoading: false,
  //       messages: [...that.data.messages, {
  //         id: 'error',
  //         role: 'system',
  //         content: '连接出错，请重试'
  //       }]
  //     });
  //   });
  // }


        wx.sendSocketMessage({
        data: JSON.stringify({
          header: {
            app_id: "a9730a45",
            request_id: this.generateUUIDv4(),
            ctrl: "start"
          },
          parameter: {
            avatar: {
              "stream": {
                "protocol": "rtmp", // 协议，支持rtmp，xrtc、webrtc、flv
                "fps": 25, // 只支持25
              },
              "audio_format": 1 / 2, //1：16k:2：24k
              "avatar_id": "cnrmkf0e2000000006", // 形象id
              "width": 512, // 视频分辨率：宽
              "height": 512 // 视频分辨率：高  其他参数变形
            },
            "tts": { // 合成参数 
              "vcn": "", // 发音人 
              "speed": 50, // 语速：[0,100]，默认50 
              "pitch": 50, // 语调：[0,100]，默认50 
              "volume": 50, // 音量：[0,100]，默认50
            }
          },
          "payload": {}
        }),
        success() {
          console.log('消息发送成功');
        }
      });


  // 初始化数字人SDK
  initAvatarSDK() {
    console.log('开始初始化数字人SDK...');
    this.getAvatarStreamUrl();
  },
  generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  getAvatarStreamUrl() {
    let wssurl = this.generateXfAvatarWsUrl()
    wx.onSocketOpen(function () {
      console.log('WebSocket 已连接');
    });
    wx.onSocketMessage(function (res) {
      console.log('收到服务器内容：', res.data);
    });
    wx.onSocketError(function (err) {
      console.error('WebSocket 连接错误：', err);
    });
    // return
    wx.connectSocket({
      url: wssurl,
      success(res) {
        console.log('WebSocket 连接已发起', res);
      },fail(err){
        console.log(err);
      }    
    },);
  },

  // wss://avatar.cn-huadong-1.xf-yun.com/v1/interact?authorization=aG1hYyB1c2VybmFtZT0iZmUxNjExOGIyZGUyOGVlOGZmZjgwNDZiMDE1ZTMzNTgiLCBhbGdvcml0aG09ImhtYWMtc2hhMjU2IiwgaGVhZGVycz0iaG9zdCBkYXRlIHJlcXVlc3QtbGluZSIsIHNpZ25hdHVyZT0iTnBXbGxkM1ZaajJGcnNzMFhET21BaDJSTmZiNzlBVUxYTmlyZkNuNmVRaz0i&host=avatar.cn-huadong-1.xf-yun.com&date=Sun%2C%2029%20Jun%202025%2023%3A37%3A13%20GMT

  generateXfAvatarWsUrl() {
    // const url = new URL(requestUrl);
    // const host = url.host;
    // const path = url.pathname;
    const apiKey = "fe16118b2de28ee8fff8046b015e3358";
    const apiSecret = "NmJkYjU3OTI1NDRlNDViOWY1NjYyYzMx";
    const method = 'GET';
    const requestUrl = 'wss://avatar.cn-huadong-1.xf-yun.com/v1/interact';
    const { protocol, host, path } = this.parseUrl('wss://avatar.cn-huadong-1.xf-yun.com/v1/interact');
    // utc().
    const date = dayjs().format('ddd, DD MMM YYYY HH:mm:ss [GMT]');
    const signatureStr = `host: ${host}\ndate: ${date}\n${method} ${path} HTTP/1.1`;
    console.log('signature_str:', signatureStr);    
    const hash = CryptoJS.HmacSHA256(signatureStr, apiSecret);
    console.log(hash);
    const signature = CryptoJS.enc.Base64.stringify(hash)
    console.log(signature);
    // 4. 构建 authorization 字符串
    const authorization = `hmac username="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authBase = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorization));
  
    // 5. 构建最终连接地址（wss + query）
    const finalUrl = `${requestUrl}?authorization=${encodeURIComponent(authBase)}&host=${encodeURIComponent(host)}&date=${encodeURIComponent(date)}`;
    console.log('signature:', signature);
    console.log('authorization:', authorization);
    console.log('authBase:', authBase);
    console.log('final WebSocket URL:', finalUrl);
    return finalUrl;
  },

  parseUrl(url) {
    const match = url.match(/^(https?:|wss?:)\/\/([^/]+)(\/[^?#]*)?/);
    if (!match) {
      throw new Error('Invalid URL');
    }
    return {
      protocol: match[1].replace(':', ''),
      host: match[2],
      path: match[3] || '/'
    };
  },
  // 数字人播放器状态变化
  onAvatarPlayerStateChange(e) {
    console.log('数字人播放器状态变化:', e.detail);
  },

  // 数字人播放器错误
  onAvatarPlayerError(e) {
    console.error('数字人播放器错误:', e.detail);
  },

  // 发送文本给数字人
  sendTextToAvatar(text) {
    if (!text || !text.trim()) return;

    wx.request({
      url: 'http://your-backend-api.com/avatar/text',
      method: 'POST',
      data: {
        text: text
      },
      success: (res) => {
        console.log('发送文本给数字人成功:', res.data);
      },
      fail: (err) => {
        console.error('发送文本给数字人失败:', err);
      }
    });
  },

  // 停止数字人
  stopAvatar() {
    wx.request({
      url: 'http://your-backend-api.com/avatar/stop',
      method: 'POST',
      success: (res) => {
        this.setData({
          avatarStreamUrl: ''
        });
      },
      fail: (err) => {
        console.error('停止数字人失败:', err);
      }
    });
  },