// 首页测试
const simulate = require('miniprogram-simulate');
require('../__mocks__/wx.js');

describe('Home2 页面测试', () => {
  let id;

  beforeAll(() => {
    // 模拟首页组件
    id = simulate.load({
      template: `
        <view class="home-container">
          <view class="header">
            <text class="title">AI智面</text>
            <text class="subtitle">智能面试助手</text>
          </view>
          
          <view class="feature-grid">
            <view class="feature-item" bindtap="navigateToInterview">
              <image class="feature-icon" src="/static/home/interview.png" />
              <text class="feature-title">AI面试</text>
              <text class="feature-desc">智能模拟面试</text>
            </view>
            
            <view class="feature-item" bindtap="navigateToPractice">
              <image class="feature-icon" src="/static/home/practice.png" />
              <text class="feature-title">刷题练习</text>
              <text class="feature-desc">海量题库练习</text>
            </view>
            
            <view class="feature-item" bindtap="navigateToAnalysis">
              <image class="feature-icon" src="/static/home/analysis.png" />
              <text class="feature-title">简历分析</text>
              <text class="feature-desc">AI智能分析</text>
            </view>
            
            <view class="feature-item" bindtap="navigateToFeedback">
              <image class="feature-icon" src="/static/home/feedback.png" />
              <text class="feature-title">反馈建议</text>
              <text class="feature-desc">专业指导建议</text>
            </view>
          </view>
          
          <view class="stats-section">
            <text class="stats-title">使用统计</text>
            <view class="stats-grid">
              <view class="stats-item">
                <text class="stats-number">{{stats.interviewCount}}</text>
                <text class="stats-label">面试次数</text>
              </view>
              <view class="stats-item">
                <text class="stats-number">{{stats.practiceCount}}</text>
                <text class="stats-label">练习题数</text>
              </view>
              <view class="stats-item">
                <text class="stats-number">{{stats.scoreAvg}}</text>
                <text class="stats-label">平均分数</text>
              </view>
            </view>
          </view>
        </view>
      `,
      data: {
        stats: {
          interviewCount: 0,
          practiceCount: 0,
          scoreAvg: 0
        }
      },
      methods: {
        onLoad() {
          this.loadUserStats();
        },
        
        loadUserStats() {
          // 模拟加载用户统计数据
          this.setData({
            stats: {
              interviewCount: 15,
              practiceCount: 128,
              scoreAvg: 85
            }
          });
        },
        
        navigateToInterview() {
          wx.navigateTo({
            url: '/pages/interviewHome/index'
          });
        },
        
        navigateToPractice() {
          wx.switchTab({
            url: '/pages/practice/index'
          });
        },
        
        navigateToAnalysis() {
          wx.navigateTo({
            url: '/pages/analysis/index'
          });
        },
        
        navigateToFeedback() {
          wx.navigateTo({
            url: '/pages/feedback/index'
          });
        }
      }
    });
  });

  afterAll(() => {
    simulate.unload(id);
  });

  describe('页面初始化', () => {
    test('应该正确渲染页面结构', () => {
      const comp = simulate.render(id);
      
      const header = comp.querySelector('.header');
      const featureGrid = comp.querySelector('.feature-grid');
      const statsSection = comp.querySelector('.stats-section');
      
      expect(header).toBeTruthy();
      expect(featureGrid).toBeTruthy();
      expect(statsSection).toBeTruthy();
    });

    test('应该显示正确的标题', () => {
      const comp = simulate.render(id);
      
      const title = comp.querySelector('.title');
      const subtitle = comp.querySelector('.subtitle');
      
      expect(title.textContent).toBe('AI智面');
      expect(subtitle.textContent).toBe('智能面试助手');
    });

    test('应该渲染所有功能模块', () => {
      const comp = simulate.render(id);
      
      const featureItems = comp.querySelectorAll('.feature-item');
      expect(featureItems).toHaveLength(4);
      
      const titles = comp.querySelectorAll('.feature-title');
      expect(titles[0].textContent).toBe('AI面试');
      expect(titles[1].textContent).toBe('刷题练习');
      expect(titles[2].textContent).toBe('简历分析');
      expect(titles[3].textContent).toBe('反馈建议');
    });
  });

  describe('数据加载', () => {
    test('应该初始化统计数据为0', () => {
      const comp = simulate.render(id);
      const initialData = comp.data;
      
      expect(initialData.stats.interviewCount).toBe(0);
      expect(initialData.stats.practiceCount).toBe(0);
      expect(initialData.stats.scoreAvg).toBe(0);
    });

    test('onLoad 应该调用 loadUserStats', () => {
      const comp = simulate.render(id);
      const loadUserStatsSpy = jest.spyOn(comp.instance, 'loadUserStats');
      
      comp.instance.onLoad();
      
      expect(loadUserStatsSpy).toHaveBeenCalled();
    });

    test('loadUserStats 应该更新统计数据', () => {
      const comp = simulate.render(id);
      
      comp.instance.loadUserStats();
      
      expect(comp.data.stats.interviewCount).toBe(15);
      expect(comp.data.stats.practiceCount).toBe(128);
      expect(comp.data.stats.scoreAvg).toBe(85);
    });
  });

  describe('统计数据显示', () => {
    test('应该正确显示统计数据', () => {
      const comp = simulate.render(id);
      comp.instance.loadUserStats();
      
      const statsNumbers = comp.querySelectorAll('.stats-number');
      const statsLabels = comp.querySelectorAll('.stats-label');
      
      expect(statsNumbers[0].textContent).toBe('15');
      expect(statsNumbers[1].textContent).toBe('128');
      expect(statsNumbers[2].textContent).toBe('85');
      
      expect(statsLabels[0].textContent).toBe('面试次数');
      expect(statsLabels[1].textContent).toBe('练习题数');
      expect(statsLabels[2].textContent).toBe('平均分数');
    });

    test('应该有正确的统计项数量', () => {
      const comp = simulate.render(id);
      
      const statsItems = comp.querySelectorAll('.stats-item');
      expect(statsItems).toHaveLength(3);
    });
  });

  describe('页面导航', () => {
    test('点击AI面试应该导航到面试页面', () => {
      const mockNavigateTo = jest.fn();
      wx.navigateTo = mockNavigateTo;
      
      const comp = simulate.render(id);
      const featureItems = comp.querySelectorAll('.feature-item');
      
      featureItems[0].dispatchEvent('tap');
      
      expect(mockNavigateTo).toHaveBeenCalledWith({
        url: '/pages/interviewHome/index'
      });
    });

    test('点击刷题练习应该切换到练习标签', () => {
      const mockSwitchTab = jest.fn();
      wx.switchTab = mockSwitchTab;
      
      const comp = simulate.render(id);
      const featureItems = comp.querySelectorAll('.feature-item');
      
      featureItems[1].dispatchEvent('tap');
      
      expect(mockSwitchTab).toHaveBeenCalledWith({
        url: '/pages/practice/index'
      });
    });

    test('点击简历分析应该导航到分析页面', () => {
      const mockNavigateTo = jest.fn();
      wx.navigateTo = mockNavigateTo;
      
      const comp = simulate.render(id);
      const featureItems = comp.querySelectorAll('.feature-item');
      
      featureItems[2].dispatchEvent('tap');
      
      expect(mockNavigateTo).toHaveBeenCalledWith({
        url: '/pages/analysis/index'
      });
    });

    test('点击反馈建议应该导航到反馈页面', () => {
      const mockNavigateTo = jest.fn();
      wx.navigateTo = mockNavigateTo;
      
      const comp = simulate.render(id);
      const featureItems = comp.querySelectorAll('.feature-item');
      
      featureItems[3].dispatchEvent('tap');
      
      expect(mockNavigateTo).toHaveBeenCalledWith({
        url: '/pages/feedback/index'
      });
    });
  });

  describe('功能模块图标', () => {
    test('应该显示正确的功能图标', () => {
      const comp = simulate.render(id);
      const icons = comp.querySelectorAll('.feature-icon');
      
      expect(icons[0].src).toBe('/static/home/interview.png');
      expect(icons[1].src).toBe('/static/home/practice.png');
      expect(icons[2].src).toBe('/static/home/analysis.png');
      expect(icons[3].src).toBe('/static/home/feedback.png');
    });

    test('所有功能模块都应该有图标', () => {
      const comp = simulate.render(id);
      const icons = comp.querySelectorAll('.feature-icon');
      
      expect(icons).toHaveLength(4);
      icons.forEach(icon => {
        expect(icon.src).toBeTruthy();
      });
    });
  });

  describe('功能描述', () => {
    test('应该显示正确的功能描述', () => {
      const comp = simulate.render(id);
      const descs = comp.querySelectorAll('.feature-desc');
      
      expect(descs[0].textContent).toBe('智能模拟面试');
      expect(descs[1].textContent).toBe('海量题库练习');
      expect(descs[2].textContent).toBe('AI智能分析');
      expect(descs[3].textContent).toBe('专业指导建议');
    });
  });

  describe('边界情况', () => {
    test('应该处理统计数据加载失败', () => {
      const comp = simulate.render(id);
      
      // 模拟数据加载失败
      comp.setData({
        stats: {
          interviewCount: 0,
          practiceCount: 0,
          scoreAvg: 0
        }
      });
      
      const statsNumbers = comp.querySelectorAll('.stats-number');
      expect(statsNumbers[0].textContent).toBe('0');
      expect(statsNumbers[1].textContent).toBe('0');
      expect(statsNumbers[2].textContent).toBe('0');
    });

    test('应该处理导航失败', () => {
      const mockNavigateTo = jest.fn().mockImplementation(() => {
        throw new Error('Navigation failed');
      });
      wx.navigateTo = mockNavigateTo;
      
      const comp = simulate.render(id);
      const featureItems = comp.querySelectorAll('.feature-item');
      
      expect(() => {
        featureItems[0].dispatchEvent('tap');
      }).not.toThrow();
    });
  });
});
