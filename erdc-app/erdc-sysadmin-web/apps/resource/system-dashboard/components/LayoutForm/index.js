define([
    'text!' + ELMP.resource('system-dashboard/components/LayoutForm/index.html'),
    'css!' + ELMP.resource('system-dashboard/components/LayoutForm/index.css')
], function (tmpl) {
    const defaultFormData = {
        nameI18nJson: {},
        descriptionI18nJson: {},
        state: 'STARTED',
        appName: ''
    };
    function convertUpdateToFormData(formConfig, rawData) {
        let newRowData = {};
        formConfig.forEach(function (i) {
            if (rawData[i.field]) {
                if (_.isObject(rawData[i.field].value)) {
                    newRowData[i.field] = {
                        attrName: rawData[i.field].attrName,
                        value: rawData[i.field].value
                    };
                } else {
                    newRowData[i.field] = rawData[i.field].value;
                }
            }
        });
        return newRowData;
    }
    return {
        template: tmpl,
        props: {
            excludeField: Array,
            oid: String,
            layoutType: {
                type: String,
                default: 'PERSONAL'
            },
            resourceRef: String,
            appName: String
        },
        watch: {
            oid: {
                handler: function () {
                    this.reInit();
                    if (this.oid) {
                        this.loadLayoutDetail();
                    }
                },
                immediate: true
            }
        },
        components: {},
        computed: {
            menuResources: function () {
                return this.$store.state.route.allResourceTree;
            },
            appList: function () {
                if (_.isEmpty(this.appName) || this.appName.toLowerCase() === 'all') {
                    return this.$store.state.app.appNames || [];
                } else {
                    return this.$store.state.app.appNames.filter((i) => i.identifierNo === this.appName);
                }
            },
            allConfig: function () {
                return [
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.name,
                        col: this.resourceRef ? 24 : 12,
                        required: true,
                        props: {
                            maxlength: 60
                        }
                    },
                    {
                        field: 'resourceRef',
                        component: 'erd-cascader',
                        label: this.i18nMappingObj.relateMenu,
                        col: 12,
                        required: true,
                        props: {
                            'options': this.menuResources,
                            'show-all-levels': true,
                            'props': { value: 'oid', label: 'displayName' }
                        }
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.desc,
                        props: {
                            type: 'textarea'
                        },
                        col: 24
                    },
                    {
                        field: 'state',
                        component: 'fam-radio',
                        label: this.i18nMappingObj.status,
                        props: {
                            options: [
                                {
                                    label: this.i18nMappingObj.enable,
                                    value: 'STARTED'
                                },
                                {
                                    label: this.i18nMappingObj.disable,
                                    value: 'BANNED'
                                }
                            ]
                        },
                        col: 12
                    },

                    {
                        field: 'appName',
                        label: this.i18nMappingObj.app,
                        slots: {
                            component: 'appName'
                        },
                        col: this.resourceRef ? 24 : 12
                    }
                ];
            },
            formConfigs: function () {
                let excludeField = this.excludeField || [];
                if (this.resourceRef) {
                    excludeField.push('resourceRef');
                }
                return this.allConfig.filter((i) => excludeField.indexOf(i.field) === -1);
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'system-dashboard'),
                i18nMappingObj: {
                    create: this.getI18nByKey('创建'),
                    baseMsg: this.getI18nByKey('基础信息'),
                    name: this.getI18nByKey('名称'),
                    desc: this.getI18nByKey('描述'),
                    status: this.getI18nByKey('状态'),
                    app: this.getI18nByKey('应用'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('停用'),
                    relateMenu: this.getI18nByKey('关联菜单')
                },
                layoutClass: 'erd.cloud.dashboard.entity.DashboardLayout',
                formData: Object.assign(
                    {
                        oid: this.oid,
                        layoutType: this.layoutType,
                        resourceRef: this.resourceRef
                    },
                    defaultFormData
                ),
                baseInfoFold: true,
                currentLan: window.LS.get('lang_current')
            };
        },
        methods: {
            reInit: function () {
                let appName = '';
                if (
                    _.some(this.appList, (i) => {
                        return i.identifierNo === 'plat';
                    })
                ) {
                    appName = 'plat';
                } else if (this.appList && this.appList.length) {
                    appName = this.appList[0].identifierNo;
                }
                this.formData = Object.assign(
                    {
                        oid: this.oid,
                        layoutType: this.layoutType,
                        resourceRef: this.resourceRef
                    },
                    defaultFormData,
                    {
                        appName
                    }
                );
                this.$nextTick(function () {
                    this.$refs.form?.clearValidate();
                });
            },
            loadLayoutDetail() {
                var self = this;
                this.$famHttp({
                    url: '/fam/attr',
                    params: {
                        className: this.layoutClass,
                        oid: this.oid
                    }
                }).then(function (resp) {
                    if (resp.success) {
                        var formData = convertUpdateToFormData(self.allConfig, resp.data.rawData);
                        formData.resourceRef =
                            'OR:' + resp.data.rawData.resourceKey.value + ':' + resp.data.rawData.resourceId.value;
                        Object.assign(self.formData, formData);
                    }
                });
            },
            submit() {
                var self = this;
                return this.$refs.form.submit().then((validateResult) => {
                    if (validateResult.valid) {
                        let data = Object.assign({}, this.formData);
                        if (self.resourceRef) {
                            data.resourceRef = self.resourceRef;
                        } else {
                            _.isArray(data.resourceRef) &&
                                data.resourceRef.length > 0 &&
                                (data.resourceRef = data.resourceRef[data.resourceRef.length - 1]);
                        }
                        var rowList = [];
                        _.each(data, function (value, key) {
                            rowList.push({
                                attrName: key,
                                value: value
                            });
                        });
                        return this.$famHttp({
                            url: data.oid ? '/fam/update' : '/fam/create',
                            method: 'post',
                            data: {
                                className: this.layoutClass,
                                attrRawList: rowList,
                                oid: data.oid
                            }
                        });
                    }
                });
            }
        },
        created() {
            this.reInit();
        },
        mounted() {}
    };
});
