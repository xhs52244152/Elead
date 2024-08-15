define([
    'text!' + ELMP.resource('system-operation-menu/components/CodeFilter/index.html'),
    ELMP.resource('system-operation-menu/componentConfig.js')
], function (template, componentConfig) {
    return {
        template,
        props: {
            type: {
                type: String,
                default: 'PluginOptionFilter'
            },
            data: {
                type: Object,
                default() {
                    return null
                }
            }
        },
        data() {
            return {
                customComponent: null
            };
        },
        computed: {
            innerData: {
                get() {
                    return this.data;
                },
                set(data) {
                    this.$set('update:data', data);
                }
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.getComponent();
            });
        },
        methods: {
            getComponent() {
                this.customComponent = componentConfig[this.type];
            },
            submit() {
                return new Promise((resolve, reject) => {
                    this.$refs?.[this.type]
                        ?.submit()
                        .then((resp) => {
                            resolve(resp);
                        })
                        .catch(reject);
                });
            }
        }
    };
});
