/**
 * @description 结构属性组件
 */
define([
    'erdc-kit',
    'text!' + ELMP.func('erdc-document/components/PdmObjectConstruction/components/PdmObjectAttrInfo/index.html'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (ErdcKit, template, cbbUtils) {
    return {
        name: 'PdmObjectAttrInfo',
        template,
        props: {
            // 对象oid
            oid: [String],
            // 对象className
            className: [String],
            formId: [String],
            readonly: [Boolean],
            info: [Object]
        },
        components: {
            // 动态表单
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            // 附件列表
            UploadFileList: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/UploadFileList/index.js')),
            lifecyleStatus: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/LifecyleStep/index.js')),
            MainContentSource: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/MainContentSource/components/MainContent/index.js')
            )
        },
        data() {
            return {
                formData: {},
                sourceData: {},
                queryLayoutParams: {
                    name: 'DETAIL'
                    // attrRawList: [
                    //     {
                    //         attrName: 'layoutSelector',
                    //         value: 'DETAIL'
                    //     }
                    // ]
                }
            };
        },
        computed: {
            modelMapper() {
                return {
                    'containerRef': (data, { displayName, oid }) => {
                        return {
                            displayName,
                            oid
                        };
                    },
                    'typeReference': (data, { displayName }) => {
                        return displayName ?? '';
                    },
                    'classifyReference': (data, { displayName }) => {
                        return displayName || '';
                    },
                    'folderRef': (data, { displayName, oid, value }) => {
                        return {
                            displayName,
                            oid: oid || value,
                            value
                        };
                    },
                    'iterationInfo.state': (data, { displayName }) => {
                        return displayName || '';
                    },
                    'lifecycleStatus.status': (data, { displayName, oid }) => {
                        return {
                            displayName,
                            oid
                        };
                    },
                    'templateInfo.templateReference': (data, { displayName }) => {
                        return displayName;
                    },
                    'lifecycleStatus.lifecycleTemplateRef': (data, { displayName }) => {
                        return displayName;
                    },
                    // 'ownedByRef': (data, { users }) => {
                    //     return users;
                    // },
                    // 'createBy': (data, { users }) => {
                    //     return users;
                    // },
                    // 'updateBy': (data, { users }) => {
                    //     return users;
                    // },
                    'teamRef': (data, { displayName }) => {
                        return displayName;
                    },
                    'teamTemplateRef': (data, { displayName }) => {
                        return displayName;
                    },
                    'defaultTraceCode': (data, { displayName }) => {
                        return displayName ?? '';
                    },
                    'organizationRef': (data, { displayName }) => {
                        return displayName || '';
                    },
                    'securityLabel': (data, { displayName }) => {
                        return displayName ?? '';
                    },
                    'docType': (data, { displayName }) => {
                        return displayName ?? '';
                    }
                };
            }
        },
        watch: {
            info: {
                handler(newVal) {
                    if (newVal) {
                        this.$nextTick(() => {
                            this.$refs.attrInfoForm.fetchFormDataByOid(newVal.oid);
                        });
                    }
                }
            },
            deep: true
        },
        methods: {
            handleGoDetail(data, type = null) {
                cbbUtils.handleGoToSpace(data, type);
            },
            // 获取对象源数据
            baseFormData(sourceData) {
                this.sourceData = sourceData?.rawData || {};
            }
        }
    };
});
