define([
    'underscore',
    ELMP.resource('erdc-components/FamUserMixin.js'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamUser/style.css')
], function (_, FamUserMixin) {
    const DefaultDisplayFields = ['displayName', 'code'];
    const FamKit = require('erdc-kit');

    return {
        /*html*/
        template: `
            <div class="user-list">
                <span class="fam-users" :class="{ 'text-ellipsis': isEllipsis }">
                    <span v-for="(user, index) in innerUsers" class="fam-user__user">
                        <erd-popover
                            v-if="typeof user === 'object'"
                            v-model="popoverShows[index]"
                            trigger="hover"
                            :placement="popoverPlacement"
                            :disabled="disablePopover"
                            :popper-class="popperOverClass"
                        >
                            <slot 
                                name="popover" 
                                v-bind="{ 
                                    user: user,
                                    index: index, 
                                    showPopover: getPopoverFunctor(index, true), 
                                    hidePopover: getPopoverFunctor(index, false)
                                }"
                            >
                                <div class="fam-user__popoverContent">
                                    <erd-avatar
                                        :src="user.avatar" 
                                        class="fam-user__avatar"
                                        :size="32"
                                    >
                                        <img :src="user.avatar"/>
                                    </erd-avatar>
                                    <div class="fam-user__info">
                                        <span class="fam-user__displayName">
                                            {{user.displayName}} ({{user.code}})
                                        </span>
                                        <ul>
                                            <li>
                                                <span class="fam-user__label">{{getI18nByKey('部门')}}&nbsp;:&nbsp;</span><erd-tooltip v-if="user.orgName" :content="user.orgName" placement="right" popper-class="fam-tooltip-max-width"><span class="fam-user__orgName">{{user.orgName}}</span></erd-tooltip><span v-else>--</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div  class="fam-user__close">
                                        <span @click="hidePopover(index)">
                                            <i class="el-icon-close"></i>
                                        </span>
                                    </div>
                                </div>
                            </slot>
                            <template v-slot:reference>
                                <slot
                                    v-bind="{ 
                                        users: innerUsers,
                                        user: user,
                                        index: index, 
                                        display: display,
                                        showPopover: getPopoverFunctor(index, true), 
                                        hidePopover: getPopoverFunctor(index, false)
                                    }"
                                >
                                    <span
                                        class="fam-user__display" 
                                        @mouseenter="onReferenceMouseEnter(index)"
                                    >
                                        {{display(user)}}
                                        <span v-if="index !== innerUsers.length - 1">; </span>
                                    </span>
                                </slot>
                            </template>
                        </erd-popover>
                        <span v-else>{{user || '--'}}</span>
                    </span>
                </span>
                <span @click="viewAll" class="view-all" v-if="innerUsers.length > 0 && isEllipsis">查看全员</span>
                <erd-ex-dialog
                    title="查看全员"
                    :visible.sync="visibleUser"
                >
                    <div style="height: 400px;">
                        <fam-advanced-table
                            ref="userTable"
                            :view-table-config="viewTableConfig"
                            :is-adaptive-height="true"
                        >        
                        </fam-advanced-table>
                    </div>
                </erd-ex-dialog>
            </div>
        `,
        mixins: [FamUserMixin],
        components: {
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        props: {
            users: {
                type: [Array, Object],
                default() {
                    return [];
                }
            },
            displayFields: {
                type: Array,
                default() {
                    return DefaultDisplayFields;
                }
            },
            popoverTrigger: {
                type: String,
                default: 'hover',
                validate(value) {
                    return 'click/focus/hover'.split('/').includes(value);
                }
            },
            popoverPlacement: {
                type: String,
                default: 'top'
            },
            disablePopover: Boolean,
            popperClass: [Array, String]
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamUser/locale/index.js'),
                popoverShows: {},
                visibleUser: false,
                isEllipsis: false,
                innerUsers: []
            };
        },
        computed: {
            popperOverClass() {
                const popperClass = Array.isArray(this.popperClass) ? this.popperClass : _.compact([this.popperClass]);
                return ['fam-user__popover', ...popperClass].join(' ');
            },
            viewTableConfig() {
                const self = this;
                return {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    addOperationCol: false,
                    tableData: self.innerUsers,
                    firstLoad: true,
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: false,
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: '请输入', // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '280',
                            isLocalSearch: true
                        }
                    },
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left', // 全局文本对齐方式
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true // 溢出隐藏显示省略号
                    },
                    pagination: {
                        // 分页
                        showPagination: false
                    },
                    columns: [
                        {
                            attrName: 'displayName', // 属性名
                            label: '姓名', // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'orgName', // 属性名
                            label: '部门', // 字段名
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'code', // 属性名
                            label: '工号', // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 70
                        }
                    ]
                };
            }
        },
        watch: {
            users: {
                immediate: true,
                handler(users) {
                    let innerUsers = users ? FamKit.deepClone(users) : [];
                    if (!_.isEmpty(innerUsers)) {
                        innerUsers = Array.isArray(innerUsers) ? innerUsers : [innerUsers];
                        innerUsers = innerUsers.filter(Boolean);
                        this.innerUsers = innerUsers.map((user) => {
                            if (typeof user !== 'object' || !user) {
                                return user;
                            }
                            return {
                                ...user,
                                avatar:
                                    user.avatar.indexOf('/') > -1
                                        ? user.avatar
                                        : FamKit.imgUrlCreator(user.avatar, {
                                              size: 'S'
                                          })
                            };
                        });
                        this.$nextTick(() => {
                            this.fetchUserData(this.innerUsers);
                            const listWidth = $(this.$el).width();
                            const userWidth = $('.fam-users', this.$el).width();
                            this.isEllipsis = userWidth > listWidth;
                        });
                    }
                }
            }
        },
        methods: {
            fetchUserData(users) {
                const userOIds = users.filter((user) => typeof user === 'string');
                Promise.all(userOIds.map((oid) => this.fetchAndSetData(oid))).then((responses) => {
                    const innerUsers = [...this.innerUsers].filter(Boolean);
                    responses.forEach((user) => {
                        const idx = innerUsers.findIndex((item) => item === user?.oid);
                        if (idx >= 0) {
                            innerUsers.splice(idx, 1, {
                                ...user,
                                avatar:
                                    user.avatar.indexOf('/') > -1
                                        ? user.avatar
                                        : FamKit.imgUrlCreator(user.avatar, {
                                              size: 'S'
                                          })
                            });
                        }
                    });
                    this.innerUsers = innerUsers;
                });
            },
            display(user) {
                const displays = _.chain(this.displayFields)
                    .map((field) => user[field])
                    .compact()
                    .value();
                displays.splice(1, 0, ['(']);
                displays.push(')');
                return displays.join(' ').replace(/\(\s/g, '(').replace(/\s\)/g, ')');
            },
            showPopover(index) {
                this.$set(this.popoverShows, index, true);
            },
            hidePopover(index) {
                this.$set(this.popoverShows, index, false);
            },
            onReferenceMouseEnter(index) {
                this.showPopover(index);
            },
            getPopoverFunctor(index, popoverShows) {
                const that = this;
                return function () {
                    popoverShows ? that.showPopover(index) : that.hidePopover(index);
                };
            },
            viewAll() {
                this.visibleUser = true;
            }
        }
    };
});
