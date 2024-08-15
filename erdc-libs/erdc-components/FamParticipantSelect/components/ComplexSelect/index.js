define([
    'text!' + ELMP.resource('erdc-components/FamParticipantSelect/components/ComplexSelect/index.html'),
    'css!' + ELMP.resource('erdc-components/FamParticipantSelect/components/ComplexSelect/style.css')
], function (template) {
    const FamKit = require('fam:kit');
    return {
        template,
        props: {
            value: {
                type: [String, Array],
                default() {
                    return null;
                }
            },
            title: String,
            selectTitle: String,
            placeholder: String,
            leftPlaceholder: String,
            leftConfig: {
                type: Object,
                default() {
                    return null;
                }
            },
            rightConfig: {
                type: Object,
                default() {
                    return null;
                }
            },
            type: {
                type: String,
                default: ''
            },
            defaultMode: {
                type: String,
                default: ''
            },
            className: String,
            queryScope: String,
            containerRef: String,
            props: {
                type: Object,
                default() {
                    return {
                        children: 'childList',
                        label: 'displayName'
                    };
                }
            },
            // 是否多选
            multiple: Boolean,
            // 当前模式下选择数据的接口配置，有默认配置，优先级在row之后
            requestConfig: {
                type: Object,
                default() {
                    return null;
                }
            },
            // 左边树的接口配置，有默认配置，优先级在row之后
            leftRequestConfig: {
                type: Object,
                default() {
                    return null;
                }
            },
            leftClassName: String,
            // 针对参与者组件各个场景下统一的接口配置，由外部传入，优先级最高
            row: {
                type: Object,
                default() {
                    return null;
                }
            },
            queryParams: {
                type: Object,
                default: () => {
                    return null;
                }
            },
            appName: String,
            disableIds: Array,
            defaultValue: {
                type: [Array, String, Object],
                default() {
                    return null;
                }
            },
            selectData: Array,
            threeMemberEnv: Boolean
        },
        components: {
            FamTree: FamKit.asyncComponent(ELMP.resource('erdc-components/FamTree/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-components/FamParticipantSelect/locale/index.js'),
                leftSearchValue: '',
                rightSearchValue: '',
                leftTreeData: [],
                checkAll: false,
                rightTreeData: [],
                selectValue: [],
                leftDefaultCheckedKeys: [],
                leftDefaultExpandedKeys: [],
                componentConfCopy: {}
            };
        },
        watch: {
            leftSearchValue(value) {
                this.$refs?.treeLeftRef?.$refs?.tree.filter(value);
            },
            rightSearchValue(value) {
                const requestApi = {
                    ...this.componentConfCopy,
                    data: {
                        ...this.componentConfCopy.data,
                        keywords: value
                    }
                }
                this.getRightTreeData(requestApi);
            },
            value: {
                immediate: true,
                handler(value) {
                    const selectvalue = _.isArray(value) ? value : [value];
                    this.selectValue = value;
                    if (value === null) {
                        this.selectValue = this.multiple ? [] : '';
                    }
                    this.$nextTick(() => {
                        this.$refs?.treeRightRef?.$refs?.tree?.setCheckedKeys(selectvalue || []);
                    });
                }
            },
            selectValue(selectValue) {
                this.$emit('input', selectValue);
            },
            innerLeftRequestConfig: {
                immediate: true,
                handler(requestConfig) {
                    if (this.defaultMode === 'GROUP') {
                        requestConfig.data.isGetVirtual = requestConfig.data?.isGetVirtual ?? true;
                    }
                    this.leftTreeConfig(requestConfig);
                }
            },
            currentSelectValue(selectValue) {
                const selectVal = _.isArray(selectValue) ? selectValue : [selectValue];
                if (
                    selectVal.length &&
                    selectVal.length ===
                        FamKit.TreeUtil.flattenTree2Array(this.rightTreeData, {
                            childrenFiled: this.rightProps.children
                        }).length
                ) {
                    this.checkAll = true;
                } else {
                    this.checkAll = false;
                }
            }
        },
        computed: {
            innerSelectData: {
                get() {
                    return this.selectData;
                },
                set(selectData) {
                    this.$emit('update:select-data', selectData);
                }
            },
            currentSelectValue() {
                return this.rightTreeData
                    .filter((item) => {
                        return this.selectValue.includes(item[this.rightNodeKey]);
                    })
                    .map((item) => item[this.rightNodeKey]);
            },
            innerLeftConfig() {
                const config = {
                    title: '左边title',
                    props: {
                        children: 'childList',
                        label: 'displayName'
                    },
                    nodeKey: 'oid',
                    row: null,
                    showCheckbox: false,
                    multiple: false
                };
                if (this.type === 'ROLE') {
                    config.nodeKey = 'idPath';
                }
                return { ...config, ...this.leftConfig };
            },
            leftTitle() {
                return this.title || '';
            },
            leftProps() {
                let props = this.innerLeftConfig?.props || {};
                return props;
            },
            leftNodeKey() {
                return this.innerLeftConfig?.nodeKey || 'oid';
            },
            innerLeftRequestConfig() {
                return {
                    ...this.leftRequestConfig,
                    data: {
                        ...this.leftRequestConfig?.data,
                        ...this.queryParams?.data
                    }
                };
            },

            /***********************************/

            innerRightConfig() {
                const config = {
                    title: '右边title',
                    props: {
                        children: 'children',
                        label: 'displayName',
                        disabled: 'disabled'
                    },
                    nodeKey: 'oid',
                    defaultExpandAll: false,
                    row: null,
                    showCheckbox: false
                };
                return { ...config, ...this.rightConfig };
            },
            innerShowCheckbox() {
                return this.innerRightConfig?.showCheckbox || this.multiple;
            },
            rightTitle() {
                return this.selectTitle || '';
            },
            rightProps() {
                return this.innerRightConfig.props;
            },
            rightNodeKey() {
                return this.innerRightConfig.nodeKey || 'oid';
            },
            rightDefaultExpandAll() {
                return this.innerRightConfig.defaultExpandAll;
            },
            rightDefaultCheckedKeys() {
                return _.isArray(this.defaultValue)
                    ? this.defaultValue.map((item) => {
                          return _.isObject(item) ? item[this.rightNodeKey] : item;
                      })
                    : _.isObject(this.defaultValue)
                      ? this.defaultValue[this.rightNodeKey]
                      : this.defaultValue;
            }
        },
        methods: {
            /********   左边树操作    **********/
            leftFilterNodeMethod(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.[this.leftProps.label]?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            // 左边选择
            leftCheckChange(row) {
                const customParamFn = function (defaultData) {
                    let requestConfig = {};
                    const { type, defaultMode, row, containerRef, queryParams } = defaultData;

                    if (type === 'ROLE' && defaultMode === 'ROLE') {
                        requestConfig = {
                            appName: row.appName,
                            roleType: row.identifierNo,
                            isGetVirtualRole: queryParams?.data?.isGetVirtualRole ?? true
                        };
                    }
                    if (type === 'USER') {
                        const roleCode = row?.identifierNo || '';
                        requestConfig = {
                            containerOid: containerRef,
                            isCurrentTenant: '',
                            current: 1,
                            groupIds: defaultMode === 'GROUP' ? [row.id] : [],
                            orgId: defaultMode === 'ORG' ? row.id : '',
                            size: 20,
                            roleCode: roleCode,
                            userType: '',
                            isGetDisable: false
                        };
                    }
                    if (type === 'GROUP') {
                        requestConfig = {
                            isGetVirtual: true
                        };
                    }
                    return requestConfig;
                };
                const requestConfig = customParamFn({
                    type: this.type,
                    defaultMode: this.defaultMode,
                    row: FamKit.deepClone(row),
                    queryScope: this.queryScope,
                    containerRef: this.containerRef,
                    queryParams: this.queryParams
                });
                let componentConf = {
                    ...this.requestConfig,
                    data: {
                        className: this.className,
                        filterThreeMember: this.threeMemberEnv,
                        ...requestConfig,
                        ...this.requestConfig?.data,
                        ...this.queryParams?.data,
                        appName: row?.appName
                    },
                    headers: {
                        'App-Name': row?.appName,
                        ...this.requestConfig?.headers,
                        ...this.queryParams?.headers
                    }
                };

                this.componentConfCopy = FamKit.deepClone(componentConf);
                this.$emit('tree-select-data', row);
                this.getRightTreeData(componentConf);
            },
            onSearchLeft() {
                this.$refs?.treeLeftRef?.$refs?.tree.filter(this.leftSearchValue);
            },
            leftTreeConfig: _.debounce(function (requestConfig = {}) {
                let params = requestConfig?.params || {};

                if (this.defaultMode === 'GROUP') {
                    params.isGetVirtual = requestConfig?.data?.isGetVirtual ?? true;
                    params.filterThreeMember = this.threeMemberEnv;
                }
                const componentConf = {
                    ...requestConfig,
                    params: _.isEmpty(params)
                        ? null
                        : {
                              className: this.leftClassName,
                              containerOid: this.containerRef,
                              ...params
                          },
                    data: {
                        className: this.leftClassName,
                        containerOid: this.containerRef,
                        ...requestConfig?.data
                    },
                    headers: {
                        'App-Name': this.appName,
                        ...requestConfig?.headers
                    }
                };

                this.getLeftTreeData(componentConf);
            }, 300),
            getLeftTreeData(request) {
                this.$famHttp(request).then((resp) => {
                    const { data } = resp;
                    this.leftTreeData = data;
                    this.$emit('tree-data', data);
                    this.$nextTick(() => {
                        const firstData = this.leftTreeData[0];
                        this.leftDefaultExpandedKeys = [firstData[this.leftNodeKey]];
                        this.$refs?.treeLeftRef?.$refs?.tree?.setCurrentKey(
                            firstData?.[this.leftProps.children]?.[0]?.[this.leftNodeKey] || ''
                        );
                        this.$nextTick(() => {
                            this.leftCheckChange(firstData?.[this.leftProps.children]?.[0]);
                        });
                    });
                });
            },
            /********   右边树操作    **********/
            rightFilterNodeMethod(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.[this.rightProps.label]?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            onSearchRight() {
                this.$refs?.treeRightRef?.$refs?.tree.filter(this.leftSearchValue);
            },
            onCheckAll(isCheckAll) {
                let selectValue = this.selectValue;
                let selectData = this.innerSelectData;
                if (isCheckAll) {
                    const data = this.rightTreeData.map((item) => item[this.rightNodeKey]);
                    this.$refs?.treeRightRef?.$refs?.tree?.setCheckedKeys(data || []);
                    const checkedKeys = this.$refs?.treeRightRef?.$refs?.tree?.getCheckedKeys();
                    const checkedNodes = this.$refs?.treeRightRef?.$refs?.tree?.getCheckedNodes();
                    selectValue = [...selectValue, ...checkedKeys];
                    selectData = this.objectArrayRemoveDuplication([...selectData, ...checkedNodes], this.rightNodeKey);
                } else {
                    this.$refs?.treeRightRef?.$refs?.tree?.setCheckedKeys([]);
                    const treeDataValue = this.rightTreeData.map((item) => item[this.rightNodeKey]);
                    selectValue = selectValue.filter((item) => !treeDataValue.includes(item));
                    selectData = selectData.filter((item) => !treeDataValue.includes(item[this.rightNodeKey]));
                }
                this.selectValue = selectValue;
                this.$set(this, 'innerSelectData', selectData);
                this.$emit('change', this.selectValue, selectData);
            },
            rightCheckChange(data, node) {
                if (this.innerShowCheckbox) {
                    const checkedKeys = node.checkedKeys;
                    const isChecked = checkedKeys.includes(data[this.rightNodeKey]);

                    if (isChecked) {
                        this.$nextTick(() => {
                            this.selectValue.push(data[this.rightNodeKey]);
                            let innerSelectData = this.innerSelectData;
                            innerSelectData.push(data);
                            this.$set(this, 'innerSelectData', innerSelectData);
                            // 获取改变的节点
                            this.$emit('change', this.selectValue, this.innerSelectData);
                        });
                    } else {
                        this.selectValue = this.selectValue.filter((item) => item !== data[this.rightNodeKey]);
                        const innerSelectData = this.innerSelectData.filter(
                            (item) => item[this.rightNodeKey] !== data[this.rightNodeKey]
                        );
                        this.$set(this, 'innerSelectData', innerSelectData);
                        this.$emit('change', this.selectValue, innerSelectData);
                    }
                    return;
                }
                this.selectValue = data[this.rightNodeKey];
                this.innerSelectData = [data];
                // 获取改变的节点
                this.$emit('change', this.selectValue, data);
            },
            getRightTreeData: _.debounce(function (requestApi) {
                this.$famHttp(requestApi).then(({ data }) => {
                    const { userInfoList, records } = data;
                    let dataList = _.isArray(data) ? data : userInfoList || records || [];
                    this.rightTreeData = dataList?.map((item) => {
                        if (item.attrRawList?.length) {
                            const attrRawList = item.attrRawList;
                            attrRawList.forEach((ite) => {
                                item[ite.attrName] = ite.value;
                            });
                        }
                        if (this.disableIds.includes(item?.[this.rightNodeKey])) {
                            this.$set(item, this.rightProps.disabled, true);
                        }
                        return item;
                    });
                });
            }, 300),
            // 数组对象去重
            objectArrayRemoveDuplication(objecjArr, key) {
                const has = {};
                return objecjArr.reduce((pre, next) => {
                    if (!has[next[key]]) {
                        has[next[key]] = true;
                        pre.push(next);
                    }
                    return pre;
                }, []);
            },
            focus() {
                this.$refs.input.focus();
            }
        }
    };
});
