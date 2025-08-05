import useToastBehavior from '~/behaviors/useToast';
import request from '~/api/request';

Page({
  behaviors: [useToastBehavior],

  data: {
    selectedFile: null,
    projectName: '',
    projectDesc: '',
    packagingResult: '',
    loading: false
  },

  onLoad() {
    console.log('项目包装页面加载');
  },

  // 选择文件
  onChooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const file = res.tempFiles[0];
        
        // 检查文件大小（限制5MB）
        if (file.size > 5 * 1024 * 1024) {
          wx.showToast({
            title: '文件大小不能超过5MB',
            icon: 'none'
          });
          return;
        }

        // 检查文件类型
        const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.md', '.js', '.py', '.java', '.cpp', '.html', '.css'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!allowedTypes.includes(fileExt)) {
          wx.showToast({
            title: '不支持的文件格式',
            icon: 'none'
          });
          return;
        }

        this.setData({
          selectedFile: {
            name: file.name,
            size: this.formatFileSize(file.size),
            path: file.path,
            type: file.type || 'application/octet-stream'
          }
        });

        wx.showToast({
          title: '文件选择成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('选择文件失败:', err);
        wx.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
      }
    });
  },

  // 移除文件
  onRemoveFile() {
    this.setData({
      selectedFile: null
    });
  },

  // 项目名称输入
  onProjectNameInput(e) {
    this.setData({
      projectName: e.detail.value
    });
  },

  // 项目描述输入
  onProjectDescInput(e) {
    this.setData({
      projectDesc: e.detail.value
    });
  },

  // 生成项目包装
  async onGeneratePackaging() {
    if (!this.data.selectedFile) {
      wx.showToast({
        title: '请先选择项目文件',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      // 上传文件到后端
      const uploadResult = await this.uploadFileToServer();
      
      if (uploadResult && uploadResult.content) {
        // 调用AI生成包装文案
        const aiResult = await this.generatePackagingWithAI(uploadResult.content);
        
        this.setData({
          packagingResult: aiResult,
          loading: false
        });

        wx.showToast({
          title: 'AI包装生成成功',
          icon: 'success'
        });
      } else {
        throw new Error('文件上传失败');
      }
    } catch (error) {
      console.error('生成包装失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      });
    }
  },

  // 上传文件到服务器
  uploadFileToServer() {
    return new Promise((resolve, reject) => {
      // 获取全局应用实例和配置
      const app = getApp();
      const config = require('../../config');
      const baseUrl = app.globalData.url || config.baseUrl;
      
      wx.uploadFile({
        url: `${baseUrl}/practice/project_packaging`,
        filePath: this.data.selectedFile.path,
        name: 'file',
        formData: {
          projectName: this.data.projectName,
          projectDesc: this.data.projectDesc
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.content) {
              resolve(data);
            } else {
              reject(new Error('服务器返回数据异常'));
            }
          } catch (e) {
            reject(new Error('解析服务器响应失败'));
          }
        },
        fail: (err) => {
          console.error('文件上传失败:', err);
          reject(err);
        }
      });
    });
  },

  // 使用AI生成包装文案
  async generatePackagingWithAI(fileContent) {
    try {
      const response = await request('/practice/answer_v2', 'POST', {
        file_content: fileContent,
        project_name: this.data.projectName,
        project_desc: this.data.projectDesc
      });
      
      // response 就是后端返回的 JSON 对象，不需要 response.data
      if (response.success) {
        return response.content || '生成失败，请重试';
      } else {
        throw new Error(response.error || 'AI生成失败');
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      throw error;
    }
  },

  // 复制结果
  onCopyResult() {
    wx.setClipboardData({
      data: this.data.packagingResult,
      success: () => {
        wx.showToast({
          title: '文案已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 重新生成
  onRegenerateResult() {
    this.onGeneratePackaging();
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
});
