/**
 * readonly component for CustomSelect
 */
define([
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/selectOptionsHandle.js'),
    'underscore',
    'fam:kit'
], function (SelectOptionsHandle) {
    const _ = require('underscore');
    const FamKit = require('fam:kit');

    return {
        components: {
            FamShowTooltip: FamKit.asyncComponent(ELMP.resource('erdc-components/FamShowTooltip/index.js'))
        },
        mixins: [SelectOptionsHandle],
        /*html*/
        template: `
            <erd-show-tooltip 
                style="color: var(--colorTextNormal)"
                placement="top" 
                :content="staticText || '--'"
                flex
            >
                <template v-slot:show-tooltip-title>
                    <span class="title_text custom-select-text-display-name">
                        <fam-link
                            v-if="path" 
                            :link-name="staticText"
                            :form="form"
                            :path="path">
                        </fam-link>
                        <span v-else>{{staticText || '--'}}</span>
                    </span>
                </template>
            </erd-show-tooltip>
        `,
        // template: `
        //     <erd-tooltip
        //         placement="top"
        //         :content="staticText || '--'"
        //         popper-class="fam-tooltip-max-width"
        //     >
        //         <span v-fam-clamp="{ truncationStyle: 'inline' }" class="fam-dynamic-form__readonly-field">
        //             {{ staticText || '--'}}
        //         </span>
        //     </erd-tooltip>
        // `,
        props: {
            value: [String, Array, Object],
            row: {
                type: Object,
                default() {
                    return {};
                }
            },
            treeSelect: Boolean,
            treeProps: {
                type: Object,
                default() {
                    return null;
                }
            },
            form: {
                type: Object,
                default() {
                    return {}
                }
            },
            path: {
                type: String,
                default: null
            }
        },
        computed: {
            treeProp() {
                return {
                    ...this.treeProps,
                    children: this.treeProps?.children || 'children',
                    label:
                        this.treeProps?.label ||
                        this.row?.value?.viewProperty ||
                        this.row?.viewProperty ||
                        'displayName',
                    value: this.treeProps?.value || this.row?.value?.valueProperty || this.row?.valueProperty || 'oid'
                };
            },
            staticText() {
                let valueList = _.isArray(this.value) ? _.compact(this.value) : _.compact([this.value]);
                const options = FamKit.TreeUtil.flattenTree2Array(this.options, {
                    childrenField: this.treeProp.children
                });
                const findLabel = (value) => {
                    const {
                        requestConfig: { valueProperty: reqValueProp, viewProperty: reqViewProp } = {},
                        valueProperty: rowValueProp,
                        viewProperty: rowViewProp
                    } = this.row;
                    const optionObj =
                        _.find(options, { [reqValueProp]: value }) ||
                        _.find(options, { [rowValueProp]: value }) ||
                        _.find(options, { ['value']: value }) ||
                        {};
                    return optionObj[reqViewProp || rowViewProp] || optionObj['label'] || optionObj['name'];
                };
                return _.chain(valueList).map(findLabel).compact().value().join(',') || valueList.join(',') || '--';
            },
            options() {
                return this.optionList;
            }
        }
    };
});
