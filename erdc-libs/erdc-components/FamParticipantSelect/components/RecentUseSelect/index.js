define([
    'text!' + ELMP.resource('erdc-components/FamParticipantSelect/components/RecentUseSelect/index.html'),
    'css!' + ELMP.resource('erdc-components/FamParticipantSelect/components/RecentUseSelect/style.css')
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
            props: {
                type: Object,
                default: () => {
                    return {
                        children: 'childList',
                        label: 'displayName'
                    };
                }
            },
            nodeKey: {
                type: String,
                default: 'oid'
            },
            showCheckbox: Boolean,
            multiple: Boolean,
            queryParams: {
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
            requestConfig: {
                type: Object,
                default() {
                    return null;
                }
            },
            placeholder: String,
            defaultValue: {
                type: [Array, String, Object],
                default() {
                    return [];
                }
            },
            selectData: Array,
            disableIds: {
                type: Array,
                default() {
                    return [];
                }
            },
            threeMemberEnv: Boolean,
            filterSecurityLabel: Boolean,
            securityLabel: String
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-components/FamParticipantSelect/locale/index.js'),
                checkAll: false,
                searchValue: '',
                dataList: [],
                copyDataList: []
            };
        },
        watch: {
            searchValue(newVal) {
                this.onSearch(newVal);
            }
        },
        computed: {
            innerShowCheckbox() {
                return this.multiple;
            },
            innerDefaultValue() {
                return _.isArray(this.defaultValue) ? this.defaultValue : [this.defaultValue];
            },
            innerSelectData() {
                return _.isArray(this.selectData) ? this.selectData : [this.selectData];
            },
            innerValue: {
                get() {
                    return this.innerShowCheckbox && !_.isArray(this.value)
                        ? _.compact([this.value])
                        : this.value || [];
                },
                set(val) {
                    const dataListOids = this.dataList.map((item) => item[this.nodeKey]);
                    const selectedData = this.innerSelectData.filter((item) => {
                        return _.isObject(item)
                            ? !dataListOids.includes(item[this.nodeKey])
                            : !dataListOids.includes(item);
                    });
                    this.dataList.forEach((item) => {
                        if (val.includes(item[this.nodeKey])) {
                            selectedData.push(item);
                        }
                    });
                    this.$emit('input', val);
                    this.$emit('change', val, selectedData);
                }
            }
        },
        mounted() {
            this.getRecentUserData();
        },
        methods: {
            onCheckAll(isCheckAll) {
                const dataListOids = this.dataList.map((item) => item[this.nodeKey]);
                const selectedData = this.innerSelectData.filter((item) => {
                    return _.isObject(item) ? !dataListOids.includes(item[this.nodeKey]) : !dataListOids.includes(item);
                });
                if (isCheckAll) {
                    this.dataList.forEach((item) => {
                        selectedData.push(item);
                    });
                }
                this.innerValue = selectedData.map((item) => item[this.nodeKey]);
            },
            onSearch(value) {
                const _this = this;
                this.searchFn(value, _this);
            },
            searchFn: _.debounce((value, _this) => {
                if (value) {
                    _this.dataList = FamKit.deepClone(_this.copyDataList).filter((item) => {
                        const newVal = item?.[_this.props.label]?.toUpperCase() || '';
                        return newVal.indexOf(value.toUpperCase()) !== -1;
                    });
                } else {
                    _this.dataList = FamKit.deepClone(_this.copyDataList);
                }
            }, 200),
            handleChange(value) {
                const dataListValue = this.dataList.map((item) => item[this.nodeKey]);
                const checkedCount = value.filter((key) => dataListValue.includes(key));
                this.checkAll = checkedCount.length === dataListValue.length;
            },
            handleClick(data) {
                if (this.isDisabled(data)) return;
                this.innerValue = data[this.nodeKey];
            },
            getRecentUserData() {
                const rolebKeyMap = {
                    ROLE: {
                        rolebKey: 'erd.cloud.foundation.principal.entity.Role',
                        contextRolebKey: 'erd.cloud.core.team.entity.TeamRoleLink'
                    },
                    USER: {
                        rolebKey: 'erd.cloud.foundation.principal.entity.User',
                        contextRolebKey: 'erd.cloud.foundation.principal.entity.User'
                    },
                    ORG: {
                        rolebKey: 'erd.cloud.foundation.principal.entity.Organization'
                    },
                    GROUP: {
                        rolebKey: 'erd.cloud.foundation.principal.entity.Group',
                        contextRolebKey: 'erd.cloud.foundation.principal.entity.Group'
                    }
                };
                const roleBObjectKey =
                    this.queryScope === 'team'
                        ? rolebKeyMap[this.type]?.contextRolebKey || ''
                        : rolebKeyMap[this.type]?.rolebKey || '';

                const securityLabel = this.filterSecurityLabel ? this.securityLabel : null;
                const filterThreeMember = this.threeMemberEnv;
                const request = {
                    ...this.requestConfig,
                    data: {
                        type: 'VISIT',
                        roleBObjectKey,
                        securityLabel,
                        filterThreeMember,
                        containerRef: this.containerRef,
                        ...this.requestConfig?.data,
                        ...this.queryParams?.data
                    }
                };
                this.$famHttp(request).then((resp) => {
                    const { data } = resp;
                    this.dataList = data.map((item) => {
                        return {
                            ...item,
                            oid: item.roleBObjectRef,
                            id: item.roleBObjectRef.split(':')[2]
                        };
                    });
                    this.copyDataList = FamKit.deepClone(this.dataList);
                });
            },
            handleMouseOver(el, dom, callback, node, tagRef) {
                const parentElement = el.parentElement;
                const parentWidth = parentElement.clientWidth - 58;
                const containerWidth = dom.clientWidth || dom.offsetWidth;
                const tagComponent = this.$refs?.[tagRef]?.[0]?.$el?.offsetWidth || 0;
                const bool = parentWidth <= containerWidth + tagComponent;
                callback(bool);
            },
            isDisabled(data) {
                return this.disableIds.includes(data[this.nodeKey]);
            },
            focus() {
                this.$refs.input.focus();
            },
            tooWide(data) {
                this.$nextTick(() => {
                    const tagRef = 'tag_' + data[this.nodeKey];
                    const titleTextRef = 'titleText_' + data[this.nodeKey];
                    const treeContentRef = 'treeContent_' + data[this.nodeKey];

                    const titleText = this.$refs?.[titleTextRef]?.[0]?.offsetWidth || 0;
                    const treeContent = this.$refs?.[treeContentRef]?.[0]?.offsetWidth || 0;
                    this.$set(data, 'tooWide', titleText > treeContent);
                    if (titleText > treeContent) {
                        this.$nextTick(() => {
                            const tagWidth = this.$refs?.[tagRef]?.[0]?.$el?.offsetWidth || 0;
                            this.$set(data, 'style', `width: calc(100% - ${tagWidth + 38}px)`);
                        });
                    }
                });
            },
            styleWidth(data) {
                const tagRef = 'tag_' + data[this.nodeKey];
                const tagWidth = this.$refs?.[tagRef]?.[0]?.$el?.offsetWidth || 0;
                return `width: calc(100% - ${tagWidth}px);`;
            }
        }
    };
});
