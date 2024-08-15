define([
    'text!' + ELMP.resource('platform-mfe/views/application/addForm/index.html'),
    ELMP.resource('platform-mfe/CONST.js'),
    ELMP.resource('platform-mfe/api.js')
], function (tmpl, CONST, api) {
    const ErdcKit = require('erdc-kit');

    const formDefault = {
        type: '0',
        appfile: '',
        name: {},
        code: '',
        desc: '',
        source: '',
        address: '',
        group: '',
        sort: '',
        icon: ''
    };

    return {
        template: tmpl,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-mfe/locale'),
                CONST: CONST,
                visible: false,
                formData: Object.assign({}, formDefault),
                fileList: [],
                isEdit: false,
                rowList: {},
                groupList: [],
                layoutList: [],
                appFileList: [],
                sourceFileList: [],
                appList: [],
                groupRead: false
            };
        },
        computed: {
            title() {
                const { i18nMappingObj } = this;
                return this.isEdit ? i18nMappingObj.editApp : i18nMappingObj.createApp;
            },
            getImage() {
                return ErdcKit.imgUrlCreator(this.formData.icon);
            },
            formConfigs() {
                const { isEdit, formData, i18nMappingObj, groupRead } = this;
                const config = [
                    {
                        field: 'type',
                        component: 'fam-radio',
                        label: i18nMappingObj.type,
                        required: !isEdit,
                        col: 24,
                        readonly: isEdit,
                        props: {
                            options: [
                                {
                                    label: i18nMappingObj.innerApp,
                                    value: '0'
                                },
                                {
                                    label: i18nMappingObj.outLink,
                                    value: '1'
                                }
                            ]
                        }
                    },
                    {
                        field: 'appfile',
                        label: i18nMappingObj.microApplication,
                        required: !isEdit,
                        col: 24,
                        hidden: formData.type === '1' || isEdit,
                        validators: [{ required: true, message: i18nMappingObj.appTips, trigger: 'change' }],
                        slots: {
                            component: 'appfile'
                        }
                    },
                    {
                        field: 'pkgVersion',
                        component: 'erd-input',
                        label: i18nMappingObj.versionNum,
                        required: false,
                        hidden: !(formData.type === '0' && isEdit),
                        col: 24,
                        readonly: true
                    },
                    {
                        field: 'name',
                        component: 'FamI18nbasics',
                        label: i18nMappingObj.name,
                        required: true,
                        hidden: formData.type === '0' && !isEdit,
                        col: 24,
                        props: {
                            placeholder: '请输入应用名称'
                        }
                    },
                    {
                        field: 'code',
                        component: 'erd-input',
                        label: i18nMappingObj.code,
                        required: formData.type === '1' && !isEdit,
                        col: 24,
                        readonly: formData.type === '0' || isEdit,
                        hidden: formData.type === '0' && !isEdit,
                        props: {
                            placeholder: i18nMappingObj.codePlac
                        }
                    },
                    {
                        field: 'desc',
                        component: 'erd-input',
                        label: i18nMappingObj.versionDesc,
                        required: false,
                        hidden: formData.type === '1',
                        col: 24,
                        props: {
                            type: 'textarea',
                            rows: 4,
                            maxlength: 1000
                        }
                    },
                    {
                        field: 'source',
                        label: i18nMappingObj.sourcePack,
                        required: false,
                        hidden: formData.type === '1',
                        col: 24,
                        slots: {
                            component: 'source'
                        }
                    },
                    {
                        field: 'address',
                        component: 'erd-input',
                        label: i18nMappingObj.address,
                        required: false,
                        col: 24,
                        hidden: formData.type === '0' && !isEdit,
                        props: {
                            placeholder: i18nMappingObj.addressPlac
                        }
                    },
                    {
                        field: 'group',
                        label: i18nMappingObj.groupForm,
                        required: false,
                        readonly: groupRead,
                        col: 12,
                        slots: {
                            component: 'group'
                        }
                    },
                    {
                        field: 'sort',
                        label: i18nMappingObj.sort,
                        required: false,
                        col: 12,
                        slots: {
                            component: 'sort'
                        }
                    },
                    {
                        field: 'icon',
                        label: i18nMappingObj.icon,
                        required: false,
                        col: 24,
                        slots: {
                            component: 'icon'
                        }
                    }
                ];
                return config;
            }
        },
        mounted() {
            this.getAppData();
        },
        methods: {
            async show(row) {
                this.rowList = row;
                this.isEdit = Object.keys(row).length !== 0;
                await this.getLayoutList();
                await this.getGroupList();
                if (this.isEdit) {
                    this.formData.type = this.rowList?.innerApp ? '0' : '1';
                    this.formData.name = this.rowList?.nameI18nJson || {};
                    this.formData.code = this.rowList?.code || '';
                    this.formData.icon = this.rowList?.iconFileId || '';
                    this.formData.address = this.rowList?.url || '';
                    this.formData.sort = this.rowList?.sortNum || '';
                    this.formData.desc = this.rowList?.versionDesc || '';
                    this.formData.pkgVersion = this.rowList?.pkgVersion || '';
                    if (this.rowList.appId) {
                        this.groupRead = true;
                        this.formData.group = this.getAppName(this.rowList.appId);
                    } else {
                        this.groupRead = false;
                        const result = this.groupList.filter((item) => item.value === this.rowList?.groupId);
                        if (result.length > 0) {
                            this.formData.group = this.rowList?.groupId;
                        } else {
                            this.formData.group = '';
                        }
                    }
                } else {
                    this.formData = JSON.parse(JSON.stringify(formDefault));
                    this.formData.group = '';
                    this.groupRead = false;
                }
                this.visible = true;
            },
            async getGroupList() {
                this.groupList = [];
                await api.getGroupData().then((resp) => {
                    if (resp.data.length > 0) {
                        for (let i = 0; i < resp.data.length; i++) {
                            const obj = {
                                name: resp.data[i].nameI18nJson?.zh_cn || resp.data[i].nameI18nJson?.value,
                                value: resp.data[i].id
                            };
                            this.groupList.push(obj);
                        }
                    }
                });
            },
            async getLayoutList() {
                this.layoutList = [];
                await this.$famHttp({
                    url: '/platform/mfe/apps/page',
                    method: 'GET',
                    data: {
                        pageIndex: 1,
                        pageSize: 1000,
                        pkgType: 'erdc-layout'
                    }
                }).then((resp) => {
                    if (resp.data.records?.length > 0) {
                        for (let i = 0; i < resp.data.records?.length; i++) {
                            const temp = resp.data.records[i];
                            const obj = {
                                name: temp.displayName,
                                value: temp.code
                            };
                            this.layoutList.push(obj);
                        }
                    }
                });
            },
            submit() {
                this.$refs.addForm.submit().then(() => {
                    let params = {
                        sortNum: this.formData.sort
                    };
                    if (this.formData.icon) {
                        params.iconFileId = this.formData.icon;
                    }
                    if (!this.isEdit) {
                        if (this.formData.type === '1') {
                            this.$famHttp({
                                url: '/platform/mfe/apps/add',
                                method: 'post',
                                data: {
                                    nameI18nJson: this.formData.name?.value,
                                    code: this.formData.code,
                                    groupId: this.formData.group,
                                    url: this.formData.address,
                                    sortNum: this.formData.sort,
                                    iconFileId: this.formData.icon
                                }
                            }).then((resp) => {
                                if (resp.data) {
                                    this.$message({
                                        type: 'success',
                                        message: '保存成功',
                                        showClose: true
                                    });
                                    this.$emit('done');
                                    this.$nextTick(() => {
                                        this.clearData();
                                    });
                                    this.visible = false;
                                } else {
                                    this.$message({
                                        type: 'error',
                                        message: resp.message,
                                        showClose: true
                                    });
                                }
                            });
                        } else {
                            params = {
                                ...params,
                                id: this.formData.appfile,
                                versionDesc: this.formData.desc
                            };
                            if (this.formData.source !== '') {
                                params.sourceCodeFileId = this.formData.source;
                            }
                            if (!this.groupRead) {
                                params.groupId = this.formData.group;
                            }
                            this.editForm(params);
                        }
                    } else {
                        if (this.formData.type === '0') {
                            params = {
                                ...params,
                                id: this.rowList.id,
                                versionDesc: this.formData.desc,
                                nameI18nJson: this.formData.name?.value,
                                url: this.formData.address
                            };
                            if (this.formData.source !== '') {
                                params.sourceCodeFileId = this.formData.source;
                            }
                            if (!this.groupRead) {
                                params.groupId = this.formData.group;
                            }
                        } else {
                            params = {
                                ...params,
                                id: this.rowList.id,
                                nameI18nJson: this.formData.name?.value,
                                url: this.formData.address,
                                groupId: this.formData.group
                            };
                        }
                        this.editForm(params);
                    }
                });
            },
            editForm(params) {
                api.updateInform(params).then((resp) => {
                    if (resp.data) {
                        this.$message({
                            type: 'success',
                            message: '保存成功',
                            showClose: true
                        });
                        this.$emit('done');
                        this.$nextTick(() => {
                            this.clearData();
                        });
                        this.visible = false;
                    }
                });
            },
            clearData() {
                this.appFileList = [];
                this.fileList = [];
                this.sourceFileList = [];
                this.$refs.addForm?.clearValidate();
            },
            cancel() {
                this.clearData();
                this.visible = false;
            },
            // 图标上传成功
            handleSuccess(file, response, fileList) {
                if (file.success) {
                    this.fileList = fileList;
                    this.formData.icon = file.data;
                } else {
                    this.$message({
                        message: file.message,
                        type: 'error'
                    });
                    this.handleRemoveIcon();
                }
            },
            // 删除图标
            handleRemoveIcon() {
                this.formData.icon = '';
                this.fileList = [];
            },
            onBeforeUploadIcon(file) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (type !== '.ico') {
                    this.$message({
                        message: this.i18nMappingObj.icoTips,
                        type: 'warning'
                    });
                    return false;
                }
                if (file.size / 1024 / 1024 > 1) {
                    this.$message({
                        message: this.i18nMappingObj.imgSizeTips,
                        type: 'warning'
                    });
                    return false;
                }
            },
            // 微应用上传成功
            handleAppSuccess(file, response, fileList) {
                if (file.success) {
                    this.appFileList = fileList;
                    this.formData.appfile = file.data;
                    api.getAppDetail(file.data).then((res) => {
                        if (res.success) {
                            if (res.data.appId) {
                                this.groupRead = true;
                                this.formData.group = this.getAppName(res.data.appId);
                            }
                        }
                    });
                } else {
                    this.$message({
                        message: file.message,
                        type: 'error'
                    });
                    this.handleRemoveApp();
                }
            },
            getAppData() {
                api.getAppList().then((res) => {
                    if (res.success) {
                        this.appList = res.data;
                    }
                });
            },
            getAppName(id) {
                return this.appList.find((item) => item.identifierNo === id)?.displayName;
            },
            handleRemoveApp() {
                this.appFileList = [];
                this.formData.appfile = '';
                this.groupRead = false;
                this.formData.group = '';
            },
            onBeforeUploadApp(file) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (type !== '.tgz') {
                    this.$message({
                        message: this.i18nMappingObj.tgzTips,
                        type: 'warning'
                    });
                    return false;
                }
            },
            // 源码包上传成功
            handleSourceSuccess(file, response, fileList) {
                if (file.success) {
                    this.sourceFileList = fileList;
                    this.formData.source = file.data;
                } else {
                    this.$message({
                        message: file.message,
                        type: 'error'
                    });
                    this.handleRemoveSource();
                }
            },
            handleRemoveSource() {
                this.formData.source = '';
                this.sourceFileList = [];
            },
            onBeforeUploadSource(file) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (['.zip', '.tgz'].indexOf(type) === -1) {
                    this.$message({
                        message: this.i18nMappingObj.zipTips,
                        type: 'warning'
                    });
                    return false;
                }
            }
        }
    };
});
