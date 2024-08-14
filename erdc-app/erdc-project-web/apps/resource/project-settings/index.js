define([
    'text!' + ELMP.resource('project-settings/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('project-settings/style.css')
], function (template, ErdcKit) {
    return {
        template,
        data() {
            return {
                isSaving: false,
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nPath: ELMP.resource('project-settings/locale/index.js'),
                selectVal: {
                    predecessorLinkCheck: {
                        type: 'predecessorLinkCheck',
                        value: false
                    },
                    milestoneDurationToBeZero: {
                        type: 'milestoneDurationToBeZero',
                        value: true
                    },
                    childEffectParentComplete: {
                        type: 'childEffectParentComplete',
                        value: true
                    },
                    associatedVerificationType: {
                        type: 'associatedVerificationType',
                        value: true
                    },
                    milestoneLightNotice: {
                        type: 'milestoneLightNotice',
                        value: {
                            available: true,
                            lightGreenNum: '0',
                            lightRedNum: '0',
                            lightYellowNum: '0'
                        }
                    },
                    projectTaskLightNotice: {
                        type: 'projectTaskLightNotice',
                        value: {
                            available: true,
                            lightGreenNum: '0',
                            lightRedNum: '0',
                            lightYellowNum: '0'
                        }
                    },
                    projectLightNotice: {
                        type: 'projectLightNotice',
                        value: {
                            available: true,
                            lightGreenNum: '0',
                            lightRedNum: '0',
                            lightYellowNum: '0'
                        }
                    }
                },
                filedArr: ['milestoneLightNotice', 'projectTaskLightNotice', 'projectLightNotice'],
                singleType: [
                    'predecessorLinkCheck',
                    'childEffectParentComplete',
                    'milestoneDurationToBeZero',
                    'associatedVerificationType'
                ],
                backData: {} // 接口返回是数据存下来，保存时会用到里边的部分数据
            };
        },
        created() {
            this.getData();
        },
        computed: {
            oid() {
                return this.$route.query.pid;
            },
            configs() {
                let { i18n } = this;
                return [
                    {
                        name: i18n.preTaskConstraint,
                        filed: 'predecessorLinkCheck',
                        data: [
                            {
                                label: i18n.startLogicValid,
                                value: true
                            },
                            {
                                label: i18n.notStartLogicValid,
                                value: false
                            }
                        ]
                    },
                    {
                        name: i18n.milestonConstraint,
                        filed: 'milestoneDurationToBeZero',
                        data: [
                            {
                                label: i18n.defDuraIsZero,
                                value: true
                            },
                            {
                                label: i18n.defDuraNotZero,
                                value: false
                            }
                        ]
                    },
                    {
                        name: i18n.fatherSonModel,
                        filed: 'childEffectParentComplete',
                        data: [
                            {
                                label: i18n.parentAutoComplete,
                                value: true
                            },
                            {
                                label: i18n.parentManuallyComplete,
                                value: false
                            }
                        ]
                    },
                    {
                        name: i18n.taskAssoVerifType,
                        filed: 'associatedVerificationType',
                        data: [
                            {
                                label: i18n.strongVerify,
                                value: true
                            },
                            {
                                label: i18n.weekVerify,
                                value: false
                            }
                        ]
                    },
                    {
                        name: i18n.milestoneLightNotice,
                        filed: 'milestoneLightNotice',
                        data: {
                            available: true,
                            lightGreenNum: '0',
                            lightRedNum: '0',
                            lightYellowNum: '0'
                        }
                    },
                    {
                        name: i18n.projectTaskLightNotice,
                        filed: 'projectTaskLightNotice',
                        data: {
                            available: true,
                            lightGreenNum: '0',
                            lightRedNum: '0',
                            lightYellowNum: '0'
                        }
                    },
                    {
                        name: i18n.projectLightNotice,
                        filed: 'projectLightNotice',
                        data: {
                            available: true,
                            lightGreenNum: '0',
                            lightRedNum: '0',
                            lightYellowNum: '0'
                        }
                    }
                ];
            }
        },
        methods: {
            onBlur(e, filed, type) {
                const value = parseFloat(e.target.value);
                if (isNaN(value)) {
                    this.selectVal[filed].value[type] = 0;
                }
            },
            onInput(value, filed, type) {
                const regex = /^[0-9]*\.?[0-9]*$/;
                if (!regex.test(value)) {
                    value = 0;
                }
                this.selectVal[filed].value[type] = parseFloat(value);
            },
            confirm() {
                this.isSaving = true;
                let params = {
                    name: this.backData?.name || '',
                    description: this.i18n.projectSettings,
                    configType: this.backData?.configType || '',
                    configContent: [],
                    contextReference: this.oid,
                    oid: this.backData?.oid || ''
                };
                let configContent = [];
                this.configs.forEach((item) => {
                    configContent.push(this.selectVal[item.filed]);
                });

                params.configContent = JSON.stringify(configContent);
                this.$famHttp({
                    url: '/ppm/communal/saveProjectSettings',
                    data: params,
                    className: this.projectClassName,
                    method: 'post'
                })
                    .then(() => {
                        this.getData();
                        this.$message({
                            type: 'success',
                            message: this.i18n.success
                        });
                    })
                    .catch((err) => {
                        this.$message({
                            type: 'error',
                            message: err?.data?.message || err?.data || err
                        });
                    })
                    .finally(() => {
                        this.isSaving = false;
                    });
            },
            getData() {
                this.backData = {};
                this.$famHttp({
                    url: '/ppm/communal/getProjectSettings',
                    params: {
                        projectOid: this.oid,
                        configType: 'Project_Settings'
                    },
                    className: this.projectClassName,
                    method: 'get'
                })
                    .then((res) => {
                        this.backData = res?.data || {};
                        let resoult = res.data?.configContent || '[]'; // 后端返回就是字符串，前端需要转一下，后端说他们转比较麻烦
                        JSON.parse(resoult).forEach((item) => {
                            this.selectVal[item.type].value = item.value;
                        });
                    })
                    .catch((err) => {
                        this.$message({
                            type: 'error',
                            message: err?.data?.message || err?.data || err
                        });
                    });
            }
        }
    };
});
