define(['text!' + ELMP.resource('erdc-cbb-components/ImportAndExport/components/Transfer/index.html')], function (
    template
) {
    return {
        template,
        props: {
            tableData: {
                type: Array,
                default() {
                    return [];
                }
            },
            height: Number,
            fields: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                allColumnsList: [],
                defaultSelected: [],
                searchLeftKey: ''
            };
        },
        computed: {
            innerHeight() {
                return _.isNumber(this.height) ? this.height : 420;
            },
            selected: {
                get() {
                    return this.fields;
                },
                set(val) {
                    this.$emit('update:fields', val);
                }
            }
        },
        watch: {
            tableData: {
                immediate: true,
                handler(nv) {
                    // 更新字段信息及默认选中自选信息
                    this.allColumnsList = nv.map((item) => ({
                        ...item,
                        displayName: item.label,
                        isDisable: item.isRequired
                    }));

                    // 切换可选后，清空已选
                    this.$refs.transfer && (this.$refs.transfer.rightColumnsList = []);
                    this.selected = this.fields;

                    // 根据selected更新defaultSelected
                    this.defaultSelected =
                        this.fields.length > 0
                            ? this.fields.map((item) => ({
                                  ...item,
                                  displayName: item.label,
                                  isDisable: item.isRequired
                              }))
                            : this.allColumnsList.filter((item) => item.isRequired);
                }
            },
            searchLeftKey: {
                handler(nv) {
                    this.$refs.transfer.searchLeftKey = nv;
                }
            }
        }
    };
});
