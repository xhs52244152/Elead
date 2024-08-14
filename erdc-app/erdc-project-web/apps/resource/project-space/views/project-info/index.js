define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-space/views/project-info/components/InfoDetail/index.js'),
    ELMP.resource('project-space/views/project-info/components/RelatedObjects/index.js'),
    'text!' + ELMP.resource('project-space/views/project-info/index.html'),
    'css!' + ELMP.resource('project-space/views/project-info/style.css')
], function (ErdcKit, store, infoDetail, relatedObjects, template) {
    return {
        template,
        components: {
            infoDetail,
            relatedObjects,
            contentInfo: ErdcKit.asyncComponent(
                ELMP.resource('project-space/views/project-info/components/ContentInfo/index.js')
            ),
            SetState: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SetState/index.js')),
            InfoList: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/InfoList/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        data() {
            return {
                currentRow: {},
                className: store.state.classNameMapping.project,
                activeTab: 'infoDetail',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-space/views/project-info/locale/index.js'),
                i18nMappingObj: {
                    projectStatusTitle: this.getI18nByKey('projectStatusTitle'),
                    success: this.getI18nByKey('success'),
                    permanentlyDeleted: this.getI18nByKey('permanentlyDeleted'),
                    tip: this.getI18nByKey('tip'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    edit: this.getI18nByKey('edit'),
                    operate: this.getI18nByKey('operate')
                },
                // showBasicInfo: false,
                infoListData: [
                    {
                        value: '',
                        title: '负责人'
                    },
                    {
                        value: '',
                        title: '状态'
                    },
                    {
                        value: '',
                        title: '预计开始日期'
                    },
                    {
                        value: '',
                        title: '预计结束日期'
                    }
                ],
                infoData: {}, // 项目详细信息
                btnList: [],
                showSetStateDialog: false,

                identifierNo: '' // 编码
            };
        },
        computed: {
            vm() {
                return this;
            },
            defaultBtnConfig() {
                return {
                    label: '操作',
                    type: 'primary'
                };
            },
            oid() {
                return this.$route.query.pid;
            },
            showBasicInfo() {
                return store.state.projectInfo['templateInfo.tmplTemplated'];
            },
            projectName() {
                return store.state.projectInfo.name;
            },
            // 操作菜单获取参数
            menuQueryConfig() {
                return {
                    name: '',
                    objectOid: this.oid
                };
            },
            containerRef() {
                let projectInfo = store.state.projectInfo;
                return `OR:${projectInfo?.containerRef?.key}:${projectInfo?.containerRef?.id}`;
            },
            projectInfo() {
                return store.state?.projectInfo;
            }
        },
        methods: {
            getActionConfig() {
                return {
                    name: 'PPM_OPERATE_MENU',
                    objectOid: this.infoData.oid,
                    className: this.className
                };
            },
            // 获取项目详情信息
            getInfoData(val) {
                this.infoData = val;
                this.identifierNo = val.identifierNo;
                this.infoListData = [
                    {
                        value: val.projectManager?.[0]?.displayName || '',
                        title: '负责人'
                    },
                    {
                        value: val['lifecycleStatus.status'],
                        title: '状态'
                    },
                    {
                        value: val['timeInfo.scheduledStartTime'],
                        title: '预计开始日期'
                    },
                    {
                        value: val['timeInfo.scheduledEndTime'],
                        title: '预计结束日期'
                    }
                ];
                // this.showBasicInfo = !val['templateInfo.tmplTemplated'];
                // if (!this.showBasicInfo) {
                //     document.getElementsByClassName('el-tabs__header is-top')[0].style.display = 'none';
                // }
            },
            refresh() {
                this.$refs.contentInfo.$refs.infoDetail[0].getData(this.oid);
            }
        }
    };
});
