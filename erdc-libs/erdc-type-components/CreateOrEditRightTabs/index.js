define([
    'text!' + ELMP.resource('erdc-type-components/CreateOrEditRightTabs/index.html'),
    'vuedraggable',
    'css!' + ELMP.resource('erdc-type-components/CreateOrEditRightTabs/style.css')
], function (template, VueDraggable) {
    return {
        template,
        components: {
            VueDraggable
        },
        props: {
            maxHeight: {
                type: [String, Number],
                default: 0
            },
            isChange: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/AttrPermissionSetting/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    save: this.getI18nByKey('保存'),
                    saveSuccess: this.getI18nByKey('保存成功'),
                    saveFailed: this.getI18nByKey('保存失败'),
                    queryFailed: this.getI18nByKey('查询失败'),
                    teamMembers: this.getI18nByKey('团队成员'),
                    teamMembersTips: this.getI18nByKey('团队成员提示'),
                    create: this.getI18nByKey('创建'),
                    modify: this.getI18nByKey('修改'),
                    view: this.getI18nByKey('查看'),
                    searchAttr: this.getI18nByKey('搜索属性'),
                    readAndWrite: this.getI18nByKey('读写'),
                    onlyRead: this.getI18nByKey('只读'),
                    hidden: this.getI18nByKey('隐藏'),
                    reset: this.getI18nByKey('重置'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    confirmCancel: this.getI18nByKey('确认取消'),
                    tips: this.getI18nByKey('提示'),
                    unSave: this.getI18nByKey('尚未保存')
                },
                currentTab: 'CREATE',
                searchValue: '',
                drag: false,
                groupHidden: {
                    name: 'groupHidden',
                    pull: true,
                    put: true
                },
                readAndWriteOriginArr: [],
                readAndWriteArr: [],
                onlyReadOriginArr: [],
                onlyReadArr: [],
                hiddenArr: [],
                hiddenOriginArr: [],
                tabs: [
                    { label: 'create', name: 'CREATE' },
                    { label: 'modify', name: 'UPDATE' },
                    { label: 'view', name: 'VIEW' }
                ],
                thirdClass: false,
                secondActive: false,
                firstActivce: false,
                onlyReadTempArr: [],
                readAndWriteTempArr: [],
                hiddenTempArr: [],
                baseRequestParams: {},
                draggedItem: {},
                nodeDisplayName: '',
                showDialog: false
            };
        },
        watch: {
            showDialog: {
                immediate: true,
                handler(val) {
                    if (val) this.cancel();
                }
            }
        },
        mounted() {},
        methods: {
            handleMouseOver(el, dom, callback) {
                //  自己计算
                const parentElement = el.parentElement;
                const parentWidth = parentElement.clientWidth - 38;
                const containerWidth = dom.clientWidth || dom.offsetWidth;
                const bool = parentWidth <= containerWidth;
                callback(bool);
            },
            // 取消提示框
            cancel() {
                this.$confirm(this.i18nMappingObj['unSave'], this.i18nMappingObj['tips'], {
                    customClass: 'custom-confirm-cancel',
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel']
                })
                    .then(() => {
                        this.handlerCreateAttrPermission();
                    })
                    .catch(() => {
                        this.openDialog();
                    });
            },
            openDialog() {
                this.showDialog = !this.showDialog;
                this.$emit('container-change', false);
            },
            leaveTab(activeName, oldActiveName) {
                // 数据有修改时，不允许切换tabs页
                if (this.isChange) return false;
            },
            // 可读可写、只读容器、隐藏容器发生变化后，调用父组件中的handleContainerChange方法
            handleReadAndWriteArrChange(newArr) {
                this.$emit('container-change', true);
            },
            handleChangeTab(tab, event) {
                this.isChange ? this.openDialog() : this.initPageData(this.baseRequestParams, this.nodeDisplayName);
            },
            resetPageData() {
                this.searchValue = '';
                this.readAndWriteOriginArr = [];
                this.readAndWriteArr = [];
                this.onlyReadOriginArr = [];
                this.onlyReadArr = [];
                this.hiddenArr = [];
                this.hiddenOriginArr = [];
                this.onlyReadTempArr = [];
                this.hiddenTempArr = [];
                this.readAndWriteTempArr = [];
            },
            initPageData(params, nodeDisplayName) {
                this.resetPageData();
                if (!params.typeOid || !params.principalOid) return;
                params && (this.baseRequestParams = params);
                this.nodeDisplayName = nodeDisplayName;
                this.$famHttp({
                    url: '/fam/type/typeAttrAccess/principal',
                    data: {
                        category: this.currentTab,
                        ...this.baseRequestParams
                    },
                    method: 'GET'
                }).then((res) => {
                    if (res.code === '200' && res.data) {
                        this.formatDragData(res.data);
                    }
                });
            },
            formatDragData(data) {
                const { hiddenList = [], modifylyList = [], readonlyList = [] } = data;
                this.readAndWriteArr = modifylyList.map((item) => {
                    item.isFilterShow = true;
                    return item;
                });
                this.onlyReadArr = readonlyList.map((item) => {
                    item.isFilterShow = true;
                    return item;
                });
                this.hiddenArr = hiddenList.map((item) => {
                    item.isFilterShow = true;
                    return item;
                });
                this.readAndWriteOriginArr = JSON.parse(JSON.stringify(this.readAndWriteArr));
                this.onlyReadOriginArr = JSON.parse(JSON.stringify(this.onlyReadArr));
                this.hiddenOriginArr = JSON.parse(JSON.stringify(this.hiddenArr));
            },
            checkCanPutInReadAndWriteArr(a, b, c, d) {
                const isReadonly = this.draggedItem.isReadonly;
                const isHidden = this.draggedItem.isHidden;
                return !isReadonly && !isHidden;
            },
            checkCanPutInReadonlyArr(a, b, c, d) {
                const isHidden = this.draggedItem.isHidden;
                return !isHidden;
            },
            chooseFirstCol(event, arrName) {
                const index = event.oldIndex;
                const arr = this[arrName];
                const filterArr = arr.filter((item) => {
                    return item.isFilterShow;
                });
                this.draggedItem = filterArr[index];
            },
            handlerSearchPermission(el) {
                // 搜索逻辑判断， 实时搜索，匹配规则
                this.readAndWriteArr = this.readAndWriteArr.map((item) => {
                    item.isFilterShow = el ? item.displayName.indexOf(el) !== -1 : true;
                    return item;
                });
                this.onlyReadArr = this.onlyReadArr.map((item) => {
                    item.isFilterShow = el ? item.displayName.indexOf(el) !== -1 : true;
                    return item;
                });
                this.hiddenArr = this.hiddenArr.map((item) => {
                    item.isFilterShow = el ? item.displayName.indexOf(el) !== -1 : true;
                    return item;
                });
            },
            onStart() {
                this.drag = true;
            },
            // 拖拽结束事件
            onEnd() {
                this.drag = false;
                this.draggedItem = null;
                if (this.thirdClass) {
                    this.thirdClass = false;
                    if (this.hiddenArr.length > 0) {
                        this.hiddenTempArr.push(this.hiddenArr[0]);
                    }
                    this.hiddenArr = JSON.parse(JSON.stringify(this.hiddenTempArr));
                    this.$nextTick(() => {
                        // 试图更新后，滚动到最末尾的位置
                        this.$refs.thirdScrollbar.wrap.scrollTop = this.$refs.thirdScrollbar.wrap.offsetHeight;
                    });
                }
                if (this.secondActive) {
                    this.secondActive = false;
                    if (this.onlyReadArr.length > 0) {
                        this.onlyReadTempArr.push(this.onlyReadArr[0]);
                    }
                    this.onlyReadArr = JSON.parse(JSON.stringify(this.onlyReadTempArr));
                    this.$nextTick(() => {
                        // 试图更新后，滚动到最末尾的位置
                        this.$refs.secondScrollbar.wrap.scrollTop = this.$refs.secondScrollbar.wrap.offsetHeight;
                    });
                }
                if (this.firstActivce) {
                    this.firstActivce = false;
                    if (this.readAndWriteArr.length > 0) {
                        this.readAndWriteTempArr.push(this.readAndWriteArr[0]);
                    }
                    this.readAndWriteArr = JSON.parse(JSON.stringify(this.readAndWriteTempArr));
                    this.$nextTick(() => {
                        // 试图更新后，滚动到最末尾的位置
                        this.$refs.firstScrollbar.wrap.scrollTop = this.$refs.firstScrollbar.wrap.offsetHeight;
                    });
                }
            },
            getSubmitParams() {
                const baseParams = {
                    category: this.currentTab,
                    containerReference: this.baseRequestParams.containerOid,
                    // containerReference: 'OR:erd.cloud.foundation.core.container.entity.OrgContainer:1572760576965734401',
                    typeReference: this.baseRequestParams.typeOid,
                    principalReference: this.baseRequestParams.principalOid,
                    hiddenAttrRef: this.hiddenArr.map((item) => item.oid),
                    modifyAttrRef: this.readAndWriteArr.map((item) => item.oid),
                    readonlyAttrRef: this.onlyReadArr.map((item) => item.oid)
                };
                return baseParams;
            },
            handlerCreateAttrPermission() {
                const submitParams = this.getSubmitParams();
                this.$famHttp({ url: '/fam/type/typeAttrAccess/batch/add', data: submitParams, method: 'POST' })
                    .then((res) => {
                        if (res.code === '200') {
                            this.$message({
                                message: this.i18nMappingObj.saveSuccess,
                                type: 'success',
                                showClose: true
                            });
                            this.$emit('container-change', false);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            handlerRestAttrPermission() {
                this.readAndWriteArr = JSON.parse(JSON.stringify(this.readAndWriteOriginArr));
                this.onlyReadArr = JSON.parse(JSON.stringify(this.onlyReadOriginArr));
                this.hiddenArr = JSON.parse(JSON.stringify(this.hiddenOriginArr));
            },
            onMoveFirstCol(el) {
                // const draggedItem = el.draggedContext.element;
                // this.draggedItem = draggedItem;
                const fromEl = el.from;
                const toEl = el.to;
                if (fromEl.className !== toEl.className) {
                    if (toEl.className.indexOf('second-col-class') !== -1) {
                        if (!this.secondActive) {
                            this.secondActive = true;
                            this.onlyReadTempArr = JSON.parse(JSON.stringify(this.onlyReadArr));
                            this.onlyReadArr = [];
                            if (this.thirdClass) {
                                this.thirdClass = false;
                                this.hiddenArr = JSON.parse(JSON.stringify(this.hiddenTempArr));
                                this.hiddenTempArr = [];
                            }
                            if (this.firstActivce) {
                                this.firstActivce = false;
                                this.readAndWriteArr = JSON.parse(JSON.stringify(this.readAndWriteTempArr));
                                this.readAndWriteTempArr = [];
                            }
                        }
                    } else if (toEl.className.indexOf('third-col-class') !== -1) {
                        if (!this.thirdClass) {
                            this.thirdClass = true;
                            this.hiddenTempArr = JSON.parse(JSON.stringify(this.hiddenArr));
                            this.hiddenArr = [];
                            if (this.secondActive) {
                                this.secondActive = false;
                                this.onlyReadArr = JSON.parse(JSON.stringify(this.onlyReadTempArr));
                                this.onlyReadTempArr = [];
                            }
                            if (this.firstActivce) {
                                if (this.firstActivce) {
                                    this.firstActivce = false;
                                    this.readAndWriteArr = JSON.parse(JSON.stringify(this.readAndWriteTempArr));
                                    this.readAndWriteTempArr = [];
                                }
                            }
                        }
                    } else if (toEl.className.indexOf('first-col-class') !== -1) {
                        if (!this.firstActivce) {
                            this.firstActivce = true;
                            this.readAndWriteTempArr = JSON.parse(JSON.stringify(this.readAndWriteArr));
                            this.readAndWriteArr = [];
                            if (this.secondActive) {
                                this.secondActive = false;
                                this.onlyReadArr = JSON.parse(JSON.stringify(this.onlyReadTempArr));
                                this.onlyReadTempArr = [];
                            }
                            if (this.thirdClass) {
                                this.thirdClass = false;
                                this.hiddenArr = JSON.parse(JSON.stringify(this.hiddenTempArr));
                                this.hiddenTempArr = [];
                            }
                            // return !draggedItem.isReadonly && !draggedItem.isHidden;
                        }
                    }
                } else {
                    if (this.thirdClass) {
                        this.thirdClass = false;
                        this.hiddenArr = JSON.parse(JSON.stringify(this.hiddenTempArr));
                        this.hiddenTempArr = [];
                    }
                    if (this.secondActive) {
                        this.secondActive = false;
                        this.onlyReadArr = JSON.parse(JSON.stringify(this.onlyReadTempArr));
                        this.onlyReadTempArr = [];
                    }
                    if (this.firstActivce) {
                        this.firstActivce = false;
                        this.readAndWriteArr = JSON.parse(JSON.stringify(this.readAndWriteTempArr));
                        this.readAndWriteTempArr = [];
                    }
                }
                return true;
            }
        }
    };
});
