/**
* @module 公共组件
* @component FamTableColSet
* @props { FamTableColSetProps } - props参数引用
* @description 视图表格列配置组件
* @author Mr.JinFeng
* @example 参考FamAdvancedTable组件页面中使用代码
* 组件声明
* components: {
*   FamTableColSet: FamKit.asyncComponent(ELMP.resource('erdc-components/FamTableColSet/index.js'))
* }
*
* @typedef { Object } FamTableColSetProps
* @property { Boolean } visible -- 显示隐藏组件
* @property { String } title -- 弹窗标题
* @property { Array } columnsList -- 列集合
* @property { String } type -- 【colSet: 表格列配置】，需要的自己定义规则，比如高级条件选择列

* <!-- 列配置html -->
* <fam-table-col-set :visible.sync="colSettingVisible" title="字段设置" @onsubmit="submit"></fam-table-col-set>
* @events TODO
*/
define([
    'text!' + ELMP.resource('erdc-components/FamAdvancedTable/FamTableColSet/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamAdvancedTable/FamTableColSet/style.css')
], function (template, utils) {
    const FamKit = require('fam:kit');
    var vmOptions = function () {
        return {
            template,
            props: {
                visible: {
                    type: Boolean,
                    default() {
                        return false;
                    }
                },
                // 标题
                title: {
                    type: String,
                    default() {
                        return '';
                    }
                },
                // 默认选中
                defaultColumns: {
                    type: Array,
                    default() {
                        return [];
                    }
                },
                // 列集合
                columnsList: {
                    type: Array,
                    default() {
                        return [];
                    }
                },
                // 【colSet: 表格列配置】，需要的自己定义规则，比如高级条件选择列
                type: {
                    type: String,
                    default() {
                        return '';
                    }
                },
                beforeSubmit: {
                    type: Function
                }
            },
            data() {
                return {
                    i18nLocalePath: ELMP.resource('erdc-components/FamAdvancedTable/locale/index.js'),
                    isChange: false
                };
            },
            components: {},
            computed: {
                innerVisible: {
                    get() {
                        return this.visible;
                    },
                    set(val) {
                        this.$emit('update:visible', val);
                    }
                },

                // 处理好的全部列数据
                allColumnsList() {
                    let res = [];

                    // 处理列数据
                    if (this.columnsList.length) {
                        // 把隐藏列过滤掉，不显示选择
                        let tempRes = this.columnsList.filter((ite) => !ite.hide);
                        res = tempRes.map((item) => {
                            item.isDisable = item.locked;
                            return item;
                        });
                    }
                    return res;
                },

                // 回显已选中字段
                defaultColumnsList() {
                    let res = [];
                    // 处理列数据
                    if (this.defaultColumns.length) {
                        // 把隐藏列和扩展列过滤掉，不显示选择
                        let tempRes = this.defaultColumns.filter((ite) => !ite.hide && !ite.extraCol);
                        res = tempRes.map((item) => {
                            if (this.type === 'colSet') {
                                item.isSelected = true;
                                item.isDisable = item.locked;
                            }
                            return item;
                        });
                    }
                    return res;
                },
                buttonsList() {
                    let btnList = [
                        // 操作按钮
                        {
                            name: utils.setTextBySysLanguage({ CN: '确定', EN: 'Confirm' }),
                            type: 'successHanldClick',
                            btnType: 'primary',
                            disabled: !this.isChange
                        },
                        {
                            name: utils.setTextBySysLanguage({ CN: '取消', EN: 'Cancel' }),
                            type: 'cancelHanldClick',
                            btnType: 'default'
                        }
                    ];
                    return btnList;
                }
            },
            mounted() {},
            methods: {
                columnsChange() {
                    this.isChange = true;
                },
                buttonClick(type) {
                    this[type]();
                },
                cancelHanldClick() {
                    this.innerVisible = false;
                },
                successHanldClick() {
                    let resColumns = this.$refs.FamColumnSet.getSetResult();

                    if (this.beforeSubmit) {
                        this.beforeSubmit(resColumns, (visible) => {
                            this.innerVisible = visible;
                            if (!visible) {
                                this.$emit('onsubmit', resColumns);
                            }
                        });
                        return;
                    }
                    this.innerVisible = false;
                    this.$emit('onsubmit', resColumns);
                }
            }
        };
    };
    return vmOptions();
});
