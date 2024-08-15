define([
    ELMP.func('erdc-change/config/viewConfig.js'),
    'text!' + ELMP.func('erdc-change/components/DialogCollectObjects/index.html'),
    'css!' + ELMP.func('erdc-change/components/DialogCollectObjects/style.css')
], function (viewCfg, template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ChangeDialogCollectObjects',
        template,
        components: {
            CollectObjects: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/CollectObjects/index.js'))
        },
        props: {
            width: {
                type: String,
                default: '400px'
            },
            visible: Boolean,
            title: String,
            className: String,
            type: String,
            innerTable: {
                type: Array,
                default: []
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                tableData: []
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
            getModuleClassName() {
                return viewCfg.ecaChangeTableView.className;
            }
        },
        watch: {
            innerTable: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.tableData = ErdcKit.deepClone(nv) || [];
                    }
                }
            }
        },
        methods: {
            confirm() {
                const tableData = this.$refs?.collectObjectsRef?.getData?.();
                //调submit方法做一层属性转换跟数据过滤
                this.submit(tableData);
            },
            submit(data) {
                this.$emit('success', data);
                this.close();
            },
            cancel() {
                this.close();
            },
            close() {
                this.innerVisible = !this.innerVisible;
                this.$emit('close');
                this.$emit('update:visible', this.innerVisible);
            }
        }
    };
});
