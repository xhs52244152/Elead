/*
    类型基本信息配置
    先引用 kit组件
    LifecycleForm: FamKit.asyncComponent(ELMP.resource('biz-lifecycle/components/LifecycleForm/index.js')), // 类型基本信息配置


    <lifecycle-form
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </lifecycle-form>

    返回参数

 */
define([
    'text!' + ELMP.resource('biz-lifecycle/components/HistoryVersion/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('biz-lifecycle/components/HistoryVersion/style.css')
], function (template, fieldTypeMapping) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            formData: {
                type: Object,
                default: () => {
                    return {};
                }
            },

            historyData: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamUser: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUser/index.js'))
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-lifecycle/components/HistoryVersion/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    name: this.getI18nByKey('名称'),
                    number: this.getI18nByKey('编码'),
                    version: this.getI18nByKey('版本'),
                    enable: this.getI18nByKey('是否启用'),
                    enableRouting: this.getI18nByKey('是否启用路由'),
                    context: this.getI18nByKey('上下文')
                }
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            columns() {
                return [
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'name',
                        title: this.i18nMappingObj['name'],
                        minWidth: '160',
                        width: '160'
                    },
                    {
                        prop: 'code',
                        title: this.i18nMappingObj['number'],
                        minWidth: '120'
                    },
                    {
                        prop: 'versionStr',
                        title: this.i18nMappingObj['version'],
                        minWidth: '120'
                    },
                    {
                        prop: 'enabled',
                        title: this.i18nMappingObj['enable'],
                        minWidth: '80'
                    },
                    {
                        prop: 'routing',
                        title: this.i18nMappingObj['enableRouting'],
                        minWidth: '120'
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18nMappingObj['context'],
                        minWidth: '160'
                    },
                    {
                        prop: 'updateUser',
                        title: this.i18n.updateUser,
                        minWidth: '120'
                    },
                    {
                        prop: 'updateTime',
                        title: this.i18n.updateTime,
                        minWidth: '160'
                    }
                ];
            },
            vid() {
                return this.formData?.vid || '';
            },
            tableData() {
                return this.historyData || [];
            }
        },
        mounted() {},
        methods: {
            onCheck(data) {
                const { row } = data;
                this.$emit('onsubmit', row, 'checkHistory');
            }
        }
    };
});
