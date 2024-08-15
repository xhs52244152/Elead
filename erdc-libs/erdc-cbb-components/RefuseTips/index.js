define([
    'text!' + ELMP.resource('erdc-cbb-components/RefuseTips/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'RefuseTips',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/RefuseTips/locale/index.js'),
                visible: false,
                data: [],
                actionName: '',
                _resolve: () => { }
            };
        },
        computed: {
            column() {
                return [
                    {
                        prop: 'identifierNo',
                        title: this.i18n?.['编码']
                    },
                    {
                        prop: 'name',
                        title: this.i18n?.['名称']
                    },
                    {
                        prop: 'version',
                        title: this.i18n?.['版本']
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n?.['生命周期状态']
                    },
                    {
                        prop: 'msg',
                        title: this.i18n?.['拒绝原因']
                    }
                ];
            }
        },
        methods: {
            open(data, actionName) {
                return new Promise((resolve) => {
                    this.visible = true;
                    this.actionName = actionName;
                    this.data = data;
                    this._resolve = resolve;
                });
            },
            confirm() {
                this.visible = false;
                this._resolve(true);
            },
            close() {
                this.visible = false;
                this._resolve();
            }
        }
    };
});
