// API 基础地址
const API_BASE_URL = 'http://localhost:3000/api';

// 标签映射
const TAG_MAP = {
    'nature': '自然风光',
    'culture': '人文历史',
    'food': '美食探索',
    'relax': '休闲度假',
    'adventure': '户外探险'
};

// 获取偏好文本
function getPreferenceText(preference) {
    return TAG_MAP[preference] || '';
}
