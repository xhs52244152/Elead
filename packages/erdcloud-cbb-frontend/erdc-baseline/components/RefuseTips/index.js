define([
    'text!' + ELMP.func('erdc-baseline/components/RefuseTips/index.html'),
    ELMP.func('erdc-baseline/const.js')
], function (template, CONST) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'BaselineRefuseTips',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                tips: '',
                subTips: '',
                visible: false,
                data: [],
                actionName: '',
                className: CONST.className,
                _resolve: () => { },
                _reject: () => { }
            };
        },
        computed: {
            column() {
                return [
                    {
                        prop: `${this.className}#identifierNo`,
                        title: this.i18n.code
                    },
                    {
                        prop: 'name',
                        title: this.i18n.name
                    },
                    {
                        prop: `${this.className}#version`,
                        title: this.i18n.version
                    },
                    {
                        prop: `${this.className}#lifecycleStatus.status`,
                        title: this.i18n.lifecycleStatus
                    },
                    {
                        prop: 'msg',
                        title: this.i18n.refuseReason
                    }
                ];
            }
        },
        methods: {
            open(data, actionName) {
                return new Promise((resolve, reject) => {
                    this.visible = true;
                    this.actionName = actionName;
                    this.data = data;
                    this._resolve = resolve;
                    this._reject = reject;
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
