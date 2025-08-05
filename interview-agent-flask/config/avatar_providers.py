# 更多数字人API配置示例
# 你可以根据需要添加不同提供商的配置

# 讯飞星火数字人配置
XUNFEI_CONFIG = {
    "url": "wss://avatar.cn-huadong-1.xf-yun.com/v1/interact",
    "appId": "a9730a45",
    "appKey": "fe16118b2de28ee8fff8046b015e3358",
    "appSecret": "NmJkYjU3OTI1NDRlNDViOWY1NjYyYzMx",
    "anchorId": "cnr5dg8n2000000003",
    "vcn": "x4_xiaozhong",
    "timeout": 30,
    "hls_wait_time": 20,
    "provider": "讯飞星火"
}

# 腾讯云数字人配置示例（需要你的真实配置）
TENCENT_CONFIG = {
    "url": "wss://your-tencent-avatar-api.com/v1/interact",
    "appId": "your_tencent_app_id",
    "appKey": "your_tencent_app_key", 
    "appSecret": "your_tencent_app_secret",
    "anchorId": "your_tencent_anchor_id",
    "vcn": "your_tencent_voice",
    "timeout": 30,
    "hls_wait_time": 20,
    "provider": "腾讯云"
}

# 阿里云数字人配置示例（需要你的真实配置）
ALIYUN_CONFIG = {
    "url": "wss://your-aliyun-avatar-api.com/v1/interact",
    "appId": "your_aliyun_app_id",
    "appKey": "your_aliyun_app_key",
    "appSecret": "your_aliyun_app_secret", 
    "anchorId": "your_aliyun_anchor_id",
    "vcn": "your_aliyun_voice",
    "timeout": 30,
    "hls_wait_time": 20,
    "provider": "阿里云"
}

# 百度智能云配置示例（需要你的真实配置）
BAIDU_CONFIG = {
    "url": "wss://your-baidu-avatar-api.com/v1/interact",
    "appId": "your_baidu_app_id",
    "appKey": "your_baidu_app_key",
    "appSecret": "your_baidu_app_secret",
    "anchorId": "your_baidu_anchor_id", 
    "vcn": "your_baidu_voice",
    "timeout": 30,
    "hls_wait_time": 20,
    "provider": "百度智能云"
}

# 自定义数字人API配置示例
CUSTOM_CONFIG = {
    "url": "wss://your-custom-avatar-api.com/v1/interact",
    "appId": "your_custom_app_id",
    "appKey": "your_custom_app_key",
    "appSecret": "your_custom_app_secret",
    "anchorId": "your_custom_anchor_id",
    "vcn": "your_custom_voice", 
    "timeout": 30,
    "hls_wait_time": 20,
    "provider": "自定义"
}

# 可用配置列表
AVAILABLE_CONFIGS = {
    "xunfei": XUNFEI_CONFIG,
    "tencent": TENCENT_CONFIG,
    "aliyun": ALIYUN_CONFIG,
    "baidu": BAIDU_CONFIG,
    "custom": CUSTOM_CONFIG
}

def get_config_by_provider(provider_name):
    """根据提供商名称获取配置"""
    return AVAILABLE_CONFIGS.get(provider_name.lower(), XUNFEI_CONFIG)

def list_available_providers():
    """列出所有可用的提供商"""
    return list(AVAILABLE_CONFIGS.keys())
