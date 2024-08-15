define(['text!' + ELMP.resource('biz-lifecycle/index.html'), 'erdcloud.kit'], function (template, ErdcKit) {
    return {
        template,
        components: {
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            LifecycleTree: ErdcKit.asyncComponent(ELMP.resource('biz-lifecycle/components/LifecycleTree/index.js')),
            LifecycleForm: ErdcKit.asyncComponent(ELMP.resource('biz-lifecycle/components/LifecycleForm/index.js')),
            StateManagement: ErdcKit.asyncComponent(ELMP.resource('biz-lifecycle/components/StateManagement/index.js'))
        },
        data() {
            return {
                title: '',
                type: 'create',
                data: {},
                state: false
            };
        },
        mounted() {
            this.state = this.$route.query.type === 'createState';
        },
        methods: {
            onSubmit(data, type, formType) {
                this.state = false;
                this.type = type || this.type;
                this.data = data;

                this.$nextTick(() => {
                    this.$refs.lifecycleForm.refresh(formType);
                });
            },
            onClickState() {
                this.state = true;
            },
            onRefresh(key, type) {
                this.$refs.lifecycleTree.refresh(key, type);
            }
        }
    };
});
