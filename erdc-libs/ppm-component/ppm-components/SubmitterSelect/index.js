define(['erdcloud.kit'], function (ErdcKit) {
    return {
        template: `
            <fam-participant-select
                v-model="dataValue"
                :default-value="defaultValue"
                v-bind="$attrs"
                :with-source-object="true"
                search-scop="group"
                :showType="showType"
                :query-scope="queryScope"
                @change="onChange">
            </fam-participant-select>
        `,
        props: {
            value: String | Array,
            showType: Array,
            handleChange: Function,
            queryScope: {
                type: String,
                default: 'fullTenant' // 搜索范围为当前租户下的成员
            }
        },
        components: {
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        data() {
            return {
                dataValue: [],
                defaultValue: []
            };
        },
        watch: {
            value: {
                handler(newVal) {
                    if (_.isArray(newVal)) {
                        this.dataValue = newVal.map((item) => item.oid);
                        this.defaultValue = newVal;
                    } else if (_.isObject(newVal)) {
                        this.dataValue = newVal.oid;
                        this.defaultValue = newVal;
                    } else if (_.isEmpty(newVal)) {
                        this.defaultValue = [];

                        this.dataValue = '';
                    }
                    // this.dataValue = val;
                    // if (_.isArray(val)) this.defaultValue = val;
                    // else if (_.isEmpty(val)) this.defaultValue = [];
                },
                immediate: true
            }
        },
        methods: {
            onChange(val, data) {
                this.$emit('input', val, data);
                this.$emit('change', val, data);
                this.$emit('update:value', val, data);
                if (_.isFunction(this.handleChange)) {
                    this.handleChange(data, val);
                }
            }
        }
    };
});
