define([
    ELMP.resource('platform-storage/api.js'),
    'text!' + ELMP.resource('platform-storage/views/StorageConfiguration/index.html'),
    'css!' + ELMP.resource('platform-storage/views/StorageConfiguration/index.css')
], function (api, template) {
    return {
        template,
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'save',
                    'reset',
                    'basicInfo',
                    'storeConfig',
                    'toolConfig',
                    'appCode',
                    'appName',
                    'videoPlay',
                    'audioPlay',
                    'imgPreview',
                    'pdfPreview',
                    'storageBuket',
                    'storageType',
                    'pleaseEnter',
                    'fileSuffix',
                    'func',
                    'playControl',
                    'scriptEditTool',
                    'onlinePreview',
                    'onlineEdit',
                    'onlinePlay',
                    'requestSuccess',
                    'pluginAddress',
                    'appManage'
                ]),

                clientHeight: document.body.clientHeight - 152,

                basicUnfold: true,
                storeUnfold: true,
                toolUnfold: true,

                storeTypes: [],
                appList: [], // 应用列表
                selectedApp: {},
                cacheData: null,

                labelWidth: '190px',
                basic: {
                    code: '',
                    name: ''
                },
                store: {
                    bucket: '',
                    storageType: ''
                },
                onlyoffice: {
                    edit: false,
                    host: '',
                    support: '',
                    view: false
                },
                video: {
                    edit: false,
                    control: false,
                    support: '',
                    view: false
                },
                audio: {
                    edit: false,
                    control: false,
                    support: '',
                    view: false
                },
                script: {
                    edit: false,
                    support: '',
                    view: false
                },
                image: {
                    edit: false,
                    support: '',
                    view: false
                },
                pdf: {
                    edit: false,
                    support: '',
                    view: false
                }
            };
        },
        computed: {
            storeConfig() {
                const { i18nMappingObj, toLowerCase } = this;

                return [
                    {
                        field: 'storageType',
                        label: i18nMappingObj.storageType,
                        required: true,
                        slots: {
                            component: 'storageType'
                        },
                        col: 24
                    },
                    {
                        field: 'bucket',
                        component: 'erd-input',
                        label: i18nMappingObj.storageBuket,
                        props: {
                            clearable: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.storageBuket)}`
                        }
                    }
                ];
            },
            onlyofficeConfig() {
                const { i18nMappingObj, toLowerCase } = this;

                return [
                    {
                        field: 'host',
                        component: 'erd-input',
                        label: i18nMappingObj.pluginAddress,
                        props: {
                            clearable: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.pluginAddress)}`
                        }
                    }
                ];
            },
            commonConfig() {
                const { i18nMappingObj } = this;
                return [
                    {
                        field: 'control',
                        component: 'erd-switch',
                        label: i18nMappingObj.playControl
                    }
                ];
            }
        },
        created() {
            this.getStoreTypes();
            this.getAppList();
        },
        methods: {
            toLowerCase(str) {
                return String.prototype.toLowerCase.call(str);
            },
            handleAppChange(id) {
                const app = this.appList.find((item) => item.id === id);
                if (app) {
                    this.selectedApp = app;
                    this.getAppInfoByCode(app);
                }
            },
            getStoreTypes() {
                api.other.dsList().then((res) => {
                    if (res.success) {
                        this.storeTypes = res.data;
                    }
                });
            },
            getAppList() {
                api.app.list().then((res) => {
                    if (res.success) {
                        this.appList = res.data;
                        if (this.appList.length) {
                            this.selectedApp = this.appList[0];
                            this.getAppInfoByCode(this.selectedApp);
                        }
                    }
                });
            },
            getAppInfoByCode(app) {
                api.app.get(app.identifierNo).then((res) => {
                    if (res.success) {
                        const data = res.data ?? {};
                        this.cacheData = data;
                        this.setData(data);
                    }
                });
            },
            setData(data) {
                const { selectedApp: app } = this;
                // 基本信息
                this.basic.code = app.identifierNo;
                this.basic.name = app.displayName;

                // 存储配置
                const store = data.config.store ?? {};
                this.store = Object.assign(this.store, store);
                // this.store.bucket = store.bucket ?? '';
                // this.store.storageType = store.storageType ?? '';

                // 工具配置
                const tool = data.config.tool ?? {};
                const { onlyoffice = {}, video = {}, audio = {}, image = {}, pdf = {}, script = {} } = tool;

                this.onlyoffice = Object.assign(this.onlyoffice, onlyoffice);
                this.video = Object.assign(this.video, video);
                this.audio = Object.assign(this.audio, audio);
                this.image = Object.assign(this.image, image);
                this.pdf = Object.assign(this.pdf, pdf);
                this.script = Object.assign(this.script, script);
            },
            handleApply() {
                // 只需要校验存储配置表单
                this.$refs.storeForm.submit().then(({ data, valid }) => {
                    if (valid) {
                        const { i18nMappingObj, store, audio, image, onlyoffice, script, video, pdf, selectedApp } =
                            this;

                        const config = {
                            store,
                            tool: {
                                audio,
                                image,
                                onlyoffice,
                                script,
                                video,
                                pdf
                            }
                        };
                        api.app.save(selectedApp.identifierNo, config).then((res) => {
                            if (res.success) {
                                this.$message({
                                    type: 'success',
                                    message: i18nMappingObj.requestSuccess
                                });
                            }
                        });
                    }
                });
            },
            handleReset() {
                if (this.cacheData) {
                    this.setData(this.cacheData);
                }
            }
        }
    };
});
