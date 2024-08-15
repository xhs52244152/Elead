define([
    'text!' + ELMP.resource('erdc-components/FamParticipantSelect/components/SimpleSelect/index.html'),
    'css!' + ELMP.resource('erdc-components/FamParticipantSelect/components/SimpleSelect/style.css')
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
            placeholder: String,
            props: {
                type: Object,
                default: () => {
                    return {
                        children: 'childList',
                        label: 'displayName',
                        disabled: 'disabled'
                    };
                }
            },
            nodeKey: {
                type: String,
                default: 'oid'
            },
            showCheckbox: Boolean,
            multiple: Boolean,
            // 针对参与者组件各个场景下统一的接口配置，由外部传入，优先级最高
            row: {
                type: Object,
                default() {
                    return null;
                }
            },
            defaultExpandAll: Boolean,
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
            // 树接口配置，有默认配置，优先级在row之后
            requestConfig: {
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
            selectData: Array,
            threeMemberEnv: Boolean
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-components/FamParticipantSelect/locale/index.js'),
                searchValue: '',
                treeData: [],
                checkAll: false,
                setCheckedKeys: [],
                selectValue: [], // 选中的数据
                currentNodeKey: '',
                defaultExpandedKeys: [],
                selectValueAll: null,
                unCheckValue: [], // 不可选中
                style: 'width: 100%'
            };
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
            innerShowCheckbox() {
                return this.showCheckbox || this.multiple;
            },
            innerRequestConfig() {
                let data = {
                    className: this.className,
                    containerOid: this.containerRef
                };
                let params = {};

                let headers = {};

                if (this.defaultMode === 'GROUP') {
                    headers['App-Name'] = this.queryParams?.data?.appName || this.appName;
                    params.isGetVirtual = this.queryParams?.data?.isGetVirtual ?? true;
                    params.filterThreeMember = this.threeMemberEnv;
                }
                params = {
                    ...params,
                    ...this.requestConfig?.params,
                    ...this.queryParams?.params
                };
                return {
                    ...this.requestConfig,
                    data: {
                        ...data,
                        ...this.requestConfig?.data,
                        ...this.queryParams?.data
                    },
                    params: _.isEmpty(params)
                        ? null
                        : {
                              className: this.className,
                              containerOid: this.containerRef,
                              ...params
                          },
                    headers: {
                        ...headers,
                        ...this.requestConfig?.headers,
                        ...this.queryParams?.headers
                    }
                };
            },
            innerProps() {
                return {
                    ...this.props,
                    disabled: 'disabled',
                    children: 'childList',
                    label: 'displayName'
                };
            },
            currentSelectValue() {
                const flattenTree = FamKit.TreeUtil.flattenTree2Array(this.treeData, {
                    childrenField: this.props.children
                });
                const selectVal = _.isArray(this.selectValue) ? this.selectValue : [this.selectValue];
                return flattenTree
                    .filter((item) => {
                        return selectVal?.includes(item[this.nodeKey]);
                    })
                    .map((item) => item[this.nodeKey]);
            },
            checkStrictly() {
                return this.type === 'ORG';
            }
        },
        watch: {
            selectValue: {
                deep: true,
                handler(selectValue) {
                    const selectVal = _.isArray(selectValue) ? selectValue : [selectValue];
                    this.checkAll = false;
                    const length = FamKit.TreeUtil.flattenTree2Array(this.treeData, {
                        childrenField: this.props.children
                    }).filter((item) => item.principalTarget)?.length;
                    if (selectVal.length === length && selectVal.length !== 0) {
                        this.checkAll = true;
                    }
                    if (this.selectValueAll === null) {
                        this.selectValueAll = selectValue;
                    }
                    this.$emit('input', selectValue);
                }
            },
            searchValue(n) {
                this.$refs?.treeRef?.$refs?.tree.filter(n);
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
                        if (this.selectValueAll === null) {
                            const rootNodeValue = this.checkParent(selectvalue);
                            this.$refs?.treeRef?.$refs?.tree?.setCheckedKeys([...rootNodeValue, ...selectvalue]);
                        } else {
                            this.$refs?.treeRef?.$refs?.tree?.setCheckedKeys(
                                this.checkStrictly ? this.selectValueAll : selectvalue || []
                            );
                        }
                    });
                }
            },
            currentSelectValue(selectValue) {
                const selectVal = _.isArray(selectValue) ? selectValue : [selectValue];
                const flattenTree = FamKit.TreeUtil.flattenTree2Array(this.treeData, {
                    childrenField: this.props.children
                });
                const selectable = flattenTree.filter((item) => item.principalTarget);
                if (selectable.length && selectVal.length === selectable.length) {
                    this.checkAll = true;
                } else {
                    this.checkAll = false;
                }
            }
        },
        mounted() {
            if (this.innerRequestConfig) {
                this.fetchTree(this.innerRequestConfig);
            }
        },
        methods: {
            onSearch(value) {
                this.$refs?.treeRef?.$refs?.tree.filter(value);
            },
            handleChange(data, node) {
                if (this.innerShowCheckbox) {
                    const checkedKeys = node.checkedKeys;
                    const isChecked = checkedKeys.includes(data[this.nodeKey]);
                    const selectVal = _.isArray(this.selectValue) ? this.selectValue : [this.selectValue];
                    const selectData = this.findTree(data, this.props.children)?.filter((item) =>
                        this.checkStrictly
                            ? !selectVal.includes(item[this.nodeKey])
                            : !selectVal.includes(item[this.nodeKey]) && item.principalTarget
                    );
                    if (isChecked) {
                        const principalTargetSelectData = selectData.filter((item) =>
                            this.checkStrictly
                                ? item.principalTarget && !item.parentKey.includes('-1')
                                : item.principalTarget
                        );
                        this.selectValue.push(...principalTargetSelectData.map((item) => item[this.nodeKey]));
                        this.selectValueAll = _.union(
                            selectData
                                .map((item) => item[this.nodeKey])
                                .concat(this.selectValue)
                                .concat(this.selectValueAll)
                        );
                        this.innerSelectData.push(...principalTargetSelectData);
                        this.$emit('change', this.selectValue, this.innerSelectData);
                    } else {
                        const unselectValue = this.findTree(data, this.props.children).map(
                            (item) => item[this.nodeKey]
                        );
                        const unselectParentNode = this.$refs.treeRef.getNode(unselectValue[0])?.parent;
                        const hasSelectParentChild = unselectParentNode.childNodes.find((node) => node.checked);
                        const selectValueAll = (this.selectValueAll || []).filter((value) => {
                            if (value === unselectParentNode.data[this.nodeKey] && this.checkStrictly) {
                                return hasSelectParentChild;
                            } else {
                                return !unselectValue.includes(value) || !data[this.nodeKey];
                            }
                        });
                        this.selectValueAll = selectValueAll;
                        this.selectValue = this.selectValueAll.filter((item) => item !== data[this.nodeKey]);
                        let innerSelectData = this.innerSelectData.filter(
                            (item) =>
                                this.selectValueAll.includes(item[this.nodeKey]) &&
                                this.selectValue.includes(item[this.nodeKey])
                        );
                        this.innerSelectData = innerSelectData;
                        this.$emit('change', this.selectValue, innerSelectData);
                    }
                    return;
                }
                if (data[this.props.disabled]) return;
                // 过滤应用层数据
                if (data.principalTarget) {
                    this.selectValue = data[this.nodeKey];
                    // 获取改变的节点
                    this.$emit('change', this.selectValue, data);
                }
            },
            onCheckAll(isCheck) {
                const tiledTreeData = this.findTree(this.treeData, this.props.children);
                let selectNodes = tiledTreeData.filter((item) => {
                    return item.principalTarget;
                });
                this.selectValueAll = tiledTreeData.map((item) => item[this.nodeKey]);
                if (!isCheck) {
                    selectNodes = [];
                    this.selectValueAll = [];
                }
                this.selectValue = selectNodes.map((item) => item[this.nodeKey]);
                // 获取改变的节点
                this.$emit('change', this.selectValue, selectNodes);
            },
            filterNodeMethod(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.displayName?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            fetchTree: _.debounce(function (request) {
                this.$famHttp(request).then((resp) => {
                    const { data } = resp;
                    if (!_.isEmpty(this.disableIds)) {
                        this.traverseTree(data, this.nodeKey);
                    }
                    this.$set(this, 'treeData', data || []);
                    this.$emit('tree-data', data);

                    this.unCheckValue = this.findTree(data, this.props.children)
                        .filter((item) => !item.principalTarget)
                        .map((item) => item[this.nodeKey]);
                    this.defaultExpandedKeys = _.isArray(data[0][this.nodeKey])
                        ? data[0][this.nodeKey]
                        : [data[0][this.nodeKey]];

                    const selectvalue = _.isArray(this.value) ? this.value : [this.value];
                    if (
                        selectvalue.length ===
                            FamKit.TreeUtil.flattenTree2Array(this.treeData, { childrenField: this.props.children })
                                .length &&
                        selectvalue.length !== 0
                    ) {
                        this.checkAll = true;
                    }
                });
            }, 300),
            traverseTree(treeData, key) {
                treeData.forEach((item) => {
                    if (this.disableIds.includes(item[key])) {
                        this.$set(item, this.innerProps.disabled, true);
                    }
                    if (item?.[this.innerProps.children]?.length) {
                        this.traverseTree(item[this.innerProps.children], key);
                    }
                });
            },
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
            findTree(treeList, key = 'children') {
                let select = [];
                const data = _.isArray(treeList) ? treeList : [treeList];
                data.forEach((child) => {
                    select.push(child);
                    if (child[key]?.length) {
                        select.push(...this.findTree(child[key], key));
                    }
                });
                return select;
            },
            checkParent(selectvalue) {
                let rootNodeValue = [];
                this.treeData.forEach((item) => {
                    if (item?.[this.props.children]?.length) {
                        const childValue = this.findTree(item[this.props.children], this.props.children);
                        const isCheckAll = !childValue.find((item) => !selectvalue.includes(item[this.nodeKey]));
                        isCheckAll && rootNodeValue.push(item[this.nodeKey]);
                    }
                });
                return rootNodeValue;
            },
            focus() {
                this.$refs.input.focus();
            },
            tooWide(data) {
                this.$nextTick(() => {
                    const tagRef = 'tag_' + data[this.nodeKey];
                    const titleTextRef = 'titleText_' + data[this.nodeKey];
                    const treeContentRef = 'treeContent_' + data[this.nodeKey];

                    const titleText = this.$refs?.[titleTextRef]?.offsetWidth || 0;
                    const treeContent = this.$refs?.[treeContentRef]?.offsetWidth || 0;
                    this.$set(data, 'tooWide', titleText > treeContent);
                    if (titleText > treeContent) {
                        this.$nextTick(() => {
                            const tagWidth = this.$refs?.[tagRef]?.$el?.offsetWidth || 0;
                            this.$set(data, 'style', `width: calc(100% - ${tagWidth + 38}px)`);
                        });
                    }
                });
            }
        }
    };
});
