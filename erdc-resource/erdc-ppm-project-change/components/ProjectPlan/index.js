define([
    'text!' + ELMP.func('erdc-ppm-project-change/components/ProjectPlan/index.html'),
    'erdcloud.kit',
    'dayjs',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    ELMP.resource('ppm-utils/index.js'),
    'css!' + ELMP.func('erdc-ppm-project-change/style.css')
], function (template, ErdcKit, dayjs, store, utils, globalUtils) {
    return {
        name: 'ProjectPlan',
        template,
        props: {
            businessData: {
                type: Array,
                default: () => []
            },
            readonly: Boolean,
            processInfos: {
                type: Object,
                default: () => {}
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            GanttView: ErdcKit.asyncComponent(ELMP.resource('project-plan/components/Gantt/index.js')),
            FamMemberSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamMemberSelect/index.js')),
            ProjectAssignmentsSelect: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/ProjectAssignmentsSelect/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-ppm-project-change/locale/index.js'),
                panelUnfold: true,
                showAddProjectDialog: false,
                // 可选任务条件
                conditionDtoList: [],
                // 列头
                headers: [],
                // 人员选项
                usersByContainer: [],
                // 资源角色选项
                containerTeamRoles: [],
                // 获取表头键值与实际属性名映射关系
                keyAttrMap: {},
                originalAttrMap: {},
                tableData: [],
                sourceData: [],
                allColumns: [],
                dateFields: [
                    'Start',
                    'Finish',
                    'StartDate',
                    'FinishDate',
                    'LastTaskFinishDate',
                    'CurrentDate',
                    'LateStart',
                    'EarlyFinish',
                    'EarlyStart',
                    'LateFinish',
                    'ActualStart',
                    'ActualFinish'
                ],
                defaultProps: {
                    label: 'roleName',
                    value: 'roleCode'
                },
                params: {},
                requiredFields: [],
                showTable: false
            };
        },
        computed: {
            // allColumns() {
            //     let _this = this;
            //     let columns = _this.headers
            //         .filter((item) => item.locked)
            //         .map((item) => {
            //             let obj = {
            //                 label: item.label,
            //                 attrName: _this.keyAttrMap[item.attrName],
            //                 width: item.width
            //             };
            //             if (!item.isReadOnly && !this.readonly) {
            //                 obj.editRender = {
            //                     autofocus: '.el-input__inner'
            //                 };
            //                 _this.requiredFields.push({
            //                     attrName: _this.keyAttrMap[item.attrName],
            //                     createRequire: item.createRequire,
            //                     updateRequire: item.updateRequire
            //                 });
            //             }
            //             return obj;
            //         });
            //     return columns;
            // },
            slotsField() {
                if (this.readonly) {
                    return [];
                } else {
                    return [
                        {
                            prop: 'resAssignments',
                            type: 'edit'
                        },
                        {
                            prop: 'responsiblePerson',
                            type: 'edit'
                        },
                        {
                            prop: 'timeInfo.scheduledStartTime',
                            type: 'edit'
                        },
                        {
                            prop: 'timeInfo.scheduledEndTime',
                            type: 'edit'
                        },
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ];
                }
            },
            slotsNameList() {
                return this.slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            viewTableConfig() {
                const _this = this;
                return {
                    viewMenu: {
                        hiddenNavBar: true
                    },
                    saveAs: false,
                    tableKey: 'TaskChangeView',
                    tableConfig: {
                        vm: _this,
                        useCodeConfig: true,
                        tableBaseConfig: {
                            'showOverflow': true,
                            'edit-config': {
                                trigger: 'click',
                                mode: 'cell',
                                showUpdateStatus: false,
                                beforeEditMethod: this.beforeEditMethod
                            },
                            'treeNode': '',
                            'treeConfig': {
                                childrenField: 'children'
                            },
                            'maxLine': 5,
                            'rowClassName'(data) {
                                return data?.row?.action === 'DELETE' ? 'fam-erd-table__row--deleted' : '';
                            },
                            'customValid': false
                        },
                        tableData: _this.tableData,
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: false, // 是否显示普通模糊搜索，默认显示
                                searchCondition: [],
                                isLocalSearch: false
                            },
                            basicFilter: {
                                show: false
                            },
                            actionConfig: {
                                name: '',
                                containerOid: '',
                                className: ''
                            }
                        },
                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        pagination: {
                            showPagination: false
                        },
                        slotsField: _this.slotsField,
                        columns: _this.allColumns
                    }
                };
            },
            projectOid() {
                return this.businessData[0]?.oid || this.businessData[0]?.projectBasicInfo?.oid;
            },
            projectId() {
                return this.businessData[0]?.id || this.businessData[0]?.projectBasicInfo?.id;
            },
            containerRef() {
                return this.businessData[0]?.containerRef || this.businessData[0]?.projectBasicInfo?.containerRef;
            },
            currentPlanSet() {
                let data = this.tableData.length ? this.tableData[0] : this.sourceData[0];
                let collectOid = data?.attrRawList?.filter((item) => item.attrName === 'collectRef')?.[0]?.value;
                if (collectOid && collectOid?.value && _.isObject(collectOid?.value))
                    return 'OR:' + collectOid.value.key + ':' + collectOid.value.id;
                return collectOid;
            },
            className() {
                return store.state.classNameMapping.task;
            }
        },
        watch: {
            businessData: {
                handler(val) {
                    let tableData = ErdcKit.deepClone(val[0]?.planChange?.changeData || []);
                    tableData.forEach((item) => {
                        item.typeReference = item.typeReferenceName;
                    });
                    this.tableData = ErdcKit.deepClone(tableData);
                    this.sourceData = ErdcKit.deepClone(tableData);
                },
                immediate: true
            },
            headers: {
                handler(val) {
                    let columns = val
                        .filter((item) => item.isShow)
                        .map((item) => {
                            let obj = {
                                label: item.label,
                                attrName: this.keyAttrMap[item.attrName],
                                width: item.width
                            };
                            if (!item.isReadOnly && !this.readonly) {
                                obj.editRender = {
                                    autofocus: '.el-input__inner'
                                };
                                this.requiredFields.push({
                                    attrName: this.keyAttrMap[item.attrName],
                                    createRequire: item.createRequire,
                                    updateRequire: item.updateRequire
                                });
                            }
                            return obj;
                        });
                    this.allColumns = columns;
                    this.showTable = true;
                }
            }
        },
        activated() {
            this.getCreatePlan();
        },
        created() {
            this.getHeaders();
            if (!this.readonly) {
                this.getUsersByContainer();
                this.getContainerTeamRole();
            }
        },
        mounted() {},
        methods: {
            getValue(row, key) {
                const responsiblePersonObj = row.attrRawList.find((item) => item.attrName === 'responsiblePerson');
                responsiblePersonObj.oid = responsiblePersonObj.value;
                return key === 'value' ? responsiblePersonObj.value : [responsiblePersonObj];
            },
            // 计划数据校验
            validate(type) {
                return new Promise((resolve, reject) => {
                    let sourceData = ErdcKit.deepClone(this.$refs.table.$refs.FamAdvancedTable.tableData);
                    sourceData.forEach((item) => {
                        item.typeReferenceName = item.typeReference;
                        item.typeReference = item.attrRawList.find((item) => item.attrName === 'typeReference')?.value;
                    });
                    if (this.processInfos?.nodeMap?.node?.highLightedActivities?.[0] === 'resubmit') {
                        sourceData.forEach((item) => {
                            item.addTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
                        });
                    }

                    let obj = {
                        planChange: {
                            collectOId: this.currentPlanSet,
                            changeData: sourceData
                        }
                    };
                    if (type === 'draft') {
                        resolve(obj);
                    } else {
                        if (!this.readonly) {
                            let falg = this.validateTaskRequire();
                            if (falg) {
                                resolve(obj);
                            } else {
                                reject([
                                    {
                                        valid: false,
                                        message: this.i18n.planRequired
                                    }
                                ]);
                            }
                        } else {
                            resolve({ planChange: this.businessData[0]?.planChange });
                        }
                    }
                });
            },
            // 校验任务必填项是否已填
            validateTaskRequire() {
                let falg = true;
                _.forEach(this.requiredFields, (field) => {
                    this.sourceData.find((data) => {
                        if (data.action === 'CREATE' && field.updateRequire && !data[field.attrName]) {
                            falg = false;
                        } else if (data.action === 'UPDATE' && field.updateRequire && !data[field.attrName]) {
                            falg = false;
                        }
                    });
                    if (!falg) return;
                });
                return falg;
            },
            onActionClick(name) {
                let _this = this;
                const eventClick = {
                    // 任务创建
                    create_task: () => {
                        const routeConfig = {
                            path: '/space/project-plan/planCreate',
                            query: {
                                collectId: _this.currentPlanSet,
                                sceneName: 'change',
                                pid: _this.projectOid,
                                currentPlanSet: _this.currentPlanSet
                            }
                        };
                        globalUtils.openPage({
                            routeConfig,
                            appName: 'erdc-project-web'
                        });
                    },
                    // 变更信息对比
                    change_info: () => {
                        let changeOid = this.businessData[0].roleBObjectRef;
                        const changeContentValue = this.businessData[0].changeObject.attrRawList.find(
                            (item) => item.attrName === 'changeContent'
                        )?.value;
                        const changeContent = changeContentValue?.split(',').find((item) => ['TASK'].includes(item));
                        let props = {
                            showDialog: true,
                            changeOid,
                            compareType: 'projectPlan',
                            changeContent
                        };
                        let { destroy } = utils.useFreeComponent({
                            template: `
                            <change-info
                                v-bind="params"
                                @cancel="cancel">
                            </change-info>
                            `,
                            components: {
                                ChangeInfo: ErdcKit.asyncComponent(
                                    ELMP.func('erdc-ppm-project-change/components/ChangeInfo/index.js')
                                )
                            },
                            data() {
                                return {
                                    params: {}
                                };
                            },
                            created() {
                                this.params = props;
                            },
                            methods: {
                                cancel() {
                                    destroy();
                                }
                            }
                        });
                    },
                    // 任务添加
                    add_task: () => {
                        this.$famHttp({
                            url: '/ppm/communal/getProjectSettings',
                            method: 'GET',
                            data: {
                                projectOid: this.projectOid,
                                configType: 'Change_Management'
                            }
                        }).then((res) => {
                            let changeConfigContent = JSON.parse(res?.data?.configContent || [])?.[0];
                            this.conditionDtoList = [
                                {
                                    attrName: 'erd.cloud.ppm.plan.entity.Task#collectRef',
                                    oper: 'EQ',
                                    value1: this.currentPlanSet || 'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1'
                                },
                                {
                                    attrName: 'erd.cloud.ppm.plan.entity.Task#projectRef',
                                    oper: 'EQ',
                                    value1: this.projectOid
                                },
                                {
                                    attrName: 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status',
                                    isCondition: true,
                                    logicalOperator: 'AND',
                                    oper: 'IN',
                                    sortOrder: 0,
                                    value1: changeConfigContent?.value?.projectTaskStatus.join(',')
                                },
                                {
                                    attrName: 'erd.cloud.ppm.plan.entity.Task#enableChangeProcess',
                                    oper: 'EQ',
                                    logicalOperator: 'AND',
                                    sortOrder: 1,
                                    isCondition: true,
                                    value1: true
                                }
                            ];
                            this.showAddProjectDialog = true;
                        });
                    },
                    // 任务移除
                    remove_task: (selected) => {
                        let _this = this;
                        if (selected.length < 1) return _this.$message.info(_this.i18n.slecetRemoveTask);
                        _this
                            .$confirm(_this.i18n.removeOrNot, _this.i18n.removeConfirm, {
                                distinguishCancelAndClose: true,
                                confirmButtonText: _this.i18n.confirm,
                                cancelButtonText: _this.i18n.cancel,
                                type: 'warning'
                            })
                            .then(() => {
                                let selectedCodeList = selected.map((item) => item.identifierNo);
                                if (selected.length > 1) {
                                    _this.sourceData = _this.sourceData.filter(
                                        (item) => !selectedCodeList.includes(item.identifierNo)
                                    );
                                } else {
                                    _this.sourceData = _this.sourceData.filter(
                                        (item) => !selectedCodeList.includes(item.identifierNo)
                                    );
                                }
                                _this.$refs.table.$refs.FamAdvancedTable.selectData = [];
                                _this.$refs.table.$refs.FamAdvancedTable.tableData = _this.sourceData;
                            });
                    }
                };
                let selected = this.$refs.table.fnGetCurrentSelection();
                return eventClick[name] && eventClick[name](selected);
            },
            // 添加计划
            addProjectConfirm() {
                let { containerRef, className } = this;
                let _this = this;
                let selectedTask = _this.$refs.ganttView.project.getSelected();
                const uidArr = selectedTask.map((item) => item.UID);
                const codeArr = this.sourceData
                    .filter((item) => {
                        return uidArr.includes(item.oid);
                    })
                    .map((item) => item.identifierNo);
                if (codeArr.length) {
                    let message = `${codeArr.join('、')}${this.i18n.codingRepeated}`;
                    this.$message.error(message);
                    return;
                }

                selectedTask.forEach((item) => {
                    let attrRawList = [];
                    // let falg = _this.sourceData.find((task) => {
                    //     return task.oid === item.UID;
                    // });
                    // if (falg) return;
                    Object.keys(item).forEach((key) => {
                        let attrName = _this.keyAttrMap[key] || key,
                            value = item[key];
                        // 如果字段不存在或者不在列头里，就不存在attrRawList里, collectRef前端要用。后端说是数据有问题，要过滤数据
                        if (
                            (!attrName || !this.allColumns.filter((item) => item.attrName === attrName).length) &&
                            attrName !== 'collectRef'
                        )
                            return;
                        if (['UID', '_state'].includes(key)) return;
                        if (_this.dateFields.includes(key)) value = value ? dayjs(value).format('YYYY-MM-DD') : '';
                        if (attrName === 'participant') {
                            attrRawList.push({
                                attrName,
                                value: value?.value?.split(',') || []
                            });
                        } else if (attrName === 'resAssignments') {
                            let valueStr = value
                                ?.map((val) => {
                                    return _this.containerTeamRoles.filter(
                                        (item) => item.roleBObjectRef === val.ResourceUID
                                    )?.[0]?.roleCode;
                                })
                                .join(',');
                            attrRawList.push({
                                attrName,
                                value: valueStr
                            });
                        } else if (attrName === 'PredecessorLink') {
                            let valueStr = item.preTask
                                ?.map((val) => {
                                    return val.displayName;
                                })
                                .join(',');
                            attrRawList.push({
                                attrName,
                                value: valueStr
                            });
                        } else if (attrName === 'typeReference' || attrName === 'collectRef') {
                            let valueStr = 'OR:' + item?.[attrName]?.value?.key + ':' + item?.[attrName]?.value?.id;
                            attrRawList.push({
                                attrName,
                                value: valueStr
                            });
                        } else if (attrName === 'scalable') {
                            attrRawList.push({
                                attrName,
                                value: !!value
                            });
                        } else {
                            if (_.isObject(value) && !_.isArray(value)) {
                                attrRawList.push({
                                    attrName,
                                    ...value
                                });
                            } else {
                                attrRawList.push({
                                    attrName,
                                    value
                                });
                            }
                        }
                    });
                    let plan = {
                        attrRawList,
                        action: 'UPDATE',
                        className,
                        oid: item.UID,
                        containerRef,
                        addTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
                    };
                    _this.formatAttrRawList(attrRawList, plan);
                    let createData =
                        _this.sourceData.filter((plan) => plan.action === 'CREATE' && !plan.parentCode) || [];
                    let addData = _this.sourceData.filter((plan) => plan.action !== 'CREATE') || [];
                    let childrenData =
                        _this.sourceData.filter((plan) => plan.action === 'CREATE' && plan.parentCode) || [];
                    addData.push(plan);
                    addData.sort((a, b) => Number(a.OutlineNumber) - Number(b.OutlineNumber));
                    let newData = [...addData, ...createData];
                    childrenData.forEach((data, ind) => {
                        childrenData.splice(ind, 1);
                        let index = newData.findIndex((item) => item.identifierNo === data.parentCode);
                        newData.splice(index + 1, 0, data);
                    });
                    _this.sourceData = newData;
                });
                _this.$refs.table.$refs.FamAdvancedTable.tableData = _this.sourceData;
                _this.showAddProjectDialog = false;
            },
            // 列头配置
            getHeaders() {
                this.$famHttp({
                    url: '/ppm/plan/v1/change/tasks/head',
                    method: 'GET',
                    appName: 'PPM',
                    className: this.className,
                    data: {
                        TableKey: 'TaskChangeView'
                    }
                }).then((res) => {
                    this.headers = res?.data?.headers || [];
                    this.headers.forEach((col) => {
                        this.keyAttrMap[col.attrName] = col.originalName.split('#')[1];
                    });
                    this.headers.forEach((col) => {
                        this.originalAttrMap[col.attrName] = col.originalName;
                    });
                });
            },
            // 获取容器团队成员
            getUsersByContainer() {
                this.$famHttp({
                    url: '/fam/team/getUsersByContainer',
                    method: 'GET',
                    data: {
                        containerOid: this.containerRef
                    }
                }).then((res) => {
                    this.usersByContainer = res?.data || [];
                });
            },
            // 获取资源角色选项
            async getContainerTeamRole() {
                this.containerTeamRoles = (await globalUtils.getContainerTeamRoles(this.projectId)) || [];
            },
            // 创建计划
            getCreatePlan() {
                let _this = this;
                let plan = JSON.parse(localStorage.getItem('changeCreatePlan'));
                localStorage.removeItem('changeCreatePlan');
                if (!plan) return;
                delete plan.typeReference;
                delete plan.relationList;
                delete plan.associationField;
                let attrRawList = plan.attrRawList;
                _this.formatAttrRawList(attrRawList, plan);
                plan.oid = _this.getOid();
                if (plan.parentCode) {
                    let index = _this.sourceData.findIndex((item) => item.identifierNo === plan.parentCode);
                    _this.sourceData.splice(index + 1, 0, plan);
                } else {
                    _this.sourceData.push(plan);
                }
                _this.$refs.table.$refs.FamAdvancedTable.tableData = _this.sourceData;
            },
            // value转换为displayName
            getDisplayName(header, attr) {
                if (_.isObject(attr.value)) return attr.value.displayName;
                return header?.values.filter((item) => item.value === attr.value)[0]?.displayName;
            },
            // 人员id转换为名称
            getUserName(users, attr) {
                if (_.isArray(attr?.value)) {
                    let userNames = [];
                    attr.value.forEach((oid) => {
                        userNames.push(users?.filter((user) => user.oid === oid)?.[0]?.displayName);
                    });
                    return userNames.join(',');
                } else {
                    return users?.filter((user) => user.oid === attr?.value)?.[0]?.displayName;
                }
            },
            // 生成32位id
            getOid() {
                return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = (Math.random() * 16) | 0,
                        v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });
            },
            // 格式化阿attrRawList
            formatAttrRawList(attrRawList, plan) {
                let _this = this;
                attrRawList.forEach((attr) => {
                    let header = _this.headers.filter(
                        (header) => _this.keyAttrMap[header.attrName] === attr.attrName
                    )?.[0];
                    attr.value = attr.value !== undefined ? attr.value : '';
                    switch (header?.componentName) {
                        case 'CustomVirtualSelect':
                            plan[attr.attrName] = attr.displayName || _this.getDisplayName(header, attr);
                            break;
                        case 'FamDict':
                            plan[attr.attrName] = attr.displayName || _this.getDisplayName(header, attr);
                            break;
                        case 'ResponsibleCurrentUserSelect':
                            plan[attr.attrName] = attr.displayName || _this.getUserName(_this.usersByContainer, attr);
                            break;
                        case 'FamMemberSelect':
                            plan[attr.attrName] = attr.displayName || _this.getUserName(_this.usersByContainer, attr);
                            break;
                        case 'FamParticipantSelect':
                            plan[attr.attrName] = attr.displayName || _this.getUserName(_this.usersByContainer, attr);
                            break;
                        case 'FamSelect':
                            plan[attr.attrName] = attr.displayName || _this.getDisplayName(header, attr);
                            break;
                        case 'FamBoolean':
                            plan[attr.attrName] = attr.displayName || attr.value ? _this.i18n.yes : _this.i18n.no;
                            break;
                        default:
                            plan[attr.attrName] =
                                attr.displayName || _.isObject(attr.value) ? attr.value.displayName : attr.value;
                            break;
                    }
                    if (attr.attrName === 'resAssignments') {
                        plan[attr.attrName] = _this.containerTeamRoles.filter(
                            (item) => item.roleCode === attr.value
                        )?.[0]?.roleName;
                    }
                });
            },
            handleCommand(type, row) {
                this[type](row);
            },
            // 裁剪计划
            cutPlan(row) {
                row.action = 'DELETE';
            },
            // 创建子任务
            createSubTask(row) {
                let _this = this;
                const routeConfig = {
                    path: 'project-plan/planCreate',
                    query: {
                        planOid: row.identifierNo,
                        planName: row.name,
                        createPlanTitle: _this.i18n.createSubTask,
                        collectId: _this.currentPlanSet,
                        sceneName: 'change',
                        currentPlanSet: _this.currentPlanSet,
                        pid: _this.projectOid
                    }
                };
                globalUtils.openPage({
                    routeConfig,
                    appName: 'erdc-project-web'
                });
            },
            // 预计开始时间可选校验
            pickerOptionsStart(date) {
                return {
                    disabledDate: (time) => {
                        if (date) {
                            return time.getTime() > new Date(date).getTime() - 24 * 60 * 60 * 1000;
                        }
                    }
                };
            },
            // 预计完成时间可选校验
            pickerOptionsFinish(date) {
                return {
                    disabledDate: (time) => {
                        if (date) {
                            return time.getTime() < new Date(date).getTime() - 24 * 60 * 60 * 1000;
                        }
                    }
                };
            },
            // 预计开始时间改变
            changeStartime(val, row) {
                row.action !== 'CREATE' && (row.action = 'UPDATE');
                let start = row.attrRawList.find((item) => item.attrName === 'timeInfo.scheduledStartTime');
                start.value = val;
                let data = {
                    oid: row.action === 'CREATE' ? this.projectOid : row.oid,
                    fieldName: 'timeInfo.scheduledStartTime',
                    scheduledStartTime: val ? dayjs(val).format('YYYY-MM-DD') : '',
                    scheduledEndTime: row['timeInfo.scheduledEndTime']
                        ? dayjs(row['timeInfo.scheduledEndTime']).format('YYYY-MM-DD')
                        : '',
                    duration: row['planInfo.duration'] || 0
                };
                if (data.scheduledEndTime || data.duration) {
                    this.handleFiledChange(data, row);
                }
            },
            // 预计结束时间改变
            changeFinishTime(val, row) {
                row.action !== 'CREATE' && (row.action = 'UPDATE');
                let start = row.attrRawList.find((item) => item.attrName === 'timeInfo.scheduledEndTime');
                start.value = val;
                let data = {
                    oid: row.action === 'CREATE' ? this.projectOid : row.oid,
                    fieldName: 'timeInfo.scheduledEndTime',
                    scheduledStartTime: row['timeInfo.scheduledStartTime']
                        ? dayjs(row['timeInfo.scheduledStartTime']).format('YYYY-MM-DD')
                        : '',
                    scheduledEndTime: val ? dayjs(val).format('YYYY-MM-DD') : '',
                    duration: row['planInfo.duration'] || 0
                };
                if (data.scheduledStartTime || data.duration) {
                    this.handleFiledChange(data, row);
                }
            },
            // 资源角色改变
            changeResAssignments({ value, option }, row) {
                let val = value;
                row.action !== 'CREATE' && (row.action = 'UPDATE');
                let resAssignmentName = option.roleName;
                row.resAssignments = resAssignmentName;
                let resAssignments = row.attrRawList.find((item) => item.attrName === 'resAssignments');
                resAssignments.value = val;
                resAssignments.displayName = resAssignmentName;
                this.params.roleCode = val || 'PM';

                // 清除责任人
                row.responsiblePerson = '';
                let responsiblePerson = row.attrRawList.find((item) => item.attrName === 'responsiblePerson');
                responsiblePerson.value = '';
                responsiblePerson.displayName = '';
                if (val) {
                    // 设置默认责任人
                    this.$famHttp({
                        url: '/fam/team/getUsersByContainer',
                        cache: false,
                        async: false,
                        data: {
                            containerOid: this.containerRef,
                            roleCode: val
                        }
                    }).then((resp) => {
                        let users = resp.data || [];
                        let primaryUser;
                        // 问题单编码：ISSUE2024053127640，BA已确认：有一个人时自动同步，多个人时同步主责任人，多个人且无责任人时不同步
                        if (users.length === 1) {
                            primaryUser = users[0];
                        } else if (users.length > 1) {
                            primaryUser = users.find((item) => item.primarily);
                        }
                        responsiblePerson.value = primaryUser?.oid || ''; // 表格真实存储值
                        responsiblePerson.displayName = primaryUser?.displayName || '';
                        row.responsiblePerson = responsiblePerson.displayName; // 用于表格里面的内容展示
                    });
                }
            },
            // 责任人改变
            changeResponsiblePerson(val, row) {
                row.action !== 'CREATE' && (row.action = 'UPDATE');
                let responsiblePerson = row.attrRawList.find((item) => item.attrName === 'responsiblePerson');
                responsiblePerson.value = val;
                let responsiblePersonName = this.getUserName(this.usersByContainer, responsiblePerson);
                responsiblePerson.displayName = responsiblePersonName;
                row.responsiblePerson = responsiblePersonName;
            },
            // 获取行数据对应的资源角色
            getResAssignmentsValue(row) {
                return row.attrRawList.find((item) => item.attrName === 'resAssignments')?.value;
            },
            // 单元格编辑之前
            beforeEditMethod({ row }) {
                return row.action !== 'DELETE';
            },
            // 预计开始时间、预计结束时间任一值修改
            handleFiledChange(data, row) {
                const typeOId = row.attrRawList.find((item) => item.attrName === 'typeReference')?.value;
                this.$famHttp({
                    url: '/ppm/plan/v1/getTimeAndDuration',
                    data: {
                        ...data,
                        typeOId
                    },
                    method: 'get',
                    className: 'erd.cloud.ppm.project.entity.Project'
                }).then((res) => {
                    if (res.code === '200') {
                        let start = row.attrRawList.find((item) => item.attrName === 'timeInfo.scheduledStartTime');
                        start.value = res.data['timeInfo.scheduledStartTime'];
                        let finish = row.attrRawList.find((item) => item.attrName === 'timeInfo.scheduledEndTime');
                        finish.value = res.data['timeInfo.scheduledEndTime'];
                        let duration = row.attrRawList.find((item) => item.attrName === 'planInfo.duration');
                        duration.value = res.data['planInfo.duration'];
                        row['timeInfo.scheduledStartTime'] = res.data['timeInfo.scheduledStartTime'];
                        row['timeInfo.scheduledEndTime'] = res.data['timeInfo.scheduledEndTime'];
                        row['planInfo.duration'] = res.data['planInfo.duration'];
                    }
                });
            }
        }
    };
});
