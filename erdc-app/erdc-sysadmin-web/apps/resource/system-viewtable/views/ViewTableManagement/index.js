define([
    'erdc-kit',
    'text!' + ELMP.resource('system-viewtable/views/ViewTableManagement/index.html'),
    'css!' + ELMP.resource('system-viewtable/styles/index.css')
], function (ErdcKit, template) {
    return {
        template,
        components: {
            SystemViewTable: ErdcKit.asyncComponent(
                ELMP.resource('system-viewtable/components/SystemViewTable/index.js')
            ),
            ViewManager: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/ViewManager/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-viewtable/locale/index.js'),
                componentName: 'SystemViewTable',
                componentMap: {
                    systemViewTable: 'SystemViewTable',
                    viewManager: 'ViewManager'
                },
                row: ''
            };
        },
        computed: {
            showCallback() {
                return this.componentName !== 'SystemViewTable';
            }
        },
        methods: {
            // 切换组件显示
            switchComponent(componentName, row) {
                this.componentName = this.componentMap[componentName || 'systemViewTable'];
                this.row = row;
            },
            callback() {
                this.componentName = 'SystemViewTable';
                this.$nextTick(() => {
                    this.$refs.SystemViewTable?.refreshTable();
                });
            }
        }
    };
});
