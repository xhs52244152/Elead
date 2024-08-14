define([
    'text!' + ELMP.func('erdc-ppm-project-change/components/BusinessForm/index.html'),
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.func('erdc-ppm-project-change/style.css')
], function (template, ppmStore) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        props: {
            businessData: {
                type: Array,
                default: () => []
            },
            processInfos: {
                type: Object,
                default: () => {}
            },
            draftInfos: {
                type: Object,
                default: () => {}
            },
            processStep: String
        },
        components: {
            EffectData: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-project-change/components/EffectData/index.js')),
            ProjectInfo: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-project-change/components/ProjectInfo/index.js')),
            ProjectPlan: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-project-change/components/ProjectPlan/index.js')),
            TeamInfo: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-project-change/components/TeamInfo/index.js')),
            CommonForm: ErdcKit.asyncComponent(ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-ppm-project-change/locale/index.js'),
                panelUnfold: true,
                editableAttr: [],
                changeCategoryOpt: [],
                currentComponent: {},
                projectBaseInfoFormData: {},
                className: ppmStore.state.classNameMapping.project,
                components: {},
                changeFormData: {
                    reason: '',
                    countermeasure: ''
                }
            };
        },
        computed: {
            // 业务对象是否可编辑
            readonly() {
                return !!(
                    this.processInfos?.nodeMap &&
                    this.processInfos?.nodeMap?.node?.highLightedActivities?.[0] !== 'resubmit'
                );
            },
            componentsMap() {
                return {
                    // 项目信息变更
                    PROJECT_ATTRIBUTE: {
                        componentName: 'ProjectInfo',
                        props: {
                            businessData: this.businessData,
                            processInfos: this.processInfos
                        },
                        eventMethods: {},
                        ref: 'projectInfo'
                    },
                    // 计划变更
                    TASK: {
                        componentName: 'ProjectPlan',
                        props: {
                            businessData: this.businessData,
                            processInfos: this.processInfos
                        },
                        eventMethods: {},
                        ref: 'projectPlan'
                    },
                    // 团队变更
                    TEAM: {
                        componentName: 'TeamInfo',
                        props: {
                            businessData: this.businessData,
                            processInfos: this.processInfos
                        },
                        eventMethods: {},
                        ref: 'TeamInfo'
                    },
                    OTHER: {
                        componentName: '',
                        props: {},
                        eventMethods: {},
                        ref: ''
                    }
                };
            },
            businessOid() {
                return this.projectBaseInfoFormData.oid;
            },
            formSlots() {
                return {
                    'change-form': ErdcKit.asyncComponent(
                        ELMP.func('erdc-ppm-project-change/components/BusinessForm/components/ChangeForm/index.js')
                    )
                };
            }
        },
        watch: {
            businessData: {
                handler(nval, oval) {
                    if (
                        ((JSON.stringify(this.projectBaseInfoFormData) === '{}' || nval?.[0]?.oid !== oval?.[0]?.oid) &&
                            nval.length) ||
                        nval?.[0]?.changeContent !== oval?.[0]?.changeContent
                    ) {
                        this.projectBaseInfoFormData = ErdcKit.deepClone(nval[0]?.projectBasicInfo || nval[0]);
                        let keys =
                            nval[0]?.changeObject?.attrRawList?.find((item) => item.attrName === 'changeContent')
                                ?.value ||
                            nval[0]?.changeContent ||
                            '';
                        // 清空组件信息，否则会保留上一次的组件信息
                        this.components = {};
                        keys.split(',').forEach((item) => {
                            this.$set(this.components, item, this.componentsMap[item]);
                        });
                    }
                },
                immediate: true,
                deep: true
            }
        },
        mounted() {},
        methods: {
            validate(type) {
                if (this.readonly) {
                    return Promise.resolve(this.businessData);
                }
                let changeFormRef = this.$refs?.projectBaseInfoForm?.$refs['change-form']?.[0]?.initFormRef;
                const changeObjectValidate = () => {
                    return new Promise((resolve, reject) => {
                        if (type === 'draft') {
                            resolve(changeFormRef.serializeEditableAttr());
                        } else {
                            changeFormRef.$refs.dynamicForm
                                .validate()
                                .then(() => {
                                    resolve();
                                })
                                .catch(() => {
                                    reject(false);
                                });
                        }
                    });
                };
                const effectDataValidate = this.$refs.effectData.validate;
                let arr = [effectDataValidate(), changeObjectValidate()];
                Object.keys(this.components).forEach((key) => {
                    if (this.components[key].componentName) {
                        const currentRef = this.components[key].ref;
                        arr.push(this.$refs[currentRef]?.validate(type));
                    }
                });
                return new Promise((resolve, reject) => {
                    Promise.all(arr)
                        .then((resArr) => {
                            let attrRawList = changeFormRef.serializeEditableAttr();
                            const {
                                changeContentName,
                                projectBasicInfo,
                                changeContent,
                                changeObject,
                                containerRef,
                                id,
                                roleBObjectRef
                            } = this.businessData[0];
                            const contentName =
                                changeContentName ||
                                projectBasicInfo?.changeFormData.find((item) => item.attrName === 'changeContent')
                                    .value;
                            const contentValue =
                                changeContent ||
                                changeObject.attrRawList.find((item) => item.attrName === 'changeContent').value;

                            const attrItem = [
                                {
                                    attrName: 'projectRef',
                                    value: this.projectBaseInfoFormData.oid || this.projectBaseInfoFormData.projectRef
                                },
                                {
                                    attrName: 'changeContent',
                                    value: contentValue
                                }
                            ];
                            attrRawList.push(...attrItem);
                            let result = [
                                {
                                    ...resArr[0], //影响数据
                                    // 回显项目基础信息数据
                                    projectBasicInfo: {
                                        changeFormData: [
                                            ...changeFormRef.serializeEditableAttr(),
                                            {
                                                attrName: 'changeContent',
                                                value: contentName
                                            }
                                        ],
                                        oid: this.projectBaseInfoFormData.oid,
                                        containerRef: containerRef || projectBasicInfo.containerRef || '',
                                        id: id || projectBasicInfo.id || ''
                                    },
                                    // 后端需要的项目基础信息数据
                                    changeObject: {
                                        oid: roleBObjectRef || '',
                                        attrRawList
                                    },
                                    oid: this.projectBaseInfoFormData.oid || this.projectBaseInfoFormData.projectRef
                                }
                            ];
                            const projectData = resArr[2] || {};
                            const taskData = resArr[3] || {};
                            const teamData = resArr[4] || {};
                            if (Object.keys(this.components).length) {
                                result = [{ ...result[0], ...projectData, ...taskData, ...teamData }];
                            }
                            resolve(result);
                        })
                        .catch((error) => {
                            if (_.isArray(error)) {
                                reject(error);
                            } else {
                                reject([{ valid: false }]);
                            }
                        });
                });
            },
            onFieldChange({ field }, value) {
                if (['reason', 'countermeasure'].includes(field)) {
                    this.changeFormData[field] = value;
                }
                if (field === 'changeType') {
                    this.$set(this.components, value, this.componentsMap[value]);
                }
            }
        }
    };
});
