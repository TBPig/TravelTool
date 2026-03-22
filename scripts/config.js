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

// 兴趣标签映射
const INTEREST_TAG_MAP = {
    'photo': '拍照打卡',
    'food': '美食探索',
    'culture': '人文历史',
    'nature': '自然风光',
    'shopping': '购物血拼',
    'adventure': '户外探险',
    'relax': '休闲度假',
    'nightlife': '夜生活'
};

// 游玩强度映射
const INTENSITY_MAP = {
    'relaxed': '休闲轻松',
    'moderate': '适中节奏',
    'intensive': '紧凑充实'
};

// 同行人类型映射
const COMPANION_MAP = {
    'solo': '独自一人',
    'couple': '情侣出游',
    'family': '亲子家庭',
    'friends': '朋友结伴',
    'elderly': '长辈同行'
};

// 获取偏好文本
function getPreferenceText(preference) {
    return TAG_MAP[preference] || '';
}

// 获取兴趣标签文本
function getInterestTagText(tag) {
    return INTEREST_TAG_MAP[tag] || tag;
}

// 获取游玩强度文本
function getIntensityText(intensity) {
    return INTENSITY_MAP[intensity] || '';
}

// 获取同行人类型文本
function getCompanionText(companion) {
    return COMPANION_MAP[companion] || '';
}
