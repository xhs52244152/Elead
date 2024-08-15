/**
 * readonly component for CustomSelect
 */
define([
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/selectOptionsHandle.js'),
    'dayjs',
    'underscore',
    'fam:kit'
], function (SelectOptionsHandle, dayjs) {
    const FamKit = require('fam:kit');

    return {
        components: {
            FamShowTooltip: FamKit.asyncComponent(ELMP.resource('erdc-components/FamShowTooltip/index.js'))
        },
        mixins: [SelectOptionsHandle],
        template: `
            <erd-show-tooltip 
                placement="top" 
                :content="staticText"
                flex
            ></erd-show-tooltip>
        `,
        props: {
            value: {
                type: String,
                default: ''
            },
            formConfig: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            staticText() {
                return this.formattedValueArray.join(' ~ ') || '--';
            },
            formattedValueArray() {
                return this.valueArray.map((value) => {
                    if (!value) {
                        return '--';
                    }
                    let formattedValue = value;
                    if (this.dayjsValueFormat) {
                        formattedValue = dayjs(value).format(this.dayjsValueFormat);
                    } else if (this.isCustomDateTime) {
                        return dayjs(value).format('YYYY-MM-DD');
                    }
                    return formattedValue;
                });
            },
            valueArray() {
                let value = this.value;
                if (!value) {
                    return [];
                }
                if (Array.isArray(value)) {
                    return value;
                }

                value = value
                    .replace(/^\[(.+)\]$/, '$1')
                    .replaceAll(', ', ',')
                    .split(',');
                return value;
            },
            props() {
                return this.formConfig?.props || {};
            },
            row() {
                return this.props.row || {};
            },
            component() {
                return this.formConfig?.component || 'CustomDateTime';
            },
            valueFormat() {
                return this.props.valueFormat || this.row.valueFormat || this.row.dateFormat;
            },
            dayjsValueFormat() {
                return this.valueFormat?.replace(/y/g, 'Y')?.replace(/d/g, 'D');
            },
            isCustomDateTime() {
                return FamKit.isSameComponentName('CustomDateTime', this.component);
            }
        }
    };
});
