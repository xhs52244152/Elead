define([
    'text!' + ELMP.func('erdc-epm-document/components/MainContentSource/index.html'),
    ELMP.func('erdc-epm-document/api.js'),
    ELMP.func('erdc-epm-document/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.resource('erdc-cbb-components/Mixins/upload.js'),
    'css!' + ELMP.func('erdc-epm-document/components/MainContentSource/index.css')
], function (template, Api, viewCfg, cbbUtils, uploadMixin) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'EpmMainContentSource',
        template,
        mixins: [uploadMixin],
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js'))
        },
        props: {
            vm: Object,
            currentData: Object
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-epm-document/locale/index.js'),
                panelUnfold: true,
                mainSourceInfo: {
                    authoringApplication: '', // 应用程序
                    docType: '', // 类别
                    templateFile: '' // 模板文件
                },
                MountedapplicationList: [], //应用程序初始化列表
                MountedTemplateList: [], // 摸板的初始化数据
                initTemplateFile: ''
            };
        },
        computed: {
            oid() {
                return this?.vm?.containerOid || '';
            },
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            formConfigs() {
                return [
                    {
                        field: 'authoringApplication',
                        component: 'custom-select',
                        label: this.i18n['创作应用程序'],
                        labelLangKey: 'component',
                        required: true,
                        class: 'h-100p',
                        props: {
                            clearable: false,
                            multiple: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'value', // 显示的label的key
                                valueProperty: 'name', // 显示value的key
                                referenceList: this.applicationList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        listeners: {
                            change: () => {
                                this.mainSourceInfo.docType = '';
                                this.mainSourceInfo.templateFile = '';
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'docType',
                        component: 'custom-select',
                        label: this.i18n['类别'],
                        required: true,
                        props: {
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'value', // 显示的label的key
                                valueProperty: 'name', // 显示value的key
                                referenceList: this.categoryList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        listeners: {
                            change: () => {
                                this.mainSourceInfo.templateFile = '';
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'templateFile',
                        component: 'custom-select',
                        label: this.i18n['模型源文件'],
                        required: true,
                        props: {
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'cadName', // 显示的label的key
                                valueProperty: 'contentId', // 显示value的key
                                referenceList: this.templateList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'upload',
                        component: 'erd-button',
                        label: '',
                        disabled: false,
                        required: false,
                        hidden: false,
                        class: 'upload-download',
                        props: {},
                        col: 12,
                        slots: {
                            component: 'uploadComponent'
                        }
                    }
                ];
            },
            // 应用程序列表
            applicationList() {
                let applicationList = [];
                if (_.isArray(this.MountedapplicationList) && this.MountedapplicationList.length) {
                    applicationList = ErdcKit.deepClone(this.MountedapplicationList) || [];
                    if (_.isArray(this.MountedTemplateList) && this.MountedTemplateList.length) {
                        // 需求：通过获取所有摸板，匹配存在的应用程序和类别
                        const TypeList = _.map(this.MountedTemplateList, (item) => item.applicationType + item.cadType);
                        //2. 通过循环匹配,去掉不存在摸板的类别，这里没去掉所有类型为空的应用程序
                        for (let index = 0; index < applicationList.length; index++) {
                            // 从数组尾部开始遍历,不影响数组每一项的下标
                            for (let i = applicationList[index].categoryList.length - 1; i >= 0; i--) {
                                const type = applicationList[index].name + applicationList[index].categoryList[i].value;
                                if (!TypeList.includes(type)) {
                                    applicationList[index].categoryList.splice(i, 1);
                                }
                            }
                        }
                        applicationList = _.filter(
                            applicationList,
                            (item) => _.isArray(item?.categoryList) && item.categoryList.length
                        );
                    }
                }
                return applicationList;
            },
            // 类别列表
            categoryList() {
                let categoryList = [];
                if (_.isArray(this.applicationList) && this.applicationList.length) {
                    const applicationList = ErdcKit.deepClone(this.applicationList) || [];
                    const application = _.find(
                        applicationList,
                        (item) => item.name === this.mainSourceInfo.authoringApplication
                    );
                    if (_.isArray(application?.categoryList) && application.categoryList.length) {
                        categoryList = application.categoryList;
                    }
                }
                return categoryList;
            },
            // 模板文件列表
            templateList() {
                let templateList = [];
                if (_.isArray(this.MountedTemplateList) && this.MountedTemplateList.length) {
                    templateList = ErdcKit.deepClone(this.MountedTemplateList) || [];
                    if (_.isArray(this.categoryList) && this.categoryList.length) {
                        const { docType, authoringApplication } = this.mainSourceInfo || {};
                        if (docType && authoringApplication) {
                            const cadType = _.find(this.categoryList, (item) => item.name === docType)?.value || '';
                            templateList = _.filter(this.MountedTemplateList, (item) => {
                                return item.cadType === cadType && item.applicationType === authoringApplication;
                            });
                        }
                    }
                }
                return templateList;
            },
            // 是否加载附件列表
            loadAttachmentList() {
                return !_.isEmpty(this.currentData) && this.oid;
            },
            // 编辑附件列表
            initAttachmentList() {
                return _.isArray(this.templateList) && this.templateList.length && this.initTemplateFile;
            }
        },
        created() {
            this.getTemplateFile();
        },
        mounted() {
            this.getApplicationList();
        },
        watch: {
            'currentData': {
                immediate: true,
                handler(nv) {
                    if (!_.isEmpty(nv)) {
                        _.each(nv, (value, key) => {
                            value && this.$set(this.mainSourceInfo, key, value);
                        });
                    }
                }
            },
            'loadAttachmentList': {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.getFileData(this.oid, true);
                    }
                }
            },
            'mainSourceInfo.templateFile': {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        const template = _.find(this.templateList, { contentId: nv }) || {};
                        if (!_.isEmpty(template) && template?.oid) {
                            const { fileData } = this.mainSourceInfo || {};
                            if (!_.isEmpty(fileData) && fileData?.id === nv) {
                                return;
                            }
                            this.getFileData(template?.oid);
                        }
                    }
                }
            },
            'initAttachmentList': {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        const template = _.find(this.templateList, { contentId: nv }) || {};
                        if (_.isEmpty(template) && !_.isEmpty(this.mainSourceInfo?.fileData)) {
                            nv = this.mainSourceInfo.fileData?.displayName;
                        }
                        this.$set(this.mainSourceInfo, 'templateFile', nv);
                    }
                }
            }
        },
        methods: {
            // 获取应用程序列表
            getApplicationList() {
                this.$famHttp({
                    url: Api.searchSupportType,
                    params: {
                        className: viewCfg.epmDocumentViewTableMap.className
                    }
                }).then((res) => {
                    this.MountedapplicationList = _.filter(
                        res?.data || [],
                        (item) => _.isArray(item.categoryList) && item.categoryList.length
                    );
                });
            },
            // 获取模板列表
            getTemplateFile(docType, authoringApplication) {
                this.$famHttp({
                    url: Api.getEpmTempate,
                    params: {
                        cadType: docType || '',
                        applicationType: authoringApplication || '',
                        className: viewCfg.epmDocumentViewTableMap.className
                    }
                }).then((res) => {
                    this.MountedTemplateList = res?.data || [];
                });
            },
            submit(check) {
                const { mainSourceForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    const fileData = this.mainSourceInfo.fileData;
                    let attrRawList = mainSourceForm.serializeEditableAttr();
                    attrRawList = attrRawList.filter((item) => item.value !== '—');
                    if (check) {
                        resolve({ attrRawList, fileData, status: true });
                    } else {
                        mainSourceForm.submit().then((valid) => {
                            if (valid) {
                                resolve({ attrRawList, fileData, status: true });
                            } else {
                                reject({ status: false });
                            }
                        });
                    }
                });
            },
            getFileData(oid, init) {
                this.$famHttp({
                    url: 'epm/content/attachment/list',
                    method: 'GET',
                    className: viewCfg.epmDocumentViewTableMap.className,
                    params: {
                        objectOid: oid,
                        roleType: 'PRIMARY'
                    }
                }).then((res) => {
                    const [result] = res.data?.attachmentDataVoList || [];
                    if (!_.isEmpty(result)) {
                        const data = {
                            ...result,
                            actionFlag: 1,
                            id: result?.id || '',
                            isDownlad: true,
                            description: '',
                            displayName: result?.displayName || '',
                            createTime: result?.createTime || '',
                            role: 'PRIMARY',
                            source: 0,
                            location: 'REMOTE'
                        };
                        if (init) {
                            this.initTemplateFile = data?.id;
                        }
                        this.$set(this.mainSourceInfo, 'fileData', data);
                    }
                });
            },
            onSuccess(response, file) {
                if (!response.success) return;
                this.$message.success(this.i18n['上传成功']);
                const data = {
                    actionFlag: 1,
                    // 适配平台大文件上传的取值,自定义上传取的是id
                    id: file.response?.contentId,
                    storeId: response?.data,
                    authCode: response?.authorizeCode,
                    isDownlad: true,
                    description: '',
                    displayName: file.name,
                    fileSize: cbbUtils.formatSize(file.size),
                    createTime: ErdcKit.formatDateTime(new Date(), 'ymdhms'),
                    role: 'PRIMARY',
                    source: 0,
                    location: 'REMOTE'
                };
                this.initTemplateFile = data?.id;
                this.$set(this.mainSourceInfo, 'fileData', data);
            },
            hanldeDownloadTemplate() {
                ErdcKit.downFile({
                    url: Api.download,
                    className: viewCfg.epmDocumentViewTableMap.className,
                    method: 'GET',
                    data: {
                        id: this.mainSourceInfo.fileData?.id,
                        name: this.mainSourceInfo.fileData?.displayName,
                        className: viewCfg.epmDocumentViewTableMap.className
                    }
                });
            }
        }
    };
});
