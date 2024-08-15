define([], function () {
    const languageObj = {
        searchTips: {
            CN: '请输入名称、编码',
            EN: 'Please Input Name、Code'
        },
        '新建文件夹': {
            CN: '新建文件夹',
            EN: 'New Folder'
        },
        'delete': {
            CN: '删除',
            EN: 'Remove'
        },
        '重命名': {
            CN: '重命名',
            EN: 'Rename'
        },
        '上传': {
            CN: '上传',
            EN: 'Upload'
        },
        'sort': {
            CN: '排序',
            EN: 'Sort'
        },
        '恢复': {
            CN: '恢复',
            EN: 'Revert'
        },
        '彻底删除': {
            CN: '彻底删除',
            EN: 'Force Remove'
        },
        '详情': {
            CN: '详情',
            EN: 'Detail'
        },
        'download': {
            CN: '下载',
            EN: 'Download'
        },
        '打包下载': {
            CN: '打包下载',
            EN: 'Zip Download'
        },
        '存储': {
            CN: '存储',
            EN: 'Storage'
        },
        'filePlatform': {
            CN: '文件平台',
            EN: 'File Platform'
        },
        'appManage': {
            CN: '文件配置',
            EN: 'File Configuration'
        },
        'typeManage': {
            CN: '文件格式配置',
            EN: 'File format configuration'
        },
        'siteManage': {
            CN: '文件站点',
            EN: 'File Site'
        },
        '工具管理': {
            CN: '工具管理',
            EN: 'Tool Manage'
        },
        'name': {
            CN: '名称',
            EN: 'Name'
        },
        '类型': {
            CN: '类型',
            EN: 'Type'
        },
        'size': {
            CN: '大小',
            EN: 'Size'
        },
        '创建时间': {
            CN: '创建时间',
            EN: 'Create Time'
        },
        '创建人': {
            CN: '创建人',
            EN: 'Creator'
        },
        'updateTime': {
            CN: '更新时间',
            EN: 'Update Time'
        },
        'updater': {
            CN: '更新人',
            EN: 'Updater'
        },
        '注册时间': {
            CN: '注册时间',
            EN: 'Registry Time'
        },
        '注册人': {
            CN: '注册人',
            EN: 'Register'
        },
        '位置': {
            CN: '位置',
            EN: 'Location'
        },
        'code': {
            CN: '编码',
            EN: 'Code'
        },
        'address': {
            CN: '地址',
            EN: 'Address',
        },
        'state': {
            CN: '状态',
            EN: 'State'
        },
        'icon': {
            CN: '图标',
            EN: 'Icon'
        },
        'save': {
            CN: '保存',
            EN: 'Save'
        },
        '关联属性': {
            CN: '关联属性',
            EN: 'Link Attribute'
        },
        'fileType': {
            CN: '文件类型',
            EN: 'File Type'
        },
        'fileClassification': {
            CN: '文件分类',
            EN: 'File Classification'
        },
        'fileFormat': {
            CN: '文件格式',
            EN: 'File Format'
        },
        'fileTypeCode': {
            CN: '文件类型编码',
            EN: 'FileType Code'
        },
        'fileTypeName': {
            CN: '文件类型名称',
            EN: 'FileType Name'
        },
        'mimeType': {
            CN: '媒体类型',
            EN: 'Mime Type'
        },
        'storageType': {
            CN: '存储方式',
            EN: 'Storage Type'
        },
        '授权回调URL': {
            CN: '授权回调URL',
            EN: 'The callback URL for authorization'
        },
        '介绍': {
            CN: '介绍',
            EN: 'Introduce'
        },
        '请输入文件类型编码': {
            CN: '请输入文件类型编码',
            EN: 'Please input the code of fileType'
        },
        '请输入文件类型名称': {
            CN: '请输入文件类型名称',
            EN: 'Please input the name of fileType'
        },
        '请选择应用': {
            CN: '请选择应用',
            EN: 'Please select app'
        },
        '服务器地址': {
            CN: '服务器地址',
            EN: 'Server Url'
        },
        '令牌': {
            CN: '令牌',
            EN: 'Token'
        },
        '加密密钥': {
            CN: '加密密钥',
            EN: 'Aes Key'
        },
        '审批意见': {
            CN: '审批意见',
            EN: 'Approval Opinion'
        },
        'storageBuket': {
            CN: '存储桶',
            EN: 'Storage Bucket'
        },
        '升序': {
            CN: '升序',
            EN: 'Ascending Order'
        },
        '降序': {
            CN: '降序',
            EN: 'Descending Order'
        },
        '请输入文件名称': {
            CN: '请输入文件名称',
            EN: 'Please input the name of file'
        },
        '请输入属性名称': {
            CN: '请输入属性名称',
            EN: 'Please input the name of attribute'
        },
        '请输入显示名称': {
            CN: '请输入显示名称',
            EN: 'Please input the displayName of attribute'
        },
        '请输入应用介绍': {
            CN: '请输入应用介绍',
            EN: 'Please input the introduce of application'
        },
        '保存': {
            CN: '保存',
            EN: 'Save'
        },
        'confirm': {
            CN: '确定',
            EN: 'Confirm'
        },
        'cancel': {
            CN: '取消',
            EN: 'Cancel'
        },
        'moveUp': {
            CN: '上移',
            EN: 'Move Up'
        },
        'moveDown': {
            CN: '下移',
            EN: 'Move Down'
        },
        '名称不能为空': {
            CN: '名称不能为空',
            EN: "Name shouldn't be empty"
        },
        'requestSuccess': {
            CN: '请求成功',
            EN: 'Request success'
        },
        '请求失败': {
            CN: '请求失败',
            EN: 'Request failed'
        },
        'deleteTip': {
            CN: '确认删除？',
            EN: 'Sure to remove these？'
        },
        '请选择媒体类型': {
            CN: '请选择媒体类型',
            EN: 'Please select the mimeType'
        },
        '请选择文件类型': {
            CN: '请选择文件类型',
            EN: 'Please select the fileType'
        },
        '请选择类型': {
            CN: '请选择类型',
            EN: 'Please select type'
        },
        '请输入审批意见': {
            CN: '请输入审批意见',
            EN: 'Please input approval opinion'
        },
        '已审批应用不能删除': {
            CN: '已审批应用不能删除',
            EN: 'The approved application is not allow remove'
        },
        'doc_tips_allow_remove_one': {
            CN: '暂时只支持单个应用审批',
            EN: 'Only single application approval is supported'
        },
        'doc_tips_allow_approval': {
            CN: "所选应用不是'未审批'状态",
            EN: "The selected application is not in the 'Unapproved' state"
        },
        '请输入必填项': {
            CN: '请输入必填项',
            EN: 'Please input these required items'
        },
        '请输入媒体类型': {
            CN: '请输入媒体类型',
            EN: 'Please input mimeType'
        },
        '请输入授权回调URL': {
            CN: '请输入授权回调URL',
            EN: 'Please input the callback URL of authorization'
        },
        '请输入介绍': {
            CN: '请输入介绍',
            EN: 'Please input introduce'
        },
        'doc_field_url_tips': {
            CN: '必须以http://或https://开头，分别支持80端口和443端口',
            EN: "Must start with 'http://' or 'https://'"
        },
        'doc_field_token_tips': {
            CN: '必须为英文或数字，长度为3-32个字符',
            EN: 'Must be in English or numeric and length is between 3 and 32'
        },
        'doc_field_aes_key_tips': {
            CN: '加密密钥由43位字符组成，可随机修改，字符范围为A-Z,a-z,0-9',
            EN: 'The encryption key consists of 43-bit characters, which can be changed at random, and the characters range from A-Z, A-Z, 0-9'
        },
        '请输入存储桶': {
            CN: '请输入存储桶',
            EN: 'Please input bucket'
        },
        '文件夹': {
            CN: '文件夹',
            EN: 'Folder'
        },
        '文件': {
            CN: '文件',
            EN: 'File'
        },
        'fileName': {
            CN: '文件名',
            EN: 'File Name'
        },
        'basicInfo': {
            CN: '基础信息',
            EN: 'Basic Info'
        },
        'storeConfig': {
            CN: '存储配置',
            EN: 'Store Config'
        },
        'toolConfig': {
            CN: '工具配置',
            EN: 'Tool Config'
        },
        'appCode': {
            CN: '应用编码',
            EN: 'App Code'
        },
        'appName': {
            CN: '应用名称',
            EN: 'App Name'
        },
        '应用图标': {
            CN: '应用图标',
            EN: 'App Icon'
        },
        '应用介绍': {
            CN: '应用介绍',
            EN: 'App Introduce'
        },
        'pluginAddress': {
            CN: '插件地址',
            EN: 'Plugin Address'
        },
        'func': {
            CN: '功能',
            EN: 'Function'
        },
        'onlinePreview': {
            CN: '在线预览',
            EN: 'Online Preview'
        },
        'onlineEdit': {
            CN: '在线编辑',
            EN: 'Online Edit'
        },
        'fileSuffix': {
            CN: '支持的文件后缀',
            EN: "Support file's suffix"
        },
        'videoPlay': {
            CN: '视频播放',
            EN: 'Video Play'
        },
        'onlinePlay': {
            CN: '在线播放',
            EN: 'Online Play'
        },
        'playControl': {
            CN: '播放控制',
            EN: 'Play Controls'
        },
        'audioPlay': {
            CN: '音频播放',
            EN: 'Audio Play'
        },
        'imgPreview': {
            CN: '图片预览',
            EN: 'Image Preview'
        },
        'scriptEditTool': {
            CN: '脚本编辑器',
            EN: 'Script Edit Tool'
        },
        '创建': {
            CN: '创建',
            EN: 'Create'
        },
        '编辑': {
            CN: '编辑',
            EN: 'Edit',
        },
        '批量删除': {
            CN: '批量删除',
            EN: 'Batch Delete'
        },
        '注册': {
            CN: '注册',
            EN: 'Register'
        },
        '审批': {
            CN: '审批',
            EN: 'Approve'
        },
        '配置': {
            CN: '配置',
            EN: 'Config'
        },
        '修改配置': {
            CN: '修改配置',
            EN: 'Modify Config'
        },
        '关闭': {
            CN: '关闭',
            EN: 'Close'
        },
        '启用': {
            CN: '启用',
            EN: 'Open'
        },
        '停用': {
            CN: '停用',
            EN: 'Close'
        },
        '确认': {
            CN: '确认',
            EN: 'Sure'
        },
        'reset': {
            CN: '重置',
            EN: 'Reset'
        },
        '属性名称': {
            CN: '属性名称',
            EN: 'Attribute Name'
        },
        '显示名称': {
            CN: '显示名称',
            EN: 'Display Name'
        },
        'operate': {
            CN: '操作',
            EN: 'Operate'
        },
        '应用审批': {
            CN: '应用审批',
            EN: 'App Approval'
        },
        '基本配置': {
            CN: '基本配置',
            EN: 'Base Config'
        },
        '回调事件配置': {
            CN: '回调事件配置',
            EN: 'Callback Event Config'
        },
        '全部': {
            CN: '全部',
            EN: 'All'
        },
        '待审批': {
            CN: '待审批',
            EN: 'Pending'
        },
        '已通过': {
            CN: '已通过',
            EN: 'Access'
        },
        '未通过': {
            CN: '未通过',
            EN: 'Denied'
        },
        '通过': {
            CN: '通过',
            EN: 'Access'
        },
        '驳回': {
            CN: '驳回',
            EN: 'Denied'
        },
        'selectIcon': {
            CN: '选择图标',
            EN: 'Select The Icon'
        },
        'pdfPreview': {
            CN: 'PDF预览',
            EN: 'PDF Preview'
        },
        'enableOrDisable': {
            CN: '启/停用',
            EN: 'Enable/Disable'
        },
        'mainSite': {
            CN: '主站点',
            EN: ' Main Site'
        },
        '授权码': {
            CN: '授权码',
            EN: 'Authorize Code'
        },
        'bindDepartments': {
            CN: '绑定部门',
            EN: 'Binding Departments'
        },
        'curDocSite': {
            CN: '当前文档站点',
            EN: 'Binding Site'
        },
        'curSite': {
            CN: '当前站点',
            EN: 'current site',
        },
        'batchBindSite': {
            CN: '批量绑定站点',
            EN: 'Batch Bind Site'
        },
        'unbindSite': {
            CN: '解绑站点',
            EN: 'Unbind Site'
        },
        '站点编码': {
            CN: '站点编码',
            EN: 'Site Code'
        },
        'siteCreatedSuccess': {
            CN: '站点创建成功',
            EN: 'Site created successfully'
        },
        'siteDeleteSuccess': {
            CN: '站点删除成功',
            EN: 'Site deleted successfully'
        },
        'siteEnable': {
            CN: '站点启用成功',
            EN: 'Site enable successfully'
        },
        'siteDown': {
            CN: '站点已停用',
            EN: 'Site down'
        },
        'siteActiveFailed': {
            CN: '站点启用\\停用错误',
            EN: 'Site enable/disable failed'
        },
        'deleteSiteTip': {
            CN: '是否永久删除该站点',
            EN: 'Do you want to delete this site'
        },
        'taskName': {
            CN: '任务名称',
            EN: 'Task Name'
        },
        'startTime': {
            CN: '开始时间',
            EN: 'Start Time'
        },
        'endTime': {
            CN: '结束时间',
            EN: 'End Time'
        },
        'syncRecord': {
            CN: '同步记录',
            EN: 'Synchronous Record'
        },
        'syncState': {
            CN: '同步状态',
            EN: 'Synchronous State'
        },
        'numberOfFiles': {
            CN: '需同步文件数量',
            EN: 'Number Of Files'
        },
        'fileUpload': {
            CN: '文件上传',
            EN: 'File Upload'
        },
        'completedQuantity': {
            CN: '完成同步文件数量',
            EN: 'Completed Quantity'
        },
        'siteDetection': {
            CN: '站点检测',
            EN: 'Site detection'
        },
        'exceptionInfo': {
            CN: '异常信息',
            EN: 'Exception Information'
        },
        'noExceptionInfo': {
            CN: '暂无异常信息',
            EN: 'No exception information is displayed'
        },
        'switchSite': {
            CN: '切换站点',
            EN: 'Switching Site'
        },
        'siteName': {
            CN: '站点名称',
            EN: 'Site Name'
        },
        'healthState': {
            CN: '健康状态',
            EN: 'Health State'
        },
        'minTime': {
            CN: '最小耗时',
            EN: 'Min Time'
        },
        'maxTime': {
            CN: '最大耗时',
            EN: 'Max Time'
        },
        'avgTime': {
            CN: '平均耗时',
            EN: 'Average Time'
        },
        'jitterTime': {
            CN: '最大差值',
            EN: 'Jitter Time'
        },
        'bindSite': {
            CN: '绑定站点',
            EN: 'Bind Site'
        },
        'syncStrategy': {
            CN: '同步策略',
            EN: 'synchronisation strategy'
        },
        'timeMinutes': {
            CN: '持续时间',
            EN: 'time minutes'
        },
        '请输入持续时间': {
            CN: '请输入持续时间',
            EN: 'please input time minutes'
        },
        'inSite': {
            CN: '所在站点',
            EN: 'site'
        },
        '默认站点': {
            CN: '默认站点',
            EN: 'Default Site'
        },
        'sourceSite': {
            CN: '源站点',
            EN: 'Source Site'
        },
        'destSite': {
            CN: '目标站点',
            EN: 'Dest Site'
        },
        'app': {
            CN: '多应用',
            EN: 'App'
        },
        'createTaskSiteTip': {
            CN: '源站点和目标站点不能相同',
            EN: 'The source site and destination site must be different'
        },
        '未查找到主站点信息': {
            CN: '未查找到主站点信息',
            EN: 'Primary site information not found'
        },
        'pleaseEnter': {
            CN: '请输入',
            EN: 'Please enter'
        },
        '请选择数据': {
            CN: '请选择数据',
            EN: 'Please select data'
        },
        '删除成功': {
            CN: '删除成功',
            EN:  'Delete success',
        },
        '保存成功': {
            CN: '保存成功',
            EN:  'Save success',
        },
        'back': {
            CN: '返回',
            EN: 'Back',
        },
        'description': {
            CN: '描述',
            EN: 'Description',
        },
        'yes': {
            CN: '是',
            EN: 'yes',
        },
        'no': {
            CN: '否',
            EN: 'no',
        },
        'enableSiteTip': {
            CN: '请先启用站点',
            EN: 'Please enable the site first',
        },
        'cronExpression': {
            CN: 'cron 表达式',
            EN: 'cron expression'
        },
        'lastRunTime': {
            CN: '上次运行时间',
            EN: 'last run time',
        },
        'nextRunTime': {
            CN: '下次运行时间',
            EN: 'next run time'
        },
        'startUp': {
            CN: '启动',
            EN: 'Start up'
        },
        'pause': {
            CN: '暂停',
            EN: 'Pause'
        },
        'maximumDuration': {
            CN: '最大持续时间',
            EN: 'maximum duration'
        },
        'failureNumber': {
            CN: '最大失败次数',
            EN: 'Number of failures'
        },
        'depName':{
            CN: '部门名称',
            EN: 'Department name'
        },
        'modifyStatusSuccessTip': {
            CN: '修改运行状态成功',
            EN: 'Modify running status successfully',
        },
        'disableStatusConfirm': {
            CN: '暂停后当前定时任务不再执行，是否确定暂停？',
            EN:  'After suspending, the current scheduled task will no longer be executed. Are you sure to suspend?'
        },
        'tip': {
            CN: '提示',
            EN: 'tip',
        },
        'siteFiles': {
            CN: '站点文件',
            EN: 'Site Files'
        },
        'veryslow' : {
            CN: '慢',
            EN: 'very slow',
        },
        'slow' : {
            CN: '良好',
            EN: 'slow',
        },
        'fast' : {
            CN: '快',
            EN: 'fast',
        },
        'run' : {
            CN: '运行中',
            EN: 'Run',
        },
        'onPause' : {
            CN: '暂停中',
            EN: 'On Pause',
        }
    };
    return {
        i18n: languageObj
    };
});
