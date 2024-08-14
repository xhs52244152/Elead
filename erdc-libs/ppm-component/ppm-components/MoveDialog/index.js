//  此组件适用于业务管理-重量级团队和产品信息模块

define([
    'text!' + ELMP.resource('ppm-component/ppm-components/MoveDialog/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('ppm-component/ppm-components/MoveDialog/style.css')
], function (template, ErdcKit) {
    const famHttp = require('fam:http');
    return {
        template,
        props: {
            title: {
                typeof: String,
                default: '移动到'
            },
            tipTitle: {
                typeof: String,
                default: '提示：移动工作项会同步移动子工作项和已应用的实例'
            },
            showMoveDialog: {
                typeof: Boolean,
                default: false
            },
            visible: {
                type: Boolean,
                default: false
            },
            currentSelectTreeData: {
                type: Object,
                default: {}
            },
            show: {
                type: Boolean,
                default: true
            },
            className: {
                type: String,
                default: ''
            },
            oid: String
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-ppm-products/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    success: this.getI18nByKey('success'),
                    moveTip: this.getI18nByKey('moveTip'),
                    moveTo: this.getI18nByKey('moveTo'),
                    name: this.getI18nByKey('name'),
                    position: this.getI18nByKey('position'),
                    productName: this.getI18nByKey('productName'),
                    selectTeam: this.getI18nByKey('selectTeam'),
                    pleaseSelectMoveData: this.getI18nByKey('pleaseSelectMoveData')
                },
                value: {},
                defaultProps: {
                    children: 'childList',
                    label: 'name',
                    isLeaf: 'leaf'
                    // disabled: function (data, node) {
                    //     return data.level == '0';
                    // }
                },
                currentPosition: '',
                treeData: [],
                parentRef: ''
            };
        },
        created() {
            this.parentRef = '';
            this.getListTree();
            this.getParentPath(this.oid);
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            treeApi() {
                if (this.className !== 'erd.cloud.cbb.pbi.entity.HeavyTeam') {
                    return this.$route.path === '/erdc-ppm-heavy-team'
                        ? '/cbb/heavyTeam/listReleaseTree'
                        : '/cbb/productInfo/listReleaseTree';
                }
                return '/cbb/heavyTeam/listReleaseTree';
            },
            getParentPathUrl() {
                return this.$route.path !== '/erdc-ppm-products'
                    ? '/cbb/heavyTeam/getParentPathName'
                    : '/cbb/productInfo/getParentPathName';
            },
            submitApi() {
                if (this.show) {
                    return this.$route.path === '/erdc-ppm-heavy-team'
                        ? '/cbb/heavyTeam/move'
                        : '/cbb/productInfo/move';
                }
                return '/cbb/productInfo/addOrRemoveTeam';
            }
        },
        methods: {
            getListTree() {
                const param = {
                    params: {
                        className: this.className
                    }
                };
                famHttp({
                    url: this.treeApi,
                    ...param
                })
                    .then((res) => {
                        this.treeData = res.data || [];
                    })
                    .catch((error) => {
                        console.error('error====>', error);
                    });
            },
            onCheck(...args) {
                this.parentRef = args[0].oid;
            },
            handleConfirm() {
                if (!this.parentRef) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseSelectMoveData
                    });
                }
                let params = {
                    oid: this.oid,
                    className: this.className
                };
                if (this.show) {
                    params.attrRawList = [
                        {
                            attrName: 'parentRef',
                            value: this.parentRef
                        }
                    ];
                } else {
                    params.action = 'CREATE';
                    params.relationList = [
                        {
                            oid: this.parentRef
                        }
                    ];
                }
                this.$famHttp({
                    url: this.submitApi,
                    className: this.className,
                    method: 'POST',
                    data: params
                }).then((resp) => {
                    if (resp.code === '200') {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['success']
                        });
                        this.$emit('submit-success', '');
                        this.innerVisible = false;
                    }
                });
            },
            getParentPath(id) {
                this.currentPosition = '';
                this.$famHttp({
                    url: this.getParentPathUrl,
                    className: this.className,
                    params: { oid: id },
                    method: 'get'
                }).then((res) => {
                    if (res.code === '200') {
                        if (res.data) {
                            this.currentPosition = res.data + '/' + `${this.currentSelectTreeData.name}` || '';
                            // let resoult = res.data.split('/');
                            // this.currentPosition = resoult.at(-1);
                        } else {
                            this.currentPosition = this.currentSelectTreeData.name;
                        }
                    }
                });
            },
            handleCancel() {
                this.innerVisible = false;
            }
        },
        components: {
            SystemTree: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SystemDefineTree/index.js')),
            SystemDefineDetail: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/SystemDefineDetail/index.js')
            ),
            // 拖拽布局
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js'))
        }
    };
});
