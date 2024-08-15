define([
    'text!' + ELMP.resource('erdc-components/FamParticipantSelect/components/CompleteSelect/index.html'),
    'TreeUtil',
    'css!' + ELMP.resource('erdc-components/FamParticipantSelect/components/CompleteSelect/style.css')
], function (template, TreeUtil) {
    const FamKit = require('fam:kit');
    return {
        template,
        props: {
            value: {
                type: [String, Array],
                default: null
            },
            defaultValue: {
                type: [Object, Array],
                default() {
                    return null;
                }
            },
            title: {
                type: String,
                default: ''
            },
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
            selectData: {
                type: [String, Array],
                default() {
                    return null;
                }
            },
            type: {
                type: String,
                default: ''
            },
            queryListUrl: String,
            placeholder: String,
            treeData: {
                type: Array,
                default() {
                    return [];
                }
            },
            treeSelectData: {
                type: Object,
                default() {
                    return {};
                }
            },
            multiple: Boolean
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-components/FamParticipantSelect/locale/index.js'),
                searchValue: '',
                dataList: []
            };
        },
        computed: {
            innerSelectData: {
                get() {
                    return this.selectData || [];
                },
                set(val) {
                    this.$emit('update:select-data', val);
                }
            },
            innerPlaceholder() {
                const placeholderMap = {
                    ROLE: this.i18n.pleaseSelectRole,
                    ORG: this.i18n.pleaseSelectOrg,
                    GROUP: this.i18n.pleaseSelectGroup,
                    USER: this.i18n.pleaseSelectUser
                };
                return this.placeholder || placeholderMap?.[this.type] || '';
            },
            innerTitle() {
                const titleMap = {
                    ROLE: this.i18n.selectRole,
                    ORG: this.i18n.selectOrg,
                    GROUP: this.i18n.selectGroup,
                    USER: this.i18n.selectUser
                };
                return this.title || titleMap?.[this.type] || '';
            },
            innerDataList() {
                return this.innerSelectData.map((item) => {
                    const parentPath = TreeUtil.findPath(this.treeData, {
                        childrenField: 'childList',
                        target: {
                            [this.nodeKey]: this.treeSelectData?.[this.nodeKey] || item?.[this.nodeKey] || ''
                        }
                    });
                    const pathDisplayName = parentPath.map((item) => item.name)?.join('/');
                    const truePathDisplayName = _.isEmpty(this.treeSelectData)
                        ? pathDisplayName
                        : pathDisplayName + '/' + item[this.props.label];
                    return {
                        ...item,
                        pathDisplayName: this.type === 'USER' ? '' : truePathDisplayName
                    };
                });
            }
        },
        watch: {
            innerSelectData: {
                deep: true,
                handler() {
                    this.onSearch(this.searchValue);
                }
            },
            searchValue(value) {
                this.onSearch(value);
            }
        },
        mounted() {
            this.dataList = FamKit.deepClone(this.innerDataList);
        },
        methods: {
            onSearch(value) {
                if (!value) {
                    this.dataList = FamKit.deepClone(this.innerDataList);
                } else {
                    this.dataList = this.innerDataList.filter((item) => {
                        let newVal = item?.[this.props.label]?.toUpperCase() || '';
                        return newVal.indexOf(value.toUpperCase()) !== -1;
                    });
                }
            },
            onClear(data) {
                this.dataList = this.dataList.filter((item) => {
                    return item[this.nodeKey] !== data[this.nodeKey];
                });
                const clearedData = this.innerSelectData.filter((item) => {
                    return item[this.nodeKey] !== data[this.nodeKey];
                });
                const innerValue = this.multiple
                    ? clearedData.map((item) => item[this.nodeKey])
                    : clearedData?.[0]?.[this.nodeKey] || clearedData?.[this.nodeKey] || '';

                this.$emit('input', innerValue);
                this.$emit('change', innerValue, clearedData);
            },
            onClearAll() {
                this.$emit('input', this.multiple ? [] : '');
                this.$emit('change', this.multiple ? [] : '', []);
            },
            focus() {
                this.$refs.input.focus();
            }
        }
    };
});
