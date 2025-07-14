import * as echarts from '../../miniprogram_npm/ec-canvas/echarts';

Page({
  data: {
    jobTitle: '产品经理模拟面试',
    date: '2023/11/15',
    score: 86,
    scorePercent: 82,
    radarData: [
      { label: '专知', color: '#3b82f6', chartValue: 82,name: '专业知识', max: 100 },
      { label: '匹配', color: '#8b5cf6', chartValue: 86,name: '岗位匹配', max: 100 },
      { label: '表达', color: '#00b26a', chartValue: 79,name: '语言表达', max: 100 },
      { label: '逻辑', color: '#f59e42', chartValue: 84,name: '逻辑思维', max: 100 },
      { label: '创新', color: '#ef4444', chartValue: 75,name: '创新能力', max: 100 },
      { label: '抗压', color: '#6366f1', chartValue: 81,name: '抗压能力', max: 100 }
    ],
    advantages: [
      {
        title: '需求分析能力',
        desc: '能系统性地使用RICE模型进行优先级评估，展示了专业方法论',
      },
      {
        title: '数据思维',
        desc: '在案例描述中准确引用转化率、留存率等关键指标',
      }
    ],
    disadvantages: [
      {
        title: '创新提案',
        desc: '解决方案偏常规，缺乏突破性创新点',
      }
    ],
    suggestions: [
      {
        title: '创新思维训练',
        desc: '推荐阅读《创新者的窘境》，每周完成1个创新案例拆解',
        bgColor: '#dbeafe',
        color: '#3b82f6'
      },
      {
        title: '表达精炼度',
        desc: '使用PREP结构(观点-原因-案例-重申)组织回答，控制单次发言在2分钟内',
        bgColor: '#ede9fe',
        color: '#8b5cf6'
      },
      {
        title: '行业洞察',
        desc: '关注AI产品趋势，建议订阅《人人都是产品经理》行业报告',
        bgColor: '#d1fae5',
        color: '#10b981'
      }
    ],
    // --- 修改点 1：为两个图表分别定义 ec 对象 ---
    ec: {
      lazyLoad: true
    },
    ecLine: { // 为折线图新增的 ec 对象
      lazyLoad: true
    }
  },

  // 雷达图初始化函数 (你的原函数，保持不变)
  initChart() {
    this.chart = this.selectComponent("#radar");
    this.chart.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      canvas.setChart(chart);
      const option = {
        radar: {
          indicator: this.data.radarData.map(item => ({ name: item.label, max: item.max }))
        },
        series: [{
          type: 'radar',
          data: [{
            value: this.data.radarData.map(item => item.chartValue),
            name: '您的表现',
            areaStyle: { color: 'rgba(99,102,241,0.2)' }
          }]
        }]
      };
      chart.setOption(option);
      return chart;
    })
  },

// --- 替换你原来的 initLineChart 函数 ---
initLineChart(chartData) {
  this.lineChart = this.selectComponent("#line-chart");
  this.lineChart.init((canvas, width, height, dpr) => {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr
    });
    canvas.setChart(chart);

    const abilityNames = this.data.radarData.map(item => item.name);
    const series = abilityNames.map((name, index) => {
      return {
        name: name,
        type: 'line',
        smooth: true,
        data: chartData.map(interview => interview.scores[index])
      };
    });
    const allScores = chartData.flatMap(item => item.scores);

    const dataMin = Math.min(...allScores);
    const dataMax = Math.max(...allScores);

    const padding = 5; 
    let yAxisMin = dataMin - padding;
    let yAxisMax = dataMax + padding;

    if (yAxisMin < 0) {
      yAxisMin = 0;
    }
    if (yAxisMax > 100) {
      yAxisMax = 100;
    }


    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: abilityNames,
        bottom: 0,
        type: 'scroll'
      },
      grid: {
        left: '12%',
        right: '8%',
        bottom: '20%',
        containLabel: false
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.map(item => item.date)
      },
      // --- 将 yAxis 的 min 和 max 设置为我们计算出的动态值 ---
      yAxis: {
        type: 'value',
        min: yAxisMin,  // 使用计算出的最小值
        max: yAxisMax,  // 使用计算出的最大值
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: series
    };
    
    chart.setOption(option);
    return chart;
  });
},

  onLoad(options) {
    let id = options.id;


    if (id == 0) {
      wx.request({
        url: 'http://127.0.0.1:5000/interview/feedback',
        method: 'GET',
        success: (res) => { 
          if (res.statusCode == 200) {
            const data = JSON.parse(res.data.content);
            let scores = data.scores;
            const newRadarData = [...this.data.radarData];
            scores.forEach((item, index) => {
              newRadarData[index].chartValue = item;
            });
            let avgscore = scores.reduce((sum, num) => sum + num, 0) / scores.length;
            this.setData({
              radarData: newRadarData,
              advantages: data.advantages,
              disadvantages: data.disadvantages,
              score: avgscore
            });
          }
          this.initChart(); // 初始化雷达图
        },
        fail: (err) => { 
          console.log(err);
          this.initChart();
        }
      });
    } else {
      wx.request({
        url: 'http://127.0.0.1:5000/interview/feedback2',
        method: 'GET',
        success: (res) => { 
          if (res.statusCode == 200) {
            const data = JSON.parse(res.data.content);
            let scores = data.scores;
            const newRadarData = [...this.data.radarData];
            scores.forEach((item, index) => {
              newRadarData[index].chartValue = item;
            });
            let avgscore = scores.reduce((sum, num) => sum + num, 0) / scores.length;
            this.setData({
              radarData: newRadarData,
              advantages: data.advantages,
              disadvantages: data.disadvantages,
              score: avgscore
            });
          }
          this.initChart(); // 初始化雷达图
        },
        fail: (err) => { 
          console.log(err);
          this.initChart();
        }
      });
    }

    // 请求折线图数据
    wx.request({
      url: 'http://127.0.0.1:5000/interview/recent_feedbacks',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
          const formattedData = res.data.map(item => {
            const content = JSON.parse(item.content);
            const timestamp = parseInt(item.filename.split('-')[1].split('.')[0]);
            const date = new Date(timestamp * 1000);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return {
              date: `${month}-${day}`,
              scores: content.scores,
            };
          });
          const sortedData = formattedData.reverse();
          console.log('即将用于渲染折线图的数据:', sortedData);
          // 调用新增的 initLineChart 函数
          this.initLineChart(sortedData);
        } else {
          console.error('获取历史面试记录失败、数据格式不正确或数据为空', res);
        }
      },
      fail: (err) => {
        console.error('请求历史面试记录接口失败', err);
      }
    });
  },

  handleBack() {
    wx.reLaunch({
      url: '/pages/home2/index'
    });
  },
});