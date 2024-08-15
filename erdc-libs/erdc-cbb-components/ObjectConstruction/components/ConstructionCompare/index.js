define([
    'erdc-kit',
    ELMP.resource('erdc-pdm-app/store/index.js'),
    ELMP.resource('erdc-cbb-components/ObjectConstruction/store.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'text!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionCompare/index.html'),
    'css!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionCompare/style.css')
], function (ErdcKit, store, constructStore, cbbUtils, template) {
    const ErdcStore = require('erdcloud.store');
    ErdcStore.registerModule('ObjectConstruction', constructStore);

    return {
        template,
        props: {
            // 自定义参数appName
            appName: String
        },
        components: {
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            CompareTree: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ObjectConstruction/components/CompareTree/index.js')
            ),
            CompareAttr: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ObjectConstruction/components/CompareAttr/index.js')
            ),
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            FamTableColSet: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamTableColSet/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ObjectConstruction/locale/index.js'),
                className: '',
                rootA: [],
                rootB: [],
                leftCurrentNodeData: {},
                rightCurrentNodeData: {},
                leftAttrData: {
                    caption: '',
                    attrRawList: []
                },
                rightAttrData: {
                    caption: '',
                    attrRawList: []
                },
                self: {},
                colSetVisible: false,
                columnsList: [],
                defaultColumns: [],
                onlyShowDiff: false,
                viewOptions: [],
                showBackButton: false,
                attrLoading: false,
                headers: [],
                leftFiles: [],
                rightFiles: [],
                leftInitView: '',
                rightInitView: ''
            };
        },
        computed: {
            // 暂时用不上了
            defaultView() {
                return this.$store.state.ObjectConstruction.preferenceView; // view name
            },
            defaultIcon() {
                let { className } = this;
                let { tableViewMaping } = store.state;

                const config = {
                    [tableViewMaping.part.className]: 'erd-iconfont erd-icon-component-parts',
                    [tableViewMaping.document.className]: 'erd-iconfont erd-icon-regular-document',
                    [tableViewMaping.epmDocument.className]: 'erd-iconfont erd-icon-cad'
                };

                return config[className] || '';
            },
            dataAppName() {
                return this.appName || cbbUtils.getAppNameByResource();
            },
            titleConfig() {
                let { i18n, className } = this;
                let { tableViewMaping } = store.state;

                let config = {
                    [tableViewMaping.part.className]: {
                        title: i18n['BOM结构树'],
                        changeBntTitle: i18n['changeComparePart']
                    },
                    [tableViewMaping.document.className]: {
                        title: i18n['docStruct'],
                        changeBntTitle: i18n['changeCompareDoc']
                    },
                    [tableViewMaping.epmDocument.className]: {
                        title: i18n['epmStruct'],
                        changeBntTitle: i18n['changeCompareEpm']
                    }
                };

                return config[className] || {};
            },
            headersParams() {
                let { className } = this;
                let { tableViewMaping } = store.state;

                let config = {
                    [tableViewMaping.part.className]: {
                        className: 'erd.cloud.pdm.part.entity.EtPartUsageLink',
                        tableKey: 'BomUsageLinkView'
                    },
                    [tableViewMaping.document.className]: {
                        className: 'erd.cloud.cbb.doc.entity.EtDocumentUsageLink',
                        tableKey: 'DocumentStructView'
                    },
                    [tableViewMaping.epmDocument.className]: {
                        className: 'erd.cloud.pdm.epm.entity.EpmMemberLink',
                        tableKey: 'EpmDocumentStructView'
                    }
                };

                return config[className] || {};
            },
            needBomView() {
                let { className } = this;
                let { tableViewMaping } = store.state;
                return className === tableViewMaping.part.className;
            },
            needVisualization() {
                let { className } = this;
                let { tableViewMaping } = store.state;
                return [tableViewMaping.part.className, tableViewMaping.epmDocument.className].includes(className);
            },
            // 比较文件是否相同
            fileIsDifference() {
                let { leftFiles, rightFiles, leftCurrentNodeData, rightCurrentNodeData } = this;
                if (_.isEmpty(leftFiles) || _.isEmpty(rightFiles)) return false;

                // 根节点的文件不用比较
                let leftNode = this.$refs['left-tree']?.getTreeInstance()?.getNode(leftCurrentNodeData.nodeKey);
                let rightNode = this.$refs['right-tree']?.getTreeInstance()?.getNode(rightCurrentNodeData.nodeKey);
                if (leftNode.level === 1 && rightNode.level === 1) return false;

                // 默认根据文件名比较
                return leftFiles[0]?.fileName !== rightFiles[0]?.fileName;
            }
        },
        beforeRouteEnter(to, from, next) {
            next((vm) => {
                vm.showBackButton = from.matched.length !== 0;
            });
        },
        created() {
            this.self = this;

            // 初始化从路由获取的参数
            this.className = this.$route.meta.className;
            this.leftInitView = this.$route.query?.viewA || '';
            this.rightInitView = this.$route.query?.viewB || '';

            let { refresh, needBomView, fetchHeaders } = this;
            refresh();
            // 查询视图首选项
            needBomView && this.$store.dispatch('ObjectConstruction/getPreferenceView');

            // 查询视图列信息
            fetchHeaders().then((resp) => {
                this.headers = resp?.data?.headers;
            });
        },
        mounted() {
            // 设置左右上下拖拽监听
            let { destroyTransverse, destroyPortrait } = this.setDragListener();
            this.removeListeners = function () {
                destroyTransverse();
                destroyPortrait();
            };
        },
        beforeDestroy() {
            // 移除左右上下拖拽监听
            this.removeListeners();
        },
        methods: {
            /**
             * 刷新比较
             * @param {Boolean} isSimpleRefresh 是否简单刷新（适用于非页面级的刷新）
             * @param {Boolean} resetView 是否清空已选视图，点击刷新按钮时需要
             */
            refresh(isSimpleRefresh, resetView) {
                // 获取query参数，加载初始数据
                let { fetchBomByOid, getFormatTreeData, expandFirstLevel } = this;
                let { compareA, compareB } = this.$route.query;

                // 清空搜索
                this.$refs['left-tree']?.setKeyword('');
                this.$refs['right-tree']?.setKeyword('');

                // 详情切换至属性页签
                this.$refs['left-attr']?.initActiveName('');
                this.$refs['right-attr']?.initActiveName('');

                if (resetView) {
                    // 清空已选视图
                    this.$refs['left-tree']?.setViewOid('');
                    this.$refs['right-tree']?.setViewOid('');
                }

                if (isSimpleRefresh) {
                    this.rootA = [{ ...this.rootA[0], children: null }];
                    this.rootB = [{ ...this.rootB[0], children: null }];
                    return expandFirstLevel();
                }
                // 查询初始数据（根节点）
                Promise.all([fetchBomByOid(compareA), fetchBomByOid(compareB)]).then((data) => {
                    // 渲染根节点
                    let leftData = data[0]?.data,
                        rightData = data[1]?.data;

                    [this.rootA, this.rootB] = getFormatTreeData(leftData, rightData);

                    expandFirstLevel();
                });
            },
            expandFirstLevel() {
                this.$nextTick(() => {
                    // 默认展开一级，触发其中一侧的展开即可，有联动
                    let treeInstance = this.$refs['left-tree']?.getTreeInstance();
                    if (!treeInstance) {
                        setTimeout(() => {
                            this.expandFirstLevel();
                        }, 100);
                        return;
                    }

                    let node = treeInstance.getNode(this.rootA[0].nodeKey);
                    treeInstance.expandNode(this.rootA[0].nodeKey);
                    node.loadData();
                });
            },
            // 根据两个对象oid，查询比较数据
            fetchBomByOid(oid) {
                let { dataAppName } = this;
                return new Promise((resolve) => {
                    if (!oid) return resolve();
                    let className = oid.split(':')[1];
                    this.$famHttp({
                        url: '/fam/attr',
                        appName: dataAppName,
                        className,
                        params: { oid }
                    }).then((resp) => {
                        resolve(resp);
                    });
                });
            },
            getFormatTreeData(leftData = {}, rightData = {}) {
                let { getEmptyNode } = this;

                // 属性信息处理
                let leftAttr = { ...leftData, ...(ErdcKit.deserializeAttr(leftData.rawData || {}) || {}) };
                let rightAttr = { ...rightData, ...(ErdcKit.deserializeAttr(rightData.rawData || {}) || {}) };

                // caption处理
                !_.isEmpty(leftAttr) && (leftAttr.caption = leftData.caption || '');
                !_.isEmpty(rightAttr) && (rightAttr.caption = rightData.caption || '');

                // 数据key值处理
                let random = Date.now() + parseInt(Math.random() * 10000).toString();
                let leftKey = `${leftAttr.oid || 'EMPTY'}:${random}`;
                let rightKey = `${rightAttr.oid || 'EMPTY'}:${random}`;

                let getData = function (attr, key, anotherAttr, anotherKey) {
                    if (!attr || _.isEmpty(attr))
                        return [getEmptyNode(key, anotherKey, anotherAttr.leaf, anotherAttr.accessToView)];
                    else {
                        return [
                            {
                                caption: attr.caption,
                                oid: attr.oid,
                                nodeKey: key,
                                icon: attr.icon,
                                anotherTreeKey: anotherKey,
                                leaf: attr.leaf || false,
                                children: null,
                                disabled: !attr.accessToView,
                                accessToView: attr.accessToView,
                                masterRef: attr.masterRef,
                                vid: attr.vid,
                                hasForEach: attr.hasForEach ?? true,
                                linkOid: attr.usageRef || attr.usageLinkOid,
                                defaultViewOid: attr.defaultViewOid || '',
                                isEmpty: attr.isEmpty || false
                            }
                        ];
                    }
                };

                return [
                    getData(leftAttr, leftKey, rightAttr, rightKey),
                    getData(rightAttr, rightKey, leftAttr, leftKey)
                ];
            },
            getEmptyNode(key, anotherKey, leaf, accessToView) {
                let { defaultIcon } = this;
                return {
                    caption: '',
                    oid: key,
                    nodeKey: key,
                    icon: defaultIcon,
                    anotherTreeKey: anotherKey,
                    leaf,
                    children: null,
                    disabled: !accessToView,
                    accessToView,
                    isEmpty: true,
                    hasForEach: true
                };
            },
            async changeRootData({ oid, defaultViewOid }, type) {
                let { getFormatTreeData, fetchBomByOid, expandFirstLevel } = this;

                // 清空搜索
                this.$refs['left-tree'].setKeyword('');
                this.$refs['right-tree'].setKeyword('');

                // 取消“仅显示不同”
                this.onlyShowDiff = false;

                let leftData = this.$refs['left-tree'].getRootData();
                let rightData = this.$refs['right-tree'].getRootData();

                let { data: selection } = await fetchBomByOid(oid);
                selection.defaultViewOid = defaultViewOid;
                if (type === 'left') leftData = selection;
                else rightData = selection;

                [this.rootA, this.rootB] = getFormatTreeData(leftData, rightData);

                // 更新query
                this.$router.replace({
                    path: this.$route.path,
                    query: {
                        ...(this.$route.query || {}),
                        compareA: this.rootA[0]?.isEmpty ? '' : this.rootA[0]?.oid,
                        compareB: this.rootB[0]?.isEmpty ? '' : this.rootB[0]?.oid
                    }
                });

                // 重新展开第一级
                expandFirstLevel();
            },
            onBack() {
                this.$store.dispatch('route/delVisitedRoute', this.$route).then((visitedRoutes) => {
                    if (this.showBackButton) this.$router.back();
                    else this.$router.push(visitedRoutes[0]);
                });
            },
            syncTreeExpand(data, node, treeName, expand = true) {
                // 是否加载了子节点
                let hasChild = !_.isEmpty(node.childNodes);
                // 有子节点或点击空节点则可同步展开
                if (!hasChild && !data.isEmpty) return;

                let anotherTreeComp = this.$refs[treeName];
                let key = data.anotherTreeKey;
                let treeInstance = anotherTreeComp.getTreeInstance();
                let anotherNode = treeInstance.getNode(key);

                if (expand) {
                    // 加载子节点
                    anotherNode.loadData();
                    treeInstance.expandNode(key);
                } else {
                    treeInstance.collapseNode(key);
                }
            },
            syncTreeClick(data, node, treeName) {
                this.attrLoading = true;

                let anotherTreeComp = this.$refs[treeName];
                let key = data.anotherTreeKey;
                let treeInstance = anotherTreeComp.getTreeInstance();
                let anotherNode = treeInstance.getNode(key);
                treeInstance.setCurrentNode(anotherNode?.data);

                let leftNewData = this.$refs['left-tree'].getCurrentNode(),
                    rightNewData = this.$refs['right-tree'].getCurrentNode();

                // 需要区分是否重复点击
                if (this.leftCurrentNodeData === leftNewData) {
                    this.attrLoading = false;
                    return;
                }

                // 更新当前高亮节点信息
                this.leftCurrentNodeData = leftNewData;
                this.rightCurrentNodeData = rightNewData;
                // 手动点击节点触发，
                this.updateCompareAttrs();
            },
            async syncTreeLoad(node, resolve, treeName) {
                let { afterBomViewInit, fetchStructSingle, fetchStructCompare, getFormatTreeData } = this;
                let { assembleCaption } = this;

                if (node.data.isEmpty) return resolve([]);

                let anotherTreeComp = this.$refs[treeName];
                let key = node?.data.anotherTreeKey;
                let treeInstance = anotherTreeComp.getTreeInstance();
                let anotherNode = treeInstance.getNode(key);

                let leftNodeData = node.data,
                    rightNodeData = anotherNode.data;

                if (treeName === 'left-tree') {
                    leftNodeData = anotherNode.data;
                    rightNodeData = node.data;
                }

                let handler = (leftAttr, rightAttr) => {
                    let leftResult = [];
                    let rightResult = [];
                    (_.isEmpty(leftAttr) ? rightAttr : leftAttr).forEach((item, i) => {
                        let result = getFormatTreeData(leftAttr[i] || {}, rightAttr[i] || {});
                        leftResult[i] = result[0][0];
                        rightResult[i] = result[1][0];
                    });

                    let data = [];
                    let anotherData = [];

                    if (treeName === 'left-tree') {
                        data = rightResult;
                        anotherData = leftResult;
                    } else {
                        data = leftResult;
                        anotherData = rightResult;
                    }

                    // 设置另一个树的数据，并展开
                    anotherTreeComp.setChildren(anotherNode, anotherData);
                    anotherNode.loadData();
                    treeInstance.expandNode(key);

                    resolve(data);
                };

                let isRootLevel = node.level === 1;

                // 查询比较数据
                // 单个数据按BOM树结构接口查询，多个再调比较接口
                let leftHasData = !_.isEmpty(leftNodeData) && !leftNodeData?.isEmpty;
                let rightHasData = !_.isEmpty(rightNodeData) && !rightNodeData?.isEmpty;
                let isSingleTree = leftHasData ^ rightHasData;

                // 尝试获取对象视图信息
                let viewOidInfo = await afterBomViewInit(isSingleTree);
                if (!viewOidInfo) {
                    this.$message.info('存在无BOM的对象');
                    return resolve([]);
                }

                // 单对象查询树结构
                if (isSingleTree) {
                    let viewOid = leftHasData ? viewOidInfo.leftViewOid : viewOidInfo.rightViewOid;
                    fetchStructSingle(node.data.oid, viewOid).then((resp) => {
                        // data handle
                        // 单对象的hasForEach标识有问题，这里默认改为true，表示无差异
                        resp.data.children.forEach((item) => {
                            item.hasForEach = true;
                            // 单对象查到的caption格式可能不正确，需要前端自己组装
                            item.caption = assembleCaption(item.rawData || {});
                        });

                        let leftAttr = [];
                        let rightAttr = [];

                        let caption = assembleCaption(resp.data.rawData || {});
                        if (leftHasData) {
                            // 单对象查到的caption格式可能不正确，需要前端自己组装
                            leftNodeData.caption = caption;

                            leftAttr = resp.data.children || [];
                            rightAttr = new Array(leftAttr.length).fill({});
                            // 更新跟节点isPrecise
                            isRootLevel && (leftNodeData.isPrecise = resp.data?.rawData?.isPrecise?.value);
                        } else {
                            // 单对象查到的caption格式可能不正确，需要前端自己组装
                            rightNodeData.caption = caption;

                            rightAttr = resp.data.children || [];
                            leftAttr = new Array(leftAttr.length).fill({});
                            // 更新跟节点isPrecise
                            isRootLevel && (rightNodeData.isPrecise = resp.data?.rawData?.isPrecise?.value);
                        }

                        handler(leftAttr, rightAttr);
                    });

                    return;
                }

                // 正常双对象查询
                fetchStructCompare(
                    { ...leftNodeData, viewOid: viewOidInfo.leftViewOid },
                    { ...rightNodeData, viewOid: viewOidInfo.rightViewOid }
                ).then((resp) => {
                    let { data } = resp;
                    let [leftData, rightData] = data;

                    // 更新两条数据本身的差异标识
                    leftNodeData.hasForEach = isRootLevel ? true : leftData?.hasForEach;
                    rightNodeData.hasForEach = isRootLevel ? true : rightData?.hasForEach;

                    // 更新跟节点isPrecise
                    if (isRootLevel) {
                        leftNodeData.isPrecise = leftData?.rawData?.isPrecise?.value;
                        rightNodeData.isPrecise = rightData?.rawData?.isPrecise?.value;
                    }

                    // 处理双方子节点数据
                    handler(leftData.children, rightData.children);

                    // 节点caption更新
                    leftNodeData.caption = leftData.caption;
                    rightNodeData.caption = rightData.caption;
                });
            },
            // 组装caption(前端部分场景需要)
            assembleCaption(rawData = {}) {
                return `${rawData.typeReference?.displayName} - ${rawData.identifierNo?.value}, ${rawData.name?.value}`;
            },
            // 等待BOM视图初始化完毕
            afterBomViewInit(isSingleTree) {
                let { needBomView } = this;
                let leftViewOid = '',
                    rightViewOid = '';

                return new Promise((resolve) => {
                    ErdcKit.deferredUntilTrue(
                        () => {
                            if (!needBomView) return true;
                            else {
                                leftViewOid =
                                    this.$refs['left-tree'].viewOid ||
                                    this.$refs['left-tree'].getRootData().hasNoBomView;
                                rightViewOid =
                                    this.$refs['right-tree'].viewOid ||
                                    this.$refs['right-tree'].getRootData().hasNoBomView;
                                return (
                                    (isSingleTree && (leftViewOid || rightViewOid)) ||
                                    (!isSingleTree && leftViewOid && rightViewOid)
                                );
                            }
                        },
                        () => {
                            // 存在无BOM的对象
                            if (leftViewOid === 'no_bom' || rightViewOid === 'no_bom') resolve(false);
                            else resolve({ leftViewOid, rightViewOid });
                        }
                    );
                });
            },
            fetchStructSingle(parentOid, viewOid) {
                let { needBomView, className, dataAppName } = this;
                let data = { parentOid };
                if (needBomView) data.viewOid = viewOid;

                let url = needBomView ? `/part/bom/query/1` : `/fam/struct/queryChildByLevel/1`;
                return this.$famHttp({
                    url,
                    data,
                    appName: dataAppName,
                    className,
                    method: 'POST'
                });
            },
            fetchStructCompare(dataLeft, dataRight) {
                let { headersParams, className, dataAppName } = this;
                return this.$famHttp({
                    url: '/fam/structCompare',
                    method: 'POST',
                    className,
                    appName: dataAppName,
                    data: {
                        className: headersParams.className,
                        tableKey: headersParams.tableKey,
                        queryVoList: [
                            {
                                parentOid: dataLeft.oid,
                                viewOid: dataLeft.viewOid,
                                usageLinkOid: dataLeft.linkOid
                            },
                            {
                                parentOid: dataRight.oid,
                                viewOid: dataRight.viewOid,
                                usageLinkOid: dataRight.linkOid
                            }
                        ],
                        attributeList: this.$refs['left-attr']?.getShowAttrs()?.map((item) => item.attrName)
                    }
                });
            },
            fetchHeaders() {
                let { headersParams, dataAppName } = this;
                return this.$famHttp({
                    url: '/fam/view/table/head',
                    method: 'POST',
                    appName: dataAppName,
                    data: headersParams
                });
            },
            // 初始默认节点设置
            setDefaultNodeData(data, type) {
                if (type === 'left') this.leftCurrentNodeData = data;
                else this.rightCurrentNodeData = data;

                this.updateCompareAttrs();
            },
            updateCompareAttrs: _.debounce(async function () {
                let {
                    leftCurrentNodeData,
                    rightCurrentNodeData,
                    headersParams,
                    className,
                    getRootPreciseStatus,
                    dataAppName
                } = this;

                this.attrLoading = true;

                let linkCompareDtoList = [[]];

                // 等待isPrecise获取到
                let { leftPrecise, rightPrecise } = await getRootPreciseStatus();
                if (!leftCurrentNodeData.isEmpty) {
                    linkCompareDtoList[0].push({
                        linkOid: leftCurrentNodeData.linkOid || '',
                        oid: leftCurrentNodeData.oid,
                        isPrecise: leftPrecise
                    });
                }

                if (!rightCurrentNodeData.isEmpty)
                    linkCompareDtoList[0].push({
                        linkOid: rightCurrentNodeData.linkOid || '',
                        oid: rightCurrentNodeData.oid,
                        isPrecise: rightPrecise
                    });
                this.$famHttp({
                    url: '/fam/compareStructAtrribute',
                    method: 'POST',
                    className,
                    appName: dataAppName,
                    data: {
                        className: headersParams.className,
                        tableKey: headersParams.tableKey,
                        linkCompareDtoList,
                        attributeList: this.$refs['left-attr']?.getShowAttrs()?.map((item) => item.attrName)
                    }
                }).then((resp) => {
                    let { data } = resp;
                    Object.keys(data).forEach((oid) => {
                        if (oid === leftCurrentNodeData.oid || oid === leftCurrentNodeData.linkOid)
                            this.leftAttrData = {
                                caption: leftCurrentNodeData.caption,
                                icon: leftCurrentNodeData.icon,
                                attrRawList: data[oid].map((item) => {
                                    if (item.attrName.search('#') > -1) item.attrName = item.attrName.split('#')[1];
                                    item.simple = leftCurrentNodeData.hasForEach ? true : item.simple;
                                    return item;
                                })
                            };
                        if (oid === rightCurrentNodeData.oid || oid === rightCurrentNodeData.linkOid)
                            this.rightAttrData = {
                                caption: rightCurrentNodeData.caption,
                                icon: rightCurrentNodeData.icon,
                                attrRawList: data[oid].map((item) => {
                                    if (item.attrName.search('#') > -1) item.attrName = item.attrName.split('#')[1];
                                    item.simple = rightCurrentNodeData.hasForEach ? true : item.simple;
                                    return item;
                                })
                            };
                    });

                    this.attrLoading = false;
                });
            }, 300),
            // 获取根节点的是否精确状态
            getRootPreciseStatus() {
                return new Promise((resolve) => {
                    let leftPrecise, rightPrecise;
                    if (!this.needBomView) return resolve({ leftPrecise, rightPrecise });
                    ErdcKit.deferredUntilTrue(
                        () => {
                            return (
                                !_.isUndefined(this.$refs['left-tree'].getRootData()?.isPrecise) ||
                                !_.isUndefined(this.$refs['right-tree'].getRootData()?.isPrecise)
                            );
                        },
                        () => {
                            leftPrecise = this.$refs['left-tree'].getRootData()?.isPrecise;
                            rightPrecise = this.$refs['right-tree'].getRootData()?.isPrecise;

                            resolve({ leftPrecise, rightPrecise });
                        }
                    );
                });
            },
            setDragListener() {
                // 注册左右拖拽
                let destroyTransverse = this.registerDrag(
                    this.$refs.transverseLine,
                    this.$refs.infoContainer,
                    function onDrag({ x, containerWidth }) {
                        // 限制左右移动范围
                        if (x <= 150 || x >= containerWidth - 150) return;
                        document.documentElement.style.setProperty('--pdm-bom-compare-left-width', `${x}px`);
                    }
                );
                // 注册上下拖拽
                let destroyPortrait = this.registerDrag(
                    this.$refs.portraitLine,
                    this.$refs.infoContainer,
                    function onDrag({ y, containerHeight }) {
                        // 限制上下移动范围
                        if (y <= 50 || y >= containerHeight - 50) return;
                        document.documentElement.style.setProperty('--pdm-bom-compare-left-height', `${y}px`);
                    }
                );

                return { destroyTransverse, destroyPortrait };
            },
            registerDrag(ele, containerEle, onDrag) {
                ele.onmousedown = function () {
                    ele.style.background = '#818181';
                    const containerWidth = containerEle.clientWidth;
                    const containerHeight = containerEle.clientHeight;

                    document.onmousemove = function (ev) {
                        requestAnimationFrame(() => {
                            const endX = ev.clientX - containerEle.offsetLeft;
                            const endY = ev.clientY - containerEle.offsetTop;
                            onDrag({ x: endX, y: endY, containerWidth, containerHeight });
                        });
                    };

                    document.onmouseup = function () {
                        ele.style.background = '#d9d9d9';
                        document.onmousemove = null;
                        document.onmouseup = null;
                        ele.releaseCapture && ele.releaseCapture();
                    };

                    ele.setCapture && ele.setCapture();
                    return false;
                };

                return function destroy() {
                    ele.onmousedown = null;
                };
            },
            // 竖线复位
            resetTransverseLine() {
                document.documentElement.style.setProperty('--pdm-bom-compare-left-width', `50%`);
            },
            // 横线复位
            resetPortraitLine() {
                document.documentElement.style.setProperty('--pdm-bom-compare-left-height', `50%`);
            },
            // 打开属性配置面板
            openColSet() {
                // 获取当前显示属性
                let currentAttrs = this.$refs['left-attr'].getAttrs();
                let showAttrs = this.$refs['left-attr'].getShowAttrs();

                let showAttrFields = showAttrs.map((item) => item.attrName);
                this.columnsList = currentAttrs.map((item) => {
                    item.isSelected = showAttrFields.includes(item.attrName);
                    return item;
                });
                this.defaultColumns = showAttrs;

                // 打开面板
                this.colSetVisible = true;
            },
            // 确认设置显示属性之前
            beforeColSubmit(data, setVisible) {
                let { i18n } = this;
                let { selectedColumns } = data;
                // 至少选择一个属性
                if (selectedColumns.length < 1) {
                    this.$message.warning(i18n.selectOneAttrTips);
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            },
            // 确认后设置显示属性
            fnColSettingSubmit(data) {
                let { selectedColumns } = data;

                // 更改显示属性后刷新比较，属性有不同则需要重新比较
                let oldFields = this.$refs['left-attr'].getShowAttrs().map((item) => item.attrName);
                let newFields = selectedColumns.map((item) => item.attrName);
                let needRefresh = false;
                if (oldFields.length !== newFields.length) needRefresh = true;
                else if (Array.from(new Set([...oldFields, ...newFields])).length !== oldFields.length) {
                    needRefresh = true;
                }

                this.$refs['left-attr'].setShowAttrs(selectedColumns);
                this.$refs['right-attr'].setShowAttrs(selectedColumns);

                if (needRefresh) this.refresh(true);
            },
            // 切换仅显示不同
            onChangeShowDiff(onlyShowDiff) {
                let filterData = onlyShowDiff ? { type: 'diff' } : '';
                // 过滤
                this.$refs['left-tree'].filter(filterData);
                this.$refs['right-tree'].filter(filterData);

                // 选中对象要切换回顶层（选中一侧即可，自动触发同步逻辑）
                this.$refs['left-tree'].getTreeInstance()?.setCurrentNode(this.rootA[0]);
                this.syncTreeClick(this.rootA[0], null, 'right-tree');
            },
            onLeftScroll(scrollTop) {
                this.$refs['right-tree'].setScrollTop(scrollTop);
            },
            onRightScroll(scrollTop) {
                this.$refs['left-tree'].setScrollTop(scrollTop);
            }
        }
    };
});
