define([
    'text!' + ELMP.resource('erdc-process-components/BpmAvatar/index.html'),
    'css!' + ELMP.resource('erdc-process-components/BpmAvatar/index.css'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    let userInfos = [];

    const AvatarPopover = {
        template: `
            <erd-popover
                v-if="user"
                :key="user.oid"
                placement="top"
                trigger="hover"
                ref="popoverRef"
                :popper-options="{ boundariesElement: viewport, removeOnDestroy: true }"
                @show="getSysUserInfo"
            >
                <template slot="reference">
                    <slot :user="user"><span class="mr-8">{{user.displayName || '-'}}</span></slot>
                </template>

                <div class="el-member-info">
                        <a :class="{ avatar: true, 'avatar-62': true, departure: user.active === 0 }" :title="user.displayName" :member-id="user.oid" href="javascript:;">
                            <span class="avatar-face">
                                <img v-if="user.avatar" :src="user.avatar.indexOf('/') === 0?'.':'' + user.avatar" :alt="user.displayName">
                                <span v-else class="avatar-text" :title="user.displayName">{{nameLetter(user.displayName)}}</span>
                            </span>
                            <br>
                            <span class="avatar-name" :title="user.displayName">{{user.displayName}}</span>
                            <span class="avatar-append">{{user.code}}</span>
                            <span v-if="user.active === 0" class="avatar-dimission" data-lang="have_left">已离职</span>
                        </a>
                        <div class="avatar-right">
                            <ul class="avatar-right-grid">
                                <li class="ellipsis" :title="user.orgName"><span data-lang="dept">部门</span> <span :title="user.orgName">{{user.orgName}}</span></li>
                                <li class="ellipsis"><span data-lang="phone_num">手机</span> <span :title="user.mobile">{{user.mobile}}</span></li>
                                <li class="ellipsis" :title="user.email"><span data-lang="email">邮箱</span> <span :title="user.email"><a :href="'mailto:' + user.email">{{user.email}}</a></span></li>
                                <li class="ellipsis"><span data-lang="work_address">工作地</span> <span :title="user.workPlace">{{user.workPlace}}</span></li>
                            </ul>
                        </div>
                    </div>
            </erd-popover>
        `,
        props: {
            userInfo: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                viewport: 'body',
                user: {}
            };
        },
        mounted() {
            this.viewport = $(this.$el).closest('body')[0];
            // this.$nextTick(() => {
            //     this.$refs.popoverRef.updatePopper()
            // })
        },
        methods: {
            //取大写字母前两位
            nameLetter: function (name = '') {
                if (name.length > 2 && name.length < 5) {
                    return name.substring(1, 3).toUpperCase();
                } else if (name.length >= 5) {
                    return name.substring(0, 2).toUpperCase();
                } else {
                    return name.toUpperCase();
                }
            },
            getSysUserInfo() {
                if (this.userInfo?.oid && this.userInfo?.displayName) {
                    return (this.user = this.userInfo);
                }
                const hadUser = _.find(userInfos, (user) => user.oid === this.userInfo?.oid);
                if (hadUser?.displayName) {
                    return (this.user = hadUser);
                }
                this.$famHttp({
                    url: '/fam/attr',
                    method: 'GET',
                    params: {
                        oid: this.userInfo.oid
                    }
                }).then((resp) => {
                    this.user = this.formatUserRawData(resp.data?.rawData);
                    userInfos.push(this.user);
                });
            },
            /**
             * 格式化属性 row -> 对象
             * @param rawData
             */
            formatUserRawData(rawData = {}) {
                let userInfo = {};
                _.each(rawData, (value, key) => {
                    userInfo[key] = value.value;
                });
                return userInfo;
            }
        }
    };

    return {
        template: template,
        components: {
            AvatarPopover,
            FamUser: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUser/index.js'))
        },
        props: {
            users: {
                type: [String, Object, Array],
                default() {
                    return [];
                }
            },
            getCustomUser: Function,
            showAll: Boolean,
            sliceLength: {
                type: Number,
                default: 1
            },
            // 显示更多：打点显示 ellipsis 数字显示 number
            iconMore: {
                type: String,
                default: 'ellipsis'
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-process-components/BpmAvatar/locale/index.js'),
                allUsers: []
            };
        },
        computed: {
            userList() {
                return this.showAll ? this.allUsers : this.allUsers.slice(0, this.sliceLength);
            },
            userListName() {
                const { displayName = '--', code = '' } = (this.userList || [])[0] || {};
                return displayName + (code ? ` (${code})` : '');
            },
            showMore() {
                return !this.showAll && this.allUsers.length > this.sliceLength;
            },
            iconMoreStyle() {
                const style = {
                    ellipsis: 'erd-iconfont erd-icon-more icon-more-style',
                    number: 'erd-iconfont erd-icon-add-user-round'
                }
                return style[this.iconMore];
            },
            iconMoreNumber() {
                const count = this.allUsers.length - 1;
                return count >= 0 ? count : 0;
            }
        },
        watch: {
            users: {
                immediate: true,
                handler(users) {
                    if (_.isString(users)) {
                        this.getUserInfo([users]);
                    } else if (_.isObject(users) && !_.isArray(users)) {
                        this.allUsers = [users];
                    } else if (_.isArray(users) && _.isString(users[0])) {
                        this.getUserInfo(users);
                    } else {
                        this.allUsers = users;
                    }
                }
            }
        },
        methods: {
            // 获取用户信息
            async getUserInfo(oidList) {
                let userList = [];
                if (_.isFunction(this.getCustomUser)) {
                    userList = await this.getCustomUser(oidList);
                } else {
                    for (let i = 0; i < oidList.length; i++) {
                        const resp = await this.$famHttp({
                            url: '/fam/attr',
                            method: 'GET',
                            params: {
                                oid: oidList[i]
                            }
                        });
                        if (resp.success) {
                            const formatUser = this.formatUserRawData(resp.data?.rawData);
                            const lan = this.$store.state.i18n?.lang;
                            if (!formatUser.displayName) {
                                if (lan === 'CN') {
                                    formatUser.displayName = formatUser.displayNameCn || formatUser.code;
                                } else if (lan === 'EN') {
                                    formatUser.displayName = formatUser.displayNameEn || formatUser.code;
                                } else {
                                    formatUser.displayName = formatUser.code;
                                }
                            }
                            userList.push(formatUser);
                        } else {
                            userList.push({ oid: oidList[i] });
                        }
                    }
                }
                this.allUsers = userList;
            },
            /**
             * 格式化属性 row -> 对象
             * @param rawData
             */
            formatUserRawData(rawData = {}) {
                let userInfo = {};
                _.each(rawData, (value, key) => {
                    userInfo[key] = value.value;
                });
                return userInfo;
            }
        }
    };
});
