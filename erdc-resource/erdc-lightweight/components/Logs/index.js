define([
    'text!' + ELMP.resource('erdc-lightweight/components/Logs/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'LightweightLogs',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            // 列头
            column: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            // 表格数据
            tableData: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-lightweight/locale/index.js')
            };
        },
        computed: {
            innerColumn() {
                return this.column.length ? this.column : this.defaultColumn;
            },
            defaultColumn() {
                return [
                    {
                        type: 'seq',
                        align: 'center',
                        fixed: 'left',
                        width: 48
                    },
                    {
                        prop: 'event',
                        title: this.i18n?.['事件']
                    },
                    {
                        prop: 'time',
                        title: this.i18n?.['时间']
                    },
                    {
                        prop: 'level',
                        title: this.i18n?.['级别']
                    },
                    {
                        prop: 'subject',
                        title: this.i18n?.['主题']
                    },
                    {
                        prop: 'msg',
                        title: this.i18n?.['提示信息']
                    }
                ];
            },
        },
        methods: {
            // 格式化时间数据 fmt:输出格式，date：输入的时间字符串
            formatTimeData(fmt, date) {
                var ret = "";
                date = new Date(date);
                var opt = {
                    'Y+': date.getFullYear().toString(), // 年
                    'm+': (date.getMonth() + 1).toString(), // 月
                    'd+': date.getDate().toString(), // 日
                    'H+': date.getHours().toString(), // 时
                    'M+': date.getMinutes().toString(), // 分
                    'S+': date.getSeconds().toString() // 秒
                }
                for (var k in opt) {
                    ret = new RegExp('(' + k + ')').exec(fmt)
                    if (ret) {
                        fmt = fmt.replace(
                            ret[1],
                            ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0')
                        )
                    }
                }
                return fmt
            }
        }
    };
});
