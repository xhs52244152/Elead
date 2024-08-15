/**
 * i18n公用国际化文件
 * **/
define([], function () {
    /**
     * 国际化key建议 短文本统一用中文作为key  长文本用英文作key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/

    const i18n = {
        // 通用名词
        app: { CN: '应用', EN: 'Application' },
        application: { CN: '所属应用', EN: 'Application' },
        code: { CN: '编码', EN: 'Code' },
        name: { CN: '名称', EN: 'Name' },
        status: { CN: '状态', EN: 'Status' },
        description: { CN: '描述', EN: 'Description' },
        createBy: { CN: '创建人', EN: 'Create By' },
        createTime: { CN: '创建时间', EN: 'Create Time' },
        operation: { CN: '操作', EN: 'Operation' },
        more: { CN: '更多', EN: 'More' },
        operations: { CN: '更多操作', EN: 'More operations' },
        all: { CN: '全部', EN: 'All' },
        type: { CN: '类型', EN: 'Type' },
        mainModelType: { CN: '主类型', EN: 'Main Model Type' },
        true: { CN: '是', EN: 'Yes' },
        false: { CN: '否', EN: 'No' },
        displayName: { CN: '显示名称', EN: 'Display name' },
        user: { CN: '用户', EN: 'User' },
        org: { CN: '组织', EN: 'Organization' },
        role: { CN: '角色', EN: 'Role' },
        group: { CN: '群组', EN: 'Group' },
        operator: { CN: '操作者', EN: 'Operator' },
        yes: { CN: '是', EN: 'yes' },
        no: { CN: '否', EN: 'no' },
        have: { CN: '有', EN: 'have' },
        none: { CN: '无', EN: 'none' },
        noData: { CN: '暂无数据', EN: 'No Data' },

        // 通用按钮
        add: { CN: '新增', EN: 'Add' },
        delete: { CN: '删除', EN: 'Delete' },
        deleteSuccess: { CN: '删除成功', EN: 'Delete Success' },
        deleteFailed: { CN: '删除失败', EN: 'Delete failed' },
        create: { CN: '创建', EN: 'Create' },
        createSuccess: { CN: '创建成功', EN: 'Created successfully' },
        createFailed: { CN: '创建失败', EN: 'Created failed' },
        update: { CN: '更新', EN: 'Update' },
        updateSuccess: { CN: '更新成功', EN: 'Updated successfully' },
        updateFailed: { CN: '更新失败', EN: 'Updated failed' },
        modify: { CN: '修改', EN: 'Modify' },
        edit: { CN: '编辑', EN: 'Edit' },
        view: { CN: '查看', EN: 'View' },
        close: { CN: '关闭', EN: 'Close' },
        cancel: { CN: '取消', EN: 'Cancel' },
        confirm: { CN: '确定', EN: 'Confirm' },
        help: { CN: '帮助', EN: 'Help' },
        upload: { CN: '上传', EN: 'Upload' },
        clickUpload: { CN: '点击上传', EN: 'Click to upload' },
        download: { CN: '下载', EN: 'Download' },
        import: { CN: '导入', EN: 'Import' },
        export: { CN: '导出', EN: 'Export' },
        configure: { CN: '配置', EN: 'Configure' },
        enable: { CN: '启用', EN: 'Enable' },
        disable: { CN: '停用', EN: 'Disable' },
        deactivate: { CN: '禁用', EN: 'Deactivate' },
        login: { CN: '登录', EN: 'Login' },
        submit: { CN: '提交', EN: 'Submit' },
        inherit: { CN: '继承父级数据', EN: 'Inherit from Parent Type' },
        loading: { CN: '加载中...', EN: 'Loading...' },
        downloadSuccess: { CN: '下载成功', EN: 'Downloaded successfully' },
        downloadFailed: { CN: '下载失败', EN: 'Download failed' },
        downloading: { CN: '正在下载...', EN: 'Downloading...' },
        downloadingWithPercentage: { CN: '正在下载... {percentage}', EN: 'Downloading... {percentage}' },
        search: { CN: '搜索', EN: 'Search' },
        save: { CN: '保存', EN: 'Save' },
        clear: { CN: '清空', EN: 'Clear' },
        refresh: { CN: '刷新', EN: 'Refresh' },

        // 通用提示
        noCurrentTenant: { CN: '非当前租户数据禁止操作', EN: 'Non-current tenant data cannot be performed' },
        confirmChange: { CN: '确认修改', EN: 'Confirm the change' },
        confirmDelete: { CN: '确认删除', EN: 'Confirm delete' },
        confirmDeleteThis: { CN: '确认删除该数据？', EN: 'Confirm to delete this data?' },
        confirmDeleteTip: { CN: '您确定删除【{name}】吗？', EN: 'Are you sure to delete {name} ?' },
        please: { CN: '请', EN: 'Please' },
        pleaseEnterTips: { CN: '请填入', EN: 'Please enter' },
        enterKeyword: { CN: '请输入关键词', EN: 'Please enter keyword' },
        pleaseSelect: { CN: '请选择', EN: 'Please select' },
        pleaseCheck: { CN: '请勾选', EN: 'Please check' },
        isEditingBy: { CN: '正在被 {user} 编辑', EN: 'Is Editing By {user}' },
        error: { CN: '发生错误', EN: 'Error' },
        info: { CN: '提示', EN: 'Info' },
        saveSuccess: { CN: '保存成功', EN: 'Save Success' },

        // 特殊国际化
        holidaySetting: { CN: '{year} 年节假日设置', EN: 'Holiday Settings for {year}' },

        // 状态
        202: {
            CN: '[202] 一个请求已经进入后台排队（异步任务）。',
            EN: '[202] A request has entered the background queue (asynchronous task).'
        },
        400: {
            CN: '[400] 发出的请求有错误，服务器没有进行新建或修改数据的操作。',
            EN: '[400] There is an error in the request sent, and the server does not create or modify data.'
        },
        401: {
            CN: '[401] 用户没有权限（令牌、用户名、密码错误）。',
            EN: '[401] The user does not have permission (wrong token, user name and password).'
        },
        403: {
            CN: '[403] 用户得到授权，但是访问是被禁止的。',
            EN: '[403] The user is authorized, but access is prohibited.'
        },
        404: {
            CN: '[404] 发出的请求针对的是不存在的记录，服务器没有进行操作。',
            EN: '[404] The request sent is for a nonexistent record, and the server did not operate.'
        },
        406: { CN: '[406] 请求的格式不可得。', EN: '[406] The requested format is not available.' },
        410: {
            CN: '[410] 请求的资源被永久删除，且不会再得到的。',
            EN: '[410] The requested resource is permanently deleted and will no longer be available.'
        },
        422: {
            CN: '[422] 当创建一个对象时，发生一个验证错误。',
            EN: '[422] A validation error occurred while creating an object.'
        },
        429: {
            CN: '[429] 请求次数过多，请稍后再操作',
            EN: '[429] Too many requests, please try again later.'
        },
        500: {
            CN: '[500] 服务器发生错误，请检查服务器。',
            EN: '[500] An error occurred in the server. Please check the server.'
        },
        502: { CN: '[502] 网关错误。', EN: '[502] Gateway error.' },
        503: {
            CN: '[503] 服务不可用，服务器暂时过载或维护。',
            EN: '[503] Service unavailable, server temporarily overloaded or maintained.'
        },
        504: { CN: '[504] 网关超时。', EN: '[504] The gateway timed out.' },
        ERR_NETWORK: { CN: '发生网络错误', EN: 'ERR_NETWORK' },
        413: {
            CN: '[413] 请求体过大，服务器无法处理。',
            EN: '[413] The request body is too large for the server to process.'
        },
        // TODO 兼容旧国际化，后续迭代版本废除
        状态码: { CN: '状态码', EN: 'Status code' },
        '接口异常,请联系管理员': { CN: '接口异常,请联系管理员', EN: 'Service Error, please contact the administrator' },
        新增: { CN: '新增', EN: 'Add' },
        删除: { CN: '删除', EN: 'Delete' },
        创建: { CN: '创建', EN: 'Create' },
        更新: { CN: '更新', EN: 'Update' },
        修改: { CN: '修改', EN: 'Modify' },
        编辑: { CN: '编辑', EN: 'Edit' },
        温馨提示: { CN: '温馨提示', EN: 'Reminder' },
        好的: { CN: '好的', EN: 'OK' },
        知道了: { CN: '知道了', EN: 'Got it' },
        取消: { CN: '取消', EN: 'Cancel' },
        确认: { CN: '确认', EN: 'Confirm' },
        确定: { CN: '确定', EN: 'Confirm' },
        暂无数据: { CN: '暂无数据', EN: 'No data' },
        请输入: { CN: '请输入', EN: 'Please enter' },
        请选择: { CN: '请选择', EN: 'Please select' },
        全选: { CN: '全选', EN: 'Select all' },
        下载成功: { CN: '下载成功', EN: 'Downloaded successfully' },
        下载失败: { CN: '下载失败', EN: 'Download failed' },
        是: { CN: '是', EN: 'Yes' },
        否: { CN: '否', EN: 'No' },
        提示: { CN: '提示', EN: 'Tips' },
        请填入正确的信息: { CN: '请填入正确的信息', EN: 'Please fill in the correct information' },
        创建成功: { CN: '创建成功', EN: 'Create Success' },
        更新成功: { CN: '更新成功', EN: 'Update Success' },
        删除成功: { CN: '删除成功', EN: 'Delete Success' },
        增加成功: { CN: '增加成功', EN: 'Add Success' },
        移除成功: { CN: '移除成功', EN: 'Remove Success' },
        保存成功: { CN: '保存成功', EN: 'Save Success' },
        保存: { CN: '保存', EN: 'Save' },
        重置: { CN: '重置', EN: 'Reset' },
        清空: { CN: '清空', EN: 'Clear' },
        uploading: { CN: '上传中...', EN: 'UPLOADING...' }
    };

    // 配置国际化key-value
    class GlobalI18n {
        constructor() {
            this.i18n = i18n;
            this.getLanguageBySystem = null;
            this.eventList = [];
        }

        set(key, value) {
            if (arguments.length === 1) {
                this.i18n = Object.assign({}, this.i18n, key);
            } else {
                this.i18n[key] = value;
            }
            this.eventList &&
                this.eventList.forEach((eventCallback) => {
                    eventCallback(this.i18n);
                });
        }

        register(fn) {
            this.eventList.push(fn);
        }

        wrap(i18nConfig) {
            const i18nData = i18nConfig.i18n || {};
            const currentLanguage = this.getLanguageBySystem() || 'CN';
            const result = Object.create(this.i18n);
            Object.keys(i18nData).forEach((key) => {
                result[key] = i18nData[key][currentLanguage] || '';
            });
            return result;
        }
    }

    return new GlobalI18n();
});
