const { get } = require('sortablejs');

/*
    类型基本信息配置
    先引用 kit组件
    ManageTeamForm: ErdcKit.asyncComponent(ELMP.resource('biz-template/team-template/components/ManageTeamForm/index.js')), // 类型基本信息配置


    <manage-team-form
    ref="ManageTeamForm"
    :data="data"
    @onsubmit="onSubmit"
    @onrefresh="onRefresh">
 */
define([
    'text!' + ELMP.resource('biz-template/team-template/components/ManageTeamForm/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'vuedraggable',
    'css!' + ELMP.resource('biz-template/team-template/components/ManageTeamForm/style.css')
], function (template, fieldTypeMapping, VueDraggable) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            data: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-template/team-template/components/ManageTeamTree/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    updateTemplate: this.getI18nByKey('编辑团队模板'),
                    enabledSuccess: this.getI18nByKey('启用成功'),
                    disabledSuccess: this.getI18nByKey('停用成功'),
                    disabled: this.getI18nByKey('启用失败'),
                    confirmDel: this.getI18nByKey('确认删除'),
                    removeSuccessful: this.getI18nByKey('删除成功'),
                    removeFailed: this.getI18nByKey('删除失败'),
                    removeTips: this.getI18nByKey('删除提示')
                },
                iconClass: 'edit2',
                activeTab: 'BaseInfo',
                componentHeight: '100%',
                mainHeight: '100%',
                tagWidth: 'auto',
                tagDisplay: 'none',
                title: '',
                formData: {},
                innerVisible: false,
                tableHeight: document.documentElement.clientHeight - 244,
                // 团队模板 =》团队成员
                showParticipantType: ['USER', 'GROUP']
            };
        },
        watch: {
            searchValue(val) {
                this.$refs.tree.filter(val);
            },
            formData: {
                handler: function (n, o) {
                    this.tagDisplay = 'none';
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.tagWidth = `${document.getElementById('lifecycle-form-content')?.clientWidth + 12}px`;
                            this.tagDisplay = 'inline-block';
                        }, 50);
                    });
                },
                deep: true
            }
        },
        computed: {
            key() {
                return this.data?.key || '';
            },
            appName() {
                return this.data?.appName;
            },
            queryParams() {
                return {
                    data: {
                        isGetVirtual: false,
                        appName: this.appName,
                        isGetVirtualRole: false
                        // isGetVirtualGroup: true
                    }
                };
            },
            oid() {
                return this.data?.oid || '';
            },
            isEdit() {
                return this.data?.edit;
            },
            isDelete() {
                return this.data?.delete;
            },
            tabList() {
                return [
                    {
                        name: 'BaseInfo',
                        label: this.i18n.basicInfo,
                        title: this.i18n.basicInfo,
                        componentName: 'BaseInfo'
                    },
                    {
                        name: 'Team',
                        label: this.i18n.teamMembers,
                        title: this.i18n.teamMembers,
                        componentName: 'Team'
                    }
                ];
            },
            activeTabObj() {
                const activeObj = this.tabList.find((item) => {
                    return item.name === this.activeTab;
                });
                return activeObj || {};
            }
        },
        mounted() {},
        methods: {
            /**
             * 刷新数据
             */
            refresh() {
                this.getData();
            },
            /**
             * 获取详情
             * @returns
             */
            getData() {
                let url = '/fam/team/selectById' + '?teamOid=' + this.key;

                this.$famHttp({
                    url,
                    method: 'get'
                })
                    .then((resp) => {
                        let { data } = resp;
                        this.title = data?.displayName || '';
                        this.formData = data;
                        // 组织默认团队 不可添加子角色
                        if (this.data?.identifierNo === 'T20200425005') {
                            this.showParticipantType = ['USER', 'GROUP'];
                        } else {
                            this.showParticipantType = ['USER', 'GROUP', 'ROLE'];
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            // 编辑
            onEdit() {
                this.innerVisible = true;
            },
            /**
             * 启用
             */
            onEnabled() {
                let { id, enabled } = this.formData;
                let formData = new FormData();
                formData.append('id', id);
                formData.append('enabled', !enabled);
                this.$famHttp({
                    url: '/fam/team/template/enabled',
                    data: formData,
                    method: 'put'
                })
                    .then((res) => {
                        if (enabled) {
                            this.$message.success(this.i18nMappingObj.disabledSuccess);
                        } else {
                            this.$message.success(this.i18nMappingObj.enabledSuccess);
                        }
                        this.refresh();
                    })
                    .catch((err) => {
                        // this.$message.error(this.i18nMappingObj.disabled);
                    });
            },
            /**
             * 删除
             */
            onDelete() {
                this.$confirm(this.i18nMappingObj['removeTips'], this.i18nMappingObj['confirmDel'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then((_) => {
                    this.$famHttp({
                        url: '/fam/delete',
                        params: {
                            oid: this.key
                        },
                        method: 'DELETE'
                    })
                        .then((resp) => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj['removeSuccessful'],
                                showClose: true
                            });
                            this.$emit('onrefresh');
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
            },
            onSubmit(data, type) {
                this.refresh();
                this.$emit('onrefresh', data);
            }
        },
        components: {
            BaseInfo: ErdcKit.asyncComponent(ELMP.resource('biz-template/team-template/components/BaseInfo/index.js')),
            BaseInfoConfig: ErdcKit.asyncComponent(
                ELMP.resource('biz-template/team-template/components/BaseInfoConfig/index.js')
            ),
            // ProductOverview: ErdcKit.asyncComponent(
            //     ELMP.resource('biz-template/team-template/components/ProductOverview/index.js')
            // ),
            PhaseInformation: ErdcKit.asyncComponent(
                ELMP.resource('biz-template/team-template/components/PhaseInformation/index.js')
            ),
            VueDraggable,
            Team: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js'))
        }
    };
});
