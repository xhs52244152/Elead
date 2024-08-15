/**
 * @component LayoutAvatar
 * @description 显示在布局的人员头像
 */
define(['erdc-kit', 'EventBus', 'css!' + ELMP.resource('erdc-app/layout/LayoutAvatar/Popover.css')], function (
    ErdcKit
) {
    const MenuList = {
        name: 'MenuList',
        template: `
            <div v-if="menu.key === 'TENANT_SWITCH'">
                <i :class="menu.props.icon"></i>
                <div class="nameInfo text-margin-left">
                    <span>{{menu.props.displayName}}</span>
                    <span>{{tenantName || '默认租户'}}</span>
                </div>
            </div>
            <div style="width: 100%;" class="text-margin-left" v-else>
                <i :class="menu.props.icon"></i>
                <span>{{menu.props.displayName}}</span>
            </div>
        `,
        data() {
            return {};
        },
        props: {
            menu: {
                type: Object,
                default() {
                    return {};
                }
            },
            tenantName: {
                type: String,
                default: ''
            }
        }
    };

    return {
        name: 'LayoutAvatar',

        /*html*/
        template: `
            <div>
                <erd-popover
                    ref="popover"
                    popper-class="selectTenantId fam-user-info__popover fam-user-info__popover-radius"
                    class="ultra-header-right-button-avatar"
                    placement="bottom"
                    width="200"
                    trigger="click"
                    @show="popoverShow = true"
                    @hide="popoverShow = false"
                >
                    <div class="adminInfo">
                        <div
                            class="adminInfo adminbgImg"
                            :style="'background-image: url(' + avatarUrl + ')'"
                        ></div>
                        <div class="adminInfo avatar-mask"></div>
                        <div class="admin_avatar">
                            <img :src="avatarUrl || defaultAvatar"/>
                        </div>
                        <div class="admin_details">
                            <p
                                class="name"
                                :title="user.displayName"
                            >
                                {{ user.displayName }}
                            </p>
                            <p
                                class="branch"
                                :title="user.orgName"
                            >
                                {{ user.orgName }}
                            </p>
                        </div>
                    </div>
                    <div>
                        <ul class="detailList erd-scollbar">
                            <template v-for="(menu, index) in dropMenuList">
                                <li
                                    v-if="menu.props.children"
                                    class="ellipsis"
                                    :class="{'active': menu.active,'unactive': !menu.active}"
                                    @click="resetActiveMenu(menu, index, 1)"
                                >
                                    <erd-popover
                                        ref="showOnly"
                                        class="mr-normal inlineBlock"
                                        popper-class="selectTenantId fam-user-info__popover"
                                        placement="left"
                                        width="158"
                                        trigger="click"
                                        @after-enter="showOnly(index)"
                                    >
                                        <ul class="selectTenant erd-scollbar">
                                            <li
                                                v-for="(item, index1) in menu.props.children"
                                                @click="handleClick(item, index)"
                                                :title="item.displayName || item.fullName || item.key"
                                                :class="[item.active ? 'active' : '']"
                                                :key="item.key"
                                            >
                                                <span class="ellipsis">{{item.displayName || item.fullName || item.key}}</span>
                                            </li>
                                        </ul>
                                        <div
                                            class="drop-down"
                                            slot="reference"
                                        >
                                            <component
                                                v-if="current"
                                                :menu="menu"
                                                :tenantName="currentUserName"
                                                :is="current"
                                            ></component>
                                            <i class="el-icon-arrow-right"></i>
                                        </div>
                                    </erd-popover>
                                </li>
                                <template v-else>
                                    <li
                                        @click="resetActiveMenu(menu, index, 1)"
                                        :class="{'active': menu.active,'unactive': !menu.active}"
                                    >
                                        <div
                                            style="width: 100%"
                                            class="text-margin-left inlineBlock"
                                            v-on="menu.listeners"
                                        >
                                            <i :class="menu.props.icon"></i>
                                            <span>{{menu.props.displayName}}</span>
                                        </div>
                                    </li>
                                </template>
                            </template>
                            <li @click="onLogout">
                                <div class="text-margin-left inlineBlock">
                                    <i class="erd-iconfont erd-icon-logout"></i>
                                    <span>{{ i18nMappingObj.signOut }}</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <template #reference>
                        <erd-button
                            v-if="!widget.hide || (typeof widget.hide === 'function' && !widget.hide())"
                            :key="widget.key"
                            v-bind="widget.props"
                            icon=""
                            type="text"
                        >
                            <img class="avatar" :class="{ 'active': popoverShow }" :src="avatarUrl || defaultAvatar" :alt="user.displayName"/>
                        </erd-button>
                    </template>
                </erd-popover>
                <erd-ex-dialog
                    v-if="personalVisible"
                    size="meduim"
                    :title="i18n.person"
                    :visible.sync="personalVisible"
                >
                    <MemberForm
                        ref="MemberForm"
                        :oid="form.oid"
                        :editable="form.editable"
                        :queryLayoutParams="queryLayoutParams"
                        type="userInfo">
                    </MemberForm>
                    <template #footer>
                        <erd-button
                            type="primary"
                            :loading="form.loading"
                            @click="fnOnSubmit('memberForm')"
                            >{{ i18nMappingObj.ok }}
                        </erd-button>
                        <erd-button @click="fnCloseMemberForm">{{ i18nMappingObj.cancel }}</erd-button>
                    </template>
                </erd-ex-dialog>
            </div>
        `,
        components: {
            MenuList,
            MemberForm: ErdcKit.asyncComponent(ELMP.resource('erdc-app/layout/LayoutAvatar/MemberForm/index.js'))
        },
        props: {
            // 当前布局名字，暂时没有使用到
            layout: String,
            widget: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                current: 'menu-list',
                i18nLocalePath: ELMP.resource('erdc-app/layout/LayoutAvatar/locale.js'),
                i18nMappingObj: {
                    person: this.getI18nByKey('person'),
                    language: this.getI18nByKey('language'),
                    tenant: this.getI18nByKey('tenant'),
                    signOut: this.getI18nByKey('signOut'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    sureConfirm: this.getI18nByKey('sureConfirm')
                },
                popoverShow: false,
                personalVisible: false,
                form: {
                    editable: true
                },
                queryLayoutParams: {
                    name: 'USERINFO',
                    attrRawList: [{ attrName: 'entryType', value: 'Personal Center' }]
                },
                avatarUrl: ''
            };
        },
        watch: {
            'user.avatar': {
                deep: true,
                immediate: true,
                handler(avatar) {
                    if (!avatar.match(/\//gi)) {
                        this.avatarUrl = ErdcKit.imgUrlCreator(avatar, {
                            size: 'M'
                        });
                    }
                }
            }
        },
        computed: {
            user() {
                return this.$store.state.app.user;
            },
            defaultAvatar() {
                return ELMP.resource('erdc-app/layout/LayoutAvatar/avatar.png');
            },
            menuList() {
                return _.union(
                    [
                        {
                            key: 'PERSONAL_CENTER',
                            props: {
                                name: '个人中心',
                                icon: 'erd-iconfont erd-icon-user',
                                nameI18nJson: {
                                    zh_cn: '个人中心',
                                    en_us: 'Personal Center'
                                }
                            }
                        }
                    ],
                    this.$store.state.app.menuList
                );
            },
            dropMenuList() {
                return this.menuList.map((item) => {
                    let temp = item.props.name;
                    item.props.displayName = ErdcKit.translateI18n(item.props?.nameI18nJson) || temp;
                    return item;
                });
            },
            currentUserName() {
                let tenantId = JSON.parse(localStorage.getItem('tenantId'));
                const tenantMenu = _.find(this.menuList, { key: 'TENANT_SWITCH' });
                if (tenantMenu) {
                    return _.find(tenantMenu.props?.children, { identifierNo: tenantId })?.displayName || '';
                }
                return '';
            }
        },
        methods: {
            resetActiveMenu(checkedItem, index, grade) {
                if (checkedItem.key === 'PERSONAL_CENTER') {
                    this.form.oid = this.user?.oid;
                    this.personalVisible = true;
                }
                this.$store.commit(
                    'PUSH_MENU_LIST',
                    this.menuList.map((item, i) => {
                        item.active = false;
                        if (index === i) {
                            // 父级
                            if (item.key === checkedItem?.key && grade === 1) {
                                item.active = true;
                            }
                            // 子集
                            if (item.props?.children?.length && grade === 2) {
                                item.props.children = item.props.children.map((res) => ({
                                    ...res,
                                    active: item?.isActive(checkedItem, res)
                                }));
                            }
                        }
                        return item;
                    })
                );
            },
            onLogout() {
                this.$confirm(this.i18nMappingObj.sureConfirm, this.i18nMappingObj.signOut, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.logout();
                });
            },
            showOnly(data) {
                const showOnly = this.$refs.showOnly;

                this.$nextTick(() => {
                    showOnly.forEach((item, index) => {
                        if (!(index === data - 1)) {
                            showOnly[index].doClose();
                        }
                    });
                });
            },
            logout() {
                ErdcKit.toLogin();
            },

            // 切换语言 布局语言切换使用 把方法搬过去即可
            changeLan: function (lan) {
                const erdcloudI18n = require('erdcloud.i18n');
                erdcloudI18n.switchLanguage(lan).then(() => {
                    window.location.reload();
                });
            },
            // 切换租户功能
            changeTenant(identifierNo) {
                this.$famHttp({
                    url: '/fam/user/toggle/' + identifierNo,
                    method: 'get'
                }).then((res) => {
                    if (res?.data) {
                        localStorage.setItem('tenantId', JSON.stringify(identifierNo));
                        window.top.location.reload();
                    }
                });
            },
            // index 父级索引
            handleClick(item, index) {
                const menu = this.dropMenuList[index];
                typeof item.onclick === 'function' && item.onclick(item, menu);
                typeof menu.listeners?.check === 'function' && menu.listeners?.check(item, menu);
                // 语言切换
                if (menu.key === 'LANGUAGE_SWITCH') {
                    this.changeLan(item.language);
                    return;
                }
                if (menu.key === 'TENANT_SWITCH') {
                    this.changeTenant(item.identifierNo);
                    return;
                }
                this.resetActiveMenu(item, index, 2);
            },
            fnOnSubmit() {
                this.$refs.MemberForm.submit().then(() => {
                    this.personalVisible = false;
                });
            },
            fnCloseMemberForm() {
                this.personalVisible = false;
            }
        }
    };
});
