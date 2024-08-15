define([], function () {
    return {
        /*html*/
        template: `
            <ErdQuillEditor v-model="staticText" readonly></ErdQuillEditor>
        `,
        props: {
            value: [String, Object]
        },
        data() {
            return {
                isShow: false,
                showMore: false
            };
        },
        watch: {
            value: {
                immediate: true,
                handler(nv) {
                    this.$nextTick(() => {
                        this.showMoreFn();
                    });
                }
            }
        },
        computed: {
            style() {
                if (this.showMore && !this.isShow) {
                    return `height: 44px`;
                }
                return `height: auto`;
            },
            staticText() {
                return this.value || '--';
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.showMoreFn();
            });
        },
        methods: {
            onShow() {
                this.isShow = !this.isShow;
            },
            showMoreFn() {
                this.showMore = this.$refs?.famQuillEditorStaticText?.clientHeight > 44;
            }
        }
    };
});
