define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'text!' + ELMP.resource('knowledge-library-list/components/FolderPermissions/index.html')
], function (ErdcKit, ppmStore, template) {
    return {
        template,
        components: {
            FamObjectPermission: ErdcKit.asyncComponent(
                ELMP.resource('erdc-permission-components/PermissionIndex/index.js')
            ),
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            FolderListTree: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/FolderListTree/index.js'))
        },
        props: {
            row: Object
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('knowledge-library-list/locale/index.js'),
                className: ppmStore.state.classNameMapping.document,
                folderPath: '',
                folderList: [],
                isMounted: true,
                includeAncestorDomain: false
            };
        },
        computed: {
            statusQueryParams() {
                return {
                    targetClass: this.className,
                    showAll: true,
                    isGetDraft: true
                };
            },
            typeTreeProps() {
                return {
                    label: 'displayName',
                    children: 'childList',
                    isLeaf: 'leaf',
                    disabled: 'disabled'
                };
            }
        },
        methods: {
            nodeClick(...args) {
                this.folderList = [];
                let data = args[1] || {};
                this.getTreeNode(data);
                // 页面初始化也会调用，防止多次调用列表接口
                if (this.isMounted) {
                    setTimeout(() => {
                        this.isMounted = false;
                    }, 1000);
                    return;
                }
                this.permissionReady(args[0]);
            },
            //获取当前树节点和其父级节点
            getTreeNode(node) {
                if (node && node.data?.name) {
                    this.folderList.unshift(node.data?.name);
                    this.getTreeNode(node.parent); //递归
                    this.folderPath = this.folderList.join('/');
                }
            },
            cancelReadPermission() {
                this.$emit('cancel');
            },
            permissionReady(row) {
                let data = row || this.row;
                this.$refs.famObjectPermission?.changeOrganization({ ...data, domainRef: data?.category });
            },
            beforeRequest(params) {
                params.includeAncestorDomain = false;
                return params;
            },
            customGetTypeData(vm) {
                this.$famHttp({
                    url: 'plat-system/type/typeDefinition/getTypeTree',
                    method: 'GET',
                    params: {
                        typeName: this.className
                    }
                }).then((resp) => {
                    vm.typeTreeData = resp.data.map((item, index) => {
                        if (!item.id) item.id = `rootNodex-${index}`;
                        return item;
                    });
                });
            }
        }
    };
});
