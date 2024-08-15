define([
    'text!' + ELMP.func('erdc-change/components/RelatedObject/index.html'),
    ELMP.func('erdc-change/utils.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-change/components/RelatedObject/mixin.js'),
    ELMP.func('erdc-change/config/viewConfig.js')
], function (template, utils, cbbUtils, mixin, viewCfg) {
    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('Change');
    const mapGettersFlow = createNamespacedHelpers('cbbWorkflowStore').mapGetters;

    return {
        name: 'ChangeRelatedObject',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js')),
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            readonly: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            isShow: {
                type: Boolean,
                default: () => {
                    return true;
                }
            },
            probOid: String,
            title: {
                type: String,
                default: '关联的PR对象'
            },
            typeName: {
                type: String,
                default: 'PR'
            },
            vm: Object,
            // 自定义参数appName
            appName: String
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                panelUnfold: true,
                selectedData: [], // 选中数据
                addList: [], // 新增数据
                tableData: [], // 表格显示数据
                showDialog: false,
                associationCfg: {
                    className: '',
                    tableKey: ''
                },
                selectedViewType: '',
                selectedChildType: '',
                openType: ''
            };
        },
        mixins: [mixin],
        computed: {
            ...mapGetters(['getViewTableMapping']),
            ...mapGettersFlow(['getReviewObject']),
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: this.typeName });
            },
            reviewObject() {
                let reviewObject =
                    this.openType === 'create'
                        ? this.getReviewObject({ processDefinitionKey: 'flowChangeRequest' })
                        : [];
                //编码是个对象，要做特殊处理
                reviewObject = reviewObject?.map((item) => ({
                    ...item,
                    identifierNo: _.isObject(item?.identifierNo) ? item?.identifierNo?.value : item?.identifierNo
                }));
                return ErdcKit.deepClone(reviewObject) || [];
            },
            oid() {
                return this.vm?.containerOid || this.probOid;
            },
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            columns() {
                const {
                    checkbox,
                    seq,
                    icon,
                    identifierNo,
                    name,
                    // version,
                    containerRef,
                    createBy,
                    updateBy,
                    createTime,
                    updateTime
                } = this.commonColumnsMap;
                return [
                    checkbox,
                    seq,
                    icon,
                    identifierNo,
                    name,
                    this.commonColumnsMap['lifecycleStatus.status'],
                    // version,
                    containerRef,
                    createBy,
                    updateBy,
                    createTime,
                    updateTime
                ];
            },
            importTable() {
                const { getUserName } = this;
                let value = this.reviewObject;
                const setData = JSON.parse(localStorage.getItem('saveOtherData'));
                const type = this.$route?.query?.type || '';
                let data = [];

                if (value?.length && type === 'flow') {
                    data = value.map((item) => ({ ...item, selected: true }));
                }
                if (setData?.length && type === 'create') {
                    data = setData.map((item) => {
                        if (item.attrRawList) {
                            item['containerRef'] =
                                item?.attrRawList?.find((item) => item.attrName === 'containerRef')?.displayName ||
                                item.containerRef;
                        } else {
                            item['containerRef'] = item?.containerRef?.displayName || item?.containerRef;
                            item['createBy'] = getUserName(item, 'createBy');
                            item['updateBy'] = getUserName(item, 'updateBy');
                        }
                        return { ...item, selected: true };
                    });
                }

                return data;
            },
            //修改左穿梭框的标题
            leftTitle() {
                return this.i18n.allDataList;
            },
            actionNameMap() {
                return {
                    [viewCfg.ecrChangeTableView.className]: 'CHANGE_REQUEST_CREATE_RELATE_MENU',
                    [viewCfg.ecnChangeTableView.className]: 'CHANGE_ORDER_CREATE_RELATE_MENU'
                };
            },
            actionConfig() {
                return {
                    name: this.actionNameMap[this.$route.meta.className],
                    objectOid: this?.oid?.includes('container') ? '' : this?.oid,
                    containerOid: this.containerRef || '',
                    className: this.$route.meta.className
                };
            },
            excluded() {
                return _.map(this.tableData, 'identifierNo');
            }
        },
        created() {
            this.openType = this.$route.query.type;
            this.getFlowInitData();
        },
        watch: {
            oid: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        //容器入口-创建时不需要请求数据
                        if (this.$route.meta.openType == 'create') {
                            return false;
                        }
                        if (this.$route.query.type == 'flow') {
                            return false;
                        }
                        this.getTableList(nv);
                    }
                }
            },
            importTable: {
                immediate: true,
                handler(nv) {
                    if (nv && nv.length) {
                        this.tableData = nv;
                        let isImportData = true;
                        this.handleSaveRelatedObject(nv, isImportData);
                    }
                }
            },
            tableData: {
                immediate: true,
                handler(nv) {
                    if (nv && this.typeName === 'PR') {
                        this.$nextTick(() => {
                            setTimeout(() => {
                                this?.vm?.$emit('relatedToAffected', nv);
                            }, 500);
                        });
                    }
                }
            }
        },
        methods: {
            getFlowInitData() {
                let requestToNoticeMap = this?.$store?.getters?.['Change/getRequestToNoticeMap'] || {};
                let identifierNo = requestToNoticeMap[this?.$route?.query?.probOid || ''];

                // 如果当前类型是flow并且能查出identifierNo 代表从上级的变更请求流程进入
                if (this.openType === 'flow' && identifierNo) {
                    this.$famHttp({
                        url: '/change/view/table/page',
                        method: 'POST',
                        data: {
                            tableKey: viewCfg.ecrChangeTableView.tableKey,
                            addTypeCondition: false,
                            conditionDtoList: [
                                {
                                    attrName: `${viewCfg.ecrChangeTableView.className}#lifecycleStatus.status`,
                                    oper: 'NE',
                                    value1: 'DRAFT'
                                },
                                {
                                    attrName: `${viewCfg.ecrChangeTableView.className}#identifierNo`,
                                    oper: 'EQ',
                                    value1: identifierNo
                                }
                            ]
                        }
                    }).then((r) => {
                        let arr = utils.getProp(r, 'data.records', []);
                        arr = _.filter(arr, (item) => item.oid === this.oid) || [];
                        if (arr.length === 1) {
                            let target = r.data.records[0];
                            // 防重
                            if (this.tableData.every((d) => d.oid !== target?.oid)) {
                                this.tableData.push(utils.coverDataFromAttrRowList({ ...target, selected: true }));
                            }
                            return;
                        }
                        console.warn('条件判断异常');
                    });
                }
            },
            getUserName(data, field) {
                let userData = data[`${field}_defaultValue`] || data[field];
                if (!userData) return '';
                else if (_.isArray(userData)) return userData.map((user) => user.displayName || '').join();
                else if (_.isObject(userData)) return userData.displayName || '';
                else return userData;
            },
            urlConfig(vm) {
                const data = ErdcKit.deepClone(vm?.defaultUrlConfig?.data) || {};
                data.conditionDtoList = _.map(data?.conditionDtoList, (item) => {
                    return {
                        ...item,
                        attrName: this.associationCfg.className + '#' + item?.attrName.split('#')[1]
                    };
                });
                data.conditionDtoList = _.filter(
                    data?.conditionDtoList,
                    (item) => item?.attrName?.split('#')?.[1] !== 'typeReference'
                );
                return {
                    data: {
                        className: this.associationCfg.className,
                        tableKey: this.associationCfg.tableKey,
                        typeReference: this.selectedChildType ?? '',
                        ...data
                    }
                };
            },
            //定制穿梭框左侧的表头
            tableColumns(data) {
                const tableColumns = ErdcKit.deepClone(data) || [];
                if (this.typeName === 'PR' || this.typeName === 'ECR') {
                    tableColumns.splice(5, 1);
                }
                return tableColumns;
            },
            afterRequest({ data, callback }) {
                const { className } = this.associationCfg;

                let result = data?.map((item) => {
                    let obj = {};
                    _.each(item.attrRawList, (res) => {
                        if (res.attrName.includes('icon')) {
                            obj[res.attrName.split('#')[1]] = res.value;
                        }
                        if (res.attrName.indexOf(className + '#') !== -1) {
                            obj[res.attrName.split('#')[1]] = res.displayName;
                        }
                    });
                    item['iconColor'] = this.getIconStyle(item);
                    return { ...item, ...obj, checked: false };
                });
                callback(result);
            },
            submit(data) {
                if (!data.length) {
                    return;
                }
                const result = data.map((item) => {
                    let newRow = {};
                    _.each(item?.attrRawList, (ite) => {
                        newRow[ite?.attrName] = ite?.displayName || '';
                        if (ite.attrName.includes('icon')) {
                            newRow[ite.attrName.split('#')[1]] = ite.value;
                        }
                    });
                    item['selected'] = true;
                    return {
                        ...item,
                        ...newRow
                    };
                });
                // 过滤出tableData中不存在的数据
                const newDataToAdd = result.filter(
                    (newItem) => !this.tableData.some((item) => item.oid === newItem.oid)
                );
                // 将新数据追加到tableData中
                this.addList = newDataToAdd;
                this.tableData = [...this.tableData, ...newDataToAdd];
                //保存到仓库
                this.handleSaveRelatedObject();
            },
            async getTableList(relationshipRef, isBool) {
                this.tableData = await this.changeProcessTableGetList(
                    {
                        className: viewCfg.otherClassNameMap.changeProcessLink,
                        tableKey: {
                            PR: 'ChangeRequestRelationChangeIssueView',
                            ECR: 'ChangeOrderRelationChangeRequestView',
                            ECA: 'ChangeActivityQueryChangeOrderView'
                        }[this.typeName],
                        relationshipRef
                    },
                    (res) =>
                        (res?.data?.records || []).map((item) => {
                            (item?.attrRawList || []).forEach((attrObject) => {
                                const key = attrObject?.attrName.split('#')?.[1];
                                if (key === 'roleAObjectRef') {
                                    item[key] = attrObject?.oid || '';
                                } else {
                                    item[key] = attrObject?.displayName || attrObject?.value || '';
                                }
                                item[attrObject?.attrName] = attrObject?.displayName || attrObject?.value || '';
                            });
                            item.selected = isBool;
                            item.attrRawList = item.attrRawList.filter((ite) => !ite.attrName.includes('icon'));
                            return item;
                        })
                );

                //保存到仓库
                this.handleSaveRelatedObject();
            },
            getData() {
                return new Promise((resolve) => {
                    const data = this.tableData.filter((item) => item.selected);
                    resolve(data);
                });
            },
            handlerAdd() {
                this.associationCfg = _.extend({}, this.associationCfg, {
                    className: this.viewTableMapping.className,
                    tableKey: this.viewTableMapping.tableKey
                });
                this.showDialog = true;
            },
            clearStoreRelatedChangeObject(oids = []) {
                let storeOids = this.$store?.getters?.['Change/getRelatedChangeObject'] || [];
                this.$store.commit(
                    'Change/relatedChangeObject',
                    storeOids.filter((oid) => !oids.includes(oid))
                );
            },
            handlerRemove() {
                const { i18n, selectedData } = this;
                if (!selectedData || !selectedData.length) {
                    this.$message({
                        type: 'warning',
                        message: i18n.selectTip
                    });
                    return;
                }
                // 已绑定的数据
                const deleteIds = selectedData.filter((item) => !item.selected).map((item) => item.oid);
                // 新增数据
                const filterData = selectedData.filter((item) => item.selected).map((item) => item.oid);

                this.$confirm(i18n.deleteBatchTip, i18n.deleteTip, {
                    type: 'warning',
                    confirmButtonText: i18n.confirm,
                    cancelButtonText: i18n.cancel
                }).then(() => {
                    if (deleteIds.length) {
                        const className = viewCfg.otherClassNameMap.changeProcessLink;
                        this.$famHttp({
                            url: '/fam/deleteByIds',
                            method: 'delete',
                            params: {},
                            data: {
                                oidList: deleteIds,
                                className
                            }
                        }).then(() => {
                            this.$message({
                                type: 'success',
                                message: i18n.deleteSuccess,
                                showClose: true
                            });
                            this.getTableList(this.oid);
                            this.clearStoreRelatedChangeObject(selectedData.map((d) => d.oid));
                            //清空勾选的数据
                            this.selectedData = [];
                        });
                    }
                    if (filterData.length) {
                        const indicesToRemove = function (array) {
                            return array.reduce((acc, obj, index) => {
                                if (filterData.find((bObj) => bObj === obj.oid)) {
                                    acc.push(index);
                                }
                                return acc;
                            }, []);
                        };
                        // 从a数组中移除与b数组中共享的对象
                        indicesToRemove(this.tableData)
                            .sort((a, b) => b - a)
                            .forEach((index) => this.tableData.splice(index, 1));
                        indicesToRemove(this.addList)
                            .sort((a, b) => b - a)
                            .forEach((index) => this.addList.splice(index, 1));
                        this.clearStoreRelatedChangeObject(selectedData.map((d) => d.oid));
                        //清空勾选的数据
                        this.selectedData = [];
                    }
                });
            },
            handleGoDetail(data) {
                //流程查看详情,需添加返回按钮
                cbbUtils.goToDetail(
                    data,
                    { query: { backButton: true }, skipMode: 'replace' },
                    utils.getClassNameKey(data),
                    null,
                    true
                );
            },
            // 复选框选中数据
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            // 复选框全选数据
            checkboxAll({ records = [] }) {
                this.selectedData = records;
            },
            getIconStyle(row) {
                const style = utils.getIconClass(row.attrRawList, row?.idKey);
                style.verticalAlign = 'text-bottom';
                style.fontSize = '16px';

                return style;
            },
            getIcon(row) {
                return (
                    row.attrRawList?.find((item) =>
                        [`${this.viewTableMapping.className}#icon`, 'icon'].includes(item.attrName)
                    )?.value || row.icon
                );
            },
            //存储关联的变更对象
            handleSaveRelatedObject(nv, isImportData = false) {
                //只有变更通告页面才保存数据
                if (this.typeName !== 'ECR') return false;
                //变更任务触发到，拦截
                if (this.$route.meta.className === viewCfg.ecaChangeTableView.className) return false;
                let oids = [];
                //当行编辑、批量编辑、详情入口创建变更通告
                if (isImportData) {
                    nv &&
                        nv.forEach((item) => {
                            if (item?.oid?.includes('EtChangeRequest')) {
                                oids.push(item.oid);
                            }
                        });
                } else {
                    this.tableData.forEach((item) => {
                        //新增的数据取oid
                        if (item.selected) {
                            if (item?.oid?.includes('EtChangeRequest')) {
                                oids.push(item.oid);
                            }
                        } else {
                            //已经关联的数据取roleAObjectRef里面的oid
                            let roleAObjectOptions = item.attrRawList.find(
                                (ite) => ite.attrName == `${item.idKey}#roleAObjectRef`
                            );
                            if (roleAObjectOptions?.oid?.includes('EtChangeRequest')) {
                                oids.push(roleAObjectOptions.oid);
                            }
                        }
                    });
                }
                this.$store.commit('Change/relatedChangeObject', oids);
            },
            // 功能按钮点击事件
            actionClick(type = {}, data = {}) {
                let eventClick = {
                    CHANGE_REQUEST_CREATE_RELATE_MENU_ADD: this.handlerAdd, //变更请求-增加
                    CHANGE_REQUEST_CREATE_RELATE_MENU_REMOVE: this.handlerRemove, //变更请求-移除
                    CHANGE_ORDER_CREATE_RELATE_MENU_ADD: this.handlerAdd, //变更通告-增加
                    CHANGE_ORDER_CREATE_RELATE_MENU_REMOVE: this.handlerRemove //变更通告-移除
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            }
        }
    };
});
