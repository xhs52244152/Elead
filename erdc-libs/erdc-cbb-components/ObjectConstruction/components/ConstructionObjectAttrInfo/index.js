/**
 * @description 结构属性组件
 */
define([
    'text!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionObjectAttrInfo/index.html'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, cbbUtils) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ConstructionObjectAttrInfo',
        template,
        props: {
            // 对象oid
            oid: [String],
            // 对象className
            className: [String],
            formId: [String],
            readonly: [Boolean],
            info: [Object],
            isRoot: Boolean
        },
        components: {
            // 动态表单
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            // 附件列表
            UploadFileList: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/UploadFileList/index.js')),
            lifecyleStatus: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/LifecyleStep/index.js'))
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
                    'classifyReference': (data, { displayName, oid }) => {
                        return {
                            displayName,
                            oid
                        };
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
                    'securityLabel': (data, { displayName }) => {
                        return displayName ?? '';
                    },
                    'defaultTraceCode': (data, { displayName }) => {
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
                },
                deep: true
            }
        },
        created() {
            this.vm = this;
        },
        methods: {
            refresh(oid) {
                this.oid = oid;
                this.$refs.attrInfoForm.fetchFormDataByOid(oid);

                // 如果是根节点，还需要刷新当前对象
                if (this.isRoot) {
                    this.$router.replace({
                        path: this.$route.path,
                        query: {
                            ...(this.$route.query || {}),
                            oid
                        }
                    });
                }
                // 局部刷新节点信息
                else this.$emit('refreshNode', { oid, id: oid.split(':')?.[2] });
            },
            // 进入资源库空间
            goFolder(row) {
                cbbUtils.handleGoToSpace(row, 'folder');
            },
            handleGoDetail(data) {
                cbbUtils.handleGoToSpace(data);
            },
            // 获取对象源数据
            baseFormData(sourceData) {
                this.sourceData = sourceData?.rawData || {};
            }
        }
    };
});
