define([
    'text!' + ELMP.resource('platform-mfe/views/application/configManage/index.html'),
    ELMP.resource('platform-mfe/api.js'),
    ELMP.resource('platform-mfe/CONST.js'),
    'erdc-kit',
    'css!' + ELMP.resource('platform-mfe/index.css')
], function (tmpl, api, CONST, FamUtils) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template: tmpl,
        components: {
            FamEmpty: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamEmpty/index.js'))
        },
        props: {
            type: {
                type: Number,
                default: 0
            },
            pkgCode: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-mfe/locale'),
                visible: false,
                appType: 'all',
                searchKey: '',
                CONST: CONST,
                defaultData: {
                    data: []
                },
                formData: {
                    data: []
                },
                originalData: [] // 保存原始数据的变量
            };
        },
        computed: {
            title() {
                const { i18nMappingObj } = this;
                return this.type === 0 ? i18nMappingObj.appConfig : i18nMappingObj.config;
            },
            noData() {
                return this.i18nMappingObj.noData;
            },
            lang() {
                return this.$store.state.i18n.lang;
            }
        },
        methods: {
            async show() {
                const self = this;
                self.clearSearch();
                self.appList = [];
                self.appList.push({
                    name: this.i18nMappingObj.allApplication,
                    value: 'all'
                });
                let params = {};
                await api.getConfigData({ pkgCode: this.pkgCode }).then((res) => {
                    if (this.type === 0) {
                        res.data.map((item) => {
                            let obj = {
                                name: item.displayName,
                                value: item.code
                            };
                            this.appList.push(obj);
                        });
                        this.appType = 'all';
                    }
                    this.defaultData.data = res.data;
                    api.getConfigValue(params).then((res) => {
                        this.defaultData.data.forEach((ele) => {
                            const metadata = ele.metadata;
                            metadata?.map((item) => {
                                item.name = item.name[this.lang] ?? item.name;
                                item.description = item.description[this.lang] ?? item.name;
                                if (item.options) {
                                    item.options.map((opt) => {
                                        opt.text = opt.text[this.lang] ?? opt.text;
                                    });
                                }
                                self.$set(item, 'value', res.data?.find((e) => e.key === item.key)?.value ?? '');
                            });
                        });
                        this.formData.data = [...this.defaultData.data];
                        this.originalData = JSON.parse(JSON.stringify(this.formData.data));
                    });
                });
                this.visible = true;
            },
            submit() {
                let params = [];
                const data = this.formData.data;
                data?.map((item) => {
                    const metadata = item.metadata;
                    if (metadata.length) {
                        metadata.map((ele) => {
                            const obj = {
                                key: ele?.key,
                                pkgCode: item.code,
                                value: ele?.value
                            };
                            params.push(obj);
                        });
                    }
                });
                api.saveConfigValue(params).then((res) => {
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: '配置成功',
                            showClose: true
                        });
                        this.visible = false;
                    }
                });
            },
            cancel() {
                this.visible = false;
            },
            changeAppType(id) {
                if (id !== 'all') {
                    const result = this.defaultData.data.filter((item) => item.code === id);
                    this.formData = { data: result };
                } else {
                    this.formData.data = [...this.defaultData.data];
                }
            },
            handleConfigSuccess(file, fileList) {
                if (file.success) {
                    this.$message({
                        message: '导入成功',
                        type: 'success'
                    });
                } else {
                    this.$message({
                        message: '导入失败',
                        type: 'success'
                    });
                }
            },
            handleRemoveConfig() {
                console.log(1);
            },
            handleExceedConfig() {
                console.log(1);
            },
            onBeforeUploadConfig(file) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (type !== '.json') {
                    this.$message({
                        message: this.i18nMappingObj.jsonTips,
                        type: 'warning'
                    });
                    return false;
                }
            },
            exportData() {
                FamUtils.downFile({
                    url: '/platform/mfe/config/export',
                    method: 'post'
                });
            },
            resetData(item) {
                item.value = item.defaultValue;
            },
            searchConfig() {
                const allData = JSON.parse(JSON.stringify(this.originalData));
                const result = allData.map((item) => {
                    const filterData = item.metadata.filter((item) => item.name.includes(this.searchKey));
                    return { ...item, metadata: filterData };
                });
                this.formData.data = result;
            },
            clearSearch() {
                this.searchKey = '';
            }
        }
    };
});
