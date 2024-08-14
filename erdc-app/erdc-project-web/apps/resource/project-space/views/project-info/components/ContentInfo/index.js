define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-space/views/project-info/components/ContentInfo/index.html'),
    ELMP.resource('project-space/views/project-info/components/InfoDetail/index.js'),
    ELMP.resource('project-space/views/project-info/components/RelatedObjects/index.js'),
    ELMP.resource('ppm-component/ppm-components/WorkHourRecord/index.js'),
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('project-space/views/project-info/components/ContentInfo/index.css')
], function (ErdcKit, template, infoDetail, relatedObjects, workHourRecord, store) {
    return {
        template,
        components: {
            infoDetail,
            relatedObjects,
            workHourRecord,
            ProcessRecords: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/ProcessRecords/index.js')
            )
        },
        props: {
            textVal: {
                type: String,
                default: () => {
                    return '提交';
                }
            }
        },
        data() {
            return {
                isEdit: false,
                activeTab: 'infoDetail',
                // 是否为草稿
                isDraft: false,
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-space/views/project-info/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    infoDetail: this.getI18nByKey('infoDetail'),
                    relatedObjects: this.getI18nByKey('relatedObjects')
                },
                componentId: 'infoDetail',
                tabsConfig: []
            };
        },
        computed: {
            oid() {
                return this.$route.query.pid;
            },
            // 操作菜单获取参数
            menuQueryConfig() {
                return {
                    name: '',
                    objectOid: this.oid
                };
            }
        },
        watch: {
            oid(val) {
                if (val) this.updateTabsConfig();
            }
        },
        created() {
            this.updateTabsConfig();
        },
        mounted() {},
        methods: {
            setCurrentData(data) {
                this.isDraft = data?.['lifecycleStatus.status']?.value === 'DRAFT';
                this.updateTabsConfig();
                // 将项目信息传到父组件
                if (this.$listeners) {
                    this.$emit('info-data', data);
                }
            },
            updateTabsConfig() {
                let { i18nMappingObj, oid, setCurrentData, isDraft } = this;
                let config = [
                    {
                        name: 'infoDetail',
                        displayName: i18nMappingObj.infoDetail,
                        props: {
                            oid,
                            isEdit: false
                        },
                        listeners: {
                            ready: setCurrentData
                        }
                    },
                    {
                        name: 'relatedObjects',
                        displayName: i18nMappingObj.relatedObjects,
                        props: {
                            oid
                        },
                        hide: isDraft
                    },
                    {
                        name: 'workHourRecord',
                        displayName: '工时记录',
                        props: {
                            oid,
                            className: store.state.classNameMapping.project,
                            workHourClassName: store.state.classNameMapping.projectTime,
                            topMenuActionName: 'PPM_PROJECT_TIMESHEET_LIST_MENU',
                            optMenuActionName: 'PPM_PROJECT_TIMESHEET_OPERATE_MENU',
                            tableKey: 'ProjTimesheetView'
                        },
                        hide: isDraft
                    },
                    {
                        name: 'ProcessRecords',
                        displayName: '流程记录',
                        props: {
                            businessOid: oid
                        }
                    }
                ];

                setTimeout(() => {
                    this.tabsConfig = config;
                }, 300);
            }
        }
    };
});
