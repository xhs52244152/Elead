//  此组件适用于业务管理-重量级团队和产品信息模块

define([
    'text!' + ELMP.resource('erdc-ppm-heavy-team/components/LookUser/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('erdc-ppm-heavy-team/components/LookUser/style.css')
], function (template, ErdcKit) {
    const famHttp = require('fam:http');
    return {
        template,
        props: {
            title: {
                typeof: String,
                default: '查看用户'
            },
            currentOperRole: {
                typeof: Object
            },
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-ppm-heavy-team/locale/index.js'),
                i18nMappingObj: {
                    groupInfo: this.getI18nByKey('groupInfo'),
                    userInfo: this.getI18nByKey('userInfo'),
                    participants: this.getI18nByKey('participants'),
                    participantsType: this.getI18nByKey('participantsType'),
                    workNumber: this.getI18nByKey('workNumber'),
                    login: this.getI18nByKey('login'),
                    mobile: this.getI18nByKey('mobile'),
                    email: this.getI18nByKey('email'),
                    department: this.getI18nByKey('department')
                },
                tableData: [],

                panelUnfoldGroup: true,
                panelUnfoldUser: true
            };
        },
        created() {
            this.getList();
        },
        computed: {
            column() {
                return [
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'left' //多选框默认居中显示
                    },
                    {
                        prop: 'userInfo.displayName', // 参与者
                        sort: false,
                        width: '110',
                        title: this.i18nMappingObj.participants
                    },
                    {
                        prop: 'linkName', // 参与者类型
                        title: this.i18nMappingObj.participantsType,
                        sort: false
                    },
                    {
                        prop: 'userInfo.code', // 工号
                        title: this.i18nMappingObj.workNumber,
                        sort: false
                    },
                    // {
                    //     prop: 'userCode', // 登录号
                    //     title: this.i18nMappingObj['login'],
                    //     sort: false
                    // },
                    {
                        prop: 'userInfo.mobile', // 手机
                        title: this.i18nMappingObj['mobile'],
                        sort: false
                    },
                    {
                        prop: 'userInfo.emai', // 邮箱
                        title: this.i18nMappingObj['email'],
                        sort: false
                    },
                    {
                        prop: 'userInfo.orgName', // 部门
                        title: this.i18nMappingObj['department'],
                        sort: false
                    }
                ];
            },
            dialogVisibleUser: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            }
        },
        methods: {
            getList() {
                const params = {
                    roleAObjectOId: this.currentOperRole.roleBObjectRef,
                    orderBy: 'createTime',
                    current: 1,
                    size: 200
                };
                famHttp
                    .post('fam/group/link/page', params)
                    .then((res) => {
                        this.tableData = res.data.records || [];
                    })
                    .catch((error) => {
                        console.error('error====>', error);
                    });
            }
        },
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),

            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        }
    };
});
