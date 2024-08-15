/**
 * i18n国际化文件
 * **/
define([], function () {
    /**
     * 国际化key建议 短文本统一用中文作为key  长文本用英文作key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/

    // 配置国际化key-value
    const languageObj = {
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '定时信息': { CN: '定时信息', EN: 'Timing information' },
        '请输入': { CN: '请输入', EN: 'please enter' },
        '执行配置': { CN: '执行配置', EN: 'Perform the configuration' },
        '最大任务数': { CN: '最大任务数', EN: 'The largest number of task' },
        '单机线程并发度': { CN: '单机线程并发度', EN: 'Single thread concurrency' },
        '运行时间限制（毫秒）': { CN: '运行时间限制（毫秒）', EN: 'Run time limit (ms)' },
        'I重试次数': { CN: 'Instance 重试次数', EN: 'Instance Retry count' },
        'T重试次数': { CN: 'Task 重试次数', EN: 'Task Retry count' },
        '最低CPU核心数': { CN: '最低 CPU 核心数', EN: 'The minimum number of CPU core' },
        '最低内存': { CN: '最低内存', EN: 'The minimum memory' },
        '最低磁盘空间': { CN: '最低磁盘空间', EN: 'The minimum of disk space' },
        '执行机器地址': { CN: '执行机器地址', EN: 'Perform the machine address' },
        '执行机器地址提示': { CN: '执行机器地址（可选，不指定代表全部；多值英文逗号分隔）', EN: "Execution machine address (optional, don't specify on behalf of all; More value a comma in English)" },
        '最大执行机器数量': { CN: '最大执行机器数量', EN: 'The maximum execution machine number' },

        '队列名称': { CN: '队列名称', EN: 'The name of the task' },
        '队列描述': { CN: '队列描述', EN: 'Task description' },
        '队列参数': { CN: '队列参数', EN: 'The task parameters' },
        '运行时配置': { CN: '运行时配置', EN: 'The runtime configuration' },
        '重试配置': { CN: '重试配置', EN: 'Retry the configuration' },
        '机械配置': { CN: '机械配置', EN: 'Mechanical configuration' },
        '集群配置': { CN: '集群配置', EN: 'The cluster configuration' },
        '队列任务保留天数': { CN: '队列任务保留天数', EN: 'Queue task number' },
        '获取详情失败': { CN: '获取详情失败', EN: 'Failed to get the details' },
        '创建成功': { CN: '创建成功', EN: 'Creating a successful' },
        '更新成功': { CN: '更新成功', EN: 'The update is successful' },
        '复制成功': { CN: '复制成功', EN: 'Copy success' },
        '创建失败': { CN: '创建失败', EN: 'Create a failure' },
        '更新失败': { CN: '更新失败', EN: 'Update failed' },
        '复制失败': { CN: '复制失败', EN: 'Copy the failure' },

    }

    return {
        i18n: languageObj
    }
})