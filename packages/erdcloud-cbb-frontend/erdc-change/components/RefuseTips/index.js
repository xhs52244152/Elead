define([
    'text!' + ELMP.func('erdc-change/components/RefuseTips/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                tips: '',
                subTips: '',
                visible: false,
                data: [],
                actionName: '',
                _resolve: () => { },
                _reject: () => { }
            };
        },
        computed: {
            column() {
                return [
                    {
                        prop: 'identifierNo',
                        title: this.i18n.code
                    },
                    {
                        prop: 'name',
                        title: this.i18n.name
                    },
                    // {
                    //     prop: 'version',
                    //     title: this.i18n.version
                    // },
                    // {
                    //     prop: 'lifecycleStatus.status',
                    //     title: this.i18n.lifecycleStatus
                    // },
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
                    this.reject = reject;
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
