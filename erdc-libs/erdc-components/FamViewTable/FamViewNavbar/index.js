/**
 * @module 视图
 * @component FamViewNavbar
 * @props { FamViewNavbarProps } - props参数引用
 * @description 视图导航栏组件
 * @author Mr.JinFeng
 * @example 参考FamViewTable组件页面内使用的代码
 * 组件声明
 * components: {
 *   FamViewNavbar: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/FamViewNavbar/index.js'))
 * }
 *
 * @typedef {Object} FamViewNavbarProps
 * @property { string } tableKey -- 视图表格应用key，在系统管理>视图表格页面创建的，唯一标识
 * @property { string } dataKey -- 获取数据源的key(允许深层次获取接口返回的数据源，比如data.tableViewVos.xxxx是从resp对象里面一层一层往下找)
 * @property { string } labelKey -- 视图导航列表显示名称的labelKey，默认displayName
 * @property { string } valueKey -- 视图导航列表的valueKey，默认oid
 * @property { boolean } showViewManager -- 是否显示视图管理按钮

 * @events TODO
 */
define([
    'text!' + ELMP.resource('erdc-components/FamViewTable/FamViewNavbar/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamViewTable/FamViewNavbar/style.css')
], function (template, utils) {
    const _ = require('underscore');

    var vmOptions = function () {
        return {
            template,
            props: {
                // 视图表格应用key
                tableKey: {
                    type: String,
                    required: true,
                    default() {
                        return '';
                    }
                },
                // 获取数据源的key(允许深层次，比如data.tableViewVos.xxxx)
                dataKey: {
                    type: String,
                    default() {
                        return 'data.tableViewVos';
                    }
                },
                // label显示的key
                labelKey: {
                    type: String,
                    default() {
                        return 'displayName';
                    }
                },
                // label显示的key
                valueKey: {
                    type: String,
                    default() {
                        return 'oid';
                    }
                },
                // 是否显示视图管理按钮
                showViewManager: {
                    type: Boolean,
                    default: true
                },
                // 只显示的视图，传对象或者oid
                showNavBar: {
                    type: Array | String,
                    default() {
                        return null;
                    }
                },
                appName: String,
            },
            data() {
                return {
                    viewNavbarList: [],
                    moreViewNavList: [],
                    sourceShowMenu: [],
                    activeName: '',
                    currentSelectMenu: '',
                    viewTablRow: {},
                    leftMenuWidth: 90, // 每个菜单的宽度
                    leftSubMenuWidth: 100, // 有子菜单的菜单宽度
                    rightWidth: 150, // 固定宽度
                    // 国际化locale文件地址
                    i18nLocalePath: ELMP.resource('erdc-components/FamViewTable/FamViewNavbar/locale/index.js'),
                    // // 国际化页面引用对象
                    i18nMappingObj: this.getI18nKeys([
                        'moreViews',
                        '视图管理',
                        '配置个人视图',
                        '确定',
                        '取消',
                        '重置',
                        '是否放弃编辑',
                        '提示',
                        '自动记忆上次查看的视图'
                    ]),
                    viewManagerForm: {
                        visible: false
                    },
                    viewType: 'person',
                    autoRecordView: false,
                    firstLoad: true,
                    moreMenuTitle: ''
                };
            },
            components: {
                ViewManager: utils.asyncComponent(ELMP.resource('erdc-components/FamViewTable/ViewManager/index.js'))
            },
            watch: {
                // 表格key监听，改变重新渲染
                tableKey: {
                    immediate: true,
                    handler(nv) {
                        if (nv) {
                            this.setActiveName(null);
                            this.fnGetViewNavbar();
                        }
                    }
                }
            },
            computed: {
                tableRow() {
                    return $.extend(true, this.viewTablRow, {
                        tableKey: this.tableKey
                    });
                },
                autoRecordVal() {
                    return this.autoRecordView || false;
                }
            },
            mounted() {
                this.throttleResizeComputedMenu = () => {
                    this.resizeComputedMenu(this.sourceShowMenu);
                };
                window.addEventListener('resize', this.throttleResizeComputedMenu);
            },
            methods: {
                // 根据大小计算导航菜单显示的数量
                resizeComputedMenu(data = []) {
                    let containerWidth = $('#FamViewNavbar').width(); // 容器宽度
                    // 总宽度减右侧宽度，减去子菜单和菜单之间的差，由于子菜单和菜单的宽度不是一致的，如果不减去差，会出现刚好能放下菜单，但是放不下子菜单的情况导致换行
                    let leftContainerWidth =
                        containerWidth - this.rightWidth - (this.leftSubMenuWidth - this.leftMenuWidth);
                    // 计算左侧容器宽度最大可以显示多少个菜单，多余的写进更多视图里面
                    let max = Math.floor(leftContainerWidth / this.leftMenuWidth); // 计算最大显示的数量，向下取整
                    if (data.length && data.length > max) {
                        // 如果显示的菜单总数量比最大显示的数量大，那么最大数量减2，用于放更多视图
                        max -= 2;
                    }
                    let showMenu = [];
                    let moreMenu = [];
                    if (data.length && data.length == max) {
                        showMenu = data;
                    } else {
                        data?.forEach((item, index) => {
                            if (max > index) {
                                showMenu.push(item);
                            } else {
                                moreMenu.push(item);
                            }
                        });
                    }
                    this.viewNavbarList = showMenu;
                    this.moreViewNavList = moreMenu;
                    this.activeName = '';
                    this.$nextTick(() => {
                        // 默认视图
                        let defaultView = data.find((ite) => ite.isDefault);
                        !defaultView ? (defaultView = (data && data.length > 0 && data[0]) || '') : ''; // 如果没有默认视图，则取第一个默认选中
                        let defaultActive = defaultView ? defaultView[this.valueKey] : '';
                        this.activeName = this.currentSelectMenu ? this.currentSelectMenu : defaultActive;
                        if (this.currentSelectMenu) {
                            this.activeName = this.currentSelectMenu;
                        } else {
                            this.activeName = defaultActive;
                            if (this.firstLoad) {
                                this.firstLoad = false;
                                this.$emit('change', defaultView);
                            }
                        }
                    });
                },
                handleSelect(key) {
                    this.currentSelectMenu = key;
                    let currentMenu = this.sourceShowMenu.find((ite) => ite[this.valueKey] == key);
                    let isSelectMoreViewNav = this.moreViewNavList.some((ite) => ite[this.valueKey] == key);
                    this.moreMenuTitle = isSelectMoreViewNav
                        ? currentMenu?.displayName
                        : this.i18nMappingObj['moreViews'];
                    this.$emit('change', currentMenu);
                },
                // 获取视图
                async fnGetViewNavbar() {
                    this.sourceShowMenu = [];
                    const resp = await this.getTableViews();
                    if (_.isArray(resp.data?.tableViewVos)) {
                        resp.data.tableViewVos = _.sortBy(resp.data.tableViewVos, 'sortOrder');
                    }

                    // 是否记忆
                    this.autoRecordView = this.viewTablRow?.autoRecord || false;

                    // 通过指定key获取数据源，支持多层级
                    let data = utils.getValueByStr(resp, this.dataKey) || [];
                    let showData = data.filter((ite) => ite.enabled);

                    // 记录总的数据源
                    this.sourceShowMenu = showData.map((ite) => ite);
                    this.firstLoad = true;
                    if (!_.isEmpty(this.showNavBar)) {
                        showData = showData.filter((item) =>
                            _.isArray(this.showNavBar)
                                ? this.showNavBar.includes(item.oid)
                                : item.oid === this.showNavBar
                        );
                    }
                    this.resizeComputedMenu(showData);
                },
                getTableViews() {
                    return this.$famHttp({
                        url: '/fam/view/getViews',
                        methods: 'get',
                        appName: this.appName,
                        data: {
                            viewType: this.$route?.name === 'viewManagement',
                            tableKey: this.tableKey,
                            containerOid: this.$store?.state.app?.container?.oid
                        }
                    }).then((response) => {
                        const resp = response || {};

                        // 当前表格应用对象
                        this.viewTablRow = resp.data || {};
                        this.$emit('callback', resp);
                        return resp;
                    });
                },
                async fnTableChange(viewOid) {
                    // 刷新视图菜单导航栏数据
                    await this.fnGetViewNavbar();
                    if (this.activeName === viewOid) {
                        this.$emit('refresh-table');
                    }
                },
                fnRecordView() {
                    this.$nextTick(() => {
                        this.$refs?.viewManagerTable?.fnSubmitViewData();
                    });
                },
                fnShowViewManager() {
                    this.viewManagerForm.visible = true;
                },
                // 重置
                fnResetView(ref) {
                    this.$refs[ref]?.fnResetView();
                    this.autoRecordView = !this.autoRecordView;
                },
                toggleShow() {
                    this.viewManagerForm = {
                        visible: false
                    };
                },
                setActiveName(activeName = null) {
                    this.activeName = activeName;
                    if (this.$refs.elMenu) {
                        this.$refs.elMenu.activeIndex = activeName;
                    }
                    if (!activeName) {
                        // 置空当前视图
                        this.currentSelectMenu = '';
                    }
                }
            },
            beforeDestroy() {
                window.removeEventListener('resize', this.throttleResizeComputedMenu);
            }
        };
    };

    return vmOptions();
});
