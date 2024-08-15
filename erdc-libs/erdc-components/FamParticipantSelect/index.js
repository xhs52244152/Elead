/**
 * 参与者选择组件
 * **/
define([
    'text!' + ELMP.resource('erdc-components/FamParticipantSelect/index.html'),
    'erdc-kit',
    ELMP.resource('erdc-components/FamParticipantSelect/ParticipantTypes.js'),
    ELMP.resource('erdc-components/EmitterMixin.js'),
    'css!' + ELMP.resource('erdc-components/FamParticipantSelect/style.css')
], function (template, utils, ParticipantTypes, EmitterMixin) {
    const FamKit = require('fam:kit');

    return {
        template,
        mixins: [EmitterMixin],
        props: {
            value: {
                type: [String, Object, Array],
                default() {
                    return null;
                }
            },
            // ['USER', 'GROUP', 'ROLE', 'ORG']
            showType: {
                type: Array,
                default() {
                    return [];
                }
            },
            disableIds: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 自定义Url
            customMemberSelectUrl: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // 当前已选择的参与者，selectedParticipant: { users: [], userGroups: []}
            selectedParticipant: {
                type: Object,
                default() {
                    return {};
                }
            },
            collapseTags: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            isgetdisable: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            componentDisabled: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            width: {
                type: [String, Number],
                default: ''
            },
            queryParams: {
                type: Object,
                default: () => {
                    return null;
                }
            },
            popoverClass: String,
            isSaveSelected: Boolean,

            /*************************/

            /**
             * 查询方式
             * 'ORG' 部门, 'GROUP' 群组, 'USER' 用户, 'ROLE' 角色, 'RECENTUSE' 最近使用, 'COMMONUSE' 常用, 'FUZZYSEARCH' 模糊搜索
             */
            queryMode: {
                type: Array,
                default() {
                    return null;
                }
            },
            // 默认方式
            defaultMode: {
                type: String,
                default: 'FUZZYSEARCH'
            },
            // 默认值
            defaultValue: {
                type: [Object, Array],
                default() {
                    return [];
                }
            },
            // 是否多选
            multiple: Boolean,
            nodeKey: {
                type: String,
                default() {
                    return 'oid';
                }
            },
            // 查询范围
            queryScope: {
                type: String,
                default() {
                    return 'global';
                }
            },
            containerRef: String,
            appName: String,
            // 针对有一些场景使用参与者组件时，只希望v-model得到的值是一个value的情况
            isFetchValue: Boolean,
            props: {
                type: Object,
                default() {
                    return {};
                }
            },
            popperClass: String,
            withSourceObject: Boolean,
            isDestroySave: Boolean,
            isAutoContainerRef: {
                type: Boolean,
                default: true
            },
            autoHeight: Boolean,
            customSchema: Function,
            threeMemberEnv: {
                type: Boolean,
                default: undefined
            },
            filterSecurityLabel: Boolean,
            securityLabel: String
        },
        data() {
            return {
                visible: false,
                typeVisible: false,
                iconsMapping: {
                    USER: 'erd-iconfont erd-icon-user',
                    GROUP: 'erd-iconfont erd-icon-group',
                    ORG: 'erd-iconfont erd-icon-department',
                    ROLE: 'erd-iconfont erd-icon-team'
                },
                i18nPath: ELMP.resource('erdc-components/FamParticipantSelect/locale/index.js'),

                /*******************/
                tempSelectedUsers: {},
                innerPopoverWidth: 0,
                visible1: true,
                selectData: [],
                selectDataTags: [],
                selectDataCounts: [],
                visiblePopover: false,
                selectDataAllCopy: [],
                count: 0,
                selectType: null,
                isFirst: true
            };
        },
        components: {
            FamUserSelect: FamKit.asyncComponent(ELMP.resource('erdc-components/FamUserSelect/index.js')),
            SelectContainer: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/components/SelectContainer/index.js')
            )
        },
        computed: {
            innerContainerRef() {
                return this.containerRef === undefined &&
                    this.isAutoContainerRef &&
                    ['team', 'teamRole'].includes(this.queryScope)
                    ? this.$store?.state?.space?.context?.oid || ''
                    : this.containerRef;
            },
            defaultProps() {
                return {
                    label: 'displayName',
                    children: 'childList',
                    type: 'principalTarget',
                    ...this.props
                };
            },
            selected: {
                get() {
                    return this.value && _.isObject(this.value) && !_.isArray(this.value)
                        ? this.value?.value || ''
                        : this.value;
                },
                set(vals) {
                    if (this.isFetchValue) {
                        this.$emit('input', vals);
                    } else {
                        this.$emit('input', {
                            type: this.type,
                            value: vals,
                            selectedParticipant: this.withSourceObject ? this.selectData : undefined
                        });
                    }
                    this.dispatch('el-form-item', 'el.form.change', vals);
                }
            },
            participantType() {
                return ParticipantTypes.map((item) => {
                    return {
                        value: item.value,
                        name: item.name,
                        icon: item.icon || this.iconsMapping[item.value],
                        props: typeof item.props === 'function' ? item.props.call(this) : item.props,
                        ...item
                    };
                });
            },
            participantTypeList() {
                let resList = this.participantType;
                if (this.showType && this.showType.length > 0) {
                    resList = this.showType.map((item) => {
                        return resList.find((ite) => ite.value === item);
                    }).filter(Boolean);
                }
                return resList;
            },
            selectedType() {
                return this.participantType.find((ite) => ite.value === this.type) || '';
            },
            currentShowComponent() {
                return this.selectedType?.component || '';
            },
            componentProps() {
                return this.selectedType?.props || {};
            },
            componentListeners() {
                return this.selectedType?.listeners || {};
            },
            innerWidth() {
                let width = '100%';
                if (this.width !== '') {
                    width = typeof this.width === 'number' ? this.width + 'px' : this.width;
                }
                return width;
            },
            type() {
                return this.value?.type || this.selectType || this.participantTypeList?.[0]?.value;
            },
            selectedTypeIcon() {
                return this.iconsMapping[this.type];
            },

            /********************************************************************/
            popoverWidth() {
                return this.innerPopoverWidth || 480;
            },
            innerQueryMode() {
                const modes = {
                    ROLE: ['ROLE', 'RECENTUSE'],
                    GROUP: ['GROUP', 'RECENTUSE'],
                    USER: ['FUZZYSEARCH', 'ORG', 'GROUP', 'ROLE', 'RECENTUSE'],
                    ORG: ['ORG', 'RECENTUSE']
                };
                return this.queryMode || modes[this.type];
            },
            selectDataCountsTips() {
                return this.selectDataCounts.map((item) => {
                    if (this.type === 'USER') {
                        return `${item[this.defaultProps.label]} ${item?.code || ''}`;
                    }
                    return item[this.defaultProps.label];
                });
            },

            innerAppName() {
                return this.queryParams?.data?.appName || this.queryParams?.params?.appName || this.appName;
            },
            innerPopperClass() {
                return 'famParticipantSelect-popClass-custom ' + this.popperClass;
            },
            innerthreeMemberEnv() {
                return this.threeMemberEnv ?? JSON.parse(this.$store.state.app?.threeMemberEnv);
            }
        },
        watch: {
            defaultValue: {
                immediate: true,
                handler(value) {
                    if (!_.isEmpty(value)) {
                        const valueArr = _.isArray(value) ? value : [value];
                        this.selectData = valueArr.map((item) => ({
                            checked: true,
                            ...item
                        }));
                    } else {
                        this.selectData = [];
                    }
                }
            },
            'value.selectedParticipant': {
                immediate: true,
                handler(value) {
                    if (!_.isUndefined(value)) {
                        this.selectData = _.isArray(value) ? value : [value].filter(Boolean);
                    }
                }
            },
            selected: {
                immediate: true,
                handler(selected) {
                    const select = _.isArray(selected) ? selected : [selected];
                    const selectOid = select.map((item) => (_.isObject(item) ? item[this.nodeKey] : item));
                    this.selectData = this.selectData.filter((item) => selectOid.includes(item[this.nodeKey]));
                }
            },
            selectData: {
                deep: true,
                immediate: true,
                handler(newVal) {
                    if (_.isEmpty(newVal)) {
                        this.selectDataTags = [];
                        this.selectDataCounts = [];
                        return;
                    }
                    this.selectDataTags = newVal;
                    this.selectDataCounts = [];
                    this.$nextTick(() => {
                        const tagChildren = this.$refs?.selectTagRef?.children;
                        let selectDataTags = [];
                        let selectDataCounts = [];
                        const selectContainerWidth = this.$refs.selectBoxContent?.getBoundingClientRect()?.width || 0;
                        const toolPanelWidth = 56;
                        const selectCountWidth =
                            this.$refs.selectCounts?.$el?.getBoundingClientRect()?.width || (this.multiple ? 28 : 0);
                        let firstTotalTagWidth = toolPanelWidth;
                        let flag = false;
                        for (let i = 0; i < tagChildren.length; i++) {
                            const tag = tagChildren[i];
                            const tagWidth = tag.getBoundingClientRect().width;
                            if (firstTotalTagWidth + tagWidth < selectContainerWidth) {
                                firstTotalTagWidth += tagWidth;
                            } else {
                                flag = true;
                                break;
                            }
                        }
                        if (flag) {
                            let totalTagWidth = selectCountWidth + toolPanelWidth;
                            for (let i = 0; i < tagChildren.length; i++) {
                                const tag = tagChildren[i];
                                const tagWidth = tag.getBoundingClientRect().width;
                                if (totalTagWidth + tagWidth < selectContainerWidth) {
                                    totalTagWidth += tagWidth;
                                    selectDataTags.push(newVal[i]);
                                } else {
                                    selectDataCounts.push(newVal[i]);
                                }
                            }
                            this.selectDataTags = selectDataTags;
                            this.selectDataCounts = selectDataCounts;
                        }
                    });
                }
            },
            visiblePopover(newVal) {
                if (newVal === false) {
                    this.isFirst = false;
                    this.saveRecentUse();
                }
            }
        },
        mounted() {
            this.visible = true;
            setTimeout(() => {
                this.$nextTick(() => {
                    this.innerPopoverWidth =
                        (this.participantTypeList?.length > 1
                            ? this.$refs?.selectBox?.clientWidth + 50
                            : this.$refs?.selectBox?.clientWidth) || 0;
                });
            }, 50);
        },
        beforeDestroy() {
            this.isDestroySave && this.saveRecentUse();
        },
        methods: {
            handleCommand(command) {
                this.isFirst = true;
                this.visible = false;
                if (this.isSaveSelected) {
                    const copySelectData = FamKit.deepClone(this.selectData);
                    this.selectDataAllCopy = this.objectArrayRemoveDuplication(
                        [...this.selectDataAllCopy, ...copySelectData],
                        this.nodeKey
                    );
                    const newSelectData = this.selectDataAllCopy.filter(
                        (item) => item[this.defaultProps.type] === command
                    );
                    this.$emit('input', {
                        type: command,
                        value: this.selected
                    });
                    this.selectData = newSelectData;
                } else {
                    this.$emit('input', {
                        type: command,
                        value: []
                    });
                    this.$nextTick(() => {
                        this.selected = [];
                    });
                    this.selectData = [];
                }
                this.visible = true;
                this.selectType = command;
            },
            fnVisibleChange(visible) {
                this.isFirst = true;
                this.typeVisible = visible;
                if (visible) {
                    this.visiblePopover = false;
                }
            },
            // clearInput() {
            //     if (this.currentShowComponent === 'fam-member-select') {
            //         return this.$refs[this.currentShowComponent]?.clearInput();
            //     }
            //     this.selected = '';
            // },
            handleRemoveTag(...args) {
                this.$emit('remove-tag', ...args);
            },

            /******************************************/
            handleChange(selectValue, selectData) {
                this.selectData = _.isArray(selectData) ? selectData : [selectData];
                this.$emit('change', selectValue, this.selectData);
                this.selected = selectValue;
                if (!this.multiple) {
                    this.visiblePopover = false;
                }
            },
            closeTag(data) {
                this.selectData = FamKit.deepClone(this.selectData).filter(
                    (item) => item[this.nodeKey] !== data[this.nodeKey]
                );
                const selected = this.multiple ? this.selected.filter((item) => item !== data[this.nodeKey]) : '';
                this.selected = selected;
                this.$emit('change', selected, this.selectData);
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
            clearInput(resetType) {
                this.$emit('input', {
                    type: resetType ? this.showType[0] : this.type,
                    value: []
                });
                this.visible = true;
                this.$nextTick(() => {
                    this.selected = null;
                });
                this.selectData = [];
                this.$emit('change');
            },
            saveRecentUse() {
                let data = {
                    containerRef: this.innerContainerRef,
                    roleBOids: this.selectData.map((item) => item.oid),
                    type: 'VISIT',
                    appName: this.innerAppName === 'ALL' ? '' : this.innerAppName
                };
                if ((this.type === 'ROLE' || this.type === 'GROUP') && this.innerAppName !== 'ALL') {
                    data.appName = this.innerAppName;
                }
                this.$famHttp({
                    url: '/common/favorites/visiteds',
                    method: 'POST',
                    data
                });
            },
            tagName(type, item) {
                return type === 'USER'
                    ? `${item[this.defaultProps.label]} ${item?.code || ''}`
                    : item[this.defaultProps.label];
            },
            handlePopoverHide() {
                this.dispatch('el-form-item', 'el.form.blur', this.selected);
            },
            handlePopoverShow() {
                this.dispatch('el-form-item', 'el.form.focus', this.selected);
                this.$nextTick(() => {
                    this.$refs.popover.updatePopper();
                });
            }
        }
    };
});
