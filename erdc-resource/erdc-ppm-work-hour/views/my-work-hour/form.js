define([
    'text!' + ELMP.func('erdc-ppm-work-hour/views/my-work-hour/form.html'),
    'erdcloud.kit',
    'dayjs',
    ELMP.func('erdc-ppm-work-hour/app/store/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    'css!' + ELMP.func('erdc-ppm-work-hour/views/style.css')
], function (template, ErdcKit, dayjs, store, actions) {
    return {
        template,
        components: {
            WorkHourTable: ErdcKit.asyncComponent(ELMP.func('erdc-ppm-work-hour/components/WorkHourTable/index.js')),
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.func('erdc-ppm-work-hour/locale/index.js'),
                i18nMappingObj: {
                    enrtyOneWorkTips: this.getI18nByKey('enrtyOneWorkTips'), // 请至少登记一条工时数据
                    selectWeek: this.getI18nByKey('selectWeek'), // 选择周
                    increase: this.getI18nByKey('increase'), // 增加
                    submit: this.getI18nByKey('submit'), // 提交
                    save: this.getI18nByKey('save'), // 保存
                    saveDraft: this.getI18nByKey('saveDraft'), // 保存草稿
                    close: this.getI18nByKey('close'), // 关闭
                    toBeSubmit: this.getI18nByKey('toBeSubmit'), // 待提交
                    savedSuccess: this.getI18nByKey('savedSuccess'), // 保存成功
                    dataNotSavedTips: this.getI18nByKey('dataNotSavedTips'), // 数据未保存，是否保存
                    tips: this.getI18nByKey('tips'), // 提示
                    identifierNo: this.getI18nByKey('identifierNo'), // 编码
                    name: this.getI18nByKey('name'), // 名称
                    confirm: this.getI18nByKey('confirm'), // 确定
                    cancel: this.getI18nByKey('cancel') // 取消
                },
                loading: false,
                currentWeek: [],
                date: '',
                pickerOptions: {
                    firstDayOfWeek: 1
                },
                tabs: [],
                tableData: {},
                panelUnfolds: {},
                state: ''
            };
        },
        computed: {
            route() {
                return this.$route;
            },
            readonly() {
                return (
                    this.$route.query.stateValue &&
                    !['PENDING_SUBMIT', 'APPROVED'].includes(this.$route.query.stateValue)
                );
            },
            isSubmit() {
                return this.$route.query.stateValue && !['PENDING_SUBMIT'].includes(this.$route.query.stateValue);
            },
            openType() {
                return this.$route.meta.openType || 'create'; // 创建'create', 编辑'edit'
            },
            oid() {
                return this.$route.meta.oid || '';
            },
            dateObject() {
                // elementui控件取得是周二，这里调整成周一
                return dayjs(this.date).add(-1, 'day');
            },
            year() {
                let { week, dateObject } = this;
                let date = dateObject.toDate();
                let month = date.getMonth();

                let trueDate = new Date(date);
                if (week === 1 && month === 11) {
                    trueDate.setHours(0, 0, 0, 0);
                    // 取该周周四
                    trueDate.setDate(trueDate.getDate() + 3 - ((trueDate.getDay() + 6) % 7));
                }
                return dayjs(trueDate).format('YYYY');
            },
            week() {
                // 参考elementui计算实现
                return this.getWeekNumber(this.dateObject.toDate());
            },
            start() {
                return this.dateObject.format('YYYY-MM-DD');
            },
            end() {
                return this.dateObject.add(6, 'day').format('YYYY-MM-DD');
            },
            currentWeekText() {
                let { year, week, start, end } = this;
                return `${year}年 第 ${week} 周：${start}至${end}`;
            },
            userName() {
                let user = this.$store.state?.app?.user;
                return `${user.displayName} ${user.code}`;
            }
        },
        watch: {
            date(val) {
                let { weekdayName } = this;
                // 查询本周各对象工时记录数据
                this.loading = true;
                this.loadData().then(() => {
                    this.loading = false;
                });
                // 组装周信息，用于表格列渲染
                let start = dayjs(val).subtract(1, 'day');
                this.currentWeek = [];
                for (let i = 0; i < 7; i++) {
                    let day = start.add(i, 'day');
                    this.currentWeek.push({
                        weekDay: weekdayName[day.day()],
                        date: day.format('YYYY-MM-DD'),
                        dateName: day.format('MM-DD')
                    });
                }
            }
        },
        created() {
            this.weekdayName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            // 设置当前周(日期组件拿的是一周的第二天，所以这里是2)
            if (this.openType === 'edit') {
                this.date = dayjs(this.$route.query.start).day(2);
            } else {
                this.date = dayjs().day(2);
            }
        },
        methods: {
            submit(isOpenFlow) {
                if (typeof isOpenFlow === 'boolean' && this.isSubmit) {
                    this.$message.info('当前周报不为待提交，请勿重复提交');
                    return;
                }
                if (this.loading) return;
                let { year, week, start, end, i18nMappingObj } = this;
                let user = this.$store.state.app?.user || {};
                let userName = user.displayName;
                let name = `${userName} ${year}年第${week}周的周报`;

                let rawInfo = this.getTableData();

                // 有值的工时数据有几条
                let hasValueTimeLen = rawInfo.reduce((result, item) => {
                    return result + item.timesheet.length;
                }, 0);

                if (hasValueTimeLen === 0) return this.$message.warning(i18nMappingObj.enrtyOneWorkTips);

                this.loading = true;
                this.$famHttp({
                    url: '/ppm/timesheet/saveReport',
                    method: 'POST',
                    className: 'erd.cloud.ppm.project.entity.Project',
                    data: {
                        year,
                        dimension: 'WEEK',
                        several: week,
                        startTime: start,
                        endTime: end,
                        name,
                        rawInfo,
                        state: this.$route.query.stateValue || 'PENDING_SUBMIT'
                    }
                })
                    .then((resp) => {
                        if (typeof isOpenFlow === 'boolean') {
                            this.openFlow(resp?.data);
                        } else {
                            this.$message.success(i18nMappingObj.savedSuccess);
                            Object.keys(this.tableData).forEach((name) => {
                                return this.$refs[name]?.[0]?.setIsModified(false);
                            });
                            this.loadData();
                        }
                    })
                    .finally(() => {
                        this.close();
                        this.loading = false;
                    });
            },
            openFlow(objectOid) {
                // 如果当前工时存在在途流程需要点击提交的时跳转到流程页面去，否则就跳转到发起流程页面
                let oid = this.$route.query.oid || objectOid;
                this.$famHttp({
                    url: '/bpm/process/history/' + oid,
                    method: 'GET'
                }).then((res) => {
                    // 先暂时在这里处理，后续统一使用ppm-utils里的openProcessPage方法
                    let taskProcess = res.data?.processInstances?.find(
                        (item) => !item.ended && item.state !== 'completed'
                    );
                    if (taskProcess) {
                        const {
                            activityId,
                            processInfoTasks,
                            oid: processInstanceOId,
                            processDefinitionKey
                        } = taskProcess;
                        const taskOId = processInfoTasks?.find((item) => item.taskKey === activityId)?.oid || '';
                        let { query, path } = this.$route;
                        const route = {
                            path,
                            query
                        };
                        localStorage.setItem(`${processDefinitionKey}:${taskOId}:backRoute`, JSON.stringify(route));
                        this.$router.push({
                            path: `/container/bpm-resource/workflowActivator/${processInstanceOId}`,
                            query: {
                                taskDefKey: activityId,
                                taskOId,
                                readonly: false
                            }
                        });
                    } else {
                        let { year, week, start, end, currentWeek, tabs } = this;
                        let { code, displayName, id } = this.$store.state?.app?.user || {};
                        let businessData = [
                            {
                                year,
                                week,
                                currentWeek,
                                tabs,
                                oid,
                                userId: id,
                                userInfoText: `${displayName} ${code}`,
                                currentWeekText: `${year}年 第 ${week} 周（${start}至${end}）`
                            }
                        ];
                        actions.startProcess(this, {
                            containerRef: '',
                            businessData
                        });
                    }
                });
            },
            loadData() {
                let { fetchWorkHourData, setTableData, setTabsConfig } = this;
                return new Promise((resolve) => {
                    fetchWorkHourData()
                        .then((resp) => {
                            let { status, contextInfo } = resp.data || {};
                            this.state = status || this.$route.query.state || this.i18n.toBeSubmit;
                            let result = contextInfo || resp.data;
                            setTabsConfig(result);
                            setTableData(result);
                        })
                        .catch(() => {
                            Object.keys(this.tableData).forEach((key) => {
                                this.tableData[key] = [];
                            });
                        })
                        .finally(() => {
                            resolve();
                        });
                });
            },
            changeWeek(val) {
                let { i18nMappingObj } = this;

                if (this.loading || this.openType !== 'create') return;

                // 判断是否有修改，有修改就先提示是否保存，再切换
                let isModified = Object.keys(this.tableData).some((name) => {
                    return this.$refs[name]?.[0]?.getIsModified();
                });

                if (isModified) {
                    this.$confirm(i18nMappingObj.dataNotSavedTips, i18nMappingObj.tips, {
                        distinguishCancelAndClose: true,
                        confirmButtonText: i18nMappingObj.confirm,
                        cancelButtonText: i18nMappingObj.cancel,
                        type: 'warning'
                    })
                        .then(() => {
                            this.submit();
                        })
                        .catch(() => {
                            this.date = dayjs(this.date).add(val, 'w');
                            Object.keys(this.tableData).forEach((name) => {
                                return this.$refs[name]?.[0]?.setIsModified(false);
                            });
                        });
                } else {
                    this.date = dayjs(this.date).add(val, 'w');
                }
            },
            addObject(name) {
                this.$refs[name]?.[0]?.addObject();
            },
            openWeekSelector() {
                if (this.loading || this.openType !== 'create') return;
                this.$nextTick(() => {
                    this.$refs.weekPicker.focus();
                });
            },
            close() {
                this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                    this.$router.push({
                        path: 'myWorkHour'
                    });
                });
            },
            fetchWorkHourData() {
                let { year, week } = this;
                return this.$famHttp({
                    url: '/ppm/timesheet/selectList',
                    method: 'POST',
                    className: 'erd.cloud.ppm.project.entity.Project',
                    data: {
                        selectType: 'timesheetReport',
                        year,
                        dimension: 'WEEK',
                        several: week
                    }
                });
            },
            setTabsConfig(data) {
                let { getCustomConfig } = this;
                let defaultTableKeMap = {
                    [store.state.classNameMapping.projectTime]: 'projectView',
                    [store.state.classNameMapping.taskTime]: 'taskView',
                    [store.state.classNameMapping.DiscreteTime]: 'DiscreteTaskView'
                };
                this.tabs = data.map((item) => {
                    let name = item.typeName.split('.').slice(-1)[0];
                    let typeOIdArr = item.typeOId.split(':');
                    return {
                        title: item.displayName,
                        name,
                        workHourClassName: item.typeName,
                        typeReference: {
                            key: typeOIdArr[1],
                            id: typeOIdArr[2]
                        },
                        dialogConfig: {
                            props: {
                                className: item.contextTypeName,
                                tableKey: defaultTableKeMap[item.typeName] || 'projectView',
                                ...getCustomConfig(item)
                            }
                        }
                    };
                });

                this.tabs.forEach(({ name }) => {
                    this.$set(this.tableData, name, []);
                    this.$set(this.panelUnfolds, name, true);
                });
            },
            getCustomConfig(data) {
                let { i18nMappingObj } = this;
                if (data.data) {
                    return {
                        leftTableColumns: [
                            {
                                minWidth: '40',
                                width: '40',
                                type: 'checkbox',
                                align: 'center'
                            },
                            {
                                prop: 'identifierNo',
                                title: i18nMappingObj.code,
                                width: 'auto'
                            },
                            {
                                prop: 'name',
                                title: i18nMappingObj.name,
                                width: 'auto'
                            }
                        ],
                        getTableData: function () {
                            return data.data.map((item) => {
                                item.checked = false;
                                item.accessToView = true;
                                return item;
                            });
                        }
                    };
                } else {
                    let conditionDtoListConfig = {
                        'erd.cloud.ppm.project.entity.Project': [
                            {
                                attrName: 'erd.cloud.ppm.project.entity.Project#lifecycleStatus.status',
                                oper: 'NE',
                                logicalOperator: 'AND',
                                sortOrder: 0,
                                isCondition: true,
                                value1: 'DRAFT'
                            },
                            {
                                logicalOperator: 'AND',
                                sortOrder: 1,
                                isCondition: false,
                                children: [
                                    {
                                        attrName: 'erd.cloud.ppm.project.entity.Project#currentUser',
                                        oper: 'BELONG_ADMIN',
                                        logicalOperator: 'AND',
                                        sortOrder: 0,
                                        isCondition: true
                                    },
                                    {
                                        attrName: 'erd.cloud.ppm.project.entity.Project#member',
                                        oper: 'MEMBER_CURRENT_USER',
                                        logicalOperator: 'OR',
                                        sortOrder: 1,
                                        isCondition: true
                                    }
                                ]
                            }
                        ],
                        'erd.cloud.ppm.plan.entity.Task': [
                            {
                                attrName: 'erd.cloud.ppm.plan.entity.Task#collectRef',
                                oper: 'EQ',
                                value1: 'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1'
                            }
                            // {
                            //     attrName: 'erd.cloud.ppm.plan.entity.Task#cutted',
                            //     oper: 'EQ',
                            //     logicalOperator: 'AND',
                            //     sortOrder: 0,
                            //     isCondition: true,
                            //     value1: 'false'
                            // }
                        ],
                        'erd.cloud.ppm.plan.entity.DiscreteTask': [
                            {
                                attrName: 'erd.cloud.ppm.plan.entity.DiscreteTask#responsiblePeople',
                                oper: 'RESPONSIBLE_CURRENT_USER',
                                sortOrder: 0,
                                isCondition: true
                            },
                            {
                                attrName: 'erd.cloud.ppm.plan.entity.DiscreteTask#ownedByRef',
                                oper: 'CURRENT_USER',
                                logicalOperator: 'OR',
                                sortOrder: 1,
                                isCondition: true
                            }
                        ]
                    };
                    return {
                        urlConfig: {
                            data: {
                                deleteNoPermissionData: true,
                                conditionDtoList: conditionDtoListConfig[data.contextTypeName]
                            }
                        }
                    };
                }
            },
            setTableData(data) {
                data.forEach((record) => {
                    let tableKey = record.typeName.split('.').slice(-1)[0];
                    tableKey &&
                        (record.contexts || []).forEach((obj) => {
                            obj.raws.forEach((row) => {
                                let dataRow = {
                                    name: obj.displayName,
                                    dataOid: obj.contextOId,
                                    dataId: Date.now(),
                                    isOrigin: true
                                };
                                if (tableKey === 'TaskTimesheet') dataRow.projectName = obj.projectName;
                                row.timesheet.forEach((time) => {
                                    dataRow[`attr_${time.dayOfWeek - 1}`] = {
                                        oid: time.oid,
                                        id: time.id,
                                        idKey: time.idKey,
                                        description: time.description,
                                        dayOfWeek: time.dayOfWeek,
                                        contextRef: time.contextRef,
                                        workHour: time.workHour,
                                        sortOrder: time.sortOrder
                                    };
                                });
                                this.tableData[tableKey].push(dataRow);
                            });
                        });
                });
            },
            getTableData() {
                let { dateObject } = this;
                let result = [];
                Object.keys(this.tableData).forEach((name) => {
                    let data = this.$refs[name]?.[0]?.getTableData();
                    let tabConfig = this.tabs.find((item) => item.name === name);
                    let dataMap = {};
                    data.forEach((item) => {
                        let oid = item.dataOid;
                        let oidArr = oid.split(':');
                        dataMap[oid] = dataMap[oid] || { timesheet: [] };

                        for (let i = 0; i < 7; i++) {
                            let timeData = item[`attr_${i}`];
                            if (timeData && timeData.workHour !== '') {
                                timeData.contextRef = timeData.contextRef || {
                                    id: oidArr[2],
                                    key: oidArr[1]
                                };
                                timeData.typeReference = tabConfig.typeReference;
                                timeData.startTime = dateObject.add(timeData.dayOfWeek - 2, 'day').format('YYYY-MM-DD');
                                dataMap[oid].timesheet.push(timeData);
                            }
                        }
                    });

                    result = result.concat(Object.values(dataMap));
                });

                return result;
            },
            getWeekNumber(src) {
                const date = new Date(src.getTime());
                date.setHours(0, 0, 0, 0);
                // Thursday in current week decides the year.
                date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
                // January 4 is always in week 1.
                const week1 = new Date(date.getFullYear(), 0, 4);
                // Adjust to Thursday in week 1 and count number of weeks from date to week 1.
                // Rounding should be fine for Daylight Saving Time. Its shift should never be more than 12 hours.
                return (
                    1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
                );
            }
        }
    };
});
