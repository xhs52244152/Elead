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
        confirmDel: { CN: '确认删除', EN: 'Confirm Delete' },
        delProject: { CN: '是否删除工程', EN: 'Delete project or not' },
        Confirm: { CN: '确认', EN: 'Confirm' },
        Cancel: { CN: '取消', EN: 'Cancel' },
        successDel: { CN: '删除成功', EN: 'Successfully deleted' },
        releaseSuccess: { CN: '发布成功', EN: 'Release success' },
        offlineSuccess: { CN: '下线成功', EN: 'Offline success' },
        uploadSource: { CN: '上传源码', EN: 'Upload source code' },
        uploadSourceSuccess: { CN: '上传源码成功', EN: 'Upload source code successfully' },
        createdSuccess: { CN: '创建成功', EN: 'Created successfully' },
        projectManagement: { CN: '客制化管理', EN: 'Customized management' },
        uploadJar: { CN: '上传Jar', EN: 'Upload jar' },
        creationProject: { CN: '创建工程', EN: 'Creation project' },
        typeInformation: { CN: '类型信息', EN: 'Type information' },
        add: { CN: '增加', EN: 'Add' },
        operation: { CN: '操作', EN: 'Operation' },
        addClass: { CN: '添加模型类', EN: 'Add model class' },
        noteUnique: { CN: '注意：同一服务的工程名称唯一', EN: 'Note: The project name of the same service is unique' },
        edit: { CN: '编辑', EN: 'Edit' },
        copy: { CN: '复制', EN: 'Copy' },
        delete: { CN: '删除', EN: 'Delete' },
        create: { CN: '创建', EN: 'Create.' },
        release: { CN: '发布', EN: 'Release.' },
        deactivate: { CN: '停用', EN: 'Deactivate.' },
        uploadSourceCode: { CN: '上传源码', EN: 'Upload source code.' },
        updateSourceCode: { CN: '更新源码', EN: 'Update source code.' },
        downloadSourceCode: { CN: '下载源码', EN: 'Download the source code.' },
        downloadJar: { CN: '下载jar', EN: 'Download jar.' },
        name: { CN: '名称', EN: 'Name' },
        type: { CN: '类型', EN: 'Types' },
        beloneService: { CN: '所属服务', EN: 'Belong to the service' },
        status: { CN: '状态', EN: 'Status' },
        version: { CN: '版本', EN: 'Version' },
        beloneApplication: { CN: '所属应用', EN: 'Belongs to the application' },
        creator: { CN: '创建者', EN: 'Creator' },
        createTime: { CN: '创建时间', EN: 'Creation time' },
        sourceFile: { CN: '源码文件', EN: 'Source fil' },
        projectName: { CN: '工程名称', EN: 'Project name' },
        projectNamePlaceholder: {
            CN: '请输入工程名称，同一服务工程名称唯一',
            EN: 'Please enter the project name, the same service project name is unique'
        },
        ownService: { CN: '所属服务', EN: 'Owning service' },
        serviceTip: { CN: '插件工程如果是用于建模所属服务请选择单个服务，否则选择多个服务该模型会被覆盖', EN: 'If the plug-in project is used to model the service, please select a single service, otherwise select multiple services and the model will be overwritten' },
        pleaseSelectService: { CN: '请选择服务', EN: 'Please select a service' },
        engineerType: { CN: '工程类型', EN: 'Engineering type' },
        pleaseProjectType: { CN: '请选择工程类型', EN: 'Please select the project type' },
        className: { CN: '类名', EN: 'Class name' },
        displayName: { CN: '显示名称', EN: 'Display name' },
        parentClassName: { CN: '父类', EN: 'Parent class name' },
        interface: { CN: '特性', EN: 'Interface' },
        tenantPolicy: { CN: '租户隔离', EN: 'Tenant policy' },
        deleteOrNot: { CN: '是否删除', EN: 'Delete or not' },
        classNameUnique: { CN: '类名不能重复', EN: 'The class name must be unique' },
        pleaseClassName: { CN: '请输入类名', EN: 'Please enter a class name' },
        classNamePrefix: {
            CN: '类名前缀固定为：erd.cloud.服务别名.entity. 自定义实体类名',
            EN: 'The class name is fixed with the prefix erd.cloud.service.entity. User-defined entity class name.'
        },
        icon: { CN: '图标', EN: 'Icon' },
        inheritedSuperclass: { CN: '继承父类', EN: 'Inherited superclass' },
        selectDifferentParent: {
            CN: '选择不同的父类可以选择的特性不同，已经默认继承的特性自动勾选并且置灰，不能取消，可以选择的为用户自主选择',
            EN: 'Select different parent classes to select different features. The features inherited by default are automatically selected and gray, and cannot be canceled. The features that can be selected are selected by users'
        },
        selectiveCharacteristic: { CN: '选择特性', EN: 'Selective characteristic' },
        versionMainClassName: { CN: '版本主对象类名称', EN: 'Version Main object class name' },
        versionMainDisplayName: { CN: '版本主对象显示名称', EN: 'Version main object display name' },
        tenantIsolationMode: { CN: '租户隔离方式', EN: 'Tenant isolation mode' },
        noteInherit: {
            CN: '注意：选择继承的父类不同，可选择的特性不同',
            EN: 'Note: The properties that can be selected vary depending on the parent class you choose to inherit from'
        },
        serviceNamePlaceholder: { CN: 'erd.cloud.服务名称.entity.', EN: 'erd.cloud. service name.entity.' },
        projectTypeNote: {
            CN: '注意：上传jar自动根据名称与同一服务工程名称相同的插件工程分配，合并为一条数据，如果未分配工程将自动创建一个同名工程',
            EN: 'Project type Note: Upload jars are automatically assigned according to plug-in projects with the same name as the same service project, combined into one piece of data, and if no project is assigned, a project with the same name is automatically created'
        },
        engineerVersion: { CN: '工程版本', EN: 'Engineering version' },
        appName: { CN: '所属应用', EN: 'AppName' },
        enterName: { CN: '请输入名称', EN: 'Please enter name' },
        operationSucceeReleased: {
            CN: '操作成功，LIB插件工程发布后需重启所属服务方可生效',
            EN: 'The operation succeeds. After the LIB plug-in project is released, restart the owning service for the project to take effect.'
        },
        operationSucceeDisabled: {
            CN: '操作成功，LIB插件工程停用后需重启所属服务方可生效',
            EN: 'The operation succeeds. After the LIB plug-in project is disabled, restart the owning service for the operation to take effect.'
        },
        pleaseEnterProjectAndApplication: {
            CN: '请先填写工程名称和所属应用',
            EN: 'Please enter the project name and application.'
        },
        pleaseEnterProjectName: { CN: '请输入工程名称', EN: 'Please enter the project name.' },
        projectNameTooltip: { CN: '请输入小写字母', EN: 'Please enter all lowercase letters.' },
        pleaseSelectApp: { CN: '请选择所属应用', EN: 'Please select your application.' },
        selectiveCharacteristicTip: { CN: '请选择特性', EN: 'Please select features.' },
        numeric: { CN: '类名不能为纯数字', EN: 'Class names cannot be purely numeric.' },
        ContainedTip: { CN: '基础容器托管接口仅提供容器属性，无团队、文件夹、权限等特性；', EN: 'The basic container hosting API only provides container properties, without team, folder, permissions and other features.' },
        ScalableContainerableTip: { CN: '扩展容器托管接口提供容器属性，团队、文件夹、域等特性', EN: 'The extended container hosting interface provides container properties, team, folder, domain, etc.' },
    }

    return {
        i18n: languageObj
    };
});
