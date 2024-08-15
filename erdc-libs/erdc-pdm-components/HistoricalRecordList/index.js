define([
    'text!' + ELMP.resource('erdc-pdm-components/HistoricalRecordList/index.html'),
    'css!' + ELMP.resource('erdc-pdm-components/HistoricalRecordList/index.css')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'HistoricalRecordList',
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-pdm-components/HistoricalRecordList/locale/index.js'),
                tableHeight: 500
            };
        },
        computed: {
            viewTableConfig() {
                return {
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        defaultParams: this.defaultParams // body参数
                    },
                    toolbarConfig: {
                        showConfigCol: true, // 是否显示配置列，默认显示
                        showMoreSearch: true, // 是否显示高级搜索，默认显示
                        showRefresh: true, // 是否显示刷新表格，默认显示
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: this.i18n['请输入搜索关键词'], // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '320'
                        },
                        actionConfig: {
                            name: 'BPM_TASK_TODO_OPERATE',
                            containerOid: this.$store.state.space?.context?.oid || '',
                            className: this.$store.getters.className('workItem')
                        }
                    },
                    fieldLinkConfig: {
                        fieldLink: true, // 是否添加列超链接
                        fieldLinkName: `${this.$store.getters.className('workItem')}#processNumber`, // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        linkClick: (row) => {
                            this.dealWith(row, 'false');
                        }
                    },
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        operation: '60px'
                    },
                    slotsField: [
                        {
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        },
                        {
                            prop: `${this.$store.getters.className('workItem')}#priority`,
                            type: 'default'
                        },
                        {
                            prop: `${this.$store.getters.className('workItem')}#dueDate`,
                            type: 'default'
                        },
                        {
                            prop: `${this.$store.getters.className('workItem')}#processStatus`,
                            type: 'default'
                        }
                    ],
                    addSeq: true,
                    tableBaseEvent: {
                        scroll: _.throttle(() => {
                            let arr =
                                _.chain(this.$refs)
                                    .pick((value, key) => key.indexOf('famActionPulldown') > -1)
                                    .values()
                                    .value() || [];
                            this.$nextTick(() => {
                                _.each(arr, (item) => {
                                    let [sitem = {}] = item?.$refs?.actionPulldown || [];
                                    sitem.hide && sitem.hide();
                                });
                            });
                        }, 100)
                    }
                };
            }
        }
    };
});
