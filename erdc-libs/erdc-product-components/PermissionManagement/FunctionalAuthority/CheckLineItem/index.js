define([
    'text!' +
        ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/CheckLineItem/index.html'),
    'css!' + ELMP.resource('erdc-product-components/PermissionManagement/FunctionalAuthority/CheckLineItem/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {},
        props: {
            lineData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            checkedOptions: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                checkedOptionsArr: [],
                hasChecked: false
            };
        },
        watch: {
            checkedOptions: {
                immediate: true,
                handler(val) {
                    this.checkedOptionsArr = val || [];
                }
            }
        },
        created() {},
        computed: {
            lineItem() {
                const { label, name } = this.lineData;
                return {
                    label,
                    name
                };
            },
            childList() {
                return this.lineData?.childList || [];
            },
            isCheckAll() {
                const len = this.childList.length;
                return len > 0 && len === this.checkedOptionsArr.length;
            },
            isIndeterminate() {
                const len = this.childList.length;
                return len > 0 && len !== this.checkedOptionsArr.length && this.checkedOptionsArr.length > 0;
            }
        },
        mounted() {},
        methods: {
            handlerChangeCheckAll(flag) {
                this.isCheckAll = flag;
                const checked = flag ? this.childList.map((item) => item.oid) : [];
                this.checkedOptionsArr = checked;
                this.$emit('handler-check-option', checked);
            },
            handlerCheckOption(data) {
                this.hasChecked = false;
                if(!_.isEmpty(data)) {
                    this.hasChecked = true;
                }
                this.$emit('handler-check-option', this.checkedOptionsArr);
            },
            getShowChildList(childList) {
                return childList.filter((el) => !el.hidden);
            }
        }
    };
});
