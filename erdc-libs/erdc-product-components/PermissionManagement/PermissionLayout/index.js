define([
    'text!' + ELMP.resource('erdc-product-components/PermissionManagement/PermissionLayout/index.html'),
    ELMP.resource('erdc-components/FamMenu/FamSideMenu/index.js'),
    'css!' + ELMP.resource('erdc-product-components/PermissionManagement/PermissionLayout/style.css')
], function (template, FamSideMenu) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            ResizableContainer: FamKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            FamSideMenu
        },
        props: {
            attrName: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                typeOid: '',
                containerOid: '',
                typeName: '',
                currentMenu: {},
                collapsed: false,
                menus: [],
                currentRoot: {
                    name: '业务对象'
                },
                resizableContainerStyle: {
                    width: '200px',
                    minWidth: 200,
                    maxWidth: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    grow: '1'
                },
                menuConfig: {
                    key: 'id',
                    label: 'displayName'
                },
                tile: [],
                contextDetail: this.$store.state.space?.context || {},
                maxHeight: 0
            };
        },
        computed: {
            productInfo() {
                return this.contextDetail;
            },
            productInfoOid() {
                return this.productInfo?.oid || '';
            }
        },
        watch: {
            productInfoOid: {
                immediate: true,
                handler(val) {
                    if (val) {
                        this.getTypesByPrd();
                    }
                }
            }
        },
        mounted() {
            this.maxHeight = 'calc(100% - 70px)';
        },
        methods: {
            getTypesByPrd() {
                this.$famHttp({
                    url: '/fam/type/typeDefinition/getTypesByContainerRef',
                    method: 'GET',
                    data: {
                        containerRef: this.productInfoOid,
                        isHardType: 'false',
                        attrName: this.attrName
                    }
                })
                    .then((resp) => {
                        if (resp.code === '200') {
                            const resData = resp.data || [];
                            this.menus = resData.map((item) => {
                                return {
                                    ...item,
                                    id: item.typeOid,
                                    name: item.displayName,
                                    isShow: true,
                                    children: []
                                };
                            });
                            if (this.menus.length > 0) {
                                const menu = this.menus[0];
                                this.tile = FamKit.TreeUtil.flattenTree2Array(this.menus, {
                                    childrenField: 'children'
                                });
                                this.routeTo(null, menu);
                            }
                        }
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || this.i18nMappingObj?.['deleteFailed'],
                        //     showClose: true
                        // });
                    });
            },
            routeTo(href, menu) {
                this.currentMenu = _.isObject(menu) ? menu : this.tile.find((item) => item.typeOid === menu);
            },
            updateCollapsed(flag) {
                this.collapsed = flag;
            }
        }
    };
});
