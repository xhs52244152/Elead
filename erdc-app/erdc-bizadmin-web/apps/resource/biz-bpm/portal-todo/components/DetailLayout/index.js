define([
    'text!' + ELMP.resource('biz-bpm/portal-todo/components/DetailLayout/template.html'),
    'css!' + ELMP.resource('biz-bpm/portal-todo/components/DetailLayout/index.css'),
    'erdcloud.kit',
    'underscore',
    'dayjs'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    const dayjs = require('dayjs');

    return {
        name: 'DetailLayout',
        template,
        components: {
            DetailList: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-todo/components/DetailList/index.js')),
            BpmProcessDetails: ErdcKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmProcessDetails/index.js')
            ),
            BpmProcessHorse: ErdcKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessHorse/index.js')
            )
        },
        props: {
            tableData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            pageConfig: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            height: {
                type: Number,
                default: 500
            },
            // 加载中
            loading: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/portal-todo/components/DetailLayout/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['到期日期', '进行中', '结束', '挂起', '异常']),
                processInstanceOId: '',
                taskDefKey: '',
                taskOId: '',
                // 当前选中
                current: 0,
                // 分页按钮数量
                pagerCount: 5,
                // 跑马灯人员信息回显
                users: [],
                // 节点信息
                nodeMap: {},
                // 当前处理节点名称
                currentNodeName: '',
                // 表格数据
                innerTable: []
            };
        },
        computed: {
            list() {
                return _.map(this.innerTable, (item) => {
                    _.isFunction(this.i18nMappingObj['到期日期']) &&
                        (item.processDueDateName = this.i18nMappingObj['到期日期'](item.processDueDateName));
                    return item;
                });
            },
            // 流程状态列表
            processStateList() {
                return [
                    {
                        label: this.i18nMappingObj['进行中'],
                        value: 'LIFECYCLE_RUNNING'
                    },
                    {
                        label: this.i18nMappingObj['结束'],
                        value: 'LIFECYCLE_COMPLETED'
                    },
                    {
                        label: this.i18nMappingObj['挂起'],
                        value: 'LIFECYCLE_SUSPENDED'
                    },
                    {
                        label: this.i18nMappingObj['异常'],
                        value: 'LIFECYCLE_EXCEPTION'
                    }
                ];
            },
            // 节点
            activities() {
                return this.nodeMap?.node?.activities || [];
            },
            // 当前节点
            currentActivityId() {
                return this.nodeMap?.node?.highLightedActivities || [];
            },
            // 处理详情高度
            detailHeight() {
                return this.height - 58;
            }
        },
        watch: {
            tableData: {
                handler: function () {
                    this.initCustomStyleSheet();
                },
                immediate: true,
                deep: true
            },
            loading: {
                handler: function (n) {
                    n ? (this.current = 0) : this.clickDetail();
                },
                immediate: true
            }
        },
        methods: {
            updateNodeMapChange(nodeMap) {
                this.nodeMap = nodeMap;
            },
            updateTaskDefKeyUsersChange(users) {
                this.users = users;
            },
            // 点击详情
            clickDetail() {
                let row = this.list[this.current] || {};
                let { restData = () => {}, obtainProcessDetails = () => {} } = this.$refs?.bpmProcessDetails || {};
                if (_.isEmpty(row)) {
                    return restData();
                } else {
                    if (this.processInstanceOId === row.processInstanceOId && this.taskOId === row.taskOId) {
                        this.taskDefKey = row.taskDefKey;
                        this.taskOId = row.taskOId;
                        this.processInstanceOId = row.processInstanceOId;
                        return obtainProcessDetails();
                    }
                }
                this.taskDefKey = row.taskDefKey;
                this.taskOId = row.taskOId;
                this.processInstanceOId = row.processInstanceOId;
            },
            switchWorkshopView(activity) {
                this.currentNodeName = activity?.properties?.name || '';
                let { getTaskDetail = () => {} } = this.$refs?.bpmProcessDetails || {};
                getTaskDetail(activity);
            },
            // 点击切换页数
            handleCurrentChange(e) {
                this.$emit('current-change', e);
            },
            // 初始化自定义样式
            initCustomStyleSheet() {
                let tableData = _.map(this.tableData, (item) => _.extend({}, item));
                let daysBetween,
                    processSelect = false,
                    processStatusName,
                    processStatusClass,
                    processDueDateName,
                    processDueDateClass,
                    processInstanceName,
                    processPromoterName;

                this.innerTable = _.map(tableData, (item) => {
                    let { displayName = '', value } =
                        _.find(item.attrRawList || [], {
                            attrName: `${this.$store.getters.className('workItem')}#processStatus`
                        }) || {};
                    processStatusClass = value;
                    ({ label: displayName } = _.find(this.processStateList, { value: processStatusClass }) || {});
                    processStatusName = displayName;

                    let { value: dueData } =
                        _.find(item.attrRawList || [], {
                            attrName: `${this.$store.getters.className('workItem')}#dueDate`
                        }) || {};

                    try {
                        const end_date = dayjs(dueData).format('YYYY-MM-DD');
                        const ret_date = dayjs(new Date()).format('YYYY-MM-DD');
                        daysBetween = (Date.parse(end_date) - Date.parse(ret_date)) / 86400000;
                    } catch {
                        // do noting
                    }
                    processDueDateClass =
                        daysBetween > 0
                            ? 'not-due-class'
                            : daysBetween < 0
                              ? 'out-date-class'
                              : daysBetween === 0
                                ? 'due-today-class'
                                : '';
                    processDueDateName = daysBetween;

                    ({ displayName = '' } =
                        _.find(item.attrRawList || [], {
                            attrName: `${this.$store.getters.className('workItem')}#processName`
                        }) || {});
                    processInstanceName = displayName;
                    ({ displayName = '' } =
                        _.find(item.attrRawList || [], {
                            attrName: `${this.$store.getters.className('workItem')}#createBy`
                        }) || {});
                    processPromoterName = displayName;

                    let taskOId = item.oid || '';
                    let { oid: processInstanceOId } =
                        _.find(item.attrRawList, {
                            attrName: `${this.$store.getters.className('workItem')}#processRef`
                        }) || {};
                    let { value: taskDefKey } =
                        _.find(item.attrRawList, {
                            attrName: `${this.$store.getters.className('workItem')}#nodeKey`
                        }) || {};
                    return {
                        processSelect,
                        processStatusClass,
                        processStatusName,
                        processDueDateClass,
                        processDueDateName,
                        processInstanceName,
                        processPromoterName,
                        taskOId,
                        processInstanceOId,
                        taskDefKey,
                        ...item
                    };
                });
            }
        }
    };
});
