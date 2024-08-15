define(['text!' + ELMP.resource('bpm-resource/components/BpmDueData/template.html'), 'dayjs', 'underscore'], function (
    template
) {
    const dayjs = require('dayjs');
    const _ = require('underscore');
    return {
        name: 'BpmDueData',
        template,
        props: {
            // 到期日期
            dueData: {
                type: String,
                default: '',
                required: true
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmDueData/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['到期日期'])
            };
        },
        computed: {
            dueDataBetween() {
                let dueDataBetween = '-';
                if (!this.dueData || this.dueData === '-' || this.dueData === '1900-01-01 00:00:00') {
                    return dueDataBetween;
                }
                try {
                    const end_date = dayjs(this.dueData).format('YYYY-MM-DD');
                    const ret_date = dayjs(new Date()).format('YYYY-MM-DD');
                    dueDataBetween = (Date.parse(end_date) - Date.parse(ret_date)) / 86400000;
                } catch {
                    dueDataBetween = '-';
                }
                return dueDataBetween;
            },
            dueDataTitle() {
                return this.dueDataBetween === '-'
                    ? this.dueDataBetween
                    : _.isFunction(this.i18nMappingObj['到期日期'])
                      ? this.i18nMappingObj['到期日期'](this.dueDataBetween)
                      : '';
            },
            dueDataColor() {
                return this.dueDataBetween === '-'
                    ? 'rgba(0,0,0,.85)'
                    : this.dueDataBetween > 0
                      ? 'rgba(0,0,0,.85)'
                      : this.dueDataBetween < 0
                        ? '#FF2623'
                        : '#FFBF00';
            }
        }
    };
});
