module.exports = {
  path: '/api/genPersonalInfo',
  data: {
    code: 200,
    message: 'success',
    data: {
      image: '/static/avatar1.png',
      name: '张同学',
      star: '天秤座',
      gender: 0,
      birth: '1994-09-27',
      address: ['440000', '440300'],
      brief: '专注于AI面试助手开发',
      photos: [
        {
          url: '/static/img_td.png',
          name: 'photo1.png',
          type: 'image',
        },
        {
          url: '/static/img_td.png', 
          name: 'photo2.png',
          type: 'image',
        },
        {
          url: '/static/avatar1.png',
          name: 'avatar.png', 
          type: 'image',
        }
      ],
      learning: {
        totalDays: 30,
        completedTasks: 85,
        totalTasks: 100,
        currentLevel: 'Advanced'
      }
    },
  },
};
