define([
    'text!' + ELMP.func('erdc-ppm-project-change/components/ChangeInfo/index.html'),
    'css!' + ELMP.func('erdc-ppm-project-change/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'ChangeInfo',
        template,
        components: {
            FamTableColSet: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamTableColSet/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-ppm-project-change/locale/index.js'),
                options: [],
                beforeChangeData: [],
                afterChangeData: [],
                sShowDialog: false,
                showDescription: false,
                description: false
            };
        },
        props: {
            showDialog: {
                type: Boolean,
                default: false
            },
            // 变更单oid
            changeOid: {
                type: String,
                default: ''
            },
            // 比对类型
            compareType: {
                type: String,
                default: ''
            },
            // 项目Oid
            projectOid: {
                type: String,
                default: ''
            },
            changeContent: {
                type: String,
                default: ''
            }
        },
        computed: {
            tableHeight() {
                return document.documentElement.clientHeight - 310;
            }
        },
        created() {
            this.sShowDialog = this.showDialog;
            this.initData();
        },
        methods: {
            cellStyle({ row, rowIndex, column }, index) {
                if (this.compareType !== 'teamChange') {
                    let status = row.rawData?.['lifecycleStatus.status']?.value;
                    if (index === 1 && status !== 'CROPPED' && this.$refs['vxeGridRef_before']) {
                        let rowData = this.$refs['vxeGridRef_before'].getData(rowIndex);
                        if (row.action === 'CREATE') {
                            return {
                                backgroundColor: '#fef5f5'
                            };
                        } else if (rowData[column.property] !== row[column.property]) {
                            return {
                                backgroundColor: '#fef5f5'
                            };
                        }
                    }
                } else {
                    if (row.action === 'DELETE' || row.isCreate) {
                        return {
                            backgroundColor: '#fef5f5'
                        };
                    }
                    // if (row.isCreate) {
                    //     return {
                    //         backgroundColor: '#00A854'
                    //     };
                    // }
                }
            },
            initData() {
                let functions = [
                    this.$famHttp({
                        url: `/ppm/change/compare?oid=${this.changeOid}&changeContent=${this.changeContent}`,
                        method: 'POST'
                    }),
                    this.getListColumns()
                ];
                Promise.all(functions)
                    .then((resp) => {
                        let resData = resp[0].data;
                        let resColumns = resp[1];
                        if (resColumns.length > 0) {
                            if (this.compareType !== 'teamChange')
                                resData.forEach((element) => {
                                    let before = _.isEmpty(element.before)
                                        ? {}
                                        : {
                                              action: element.action,
                                              rawData: element.before.rawData,
                                              ...ErdcKit.deserializeAttr(element.before.rawData, {
                                                  valueKey: 'displayName'
                                              })
                                          };
                                    let after = _.isEmpty(element.after)
                                        ? {}
                                        : {
                                              action: element.action,
                                              rawData: element.after.rawData,
                                              ...ErdcKit.deserializeAttr(element.after.rawData, {
                                                  valueKey: 'displayName'
                                              })
                                          };
                                    this.beforeChangeData.push(before);
                                    this.afterChangeData.push(after);
                                });
                            else {
                                const getData = (data, parentId = '-1', result = []) => {
                                    for (let i = 0; i < data.length; i++) {
                                        let item = data[i];
                                        item.parentId = parentId;
                                        item.roleType = item.roleType || item.principalTarget;
                                        item.principalTarget = this.filterType(item.roleType || item.principalTarget);
                                        if (item.roleType === 'ROLE') {
                                            item.oid = item.oid || item.roleBObjectRef + '-' + new Date().getTime();
                                            item.id = item.id || item.roleBObjectRef + '-' + new Date().getTime();
                                            item.principalName = item.roleName;
                                        }
                                        if (item.action === 'DELETE') {
                                            resColumns.forEach((col) => {
                                                item[col.field] = '';
                                            });
                                        }
                                        result.push(item);
                                        let children = [
                                            ...(item.changeRolePrincipalLinks || []),
                                            ...(item.changeChildren || [])
                                        ];
                                        if (children.length) getData(children, item.id, result);
                                    }
                                    return result.map((item) => {
                                        return item.action === 'DELETE'
                                            ? item
                                            : {
                                                  ...item,
                                                  code: item?.code || '--',
                                                  userCode: item?.userCode || '--',
                                                  mobile: item?.mobile || '--',
                                                  email: item?.email || '--',
                                                  department: item?.department || '--'
                                              };
                                    });
                                };
                                let [{ afterContainerTeam, beforeContainerTeam }] = resData || [{}];

                                this.beforeChangeData = getData(
                                    beforeContainerTeam.teamRoleLinkDtos.map((item) => {
                                        item.roleType = 'ROLE';
                                        return item;
                                    })
                                );
                                afterContainerTeam = afterContainerTeam.teamRoleLinkDtos.map((item) => {
                                    item.roleType = 'ROLE';
                                    item.id = item.roleBObjectRef + '-' + new Date().getTime() + item.roleName;
                                    item.oid = item.roleBObjectRef + '-' + new Date().getTime() + item.roleName + 'oid';
                                    return item;
                                });
                                // 新增的排在后面;
                                afterContainerTeam = [
                                    ...afterContainerTeam.filter((item) => !item.isCreate),
                                    ...afterContainerTeam.filter((item) => item.isCreate)
                                ];
                                this.afterChangeData = getData(afterContainerTeam);
                                let createData = this.afterChangeData.filter((item) => {
                                    return (
                                        item.isCreate &&
                                        this.beforeChangeData.findIndex(
                                            (beforeItem) => beforeItem.id === item.parentId
                                        ) > -1
                                    );
                                });
                                this.beforeChangeData.push(
                                    ...createData.map((item) => {
                                        let result = ErdcKit.deepClone(item);
                                        resColumns.forEach((res) => {
                                            result[res.field] = '';
                                        });
                                        result.isCreate = false;
                                        return result;
                                    })
                                );
                            }
                            const beforeChangeDataLength = this.beforeChangeData.length;
                            const afterChangeDataLength = this.afterChangeData.length;
                            const length = afterChangeDataLength - beforeChangeDataLength;
                            const lastData = length > 0 ? this.beforeChangeData[beforeChangeDataLength - 1] : {};

                            // 取变更前最后一条数据找到parentId数据进行push空数据
                            for (let i = 0; i < length; i++) {
                                const obj = {};
                                Object.keys(lastData).forEach((key) => {
                                    obj[key] = key === 'parentId' ? lastData[key] : '';
                                });
                                this.beforeChangeData.push(obj);
                            }
                            this.options = [
                                {
                                    headerTitle: this.i18n.beforeChange,
                                    border: true,
                                    showOverflow: true,
                                    showHeaderOverflow: 'title',
                                    height: this.tableHeight,
                                    ref: 'vxeGridRef_before',
                                    columns: resColumns,
                                    data: this.beforeChangeData,
                                    scrollY: {
                                        enabled: true
                                    },
                                    scrollX: {
                                        enabled: true
                                    }
                                },
                                {
                                    headerTitle: this.i18n.afterChange,
                                    border: true,
                                    showOverflow: true,
                                    showHeaderOverflow: 'title',
                                    height: this.tableHeight,
                                    ref: 'vxeGridRef_after',
                                    columns: resColumns,
                                    data: this.afterChangeData,
                                    scrollY: {
                                        enabled: true
                                    },
                                    scrollX: {
                                        enabled: true
                                    }
                                }
                            ];
                            this.compareType === 'teamChange' &&
                                this.options.forEach((item) => {
                                    item.treeConfig = {
                                        transform: true,
                                        expandAll: true,
                                        reserve: true,
                                        rowField: 'id',
                                        iconOpen: 'erd-iconfont erd-icon-arrow-down',
                                        iconClose: 'erd-iconfont erd-icon-arrow-right ',
                                        parentField: 'parentId'
                                    };
                                });
                        }
                    })
                    .catch(() => {});
            },
            getListColumns() {
                let name = '';
                switch (this.compareType) {
                    case 'projectPlan':
                        name = 'getProjectPlanColumns';
                        break;
                    case 'projectInfo':
                        name = 'getProjectInfoColumns';
                        break;
                    case 'teamChange':
                        name = 'getTeamChangeColumns';
                        break;
                }
                return this[name]();
            },
            gridScroll: _.debounce(function ({ scrollTop, scrollLeft }) {
                for (var key in this.$refs) {
                    if (key !== 'vxeGridRef_0') {
                        this.$refs[key].scrollTo(scrollLeft, scrollTop);
                    }
                }
            }, 10),
            closeFn() {
                this.$emit('cancel');
            },
            getProjectPlanColumns() {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/ppm/plan/v1/change/tasks/head',
                        method: 'GET',
                        appName: 'PPM',
                        className: 'erd.cloud.ppm.project.entity.Project',
                        data: {
                            TableKey: 'TaskChangeView'
                        }
                    }).then((res) => {
                        let keyAttrMap = {};
                        res.data.headers.forEach((col) => {
                            keyAttrMap[col.attrName] = col.originalName.split('#')[1];
                        });
                        let columns = res.data.headers
                            .filter((item) => (item.locked && !item.isReadOnly) || item.attrName === 'Name')
                            .map((item) => {
                                let obj = {
                                    title: item.label,
                                    field: keyAttrMap[item.attrName],
                                    width: item.width || 120,
                                    resizable: true,
                                    isSelected: false,
                                    visible: true
                                };
                                return obj;
                            });
                        let nameCol = columns.find((item) => item.field === 'name');
                        nameCol.width = 200;
                        resolve(columns);
                    });
                });
            },
            getProjectInfoColumns() {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/ppm/type/layout/getLayoutByType',
                        method: 'POST',
                        data: {
                            attrRawList: [
                                // {
                                //     attrName: 'layoutSelector',
                                //     value: 'PROJECT_CHANGE_UPDATE'
                                // }
                            ],
                            className: 'erd.cloud.ppm.project.entity.Project',
                            layoutType: 'UPDATE',
                            name: 'PROJECT_CHANGE_UPDATE',
                            oid: this.projectOid
                        }
                    }).then((res) => {
                        let columns = res.data.layoutAttrList
                            .filter(
                                (item) =>
                                    !item.readonly && !item.hidden && item.componentName !== 'FamClassificationTitle'
                            )
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((item) => {
                                let component = JSON.parse(item?.componentJson || {});
                                let obj = {
                                    title: item.attrDisplayName,
                                    field: item.attrName,
                                    width: item.width || 120,
                                    isSelected: false,
                                    visible: true
                                };
                                if (component?.key === 'ErdQuillEditor') {
                                    obj.slots = {
                                        default: 'erdQuillEditor'
                                    };
                                }
                                return obj;
                            });
                        columns.unshift({
                            title: this.i18n.name,
                            field: 'name',
                            width: 200,
                            resizable: true,
                            isSelected: false,
                            visible: true
                        });
                        resolve(columns);
                    });
                });
            },
            rowClassName({ row }) {
                let status = row.rawData?.['lifecycleStatus.status']?.value;
                return status === 'CROPPED' ? 'fam-erd-table__row--deleted' : '';
            },
            viewDetails(row) {
                this.description = row.description;
                this.showDescription = true;
            },
            closeDescription() {
                this.description = '';
            },
            getTeamChangeColumns() {
                return new Promise((resolve) => {
                    // 加setTimeout是因为加载国际化文件需要时间，不加会是undefined
                    setTimeout(() => {
                        let columns = [
                            {
                                field: 'principalName', // 参与者
                                treeNode: true,
                                sort: false,
                                width: '210',
                                title: this.i18n?.['participants'],
                                slots: {
                                    default: 'principalName'
                                }
                            },
                            {
                                field: 'principalTarget', // 参与者类型
                                title: this.i18n?.['participantsType'],
                                width: '80',
                                sort: false
                            },
                            {
                                field: 'code', // 工号
                                title: this.i18n?.['workNumber'],
                                sort: false,
                                width: '80'
                            },
                            {
                                field: 'userCode', // 登录号
                                title: this.i18n?.['login'],
                                sort: false,
                                width: '120'
                            },
                            {
                                field: 'mobile', // 手机
                                title: this.i18n?.['mobilePhone'],
                                sort: false,
                                width: '120'
                            },
                            {
                                field: 'email', // 邮箱
                                title: this.i18n?.['email'],
                                sort: false,
                                width: '120'
                            },
                            {
                                field: 'department', // 部门
                                title: this.i18n.department,
                                sort: false,
                                width: '80'
                            }
                        ];
                        resolve(columns);
                    }, 100);
                });
            },
            filterType(val) {
                let displayLabel = val;
                switch (val) {
                    case 'USER':
                        displayLabel = this.i18n.user;
                        break;
                    case 'GROUP':
                        displayLabel = this.i18n.group;
                        break;
                    case 'ROLE':
                        displayLabel = this.i18n.role;
                        break;
                    default:
                        break;
                }
                return displayLabel;
            }
        }
    };
});
