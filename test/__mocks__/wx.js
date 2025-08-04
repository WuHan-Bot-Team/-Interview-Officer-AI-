// 微信小程序API Mock
global.wx = {
  // 存储相关
  getStorageSync: jest.fn(() => ''),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  
  // 网络请求
  request: jest.fn((options) => {
    setTimeout(() => {
      if (options.success) {
        options.success({
          statusCode: 200,
          data: { code: 200, message: 'success', data: {} }
        });
      }
    }, 100);
  }),
  
  // 路由相关
  switchTab: jest.fn((options) => {
    if (options.success) options.success();
  }),
  navigateTo: jest.fn((options) => {
    if (options.success) options.success();
  }),
  navigateBack: jest.fn(),
  
  // UI相关
  showToast: jest.fn(),
  showModal: jest.fn((options) => {
    if (options.success) {
      options.success({ confirm: true, cancel: false });
    }
  }),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  
  // 系统信息
  getSystemInfo: jest.fn((options) => {
    if (options.success) {
      options.success({
        platform: 'ios',
        screenWidth: 375,
        screenHeight: 667,
        windowWidth: 375,
        windowHeight: 667
      });
    }
  }),
  
  // 环境变量
  env: {
    USER_DATA_PATH: '/mock/user/data/path'
  },
  
  // 文件系统
  getFileSystemManager: jest.fn(() => ({
    copyFileSync: jest.fn(),
    readFileSync: jest.fn(),
    writeFileSync: jest.fn()
  })),
  
  // 更新管理
  getUpdateManager: jest.fn(() => ({
    onCheckForUpdate: jest.fn(),
    onUpdateReady: jest.fn(),
    applyUpdate: jest.fn()
  }))
};

// App 函数 Mock
global.App = jest.fn((config) => {
  return config;
});

// Page 函数 Mock
global.Page = jest.fn((config) => {
  return config;
});

// Component 函数 Mock
global.Component = jest.fn((config) => {
  return config;
});

// getCurrentPages Mock
global.getCurrentPages = jest.fn(() => [
  {
    route: 'pages/home2/index',
    options: {}
  }
]);

// getApp Mock
global.getApp = jest.fn(() => ({
  globalData: {
    userInfo: null,
    unreadNum: 0,
    socket: null,
    url: "",
    tabBarShow: true,
    theme: {
      primary: '#3b82f6',
      secondary: '#93c5fd',
      accent: '#1d4ed8'
    }
  },
  eventBus: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  }
}));
