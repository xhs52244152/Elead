define([
    'text!' + ELMP.resource('erdc-cbb-components/MainContentSource/index.html'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    const locationMap = {
        0: 'REMOTE',
        1: 'LOCAL'
    };
    const ACTION_FLAG = {
        // 不修改
        notModify: 0,
        // 添加
        add: 1,
        // 编辑
        edit: 2,
        // 删除
        remove: 3,
        // 替换
        replace: 4
    };

    return {
        name: 'MainContentSource',
        template,
        components: {
            MainContent: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/MainContentSource/components/MainContent/index.js')
            )
        },
        props: {
            readonly: Boolean,
            // 隐藏折叠面板
            hideCollapse: Boolean,
            className: String,
            oid: String,
            value: {
                type: [Object, Array],
                default() {
                    return {};
                }
            },
            vm: Object,
            isEpm: Boolean
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/MainContentSource/locale/index.js'),
                panelUnfold: true,
                form: {},
                fileList: [],
                // 数据源
                sourceData: {}
            };
        },
        computed: {
            urlConfigs() {
                return [
                    {
                        field: 'displayName',
                        component: 'erd-input',
                        label: this.i18n['标签名'],
                        required: true,
                        col: 12
                    },
                    {
                        field: 'urlLocation',
                        component: 'erd-input',
                        label: this.i18n['URL'],
                        required: true,
                        col: 12
                    }
                ];
            },
            fileConfigs() {
                return [
                    {
                        field: 'fileId',
                        component: 'fam-upload',
                        label: this.i18n['主内容'],
                        required: true,
                        validators: [
                            {
                                trigger: ['blur'],
                                validator: (rule, value, callback) => {
                                    if (_.isEmpty(value)) {
                                        callback(new Error(this.i18n['请选择文件']));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        slots: {
                            readonly: 'main-content',
                            component: 'main-content'
                        },
                        col: this.hideCollapse ? 24 : 12
                    }
                ];
            },
            formConfigs() {
                const { source } = this.form || {};
                let formConfigs = [
                    {
                        field: 'source',
                        component: 'custom-select',
                        label: this.i18n['请选择'],
                        props: {
                            clearable: false,
                            multiple: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'label', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.typeOptions,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        listeners: {
                            change: (value) => {
                                this.form.source = value;
                            }
                        },
                        col: 12
                    }
                ];
                return formConfigs.concat(source === 0 ? this.fileConfigs : source === 1 ? this.urlConfigs : []);
            },
            typeOptions() {
                return [
                    {
                        value: 0,
                        label: this.i18n['本机文件']
                    },
                    {
                        value: 1,
                        label: this.i18n['URL']
                    },
                    {
                        value: 2,
                        label: this.i18n['无内容']
                    }
                ];
            },
            canGetAttachmentslist() {
                return this.oid && this.className && this.oid + this.className;
            },
            showFileList() {
                let showFileList = ErdcKit.deepClone(this.fileList) || [];
                showFileList = _.filter(showFileList, (item) => item?.source === this.form?.source);
                return _.map(showFileList, (item) => {
                    return {
                        ...item,
                        fileName: item?.displayName || item?.name,
                        name: item?.displayName || item?.name,
                        createTime: item?.createTime,
                        updateTime: item?.updateTime,
                        fileSize: (item?.size && cbbUtils.formatSize(item?.size)) || item?.fileSize,
                        id: item?.id,
                        source: item?.source,
                        role: item?.role
                    };
                });
            }
        },
        watch: {
            canGetAttachmentslist: {
                immediate: true,
                handler: function (nv) {
                    if (nv) {
                        this.getFileData();
                    }
                }
            },
            fileList: {
                immediate: true,
                handler(nv) {
                    this.$set(this.form, 'fileId', _.map(nv, 'id'));
                }
            }
        },
        created() {
            // 默认选中主要内容源为本机文件
            this.$set(this.form, 'source', 0);
        },
        methods: {
            beforeRemove(file, fileList) {
                if (file && file.status === 'success') {
                    return this.$confirm('是否删除附件', '是否删除', {
                        confirmButtonText: this.i18n['confirm'],
                        cancelButtonText: this.i18n['cancel'],
                        type: 'warning'
                    }).then(() => {
                        this.deleteFile(file, fileList);
                    });
                }
            },
            beforeUpload() {
                // 平台支持大文件切片上传,所以就不用限制大小了
                // const maxSize = 20 * 1024 * 1024; // 20MB
                // if (file.size > maxSize) {
                //     this.$message.warning(`${this.i18n['文件大小不能超过']} ${maxSize / 1024 / 1024}MB`);
                //     return false;
                // }
                return true;
            },
            onSuccess(file, fileInfo) {
                let data = this.reSetFileData({}) || {};
                data = {
                    ...data,
                    // 平台要求取contentId
                    id: file.contentId,
                    name: fileInfo.name,
                    fileSize: cbbUtils.formatSize(fileInfo.size),
                    createTime: ErdcKit.formatDateTime(new Date(), 'ymdhms'),
                    updateTime: ErdcKit.formatDateTime(new Date(), 'ymdhms'),
                    storeId: file.data,
                    authCode: file.authorizeCode
                };
                this.fileList = [data];
            },
            // 重置文件系统
            reSetFileData(data) {
                data = {
                    actionFlag: ACTION_FLAG[this.oid ? 'replace' : 'add'],
                    role: 'PRIMARY',
                    source: this.form?.source,
                    location: locationMap[this?.form?.source],
                    id: this.form?.fileId[0],
                    ...data
                };
                return data;
            },
            deleteFile(file, fileList) {
                this.fileList = _.filter(ErdcKit.deepClone(fileList), (item) => item.id !== file.id);
            },
            submit(valid) {
                const { mainSourceForm } = this.$refs;
                // eslint-disable-next-line no-async-promise-executor
                return new Promise(async (resolve) => {
                    let data = this.reSetFileData({}) || {};
                    if (this.form?.source === 0) {
                        const [file = {}] = this.fileList || [];
                        // 本机文件
                        data = {
                            ...data,
                            name: file?.name || '',
                            fileSize: file?.fileSize,
                            createTime: file?.createTime || ErdcKit.formatDateTime(new Date(), 'ymdhms')
                        };
                    } else if (this.form?.source === 1) {
                        // URL
                        data = {
                            ...data,
                            description: this.form?.description,
                            displayName: this.form?.displayName,
                            urlLocation: this.form?.urlLocation,
                            // URL不需要id
                            id: ''
                        };
                    } else {
                        // 区分删除和无内容
                        if (!_.isEmpty(this?.sourceData)) {
                            data = this.reSetFileData({ ...this.sourceData, actionFlag: ACTION_FLAG['remove'] }) || {};
                        } else {
                            data = null;
                        }
                    }
                    let formValid = false;
                    if (valid) {
                        try {
                            let res = await mainSourceForm?.submit();
                            formValid = res?.valid;
                        } catch (err) {
                            formValid = err?.valid;
                        }
                    }
                    resolve({ data, valid: !valid || formValid });
                });
            },
            getFileData(objectOid, className) {
                this.$famHttp({
                    url: '/fam/content/attachment/list',
                    method: 'GET',
                    params: {
                        objectOid: objectOid || this.oid,
                        roleType: 'PRIMARY'
                    },
                    className: className || this.className
                })
                    .then((res) => {
                        const {
                            success,
                            data: { attachmentDataVoList = [] }
                        } = res || {};
                        if (success && _.isArray(attachmentDataVoList) && attachmentDataVoList.length) {
                            const [form = {}] = attachmentDataVoList || [];

                            this.sourceData = ErdcKit.deepClone(form) || {};

                            this.$set(this.form, 'source', form?.source ?? 2);

                            this.$nextTick(() => {
                                const formConfigs = _.filter(this.formConfigs, (item) => item.field !== 'source') || [];
                                _.each(formConfigs, (item) => {
                                    this.$set(this.form, item.field, form[item.field]);
                                });
                                form?.source === 0 && (this.fileList = [form] || []);
                            });
                        } else {
                            this.$set(this.form, 'source', 2);
                        }
                    })
                    .catch(() => {
                        this.$set(this.form, 'source', 2);
                    });
            }
        }
    };
});
