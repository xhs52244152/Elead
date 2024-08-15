/*
    类型基本信息配置
    先引用 kit组件
    LifecycleTree: ErdcKit.asyncComponent(ELMP.resource('fam_lifecycle/components/LifecycleTree/index.js')), // 类型基本信息配置


    <lifecycle-tree
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </lifecycle-tree>

    返回参数

 */
define([
    'text!' + ELMP.resource('system-queue/components/InstanceDetail/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('system-queue/components/InstanceDetail/style.css')
], function (template, utils) {
    const famHttp = require('fam:http');
    const ErdcKit = require('erdcloud.kit');
    const store = require('fam:store');

    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 任务队列
            instanceId: {
                type: String,
                default: () => {
                    return '';
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-queue/components/InstanceDetail/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    taskDetails: this.getI18nByKey('任务详情'),
                    refresh: this.getI18nByKey('刷新'),
                    taskID: this.getI18nByKey('任务ID'),
                    status: this.getI18nByKey('状态'),
                    runUumber: this.getI18nByKey('运行次数'),
                    taddress: this.getI18nByKey('T地址'),
                    executiontime: this.getI18nByKey('预计执行时间'),
                    startTime: this.getI18nByKey('开始时间'),
                    endTime: this.getI18nByKey('结束时间'),
                    taskParameter: this.getI18nByKey('任务参数'),
                    result: this.getI18nByKey('结果'),
                    failedDetails: this.getI18nByKey('获取详情失败')
                },
                formData: {},
                loading: false
            };
        },
        computed: {
            title() {
                return this.formData.instanceId || '';
            },
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            data() {
                return [
                    {
                        field: 'instanceId',
                        component: 'erd-input',
                        label: this.i18nMappingObj['taskID'],
                        // label: '任务ID',
                        labelLangKey: 'sortOrder',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'statusName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['status'],
                        // label: '状态',
                        labelLangKey: 'sortOrder',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'runningTimes',
                        component: 'erd-input',
                        label: this.i18nMappingObj['runUumber'],
                        // label: '运行次数',
                        labelLangKey: 'runUumber',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'taskTrackerAddress',
                        component: 'erd-input',
                        label: this.i18nMappingObj['taddress'],
                        // label: 'TaskTracker 地址',
                        labelLangKey: 'taddress',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'expectedTriggerDateTime',
                        component: 'erd-input',
                        label: this.i18nMappingObj['executiontime'],
                        // label: '预计执行时间',
                        labelLangKey: 'executiontime',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'actualTriggerDateTime',
                        component: 'erd-input',
                        label: this.i18nMappingObj['startTime'],
                        // label: '开始时间',
                        labelLangKey: 'startTime',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'finishedDateTime',
                        component: 'erd-input',
                        label: this.i18nMappingObj['endTime'],
                        // label: '结束时间',
                        labelLangKey: 'endTime',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'instanceParams',
                        component: 'erd-input',
                        label: this.i18nMappingObj['taskParameter'],
                        // label: '任务参数',
                        labelLangKey: 'taskParameter',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'result',
                        component: 'erd-input',
                        label: this.i18nMappingObj['result'],
                        // label: '结果',
                        labelLangKey: 'result',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 24
                    }
                ];
            }
        },
        mounted() {
            this.getData();
        },
        methods: {
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            formChange() {},
            refresh() {
                this.getData();
            },
            getData() {
                this.loading = true;
                this.$famHttp({
                    url: '/fam/job/fetchInstance' + `?instanceId=${this.instanceId}`,
                    method: 'GET'
                })
                    .then((resp) => {
                        const { data } = resp;
                        this.formData = data;
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        }
    };
});
