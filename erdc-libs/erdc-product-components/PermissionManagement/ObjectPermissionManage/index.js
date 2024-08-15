define([
    'text!' + ELMP.resource('erdc-product-components/PermissionManagement/ObjectPermissionManage/index.html'),
    'css!' + ELMP.resource('erdc-product-components/PermissionManagement/ObjectPermissionManage/index.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            customContextDetail: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        components: {
            PermissionTitle: FamKit.asyncComponent(
                ELMP.resource('erdc-permission-components/PermissionTitle/index.js')
            ),
            FamObjectPermission: FamKit.asyncComponent(
                ELMP.resource('erdc-permission-components/PermissionIndex/index.js')
            ),
            ResizableContainer: FamKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                isEditPermission: true,
                isReady: false,
                isTreeShow: false,
                queryScope: 'fullTenant',
                searchValue: '',
                treeProps: {
                    children: 'childList',
                    label: 'displayName'
                },
                treeData: [],
                selectData: {},
                currentKey: ''
            };
        },
        computed: {
            selectOptions() {
                const productInfo = this.contextDetail;
                if (productInfo) {
                    productInfo.label = productInfo.pathDisplayName;
                    return [productInfo];
                }
                return [];
            },
            productInfo() {
                return this.contextDetail;
            },
            defaultCurrentLevel() {
                const productInfo = this.contextDetail;
                return (productInfo && productInfo.id) || '';
            },
            queryParams() {
                return {
                    data: {
                        appName: this.contextDetail?.appName || '',
                        isGetVirtualRole: true,
                        teamOrignType:
                            'erd.cloud.foundation.core.container.business.impl.ScalableContainerBizServiceImpl',
                        isQueryByPath: false
                    }
                };
            },
            isPermissionReady() {
                return !_.isEmpty(this.productInfo) && this.isReady;
            },
            isShowReadBtn() {
                return _.isEmpty(this.productInfo) ? true : this.isEditPermission;
            },
            contextDetail() {
                return _.keys(this.customContextDetail).length
                    ? this.customContextDetail
                    : this.$store.state.space?.context || {};
            }
        },
        watch: {
            isPermissionReady: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.handlerChangeOrganization(this.productInfo);
                    }
                }
            }
        },
        mounted() {
            this.getFolderDomainTree();
        },
        methods: {
            handlerChangeOrganization(selectedObj) {
                this.$refs.objectPermissionMain.changeOrganization(selectedObj);
            },
            handlerChangeEditPermission(flag) {
                this.isEditPermission = flag;
                this.$refs.objectPermissionMain.changeEditPermission(flag);
            },
            permissionReady() {
                this.isReady = true;
            },
            /**
             * 获取权限树
             */
            getFolderDomainTree() {
                this.$famHttp({
                    url: '/fam/folder/getFolderDomainTree',
                    method: 'GET',
                    data: {
                        containerRef: this.contextDetail?.oid
                    }
                }).then(({ data }) => {
                    this.treeData = data || [];
                    this.isTreeShow = !!this.treeData.length;
                    this.currentKey = data?.[0]?.key || '';
                    setTimeout(() => {
                        this.$refs.folderDomainTree?.setCurrentKey(this.currentKey);
                    }, 300);
                });
            },
            folderDomainSearch(n) {
                this.$refs?.folderDomainTree.filter(n);
            },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                } // 不区分英文字母大小写
                let newVal = data?.displayName?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            /**
             * 权限树点击事件
             */
            folderDomainNodeClick(data) {
                this.handlerChangeOrganization(data);
            }
        }
    };
});
