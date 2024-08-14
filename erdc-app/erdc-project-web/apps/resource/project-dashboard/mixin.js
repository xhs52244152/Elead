define([], function () {
    return {
        data() {
            return {
                // 可选颜色数组（目前颜色值是获取的图表自带的颜色）
                chartColorList: [
                    '#5470c6',
                    '#91cc75',
                    '#fac858',
                    '#ee6666',
                    '#73c0de',
                    '#3ba272',
                    '#fc8452',
                    '#9a60b4',
                    '#ea7ccc'
                ],
                chartColors: [
                    // 极客蓝
                    '#5B8FF9',
                    // 翡翠绿
                    '#5AD8A6',
                    // 旭日黄
                    '#F6BD16',
                    // 薄暮红
                    '#E86452',
                    // 破晓蓝
                    '#6DC8EC',
                    // 罗兰紫
                    '#945FB9',
                    // 落曰橘
                    '#FF9845',
                    // 天水青
                    '#1E9493',
                    // 桃花粉
                    '#FF99C3',
                    // 商务灰
                    '#5D7092'
                ],
                // 状态颜色枚举
                chartStatusColor: {
                    CANCEL: '#1E9493', // 已取消
                    CLOSED: '#5D7092', // 已关闭
                    CROPPED: '#FF9845', // 已裁剪
                    ON_HOLD: '#E86452', // 暂停
                    PENDING_EXECUTE: '#6DC8EC', // 待执行
                    PENDING_VERIFIED: '#F6BD16', // 待验证
                    PENDING: '#945FB9', // 待处理
                    PENDING_SUBMIT: '#5B8FF9', // 待提交
                    PLANNING: '#FF99C3', // 规划
                    RUN: '#5AD8A6', // 运行
                    UNDER_CHANGE: '#F6BD16' // 变更中
                },
                // 状态文字对应code
                statusTextToCode: {
                    已取消: 'CANCEL',
                    已关闭: 'CLOSED',
                    已裁剪: 'CROPPED',
                    暂停: 'ON_HOLD',
                    待执行: 'PENDING_EXECUTE',
                    待验证: 'PENDING_VERIFIED',
                    待处理: 'PENDING',
                    待提交: 'PENDING_SUBMIT',
                    规划: 'PLANNING',
                    运行: 'RUN',
                    变更中: 'UNDER_CHANGE'
                }
            };
        }
    };
});
