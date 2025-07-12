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
    ec:{
      lazyLoad: true
    }
  },
  initChart(){
    this.chart = this.selectComponent("#radar");
    this.chart.init((canvas, width, height, dpr)=> {
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
          data: [
            {
              value: this.data.radarData.map(item => item.chartValue),
              name: '您的表现',
              areaStyle: { color: 'rgba(99,102,241,0.2)' }
            },
          ]
        }]
      };
      chart.setOption(option);
      return chart;
    })
  },
  onLoad(options) {
    // 检查设备权限状态
    let id = options.id
    console.log(id);
    // this.initChart();

    if(id==0){  //从面试室返回，总结这次面试反馈
      console.log("0");
      wx.request({
        url: 'http://127.0.0.1:5000/interview/feedback',
        method: 'GET',
        success: (res) => {
            console.log(res)
            if(res.statusCode == 200){
              const data = JSON.parse(res.data.content);
              console.log(data)
              let scores =  data.scores;
              const newRadarData = [...this.data.radarData];
              scores.forEach((item, index) => {
                newRadarData[index].chartValue=item;
              });
              let avgscore = scores.reduce((sum, num) => sum + num, 0) / scores.length
              this.setData({
                radarData: newRadarData,
                advantages : data.advantages,
                disadvantages: data.disadvantages,
                score: avgscore
              });
            }
            this.initChart()
        },
        fail:(err)=>{
          console.log(err);
          this.initChart()
        }
      })
    }else{
      wx.request({  // //从首页进入，返回最近一次的面试记录
        url: 'http://127.0.0.1:5000/interview/feedback2',
        method: 'GET',
        success: (res) => {
            console.log(res)
            if(res.statusCode == 200){
              const data = JSON.parse(res.data.content);
              console.log(data)
              let scores =  data.scores;
              const newRadarData = [...this.data.radarData];
              scores.forEach((item, index) => {
                newRadarData[index].chartValue=item;
              });
              let avgscore = scores.reduce((sum, num) => sum + num, 0) / scores.length
              this.setData({
                radarData: newRadarData,
                advantages : data.advantages,
                disadvantages: data.disadvantages,
                score: avgscore
              });
            }
            this.initChart()
        },
        fail:(err)=>{
          console.log(err);
          this.initChart()
        }
      })
    }


    // setTimeout(() => {
    //   const newRadarData = [...this.data.radarData];
    //   let score = [12,100,87,66,32,99]
    //   score.forEach((item, index) => {
    //     newRadarData[index].chartValue=item;
    //   });
    //   this.setData({ radarData: newRadarData });
    //   this.initChart()
    // }, 1000)
  },
  handleBack() {
    wx.reLaunch({
      url: '/pages/home2/index' // 替换为你的首页路径
    });
  },
});