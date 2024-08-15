define([
    'text!' + ELMP.resource('biz-signature/taskCenter/taskForm/index.html'),
    ELMP.resource('biz-signature/CONST.js')
], function (tmpl, CONST) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: tmpl,
        props: {
            rowList: Object
        },
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'biz-signature'),
                i18nMappingObj: this.getI18nKeys([
                    'name',
                    'type',
                    'status',
                    'convert',
                    'watermarkTask',
                    'creater',
                    'createTime',
                    'startTime',
                    'finishTime',
                    'taskSource',
                    'taskParams',
                    'signatureSign'
                ]),
                drawer: false,
                labelWidth: '100px'
            };
        },
        computed: {
            formConfigs() {
                const { i18nMappingObj } = this;
                const config = [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: i18nMappingObj.name,
                        col: 12,
                        readonly: true
                    },
                    {
                        field: 'type',
                        component: 'erd-input',
                        label: i18nMappingObj.type,
                        col: 12,
                        readonly: true
                    },
                    {
                        field: 'status',
                        component: 'erd-input',
                        label: i18nMappingObj.status,
                        col: 12,
                        readonly: true
                    },
                    {
                        field: 'creater',
                        component: 'erd-input',
                        label: i18nMappingObj.creater,
                        col: 12,
                        readonly: true
                    },
                    {
                        field: 'createTime',
                        component: 'erd-input',
                        label: i18nMappingObj.createTime,
                        col: 12,
                        readonly: true
                    },
                    {
                        field: 'startTime',
                        component: 'erd-input',
                        label: i18nMappingObj.startTime,
                        col: 12,
                        readonly: true
                    },
                    {
                        field: 'finishTime',
                        component: 'erd-input',
                        label: i18nMappingObj.finishTime,
                        col: 12,
                        readonly: true
                    },
                    {
                        field: 'source',
                        component: 'erd-input',
                        label: i18nMappingObj.taskSource,
                        col: 12,
                        readonly: true
                    },
                    {
                        field: 'taskParams',
                        component: 'erd-input',
                        label: i18nMappingObj.taskParams,
                        col: 24,
                        slots: {
                            component: 'taskParams'
                        }
                    }
                ];
                return config;
            },
            formData() {
                const { rowList, i18nMappingObj } = this;
                const typeList = CONST.taskTypeList;
                let taskParams = '';
                if (rowList?.params && JSON.parse(rowList?.params)?.params) {
                    taskParams = JSON.stringify(JSON.parse(JSON.parse(rowList?.params)?.params), null, 2);
                }
                return {
                    name: rowList?.displayName,
                    type: i18nMappingObj[typeList[rowList?.name]],
                    status: rowList?.statusName,
                    creater: rowList?.createByName,
                    createTime: rowList?.createTime,
                    startTime: rowList?.startTime,
                    finishTime: rowList?.finishTime,
                    source: rowList?.serverName,
                    taskParams
                };
            }
        },
        methods: {
            show() {
                this.drawer = true;
            }
        }
    };
});
