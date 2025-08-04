// EventBus 测试
require('../__mocks__/wx.js');

// 使用实际的 eventBus 代码
const createBus = require('../../interview2/utils/eventBus.js');

describe('EventBus 测试', () => {
  let bus;

  beforeEach(() => {
    bus = createBus();
  });

  describe('事件订阅和发布', () => {
    test('应该能够订阅和触发事件', () => {
      const callback = jest.fn();
      bus.on('test-event', callback);
      bus.emit('test-event', 'test-data');
      
      expect(callback).toHaveBeenCalledWith('test-data');
    });

    test('应该能够订阅多个回调到同一事件', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      bus.on('test-event', callback1);
      bus.on('test-event', callback2);
      bus.emit('test-event', 'test-data');
      
      expect(callback1).toHaveBeenCalledWith('test-data');
      expect(callback2).toHaveBeenCalledWith('test-data');
    });

    test('应该能够传递多个参数', () => {
      const callback = jest.fn();
      bus.on('test-event', callback);
      bus.emit('test-event', 'arg1', 'arg2', 'arg3');
      
      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('事件取消订阅', () => {
    test('应该能够取消特定回调的订阅', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      bus.on('test-event', callback1);
      bus.on('test-event', callback2);
      bus.off('test-event', callback1);
      bus.emit('test-event', 'test-data');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('test-data');
    });

    test('应该能够取消所有回调的订阅', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      bus.on('test-event', callback1);
      bus.on('test-event', callback2);
      bus.off('test-event');
      bus.emit('test-event', 'test-data');
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    test('取消不存在的事件应该不会报错', () => {
      expect(() => {
        bus.off('non-existent-event');
      }).not.toThrow();
    });
  });

  describe('边界情况', () => {
    test('触发不存在的事件应该不会报错', () => {
      expect(() => {
        bus.emit('non-existent-event', 'data');
      }).not.toThrow();
    });

    test('事件回调执行出错不应该影响其他回调', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = jest.fn();
      
      bus.on('test-event', errorCallback);
      bus.on('test-event', normalCallback);
      
      expect(() => {
        bus.emit('test-event', 'data');
      }).toThrow('Test error');
    });
  });
});
