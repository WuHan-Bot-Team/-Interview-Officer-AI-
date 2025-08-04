// 练习页面测试
const simulate = require('miniprogram-simulate');
require('../__mocks__/wx.js');

describe('Practice 页面测试', () => {
  let id;

  beforeAll(() => {
    // 模拟练习页面组件
    id = simulate.load({
      template: `
        <view class="practice-container">
          <view class="header">
            <text class="title">刷题练习</text>
            <view class="progress-info">
              <text>已完成: {{progress.completed}}/{{progress.total}}</text>
            </view>
          </view>
          
          <view class="category-list">
            <view 
              wx:for="{{categories}}" 
              wx:key="id"
              class="category-item {{selectedCategory === item.id ? 'active' : ''}}"
              bindtap="selectCategory"
              data-id="{{item.id}}"
            >
              <text class="category-name">{{item.name}}</text>
              <text class="category-count">{{item.count}}题</text>
            </view>
          </view>
          
          <view class="question-section" wx:if="{{currentQuestion}}">
            <view class="question-header">
              <text class="question-number">第{{questionIndex + 1}}题</text>
              <text class="question-type">{{currentQuestion.type === 'single' ? '单选题' : '多选题'}}</text>
            </view>
            
            <view class="question-content">
              <text class="question-text">{{currentQuestion.question}}</text>
            </view>
            
            <view class="options-list">
              <view 
                wx:for="{{currentQuestion.options}}" 
                wx:key="index"
                class="option-item {{selectedAnswers.includes(index) ? 'selected' : ''}}"
                bindtap="selectOption"
                data-index="{{index}}"
              >
                <text class="option-label">{{index === 0 ? 'A' : index === 1 ? 'B' : index === 2 ? 'C' : 'D'}}</text>
                <text class="option-text">{{item}}</text>
              </view>
            </view>
            
            <view class="action-buttons">
              <button class="btn-secondary" bindtap="previousQuestion" disabled="{{questionIndex === 0}}">
                上一题
              </button>
              <button class="btn-primary" bindtap="nextQuestion">
                {{questionIndex === questions.length - 1 ? '完成' : '下一题'}}
              </button>
            </view>
          </view>
          
          <view class="empty-state" wx:else>
            <text>请选择题目类别开始练习</text>
          </view>
        </view>
      `,
      data: {
        categories: [
          { id: 1, name: 'JavaScript', count: 50 },
          { id: 2, name: 'HTML/CSS', count: 30 },
          { id: 3, name: 'Vue.js', count: 25 },
          { id: 4, name: 'React', count: 35 }
        ],
        selectedCategory: null,
        questions: [],
        currentQuestion: null,
        questionIndex: 0,
        selectedAnswers: [],
        progress: {
          completed: 0,
          total: 140
        }
      },
      methods: {
        onLoad() {
          this.loadProgress();
        },
        
        loadProgress() {
          // 模拟加载进度数据
          this.setData({
            progress: {
              completed: 25,
              total: 140
            }
          });
        },
        
        selectCategory(e) {
          const categoryId = e.currentTarget.dataset.id;
          this.setData({
            selectedCategory: categoryId
          });
          this.loadQuestions(categoryId);
        },
        
        loadQuestions(categoryId) {
          // 模拟加载题目数据
          const mockQuestions = [
            {
              id: 1,
              type: 'single',
              question: '以下哪个是JavaScript的基本数据类型？',
              options: ['Object', 'Array', 'String', 'Function'],
              answer: 2
            },
            {
              id: 2,
              type: 'single', 
              question: 'JavaScript中var、let、const的区别是什么？',
              options: ['没有区别', 'var有函数作用域', 'let和const有块级作用域', '以上都对'],
              answer: 3
            }
          ];
          
          this.setData({
            questions: mockQuestions,
            currentQuestion: mockQuestions[0],
            questionIndex: 0,
            selectedAnswers: []
          });
        },
        
        selectOption(e) {
          const index = parseInt(e.currentTarget.dataset.index);
          const { currentQuestion, selectedAnswers } = this.data;
          
          if (currentQuestion.type === 'single') {
            this.setData({
              selectedAnswers: [index]
            });
          } else {
            const newAnswers = [...selectedAnswers];
            const existingIndex = newAnswers.indexOf(index);
            
            if (existingIndex > -1) {
              newAnswers.splice(existingIndex, 1);
            } else {
              newAnswers.push(index);
            }
            
            this.setData({
              selectedAnswers: newAnswers
            });
          }
        },
        
        previousQuestion() {
          const { questionIndex, questions } = this.data;
          if (questionIndex > 0) {
            const newIndex = questionIndex - 1;
            this.setData({
              questionIndex: newIndex,
              currentQuestion: questions[newIndex],
              selectedAnswers: []
            });
          }
        },
        
        nextQuestion() {
          const { questionIndex, questions } = this.data;
          
          if (questionIndex < questions.length - 1) {
            const newIndex = questionIndex + 1;
            this.setData({
              questionIndex: newIndex,
              currentQuestion: questions[newIndex],
              selectedAnswers: []
            });
          } else {
            this.completePractice();
          }
        },
        
        completePractice() {
          wx.showToast({
            title: '练习完成！',
            icon: 'success'
          });
          
          // 更新进度
          const newCompleted = this.data.progress.completed + this.data.questions.length;
          this.setData({
            'progress.completed': newCompleted
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
      const categoryList = comp.querySelector('.category-list');
      const emptyState = comp.querySelector('.empty-state');
      
      expect(header).toBeTruthy();
      expect(categoryList).toBeTruthy();
      expect(emptyState).toBeTruthy();
    });

    test('应该显示正确的标题', () => {
      const comp = simulate.render(id);
      const title = comp.querySelector('.title');
      
      expect(title.textContent).toBe('刷题练习');
    });

    test('应该显示所有题目类别', () => {
      const comp = simulate.render(id);
      const categoryItems = comp.querySelectorAll('.category-item');
      
      expect(categoryItems).toHaveLength(4);
      
      const categoryNames = comp.querySelectorAll('.category-name');
      expect(categoryNames[0].textContent).toBe('JavaScript');
      expect(categoryNames[1].textContent).toBe('HTML/CSS');
      expect(categoryNames[2].textContent).toBe('Vue.js');
      expect(categoryNames[3].textContent).toBe('React');
    });

    test('应该显示题目数量', () => {
      const comp = simulate.render(id);
      const categoryCounts = comp.querySelectorAll('.category-count');
      
      expect(categoryCounts[0].textContent).toBe('50题');
      expect(categoryCounts[1].textContent).toBe('30题');
      expect(categoryCounts[2].textContent).toBe('25题');
      expect(categoryCounts[3].textContent).toBe('35题');
    });
  });

  describe('进度显示', () => {
    test('应该显示初始进度', () => {
      const comp = simulate.render(id);
      const progressInfo = comp.querySelector('.progress-info text');
      
      expect(progressInfo.textContent).toBe('已完成: 0/140');
    });

    test('onLoad 应该加载进度数据', () => {
      const comp = simulate.render(id);
      const loadProgressSpy = jest.spyOn(comp.instance, 'loadProgress');
      
      comp.instance.onLoad();
      
      expect(loadProgressSpy).toHaveBeenCalled();
    });

    test('loadProgress 应该更新进度数据', () => {
      const comp = simulate.render(id);
      
      comp.instance.loadProgress();
      
      expect(comp.data.progress.completed).toBe(25);
      expect(comp.data.progress.total).toBe(140);
    });
  });

  describe('类别选择', () => {
    test('点击类别应该选中该类别', () => {
      const comp = simulate.render(id);
      const categoryItems = comp.querySelectorAll('.category-item');
      
      categoryItems[0].dispatchEvent('tap');
      
      expect(comp.data.selectedCategory).toBe(1);
    });

    test('选中的类别应该有 active 样式', () => {
      const comp = simulate.render(id);
      comp.setData({ selectedCategory: 1 });
      
      const categoryItems = comp.querySelectorAll('.category-item');
      expect(categoryItems[0].classList.contains('active')).toBe(true);
      expect(categoryItems[1].classList.contains('active')).toBe(false);
    });

    test('选择类别应该加载题目', () => {
      const comp = simulate.render(id);
      const loadQuestionsSpy = jest.spyOn(comp.instance, 'loadQuestions');
      
      const categoryItems = comp.querySelectorAll('.category-item');
      categoryItems[0].dispatchEvent('tap');
      
      expect(loadQuestionsSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('题目显示', () => {
    beforeEach(() => {
      // 设置测试数据
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
    });

    test('加载题目后应该显示题目区域', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      
      const questionSection = comp.querySelector('.question-section');
      const emptyState = comp.querySelector('.empty-state');
      
      expect(questionSection).toBeTruthy();
      expect(emptyState).toBeFalsy();
    });

    test('应该显示当前题目信息', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      
      const questionNumber = comp.querySelector('.question-number');
      const questionType = comp.querySelector('.question-type');
      
      expect(questionNumber.textContent).toBe('第1题');
      expect(questionType.textContent).toBe('单选题');
    });

    test('应该显示题目内容', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      
      const questionText = comp.querySelector('.question-text');
      expect(questionText.textContent).toBe('以下哪个是JavaScript的基本数据类型？');
    });

    test('应该显示选项', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      
      const optionItems = comp.querySelectorAll('.option-item');
      expect(optionItems).toHaveLength(4);
      
      const optionLabels = comp.querySelectorAll('.option-label');
      expect(optionLabels[0].textContent).toBe('A');
      expect(optionLabels[1].textContent).toBe('B');
      expect(optionLabels[2].textContent).toBe('C');
      expect(optionLabels[3].textContent).toBe('D');
    });
  });

  describe('选项交互', () => {
    test('点击选项应该选中该选项', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      
      const optionItems = comp.querySelectorAll('.option-item');
      optionItems[0].dispatchEvent('tap');
      
      expect(comp.data.selectedAnswers).toEqual([0]);
    });

    test('单选题只能选中一个选项', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      
      const optionItems = comp.querySelectorAll('.option-item');
      optionItems[0].dispatchEvent('tap');
      optionItems[1].dispatchEvent('tap');
      
      expect(comp.data.selectedAnswers).toEqual([1]);
    });

    test('选中的选项应该有选中样式', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      comp.setData({ selectedAnswers: [0] });
      
      const optionItems = comp.querySelectorAll('.option-item');
      expect(optionItems[0].classList.contains('selected')).toBe(true);
      expect(optionItems[1].classList.contains('selected')).toBe(false);
    });
  });

  describe('题目导航', () => {
    test('第一题时上一题按钮应该禁用', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      
      const prevButton = comp.querySelector('.btn-secondary');
      expect(prevButton.disabled).toBe(true);
    });

    test('点击下一题应该切换到下一题', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      
      const nextButton = comp.querySelector('.btn-primary');
      nextButton.dispatchEvent('tap');
      
      expect(comp.data.questionIndex).toBe(1);
      expect(comp.data.currentQuestion.id).toBe(2);
    });

    test('点击上一题应该切换到上一题', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      comp.setData({ questionIndex: 1, currentQuestion: comp.data.questions[1] });
      
      const prevButton = comp.querySelector('.btn-secondary');
      prevButton.dispatchEvent('tap');
      
      expect(comp.data.questionIndex).toBe(0);
      expect(comp.data.currentQuestion.id).toBe(1);
    });

    test('最后一题时下一题按钮应该显示完成', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      comp.setData({ questionIndex: 1, currentQuestion: comp.data.questions[1] });
      
      const nextButton = comp.querySelector('.btn-primary');
      expect(nextButton.textContent).toBe('完成');
    });
  });

  describe('练习完成', () => {
    test('完成练习应该显示提示', () => {
      const mockShowToast = jest.fn();
      wx.showToast = mockShowToast;
      
      const comp = simulate.render(id);
      comp.instance.completePractice();
      
      expect(mockShowToast).toHaveBeenCalledWith({
        title: '练习完成！',
        icon: 'success'
      });
    });

    test('完成练习应该更新进度', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      const initialCompleted = comp.data.progress.completed;
      
      comp.instance.completePractice();
      
      expect(comp.data.progress.completed).toBe(initialCompleted + 2);
    });
  });

  describe('边界情况', () => {
    test('应该处理空题目列表', () => {
      const comp = simulate.render(id);
      comp.setData({
        questions: [],
        currentQuestion: null
      });
      
      const emptyState = comp.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });

    test('应该处理无效的选项索引', () => {
      const comp = simulate.render(id);
      comp.instance.loadQuestions(1);
      
      const mockEvent = {
        currentTarget: {
          dataset: { index: 'invalid' }
        }
      };
      
      expect(() => {
        comp.instance.selectOption(mockEvent);
      }).not.toThrow();
    });

    test('应该处理类别ID不存在的情况', () => {
      const comp = simulate.render(id);
      
      const mockEvent = {
        currentTarget: {
          dataset: { id: 999 }
        }
      };
      
      expect(() => {
        comp.instance.selectCategory(mockEvent);
      }).not.toThrow();
    });
  });
});
