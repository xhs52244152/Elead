define([
    'text!' + ELMP.resource('biz-signature/signatureManage/signatureHistory/HistoryItem/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], function (template, CONST) {
    return {
        template: template,
        props: {
            history: Object
        },
        computed: {
            stateInfo: function () {
                return this.history.effective
                    ? this.i18nMappingObj.signatureStateEffect
                    : this.i18nMappingObj.signatureStateDead;
            },
            createInfo: function () {
                return `${this.history?.createBy?.displayName} ${this.i18nMappingObj.at} ${this.history.createTime} ${this.i18nMappingObj.create}`;
            },
            updateInfo: function () {
                return `${this.history?.updateBy?.displayName} ${this.i18nMappingObj.at} ${this.history.updateTime} ${this.i18nMappingObj.abandon}`;
            }
        },
        data: function () {
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys([
                    'signatureStateEffect',
                    'signatureStateDead',
                    'at',
                    'create',
                    'abandon'
                ]),
                loading: false
            };
        },
        methods: {
            loadImg: function () {
                this.loading = false;
            }
        }
    };
});
