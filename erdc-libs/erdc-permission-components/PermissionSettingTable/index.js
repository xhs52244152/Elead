define([
    'text!' + ELMP.resource('erdc-permission-components/PermissionSettingTable/index.html'),
    'css!' + ELMP.resource('erdc-permission-components/PermissionSettingTable/style.css'),
    'fam:http'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const UPDATE_MAPPING = {
        1: ['0', '10'],
        2: ['0', '10', '1', '11'],
        10: ['0'],
        11: ['0', '10', '1']
    };
    return {
        template,
        components: {
            ExpansionFoldingBlock: ErdcKit.asyncComponent(
                ELMP.resource('erdc-permission-components/ExpansionFoldingBlock/index.js')
            ),
            // 基础表格
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            editTableData: {
                type: Object,
                default: () => {
                    return [];
                }
            }
        },
        watch: {},
        computed: {
            tableColumns() {
                return [
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        width: '48'
                    },
                    {
                        prop: 'permission', // 属性名
                        title: this.i18nMappingObj.permission, // 字段名
                        minWidth: '120',
                        filter: false
                    },
                    {
                        prop: 'grantPermission',
                        title: this.i18nMappingObj.gPermission,
                        minWidth: '120'
                    },
                    {
                        prop: 'denialOfPermission',
                        title: this.i18nMappingObj.dPermission,
                        minWidth: '120'
                    },
                    {
                        prop: 'absoluteDenialOfPermission',
                        title: this.i18nMappingObj.aPermission,
                        minWidth: '120'
                    },
                    {
                        prop: 'noPermission',
                        title: this.i18nMappingObj.nPermission,
                        minWidth: '120'
                    }
                ];
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-permission-components/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    gPermission: this.getI18nByKey('授予权限'),
                    dPermission: this.getI18nByKey('拒绝权限'),
                    aPermission: this.getI18nByKey('绝对拒绝权限'),
                    nPermission: this.getI18nByKey('无权限'),
                    setPermission: this.getI18nByKey('设置权限'),
                    setPermissionTips: this.getI18nByKey('设置权限提示'),
                    permission: this.getI18nByKey('权限'),
                    allNoPermissionTips: this.getI18nByKey('全部无权限')
                },
                tableMaxHeight: 450,
                tableData: []
            };
        },
        created() {
            this.initData();
        },
        methods: {
            initData() {
                this.$famHttp({
                    url: '/fam/type/component/enumDataList',
                    params: {
                        realType: 'erd.cloud.core.base.access.AccessPermission'
                    },
                    method: 'POST'
                }).then((res) => {
                    if (res.code === '200') {
                        const resData =
                            (res.data &&
                                res.data.map((item) => {
                                    const obj = {
                                        id: (item.extraInfo && item.extraInfo.code) || '',
                                        permission: item.description,
                                        selectField: 'noPermission',
                                        grantPermission: '',
                                        denialOfPermission: '',
                                        absoluteDenialOfPermission: '',
                                        noPermission: ''
                                    };
                                    return obj;
                                })) ||
                            [];
                        const tableData = this.setDefaultTableDataValue(resData);
                        this.tableData = tableData;
                    }
                });
            },
            handlerChangeRadio(scope, filedName) {
                this.$set(scope.row, 'selectField', filedName);
                if (filedName === 'grantPermission') {
                    this.changeOtherRowByNow(scope.row);
                }
            },
            changeOtherRowByNow(row) {
                const currentRowId = row.id;
                switch (currentRowId) {
                    case '1':
                        this.handlerLinkRelationship(UPDATE_MAPPING['1']);
                        break;
                    case '2':
                        this.handlerLinkRelationship(UPDATE_MAPPING['2']);
                        break;
                    case '5':
                        this.handlerLinkRelationship(UPDATE_MAPPING['2']);
                        break;
                    case '7':
                        this.handlerLinkRelationship(UPDATE_MAPPING['2']);
                        break;
                    case '8':
                        this.handlerLinkRelationship(UPDATE_MAPPING['2']);
                        break;
                    case '10':
                        this.handlerLinkRelationship(UPDATE_MAPPING['10']);
                        break;
                    case '11':
                        this.handlerLinkRelationship(UPDATE_MAPPING['11']);
                        break;
                    default:
                        break;
                }
            },
            handlerLinkRelationship(updateArr) {
                /**
                 * 仅授予权限场景：
                    1、选中修改，会默认增加读取、下载权限
                    2、选中创建、删除、修订、新建试图版本，会默认增加读取、修改、下载、修改内容权限
                    3、选中下载，会默认增加读取权限
                    4、选中修改内容，会默认增加读取、修改、下载权限
                 */
                updateArr.forEach((item) => {
                    const row = this.tableData.find((el) => {
                        return el.id === item;
                    });
                    row && (row.selectField = 'grantPermission');
                });
            },
            validateTable() {
                const isAllNoPermission = this.tableData.findIndex((item) => {
                    return item.selectField !== 'noPermission';
                });
                if (isAllNoPermission === -1) {
                    this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj.allNoPermissionTips,
                        showClose: true
                    });
                    return { isSuccess: false, tableData: this.tableData };
                }
                return { isSuccess: true, tableData: this.tableData };
            },
            setDefaultTableDataValue(data) {
                const {
                    grantPermissionArr = [],
                    denialOfPermissionArr = [],
                    absoluteDenialOfPermission = []
                } = this.editTableData;
                const tableData = data.map((item) => {
                    const code = item.id;
                    if (grantPermissionArr.indexOf(code) !== -1) {
                        item.selectField = 'grantPermission';
                    } else if (denialOfPermissionArr.indexOf(code) !== -1) {
                        item.selectField = 'denialOfPermission';
                    } else if (absoluteDenialOfPermission.indexOf(code) !== -1) {
                        item.selectField = 'absoluteDenialOfPermission';
                    }
                    return item;
                });
                return tableData;
            }
        }
    };
});
