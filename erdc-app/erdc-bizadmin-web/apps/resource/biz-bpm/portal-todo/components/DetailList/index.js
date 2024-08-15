define([
    'text!' + ELMP.resource('biz-bpm/portal-todo/components/DetailList/template.html'),
    'css!' + ELMP.resource('biz-bpm/portal-todo/components/DetailList/index.css'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const _ = require('underscore');

    return {
        name: 'DetailList',
        template,
        components: {},
        props: {
            list: {
                type: Array,
                default() {
                    return [];
                }
            },
            current: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/portal-todo/components/DetailList/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'layout',
                    'tableView',
                    'detailView',
                    'application',
                    'batchProcessing',
                    'delegate',
                    '请勾选要批量委派的数据！',
                    '知会任务无需处理！',
                    '询问我的任务不能被委派！',
                    '确定',
                    '取消',
                    '任务委派成功',
                    '任务委派失败',
                    'handle',
                    'flowchart',
                    '流程图解'
                ]),
                tableData: []
            };
        },
        watch: {
            list: {
                handler: function (n) {
                    this.tableData = n;
                },
                deep: true,
                immediate: true
            }
        },
        methods: {
            // 更新当前选中项
            updateCurrent(current) {
                this.$emit('update:current', current);
            },
            // 点击某一项
            clickItem(current) {
                this.updateCurrent(current);
                this.clickDetail();
            },
            // 触发请求详情
            clickDetail() {
                this.$emit('click-detail');
            },
            // checkbox选中
            change() {
                let selected = _.filter(this.tableData, (item) => item.processSelect);
                this.updateSelected(selected);
            },
            // 更新选中数据
            updateSelected(selected = []) {
                this.$emit('update-selected', selected);
            }
        }
    };
});
