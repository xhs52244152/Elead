/*
    产品详情页
    先引用 kit组件
    Product: FamKit.asyncComponent(ELMP.resource('erdc-product-components/Product/index.js')), // 产品列表

    productOid	产品oid
    containerRef	通过该参数获取当前容器的详情
    menuList	菜单列表
    
    <product
			:productOid=''
			:containerRef=''
			:menuList=''
    ></product>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-product-components/Product/index.html'),
    'EventBus',
    'css!' + ELMP.resource('erdc-product-components/Product/style.css')
], function (template) {
    const famHttp = require('fam:http');
    const FamKit = require('fam:kit');
    const EventBus = require('EventBus');
    return {
        template,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                i18nMappingObj: {
                    info: this.getI18nByKey('信息'),
                    dashboard: this.getI18nByKey('仪表盘'),
                    folder: this.getI18nByKey('文件夹'),
                    part: this.getI18nByKey('部件'),
                    doc: this.getI18nByKey('文档'),
                    epm: this.getI18nByKey('图文档'),
                    team: this.getI18nByKey('团队'),
                    changeManagement: this.getI18nByKey('变更管理'),
                    workspace: this.getI18nByKey('工作区'),
                    baseline: this.getI18nByKey('基线')
                },
                jumpName: '查看所有项目组合',
                selectList: [],
                defaultProduct: '', // 默认打开
                activeName: 'MainPage'
            };
        },
        props: {
            productOid: {
                type: String,
                default: ''
            },
            containerRef: {
                type: String,
                default: ''
            },
            menuList: {
                type: Array,
                default: []
            }
        },
        watch: {
            testName(n, o) {
                
            }
        },
        computed: {
            testName() {
                return this.$store.state.app.productActive;
            }
        },
        components: {
            MainPage: FamKit.asyncComponent(ELMP.resource('erdc-product-components/MainPage/index.js')),
            FolderList: FamKit.asyncComponent(ELMP.resource('erdc-product-components/FolderList/index.js')),
            ProductList: FamKit.asyncComponent(ELMP.resource('erdc-product-components/ProductList/index.js')), // 产品列表\
            ObjectPermissionManage: FamKit.asyncComponent(ELMP.resource('erdc-product-components/PermissionManagement/ObjectPermissionManage/index.js')),
            AttrPermissionManagement: FamKit.asyncComponent(ELMP.resource('erdc-product-components/PermissionManagement/AttrPermissionManagement/index.js'))
        },
        mounted() {
            this.init();

            EventBus.on('product:activeName', (cb, data) => {
                if (data) {
                    this.activeName = data;
                }
            });
        },
        methods: {
            init() {
                
                if (this.containerRef) {
                    this.getContainerInfo(this.containerRef);
                } else {
                    this.$store.state.app.product = {};
                }
            },
            // oid: OR:erd.cloud.foundation.core.container.entity.ScalableContainer:1598581596758237186
            getContainerInfo(oid) {
                this.$famHttp({url: '/fam/container/getCurrentContainerInfo', data: {
                        oid
                    }, method: 'get'}).then((res) => {
                    
                    this.$store.state.app.product = res ?. data;
                });
            }
        }
    };
});
