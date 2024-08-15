define([
    'text!' + ELMP.resource('biz-object-permission/index.html'),
    ELMP.resource('erdc-components/FamResizableContainer/index.js'),
    ELMP.resource('erdc-permission-components/PermissionIndex/index.js'),
    'css!' + ELMP.resource('biz-object-permission/style.css')
], function (template, FamResizableContainer, PermissionIndex) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            ResizableContainer: FamResizableContainer,
            FamVirtualList: FamKit.asyncComponent(ELMP.resource('erdc-components/FamVirtualList/index.js')),
            PermissionTitle: FamKit.asyncComponent(
                ELMP.resource('erdc-permission-components/PermissionTitle/index.js')
            ),
            PermissionIndex
        },
        data() {
            let threeMemberEnv = this.$store.state.app.threeMemberEnv;
            return {
                isEditPermission: true,
                selectOptions: [],
                defaultCurrentLevel: '',
                oid: '',
                currentName: '',
                tableHeight: '100%',
                treeHeight: '100%',
                resizableContainerStyle: {
                    width: '200px',
                    minWidth: 200,
                    maxWidth: '50%'
                },
                treeProps: {
                    children: 'childList',
                    label: 'displayName',
                    isLeaf: 'leaf'
                },
                containerHeight: 0,
                siteAndOrgTreeData: [],
                threeMemberEnv: threeMemberEnv,
                showList: !threeMemberEnv,
                selectedNode: {},
                selectedItem: null,
                appName: '',
                searchValue: '',
                isBasics: false,
                row: null,
                searchAppName: 'ALL',
                siteAndOrganization: []
            };
        },
        computed: {
            isShowReadBtn() {
                return !this.siteAndOrganization.includes(this.row?.oid) && this.isEditPermission;
            },
            queryParams() {
                return {
                    data: {
                        appName: this.appName,
                        isGetVirtualRole: true,
                        isGetVirtualGroup: true,
                        isDefault: false
                    }
                };
            },
            appNames() {
                const appNames = this.$store?.state?.app?.appNames || [];
                return [
                    {
                        displayName: '全部',
                        identifierNo: 'ALL'
                    },
                    ...appNames
                ];
            },
            appNameRow() {
                return {
                    components: 'constant-select',
                    viewProperty: 'displayName',
                    valueProperty: 'identifierNo',
                    referenceList: this.appNames,
                    clearable: true
                };
            }
        },
        mounted() {
            this.tableHeight = document.documentElement.clientHeight - 188;
            this.$nextTick(() => {
                const offsetTop = FamKit.offset(this.$refs['virtual-list-split']).top;
                this.treeHeight = `calc(100vh - ${offsetTop}px)`;
                this.containerHeight = document.documentElement.clientHeight - offsetTop - 24;
                this.initSitAndOrg();
            });
        },
        methods: {
            initSitAndOrg() {
                this.$famHttp({ url: '/fam/user/me', method: 'get' }).then((res) => {
                    if (res.code === '200' && res.data) {
                        const siteAndOrganizationRes = res.data.siteAndOrganizationRes || {};
                        const { organization, site } = siteAndOrganizationRes;
                        let currentName = '';
                        let oid = '';
                        let siteAndOrgTreeData = {};
                        if (site) {
                            site.label = site.name;
                            this.selectOptions.push(site);
                            siteAndOrgTreeData = {
                                ...site,
                                displayName: site.name,
                                noContext: true,
                                childList: [],
                                isBasics: true
                            };
                            this.defaultCurrentLevel = site.id;
                            currentName = site.name;
                            oid = site.oid;
                            this.siteAndOrganization.push(site.oid);
                        }
                        if (organization) {
                            organization.label = `${site.name} / ${organization.name}`;
                            this.selectOptions.push(organization);
                            siteAndOrgTreeData.childList.push({
                                ...organization,
                                displayName: organization.name,
                                noContext: true,
                                childList: this.threeMemberEnv ? [] : [{}],
                                leaf: false,
                                isBasics: true
                            });
                            this.defaultCurrentLevel = organization.id;
                            currentName = organization.name;
                            oid = organization.oid;
                            this.siteAndOrganization.push(organization.oid);
                        }
                        this.siteAndOrgTreeData = [siteAndOrgTreeData];
                        this.appName = organization.appName;
                        this.$nextTick(() => {
                            this.$refs?.siteAndOrgTree.setCurrentKey(organization.oid);
                            this.selectedNode = organization;
                            this.isBasics = true;
                        });

                        this.handlerChangeOrganization({
                            id: this.defaultCurrentLevel,
                            oid: oid,
                            domainRef: organization?.domainRef,
                            defaultDomainRef: organization?.defaultDomainRef,
                            name: currentName,
                            noContext: true
                        });
                    }
                });
            },
            handlerChangeOrganization(selectedObj) {
                this.row = selectedObj;
                if (this.selectOptions.length >= 2) {
                    const org = this.selectOptions[1];
                    if (org.oid !== selectedObj.oid) {
                        this.selectOptions[2] = {
                            ...selectedObj,
                            label: `${org.label} / ${selectedObj.name}`
                        };
                    }
                }
                this.oid = selectedObj.oid;
                this.currentName = selectedObj.currentName;
                this.defaultCurrentLevel = selectedObj.id;
                this.$nextTick(() => {
                    this.$refs.objPermissionIndex.changeOrganization(selectedObj);
                });
            },
            handlerChangeEditPermission(flag) {
                this.isEditPermission = flag;
                this.$refs.objPermissionIndex.changeEditPermission(flag);
            },
            handlerClickTreeNode(data, isFromList) {
                this.appName = data.appName;
                this.isBasics = data.isBasics;
                if (_.isBoolean(isFromList)) {
                    this.$refs.siteAndOrgTree.setCurrentKey();
                    this.$set(this, 'selectedNode', null);
                    this.$set(this, 'selectedItem', data);
                } else {
                    this.$set(this, 'selectedItem', null);
                    this.$set(this, 'selectedNode', data);
                }
                this.handlerChangeOrganization(data);
            },
            handlerExpandNode(data, nodeData) {
                if (nodeData.level === 1) {
                    this.showList = nodeData.childNodes[0].expanded;
                } else if (nodeData.level === 2) {
                    this.showList = true;
                }
            }
        }
    };
});
