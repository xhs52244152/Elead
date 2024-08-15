define([
    'text!' + ELMP.func('erdc-baseline/components/BaselineRelationObject/index.html'),
    ELMP.func('erdc-baseline/const.js'),
    ELMP.func('erdc-baseline/mixins.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'css!' + ELMP.func('erdc-baseline/components/BaselineRelationObject/index.css')
], function (template, CONST, mixin, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');

    return {
        name: 'BaselineRelationObject',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            // FamAssociationObject: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAssociationObject/index.js')),
            CollectObjects: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/CollectObjects/index.js')),
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            VersionReplaceDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/VersionReplaceDialog/index.js')
            ),
            // 穿梭框组件
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js'))
        },
        mixins: [mixin],
        props: {
            oid: String,
            pid: String,
            formData: Object,
            viewTypesList: {
                type: [Array, Function],
                default() {
                    return ErdcStore.getters?.['CbbBaseline/getViewTypesList'] || [];
                }
            },
            relationTableKey: {
                type: String,
                default: CONST.relationTableKey
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                // 收集对象
                collectForm: {
                    visible: false,
                    title: '',
                    loading: false,
                    tableData: [],
                    className: CONST?.className
                },
                dialogFormClassName: '',
                // 子类型数组
                childTypes: [],
                // 添加对象
                objectForm: {
                    visible: false,
                    title: '',
                    className: '',
                    subClassName: ''
                },
                // 替换对象
                replaceForm: {
                    oid: ''
                },
                urlConfigData: {
                    typeReference: '',
                    conditionDtoList: []
                },
                objectAddBtnLoading: false
            };
        },
        computed: {
            viewTableConfig() {
                return {
                    tableKey: this.relationTableKey,
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        dataKey: 'data.records',
                        tableRequestConfig: {
                            url: '/baseline/view/table/page', // 表格数据接口
                            data: {
                                relationshipRef: this.oid,
                                addCheckoutCondition: false, //查询当前数据版本
                                lastestVersion: false,
                                conditionDtoList: []
                            },
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        const parseData = data && JSON.parse(data);
                                        const records = parseData?.data?.records?.map((item) => {
                                            if (item.attrRawList) {
                                                const value = item.attrRawList.find(
                                                    (attr) =>
                                                        attr.attrName ===
                                                        'erd.cloud.cbb.baseline.entity.BaselineMember#isMainRef'
                                                );
                                                item['isMainRef'] = value?.value;
                                                return item;
                                            }
                                        });
                                        parseData.data.records = records;
                                        resData = parseData;
                                    } catch (error) {
                                        /* empty */
                                    }
                                    return resData;
                                }
                            ]
                        },
                        fieldLinkConfig: {
                            linkClick: (row) => {
                                return this.$famHttp({
                                    url: '/fam/attr',
                                    methods: 'get',
                                    params: {
                                        oid: row?.relationOid
                                    },
                                    className: row?.relationOid?.split(':')[1]
                                }).then((resp) => {
                                    if (resp.success) {
                                        let data = resp?.data || {};
                                        _.each(data?.rawData, (value, key) => {
                                            _.isArray(data?.attrRawList)
                                                ? data.attrRawList.push(value)
                                                : (data.attrRawList = []);
                                            data[key] = _.isObject(value?.value) ? value?.oid : value?.value;
                                        });
                                        data?.rawData && delete data.rawData;
                                        cbbUtils.goToDetail.call(this, data, { query: { backButton: true } });
                                    }
                                });
                            }
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 工具栏
                            fuzzySearch: {
                                placeholder: this.i18n.pleaseEnter,
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            // 基础筛选
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: 'BASELINE_MEMBER_OPERATE', //操作按钮的内部名称
                                containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                                className: 'erd.cloud.cbb.baseline.entity.BaselineMember', //维护到store里
                                isDefaultBtnType: true,
                                objectOid: this?.oid
                            }
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                            operation: window.LS.get('lang_current') === 'en_us' ? 100 : 140
                        },
                        slotsField: [
                            {
                                prop: 'operation',
                                type: 'default' // 显示字段内容插槽
                            },
                            {
                                prop: 'erd.cloud.core.vc.ItemRevision#name',
                                type: 'default'
                            }
                        ]
                    }
                };
            },
            leftTableColumns() {
                return [
                    {
                        type: 'checkbox', // 特定类型
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'icon',
                        title: this.i18n.icon,
                        align: 'center',
                        width: 48
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18n.code
                    },
                    {
                        prop: 'name',
                        title: this.i18n.name
                    },
                    {
                        prop: 'version',
                        title: this.i18n.version
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n.lifecycleStatus
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18n.context
                    }
                ];
            },
            objectFormProps() {
                return {
                    'class-name': this.dialogFormClassName,
                    'title': this.objectForm.title,
                    'table-key': _.find(this.viewTypes, { className: this.dialogFormClassName })?.tableKey,
                    'left-table-columns': this.leftTableColumns,
                    'urlConfig': {
                        data: this.urlConfigData
                    }
                };
            },
            viewTypes() {
                let viewTypes = [
                    {
                        label: this.i18n.document,
                        className: 'erd.cloud.cbb.doc.entity.EtDocument',
                        tableKey: 'DocumentView'
                    },
                    {
                        label: this.i18n.parts,
                        className: 'erd.cloud.pdm.part.entity.EtPart',
                        tableKey: 'partForm'
                    },
                    {
                        label: this.i18n.model,
                        className: 'erd.cloud.pdm.epm.entity.EpmDocument',
                        tableKey: 'epmDocumentView'
                    }
                ];
                return viewTypes;
            }
        },
        methods: {
            // 添加收集对象api
            addCollectObjectApi(data) {
                return this.$famHttp({
                    url: '/fam/member/add',
                    data,
                    method: 'POST',
                    className: CONST?.className
                });
            },
            // 选中收集对象
            collectObjectClick() {
                // 选中的收集对象数据
                const tableData = this.$refs?.collectObjectsRef?.getData?.() || [];

                // 当前勾选的相关对象数据
                const selectedData = this.$refs?.famViewTable?.fnGetCurrentSelection?.() || [];

                if (tableData.length) {
                    for (let i = tableData.length - 1; i >= 0; i--) {
                        for (let j = 0; j < selectedData.length; j++) {
                            if (tableData[i]?.oid === selectedData[j]?.oid) {
                                tableData.splice(i, 1);
                            }
                        }
                    }
                }

                if (tableData.length) {
                    let data = {
                        baselineRef: this.oid,
                        confirm: false,
                        memberDtoList: _.map(tableData, (item) => ({
                            memberOid: item?.versionOid || _.find(item?.attrRawList, { attrName: 'oid' })?.value || '',
                            name:
                                _.find(item?.attrRawList, (sitem) => sitem?.attrName?.includes?.('name'))?.value ||
                                item?.name ||
                                '',
                            objectRef:
                                _.find(item?.attrRawList, (sitem) => sitem?.attrName?.includes?.('masterRef'))?.value ||
                                item?.masterRef ||
                                '',
                            version:
                                _.find(item?.attrRawList, (sitem) => sitem?.attrName?.includes?.('version'))?.value ||
                                item?.version ||
                                '',
                            number:
                                _.find(item?.attrRawList, (sitem) => sitem?.attrName?.includes?.('identifierNo'))
                                    ?.value ||
                                item?.identifierNo ||
                                ''
                        }))
                    };

                    this.collectForm.loading = true;

                    this.addCollectObjectApi(data)
                        .then((resp) => {
                            if (resp.success) {
                                this.popover({
                                    field: 'collectForm',
                                    visible: false,
                                    callback: () => {
                                        this.$message.success(this.i18n['收集相关对象成功']);
                                        return this.reloadTable();
                                    }
                                });
                            }
                        })
                        .finally(() => {
                            this.collectForm.loading = false;
                        });
                } else {
                    this.collectForm.loading = true;

                    this.popover({
                        field: 'collectForm',
                        visible: false,
                        callback: () => {
                            this.collectForm.loading = false;
                        }
                    });
                }
            },
            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '', callback }) {
                this[field].title = title;
                this[field].visible = visible;
                _.isFunction(callback) && callback();
            },
            // 收集相关对象
            collectRelatedObjects(tableData) {
                if (!tableData.length) {
                    return this.$message.info(this.i18n['请勾选对象']);
                }
                this.popover({
                    field: 'collectForm',
                    visible: true,
                    title: this.i18n['gatherRelateObject'],
                    callback: () => {
                        this.collectForm.tableData = ErdcKit.deepClone(tableData) || [];
                    }
                });
            },
            // 关联对象数据处理
            afterRequest({ data, callback }) {
                const { className } = this.objectForm;

                let result = data.map((item) => {
                    let obj = {};
                    _.each(item.attrRawList, (res) => {
                        if (res.attrName.indexOf(className + '#') !== -1) {
                            obj[res.attrName.split('#')[1]] = res.displayName;
                        }
                    });
                    let iconColor = cbbUtils.getIconClass(item.attrRawList, item.idKey);
                    if (iconColor) {
                        obj['iconColor'] = iconColor;
                    }
                    return { ...item, ...obj, checked: false };
                });
                callback(result);
            },
            openSelectAssociation() {
                this.objectAddBtnLoading = true;
                this.dialogFormClassName = this.objectForm.className = this.viewTypes[0].className;
                this.objectForm.subClassName = '';
                this.viewTypeChange('load');
            },
            viewTypeChange(val) {
                this.loadChildTypes()
                    .then((res) => {
                        if (res.success) {
                            this.childTypes = res.data;
                            if (val !== 'load') {
                                this.dialogFormClassName = val;
                            }
                            if (Array.isArray(this.childTypes) && this.childTypes.length > 0) {
                                let defaultVal = this.childTypes[0];
                                this.urlConfigData.typeReference = this.objectForm.subClassName = defaultVal.typeOid;
                            }
                            this.urlConfigData.conditionDtoList = [
                                {
                                    attrName: 'lifecycleStatus.status',
                                    oper: 'NE',
                                    value1: 'DRAFT'
                                }
                            ];
                        }
                        if (val === 'load') {
                            this.popover({
                                field: 'objectForm',
                                visible: true,
                                title: this.i18n.addRelateObject
                            });
                        } else {
                            this.childTypeChange();
                        }
                    })
                    .finally(() => {
                        this.objectAddBtnLoading = false;
                    });
            },
            loadChildTypes() {
                return this.$famHttp({
                    url: '/fam/type/typeDefinition/findAccessTypes',
                    method: 'GET',
                    data: {
                        typeName: this.objectForm.className,
                        subTypeEnum: 'ALL',
                        containerRef: '',
                        accessControl: false
                    }
                });
            },
            // 二级类型切换
            childTypeChange() {
                if (this.$refs.famAssociationObjectRef) {
                    let typeValObj = this.childTypes.find((item) => item.typeOid === this.objectForm.subClassName);
                    this.urlConfigData.typeReference = this.objectForm.subClassName;
                    // 如果二级类型选中【部件】【模型】不添加过滤子项条件
                    if (typeValObj.typeName === this.objectForm.className) {
                        this.urlConfigData.conditionDtoList = [
                            {
                                attrName: 'lifecycleStatus.status',
                                oper: 'NE',
                                value1: 'DRAFT'
                            }
                        ];
                    } else {
                        this.urlConfigData.conditionDtoList = [
                            {
                                attrName: 'lifecycleStatus.status',
                                oper: 'NE',
                                value1: 'DRAFT'
                            },
                            {
                                attrName: typeValObj.modelClass + '#typeReference',
                                oper: 'EQ',
                                logicalOperator: 'AND',
                                sortOrder: 0,
                                isCondition: true,
                                value1: typeValObj.typeOid || ''
                            }
                        ];
                    }
                    // 组件中已监听参数
                    // this.$refs.famAssociationObjectRef.currentPageChange(1);
                }
            },
            actionClick(action, row) {
                const eventClick = {
                    // 收集相关对象
                    COLLECT_MEMBER: this.collectRelatedObjects,
                    BASELINE_MEMBER_ADD: this.openSelectAssociation,
                    REMOVE_MEMBER: this.removeBaseLineMainRef
                };
                eventClick?.[action.name] && eventClick?.[action.name](row);
            },
            reloadTable() {
                this.$refs?.famViewTable?.getTableInstance('advancedTable', 'refreshTable')();
            },
            async selectAssociationDone(selectedData) {
                if (_.some(selectedData, (item) => !item?.accessToView)) {
                    return this.$message.error(this.i18n['不允许添加安全数据']);
                }

                this.replaceForm.oid = this.oid || '';
                const iterationInfoState = this.formData.iterationInfoState;
                if (iterationInfoState && iterationInfoState === 'CHECKED_IN') {
                    const resp = await this.handleCheckout();
                    if (resp?.success) {
                        const oid = resp?.data?.rawData?.oid?.value || '';
                        this.replaceForm.oid = oid || this.replaceForm.oid;
                    }
                }

                const data = {
                    baselineRef: this.replaceForm.oid || '',
                    confirm: false,
                    memberDtoList: selectedData.map((item) => ({
                        memberOid: item.oid,
                        name: item.name,
                        objectRef: item.masterRef,
                        version: item.version,
                        number: item.identifierNo
                    }))
                };

                this.handleAdd(data).then((resp) => {
                    if (resp.success) {
                        if (_.isEmpty(resp.data)) {
                            this.$message.success(this.i18n.addToBaselineSuccess);
                            if (this.oid !== this.replaceForm?.oid) {
                                this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                                    const { route } = this.$router.resolve({
                                        path: this.$route?.path,
                                        query: {
                                            ...this.$route?.query,
                                            oid: this.replaceForm?.oid,
                                            activeName: 'relationObj'
                                        }
                                    });
                                    this.$router.replace(route);
                                });
                            } else {
                                this.$emit('refresh');
                            }
                        } else {
                            // 如已经有不同版本的对象再表格咯,就弹出是否覆盖的弹窗
                            this.$refs?.versionReplaceDialogRef?.open(resp.data);
                        }
                    }
                });
            },

            handleAdd(data) {
                return this.$famHttp({
                    url: '/baseline/member/add',
                    data,
                    className: CONST?.className,
                    method: 'POST'
                });
            },
            handleReplaceBeforeClose(done) {
                _.isFunction(done) && done();
                if (this.oid !== this.replaceForm?.oid) {
                    this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                        const { route } = this.$router.resolve({
                            path: this.$route?.path,
                            query: {
                                ...this.$route?.query,
                                oid: this.replaceForm?.oid || this.oid,
                                activeName: 'relationObj'
                            }
                        });
                        this.$router.replace(route);
                    });
                } else {
                    this.$emit('refresh');
                }
            },
            handleReplaceSubmit(data, callback) {
                if (_.isEmpty(data)) {
                    callback && callback();
                    return this.$message.error(this.i18n.selectTip);
                }
                let params = {
                    baselineRef: this.replaceForm?.oid || this.oid,
                    confirm: true,
                    memberDtoList: data.map((item) => ({
                        memberOid: item.versionValue,
                        name: item.name,
                        number: item.number,
                        objectRef: item.versionOption.find((v) => {
                            return v.oid == item.versionValue;
                        })?.masterRef,
                        version: item.versionOption.find((v) => {
                            return v.oid == item.versionValue;
                        })?.label
                    }))
                };
                this.handleAdd(params)
                    .then((resp) => {
                        if (resp.success) {
                            callback && callback(true);
                            this.$message.success(this.i18n.addToBaselineSuccess);
                            if (this.oid !== this.replaceForm?.oid) {
                                this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                                    const { route } = this.$router.resolve({
                                        path: this.$route?.path,
                                        query: {
                                            ...this.$route?.query,
                                            oid: this.replaceForm?.oid || this.oid,
                                            activeName: 'relationObj'
                                        }
                                    });
                                    this.$router.replace(route);
                                });
                            } else {
                                this.$emit('refresh');
                            }
                        } else {
                            callback && callback();
                        }
                    })
                    .catch((err) => {
                        callback && callback();
                        this.$message.error(err.data.message || '');
                    });
            },
            // 设置或更新基线主要对象
            updateBaseLineMainRef(data) {
                this.$famHttp({
                    url: '/baseline/updateMainRef',
                    data,
                    className: CONST?.className,
                    method: 'POST'
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: this.i18n.setSuccess,
                        showClose: true
                    });
                    this.reloadTable();
                });
            },
            // 移除
            removeBaseLineMainRef(row) {
                row = _.isArray(row) ? row : [row];
                if (!row?.length) {
                    return this.$message.warning(this.i18n.pleaseDelData);
                }

                const data = {
                    className: 'erd.cloud.cbb.baseline.entity.BaselineMember',
                    oidList: _.map(row, 'oid')
                };

                this.$confirm(this.i18n.deleteTip, this.i18n.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel
                }).then(async () => {
                    let iterationInfoState = this.formData.iterationInfoState,
                        resp = {};
                    if (iterationInfoState && iterationInfoState === 'CHECKED_IN') {
                        resp = await this.handleCheckout();
                        if (!resp?.success) {
                            return;
                        }
                    }

                    const oid = resp?.data?.rawData?.oid?.value || this.oid || '';

                    if (oid !== this.oid) {
                        const resp = await this.$famHttp({
                            url: '/baseline/view/table/page', // 表格数据接口
                            data: {
                                relationshipRef: oid || this.oid,
                                addCheckoutCondition: false, //查询当前数据版本
                                lastestVersion: false,
                                conditionDtoList: [],
                                tableKey: this.relationTableKey
                            },
                            className: CONST?.className,
                            method: 'post'
                        });
                        if (!resp?.success) {
                            return;
                        }

                        const records = resp?.data?.records || [],
                            oidList = [];
                        for (let i = 0; i < row.length; i++) {
                            for (let j = 0; j < records.length; j++) {
                                const rowObj = _.find(row[i]?.attrRawList, (item) =>
                                    new RegExp('identifierNo$').test(item?.attrName)
                                );
                                const recordsObj = _.find(records[j]?.attrRawList, (item) =>
                                    new RegExp('identifierNo$').test(item?.attrName)
                                );
                                if (rowObj?.value === recordsObj?.value) {
                                    oidList.push(records[j]?.oid);
                                }
                            }
                        }
                        data.oidList = oidList;
                    }

                    this.$famHttp({
                        url: '/baseline/deleteByIds',
                        data,
                        className: CONST?.className,
                        method: 'DELETE'
                    }).then(() => {
                        this.$message.success(this.i18n.deleteSuccess);
                        if (this.oid !== oid) {
                            this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                                const { route } = this.$router.resolve({
                                    path: this.$route?.path,
                                    query: {
                                        ...this.$route?.query,
                                        oid: oid || this.oid,
                                        activeName: 'relationObj'
                                    }
                                });
                                this.$router.replace(route);
                            });
                        } else {
                            this.$emit('refresh');
                        }
                    });
                });
            },
            // 设为主对象
            onSetMain(row) {
                let data = new FormData();
                data.append('mainRef', row.relationOid);
                data.append('oid', this.$route.query.oid);
                this.updateBaseLineMainRef(data);
            },
            // 取消主对象
            onCancelMain() {
                let data = new FormData();
                data.append('mainRef', '');
                data.append('oid', this.$route.query.oid);
                this.updateBaseLineMainRef(data);
            },
            // 添加相关对象前检出
            handleCheckout() {
                const { oid } = this;
                return this.$famHttp('/fam/common/checkout', {
                    method: 'GET',
                    className: CONST.className,
                    params: {
                        oid
                    }
                });
            }
        }
    };
});
