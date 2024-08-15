define(['css!' + ELMP.resource('erdc-components/FamUnitNumber/style.css')], function () {
    return {
        /*html*/
        template: `
            <erd-input
                v-if="!readonly"
                class="fam-unit-number"
                v-on="$listeners"
                v-bind="$attrs"
                v-model.number="innerValue"
                :placeholder="placeholder"
                @change="onChange"
            >
                <template v-if="isPrepend" slot="prepend">
                    <span>{{innerUnit}}</span>
                </template>
                <template v-else slot="append">
                    <span>{{innerUnit}}</span>
                </template>
            </erd-input>
            <span v-else>
                <span v-if="isPrepend">
                    {{value ? innerUnit + ' ' + value : '--'}}
                </span>
                <span v-else>
                    {{value ? value + ' ' + innerUnit : '--'}}
                </span>
            </span>
        `,
        props: {
            value: {
                type: [String, Number],
                default: ''
            },
            unitReference: {
                type: String,
                default: ''
            },
            placeholder: {
                type: String,
                default: '请输入'
            },
            isPrepend: Boolean,
            readonly: Boolean
        },
        data() {
            return {
                row: {
                    componentName: 'virtual-select',
                    viewProperty: 'displayName', // 显示的label的key
                    valueProperty: 'oid', // 显示value的key
                    requestConfig: {
                        url: 'fam/listByKey',
                        params: {
                            className: 'erd.cloud.foundation.units.entity.QuantityOfMeasure'
                        }
                    }
                },
                unitData: [],
                innerUnit: ''
            };
        },
        watch: {
            unitReference: {
                deep: true,
                immediate: true,
                handler(val) {
                    this.getUnit();
                }
            },
            unitData: {
                deep: true,
                immediate: true,
                handler(unitData) {
                    this.innerUnitFn(unitData);
                }
            }
        },
        computed: {
            innerValue: {
                get() {
                    return _.isNumber(this.value) ? this.value : this.value?.replace(/[^\d]/g, '');
                },
                set(val) {
                    this.$emit('input', val);
                }
            }
        },
        methods: {
            onChange(val) {
                this.$emit('change', val, this.innerUnit);
            },
            onCallback(val) {
                this.$emit('change', this.innerValue, val?.value);
            },
            getUnit() {
                if (!_.isEmpty(this.unitData)) return;
                this.$famHttp({
                    url: 'fam/listByKey',
                    params: {
                        className: 'erd.cloud.foundation.units.entity.QuantityOfMeasure'
                    }
                }).then((resp) => {
                    const { data } = resp;
                    this.unitData = data || [];
                });
            },
            innerUnitFn: _.debounce(function (unitData) {
                this.innerUnit =
                    unitData.find((item) => item.oid === this.unitReference)?.caption || this.unitReference;
            }, 300)
        }
    };
});
