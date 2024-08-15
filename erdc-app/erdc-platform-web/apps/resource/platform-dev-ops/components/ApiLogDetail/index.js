define(['text!' + ELMP.resource('platform-dev-ops/components/ApiLogDetail/index.html')], function (template) {
    return {
        template,
        props: {
            dialogVisible: Boolean,
            currentRow: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-dev-ops/locale/index.js'),
                i18nMappingObj: {
                    timestamp: this.getI18nByKey('timestamp'),
                    appName: this.getI18nByKey('appName'),
                    traceId: this.getI18nByKey('traceId'),
                    spanId: this.getI18nByKey('spanId'),
                    interfaceName: this.getI18nByKey('interfaceName'),
                    methodName: this.getI18nByKey('methodName'),
                    tenantId: this.getI18nByKey('tenantId'),
                    userId: this.getI18nByKey('userId'),
                    takeTime: this.getI18nByKey('takeTime'),
                    status: this.getI18nByKey('status'),
                    arguments: this.getI18nByKey('arguments'),
                    result: this.getI18nByKey('result'),
                    errorMessage: this.getI18nByKey('errorMessage'),
                    errorStack: this.getI18nByKey('errorStack')
                },
                form: {}
            };
        },
        computed: {
            showDialog: {
                get() {
                    return this.dialogVisible;
                },
                set(val) {
                    this.$emit('update:dialogVisible', val);
                }
            },
            formConfig() {
                const fileList = [
                    'timestamp',
                    'appName',
                    'traceId',
                    'spanId',
                    'interfaceName',
                    'methodName',
                    'tenantId',
                    'userId',
                    'takeTime',
                    'status',
                    'arguments',
                    'result',
                    'errorMessage',
                    'errorStack'
                ];
                const span24Files = ['arguments', 'result', 'errorMessage', 'errorStack'];
                return fileList.map((item) => {
                    return {
                        field: item === 'timestamp' ? `@${item}` : item,
                        label: this.i18nMappingObj[item],
                        col: span24Files.includes(item) ? 24 : 12
                    };
                });
            }
        },
        methods: {
            closeDialog() {
                this.showDialog = false;
            }
        }
    };
});
