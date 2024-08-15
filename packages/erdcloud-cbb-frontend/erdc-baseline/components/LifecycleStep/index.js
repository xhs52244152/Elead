define([
    'text!' + ELMP.func('erdc-baseline/components/LifecycleStep/index.html')
], function (template) {

    return {
        name: 'BaselineLifecycleStep',
        template,
        props: {
            options: {
                type: Array,
                default: () => []
            },
            labelKey: {
                type: String,
                default: 'label'
            },
            valueKey: {
                type: String,
                default: 'value'
            },
            value: String
        },
        data() {
            return {
                visible: false
            };
        },
        computed: {
            // lifecycleStatus() {
            //     return this.data?.['lifecycleStatus.status'];
            // },
            // lifecycleTemplate() {
            //     return this.data?.['lifecycleStatus.lifecycleTemplateRef'];
            // },
            active() {
                let self = this;
                return this.options.findIndex((i) => i[self.valueKey] === self.value);
            },
            activeDisplayName() {
                let active = this.options[this.active];
                return active ? active[this.labelKey] : '';
            }
        },
        watch: {
            // lifecycleTemplate: {
            //     immediate: true,
            //     deep: true,
            //     handler(newVal) {
            //         if (newVal && newVal) {
            //             this.getLifecycleEnum(newVal);
            //         }
            //     }
            // },
        },
        methods: {
            // getLifecycleEnum(templateOId) {
            //     this.$famHttp({
            //         url: '/fam/lifecycle/iteration',
            //         method: 'GET',
            //         params: {
            //             templateOId,
            //         }
            //     }).then((res) => {
            //         this.statusList = res.data?.lifecycleStates;
            //     });
            // },
            show() {
                this.visible = true;
            },
            hide() {
                this.visible = false;
            }
        }
    };
});
