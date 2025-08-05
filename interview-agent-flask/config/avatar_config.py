# 数字人API配置文件
# 更换数字人API时，只需修改此文件即可

# 当前使用的是讯飞星火数字人API
AVATAR_CONFIG = {
    # WebSocket连接地址
    "url": "wss://avatar.cn-huadong-1.xf-yun.com/v1/interact",
    
    # API认证信息
    "appId": "a9730a45",
    "appKey": "fe16118b2de28ee8fff8046b015e3358", 
    "appSecret": "NmJkYjU3OTI1NDRlNDViOWY1NjYyYzMx",
    
    # 数字人配置
    "anchorId": "cnr5dg8n2000000003",  # 数字人ID
    "vcn": "x4_xiaozhong",  # 音色配置
    
    # 可选配置
    "timeout": 30,  # 连接超时时间(秒)
    "hls_wait_time": 20,  # HLS文件生成等待时间(秒)
}

# 备用数字人API配置（如果需要切换）
BACKUP_AVATAR_CONFIG = {
    "url": "wss://your-backup-avatar-api.com/v1/interact",
    "appId": "your_backup_app_id",
    "appKey": "your_backup_app_key",
    "appSecret": "your_backup_app_secret",
    "anchorId": "your_backup_anchor_id",
    "vcn": "your_backup_voice",
    "timeout": 30,
    "hls_wait_time": 20,
}

# 其他数字人API配置示例
# 可以添加更多配置选项，如：
# - 腾讯云数字人
# - 阿里云数字人  
# - 百度智能云数字人
# - 自定义数字人API

def get_avatar_config():
    """获取当前数字人配置"""
    return AVATAR_CONFIG

def get_backup_config():
    """获取备用数字人配置"""
    return BACKUP_AVATAR_CONFIG

def switch_to_backup():
    """切换到备用配置"""
    global AVATAR_CONFIG
    AVATAR_CONFIG = BACKUP_AVATAR_CONFIG.copy()
    return AVATAR_CONFIG
