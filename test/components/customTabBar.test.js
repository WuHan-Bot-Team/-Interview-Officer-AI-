// 自定义导航栏组件测试
const simulate = require('miniprogram-simulate');
require('../__mocks__/wx.js');

describe('CustomTabBar 组件测试', () => {
  let id;

  beforeAll(() => {
    // 创建组件实例
    id = simulate.load({
      template: `
        <view class="custom-tab-bar">
          <view 
            wx:for="{{list}}" 
            wx:key="index" 
            class="tab-item {{selected === index ? 'tab-item-active' : ''}}"
            bindtap="switchTab"
            data-index="{{index}}"
          >
            <image class="tab-icon" src="{{item.icon}}" />
            <text class="tab-text">{{item.text}}</text>
          </view>
        </view>
      `,
      data: {
        selected: 0,
        list: [
          {
            pagePath: "/pages/home2/index",
            text: "首页",
            icon: "/static/home/home_normal.png",
            selectedIcon: "/static/home/home_active.png"
          },
          {
            pagePath: "/pages/practice/index", 
            text: "练习",
            icon: "/static/home/practice_normal.png",
            selectedIcon: "/static/home/practice_active.png"
          },
          {
            pagePath: "/pages/my/index",
            text: "我的",
            icon: "/static/home/my_normal.png", 
            selectedIcon: "/static/home/my_active.png"
          }
        ]
      },
      methods: {
        switchTab(e) {
          const index = e.currentTarget.dataset.index;
          const url = this.data.list[index].pagePath;
          
          this.setData({
            selected: index
          });
          
          wx.switchTab({
            url: url
          });
        }
      }
    });
  });

  afterAll(() => {
    simulate.unload(id);
  });

  describe('组件初始化', () => {
    test('应该正确初始化数据', () => {
      const comp = simulate.render(id);
      const data = comp.data;
      
      expect(data.selected).toBe(0);
      expect(data.list).toHaveLength(3);
      expect(data.list[0].text).toBe('首页');
      expect(data.list[1].text).toBe('练习');
      expect(data.list[2].text).toBe('我的');
    });

    test('应该渲染正确的标签页数量', () => {
      const comp = simulate.render(id);
      const tabItems = comp.querySelectorAll('.tab-item');
      
      expect(tabItems).toHaveLength(3);
    });

    test('应该正确显示图标和文本', () => {
      const comp = simulate.render(id);
      const icons = comp.querySelectorAll('.tab-icon');
      const texts = comp.querySelectorAll('.tab-text');
      
      expect(icons).toHaveLength(3);
      expect(texts).toHaveLength(3);
      
      expect(texts[0].textContent).toBe('首页');
      expect(texts[1].textContent).toBe('练习');
      expect(texts[2].textContent).toBe('我的');
    });
  });

  describe('选中状态', () => {
    test('应该正确显示选中状态', () => {
      const comp = simulate.render(id);
      const activeItem = comp.querySelector('.tab-item-active');
      
      expect(activeItem).toBeTruthy();
    });

    test('默认应该选中第一个标签', () => {
      const comp = simulate.render(id);
      const tabItems = comp.querySelectorAll('.tab-item');
      
      expect(tabItems[0].classList.contains('tab-item-active')).toBe(true);
      expect(tabItems[1].classList.contains('tab-item-active')).toBe(false);
      expect(tabItems[2].classList.contains('tab-item-active')).toBe(false);
    });
  });

  describe('点击交互', () => {
    test('点击标签应该切换选中状态', () => {
      const comp = simulate.render(id);
      const tabItems = comp.querySelectorAll('.tab-item');
      
      // 点击第二个标签
      tabItems[1].dispatchEvent('tap');
      
      expect(comp.data.selected).toBe(1);
      expect(tabItems[0].classList.contains('tab-item-active')).toBe(false);
      expect(tabItems[1].classList.contains('tab-item-active')).toBe(true);
    });

    test('点击标签应该调用 wx.switchTab', () => {
      const mockSwitchTab = jest.fn();
      wx.switchTab = mockSwitchTab;
      
      const comp = simulate.render(id);
      const tabItems = comp.querySelectorAll('.tab-item');
      
      // 点击第三个标签
      tabItems[2].dispatchEvent('tap');
      
      expect(mockSwitchTab).toHaveBeenCalledWith({
        url: '/pages/my/index'
      });
    });

    test('应该正确传递 data-index', () => {
      const comp = simulate.render(id);
      const tabItems = comp.querySelectorAll('.tab-item');
      
      expect(tabItems[0].dataset.index).toBe('0');
      expect(tabItems[1].dataset.index).toBe('1');
      expect(tabItems[2].dataset.index).toBe('2');
    });
  });

  describe('图标路径', () => {
    test('应该使用正确的图标路径', () => {
      const comp = simulate.render(id);
      const icons = comp.querySelectorAll('.tab-icon');
      
      expect(icons[0].src).toBe('/static/home/home_normal.png');
      expect(icons[1].src).toBe('/static/home/practice_normal.png');
      expect(icons[2].src).toBe('/static/home/my_normal.png');
    });

    test('选中状态应该使用不同的图标', () => {
      const comp = simulate.render(id);
      
      // 手动设置选中状态
      comp.setData({ selected: 1 });
      
      const data = comp.data;
      expect(data.list[1].selectedIcon).toBe('/static/home/practice_active.png');
    });
  });

  describe('页面路径配置', () => {
    test('应该有正确的页面路径', () => {
      const comp = simulate.render(id);
      const data = comp.data;
      
      expect(data.list[0].pagePath).toBe('/pages/home2/index');
      expect(data.list[1].pagePath).toBe('/pages/practice/index');
      expect(data.list[2].pagePath).toBe('/pages/my/index');
    });
  });

  describe('边界情况', () => {
    test('应该处理无效的索引', () => {
      const comp = simulate.render(id);
      const originalSelected = comp.data.selected;
      
      // 模拟点击事件但没有有效的 dataset.index
      const mockEvent = {
        currentTarget: {
          dataset: {}
        }
      };
      
      expect(() => {
        comp.instance.switchTab(mockEvent);
      }).not.toThrow();
      
      // 选中状态不应该改变
      expect(comp.data.selected).toBe(originalSelected);
    });

    test('应该处理负数索引', () => {
      const comp = simulate.render(id);
      
      const mockEvent = {
        currentTarget: {
          dataset: { index: '-1' }
        }
      };
      
      expect(() => {
        comp.instance.switchTab(mockEvent);
      }).not.toThrow();
    });

    test('应该处理超出范围的索引', () => {
      const comp = simulate.render(id);
      
      const mockEvent = {
        currentTarget: {
          dataset: { index: '10' }
        }
      };
      
      expect(() => {
        comp.instance.switchTab(mockEvent);
      }).not.toThrow();
    });
  });
});
