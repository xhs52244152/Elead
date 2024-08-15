define([
    'text!' + ELMP.resource('platform-api/components/ServiceDetail/index.html'),
    'css!' + ELMP.resource('platform-api/components/ServiceDetail/index.css')
], function (template) {
    return {
        template,
        props: {
            service: {
                type: Object
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-api/views/ApiManagement/locale/index.js'),
                i18nMappingObj: {
                    view: this.getI18nByKey('详情'),
                    serviceName: this.getI18nByKey('服务名'),
                    appName: this.getI18nByKey('服务别名'),
                    owner: this.getI18nByKey('服务所有者'),
                    groupName: this.getI18nByKey('服务分组'),
                    description: this.getI18nByKey('描述'),
                    edit: this.getI18nByKey('编辑')
                },

                visible: false,
                serviceInfo: {}
            };
        },
        watch: {
            service: {
                deep: true,
                immediate: true,
                handler(newVal) {
                    if (newVal) {
                        this.setServiceInfo();
                    } else {
                        this.serviceInfo = {};
                    }
                }
            }
        },
        methods: {
            show() {
                this.visible = true;
            },
            setServiceInfo() {
                const properties = ['id', 'serviceName', 'appName', 'groupName', 'description', 'users'];

                const service = this.service ?? {};
                const tempObj = {};
                properties.forEach((key) => {
                    tempObj[key] = service[key] ?? '';
                });

                this.serviceInfo = tempObj;
            },
            toEdit() {
                this.visible = false;
                this.$emit('toEdit');
            }
        }
    };
});
