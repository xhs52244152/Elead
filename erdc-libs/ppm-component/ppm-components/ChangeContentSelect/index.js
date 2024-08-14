define([], function () {
    return {
        template: ` 
            <erd-ex-select
                v-model="changeContent"
                :options="changeContentList"
                multiple
                collapse-tags
                tagShowClose
                :default-props="{
                    label: 'name',
                    value: 'identifierNo',
                    key:'identifierNo'
                }"
            ></erd-ex-select>
        `,
        props: {
            value: {
                type: Array,
                default: () => []
            }
        },
        computed: {
            changeContent: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                    this.$emit('update:value', val);
                }
            }
        },
        data() {
            return {
                changeContentList: []
            };
        },
        mounted() {
            this.getChangeContentList();
        },
        methods: {
            getChangeContentList() {
                this.$famHttp({
                    url: '/fam/dictionary/tree/changeContent',
                    params: {
                        status: 1
                    },
                    method: 'GET'
                }).then((res) => {
                    this.changeContentList = res?.data || [];
                });
            }
        }
    };
});
