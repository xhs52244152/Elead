define([
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-https/common-http.js')
], function (utils, store, commonHttp) {
    const ErdcKit = require('erdcloud.kit');
    return {
        name: 'projectBaselineCreate',
        template: `
            <baseline-create
                ref="baselineCreate"
                :get-form-configs="getFormConfigs"
                :is-request-folder-data="false"
                :is-request-context-data="false"
                :layout-name="layoutName"
                :set-url-config="setUrlConfig"
                :custom-cancel="goBaselineList"
                @before-submit="beforeSubmit" 
                @after-submit="goBaselineList" 
            ></baseline-create>
        `,
        components: {
            BaselineCreate: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/views/create/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('project-baseline/baseline-create/locale/index.js'),
                i18nMappingObj: {
                    duplicateBaselineName: this.getI18nByKey('duplicateBaselineName'),
                    number: this.getI18nByKey('number'),
                    type: this.getI18nByKey('type'),
                    name: this.getI18nByKey('name'),
                    pleaseSelectObjectType: this.getI18nByKey('pleaseSelectObjectType')
                },
                code: ''
            };
        },
        computed: {
            layoutName() {
                const layoutNames = {
                    baselineUpdate: 'PPM_UPDATE',
                    baselineCreate: 'PPM_CREATE'
                };
                return layoutNames[this.nameInner] || '';
            },
            nameInner() {
                return this.$route.meta?.nameInner || '';
            }
        },
        methods: {
            setUrlConfig(data) {
                let params = { unSubPrefix: true, url: '/ppm/baseline/create', className: '' };
                data.data.appName = 'PPM';
                return this.nameInner === 'baselineCreate' ? { ...data, ...params } : data;
            },
            getFormConfigs(config, type) {
                const { i18nMappingObj } = this;
                let _this = this;
                let formConfigs = [
                    {
                        field: 'objectType',
                        component: 'custom-select',
                        label: i18nMappingObj.type,
                        labelLangKey: 'component',
                        disabled: false,
                        required: true,
                        readonly: false,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: i18nMappingObj.pleaseSelectObjectType,
                            placeholderLangKey: 'pleaseSelect',
                            defaultSelectFirst: true,
                            multiple: true,
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/dictionary/tree/BaselineObjectType',
                                    viewProperty: 'displayName',
                                    valueProperty: 'value',
                                    method: 'GET',
                                    params: {
                                        status: 1
                                    }
                                }
                            }
                        },
                        listeners: {
                            callback: _.debounce((data) => {
                                if (data.selected.length === 0) {
                                    _this.setCodeData();
                                }
                            }, 1000)
                        },
                        col: 12
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: i18nMappingObj.name,
                        disabled: false,
                        required: true,
                        validators: [],
                        // 只读
                        readonly: false,
                        props: {
                            maxlength: 64
                        },
                        col: 12
                    },
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: i18nMappingObj.number,
                        disabled: false,
                        required: true,
                        validators: [],
                        // 只读
                        readonly: true,
                        props: {
                            maxlength: 64
                        },
                        col: 12
                    }
                ];
                // 编辑不需要展示对象类型
                type === 'UPDATE' && formConfigs.splice(0, 1);
                return formConfigs;
            },
            beforeSubmit(data, next) {
                let pid = this.$route.query.pid;
                this.$famHttp({
                    url: '/baseline/name/unique',
                    className: store.state.classNameMapping.baseline,
                    params: {
                        persistableRef: pid,
                        oid: this.$route.query.oid,
                        name: _.find(data.attrRawList, { attrName: 'name' })?.value || ''
                    }
                }).then((res) => {
                    if (res.data) {
                        if (this.nameInner === 'baselineCreate') {
                            data.attrRawList.push({
                                attrName: 'identifierNo',
                                value: this.code
                            });
                        }
                        data.attrRawList.push({
                            attrName: 'projectRef',
                            value: this.$route.query.pid
                        });
                        data.attrRawList.push({
                            attrName: 'containerRef',
                            value: utils.getContainerRef()
                        });
                        if (this.$route.meta?.nameInner === 'baselineCreate') {
                            let objectType = data.attrRawList.find((item) => item.attrName === 'objectType');
                            objectType.value = objectType.value.join(',');
                        }
                        next();
                    } else {
                        this.$message({
                            type: 'error',
                            message: this.i18nMappingObj.duplicateBaselineName
                        });
                    }
                });
            },
            goBaselineList() {
                this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                    this.$router.push({
                        path: 'baseline/list',
                        query: {
                            pid: this.$route.query.pid
                        }
                    });
                });
            },
            setCodeData() {
                const layoutForm = this.$refs?.baselineCreate?.$refs?.baselineForm?.$refs?.layoutForm;
                if (layoutForm) {
                    this.$famHttp({
                        url: '/fam/type/typeDefinition/findAccessTypes',
                        params: {
                            typeName: 'erd.cloud.cbb.baseline.entity.Baseline',
                            containerRef: utils.getContainerRef(),
                            accessControl: false
                        },
                        appName: 'PPM'
                    }).then(async (res) => {
                        let typeOid = res?.data[0]?.typeOid || '';
                        let code = await commonHttp.getCode(typeOid);
                        this.code = code;
                        this.$set(layoutForm.form, 'identifierNo', code);
                    });
                }
            }
        }
    };
});
