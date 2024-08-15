define([
    'text!' + ELMP.resource('system-queue/components/InstanceLog/index.html'),
    'css!' + ELMP.resource('system-queue/components/InstanceLog/style.css')
], function (template) {
    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 任务队列
            instanceId: {
                type: String,
                default: () => {
                    return '';
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-queue/components/InstanceDetail/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    lifecycle: this.getI18nByKey('生命周期'),
                    moreActions: this.getI18nByKey('更多操作'),
                    Import: this.getI18nByKey('导入'),
                    Export: this.getI18nByKey('导出'),
                    stateManagement: this.getI18nByKey('状态管理')
                },
                formData: {},
                logData: '',
                loading: false
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            }
        },
        mounted() {
            this.getData();
        },
        methods: {
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            formChange() {},
            refresh() {
                this.getData();
            },
            getData() {
                this.loading = true;
                this.$famHttp({
                    url: '/fam/job/instanceLog' + `?instanceId=${this.instanceId}`,
                    method: 'POST'
                })
                    .then((resp) => {
                        const { data } = resp;
                        this.logData = data.data.split('\n');
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            onDownload() {}
        }
    };
});
