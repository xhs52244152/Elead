define([
    'text!' + ELMP.resource('system-dashboard/components/LayoutConfigComponent/index.html'),
    'erdcloud.kit',
    'vue-grid-layout',
    ELMP.resource('system-dashboard/components/LayoutConfigComponent/horizontalCompact.js'),
    '/erdc-thirdparty/platform/screenfull/dist/screenfull.js',
    'css!' + ELMP.resource('system-dashboard/components/LayoutConfigComponent/index.css')
], function (tmpl, erdcloudKit, VueGridLayout, horizontalCompact) {
    const screenfull = window.screenfull;
    const LoadingComponent = {
        template:
            '<div style="height: calc(100% - 36px); margin-top: 36px;" class="text-center dashboard-loading" v-loading="true" element-loading-text="加载中……"></div>',
        data: function () {
            return {};
        }
    };
    const ErrorComponent = {
        props: {
            message: {
                type: String,
                default: '加载出错'
            }
        },
        template: `
            <div style="color: #d9d7d3;">
                <div><img src="/erdc-libs/erdc-assets/images/404.svg" width="130px"></div>
                <div class="text-center"><p>{{message}}</p></div>
            </div>
        `,
        data: function () {
            return {};
        }
    };
    const defaultCardEdit = {
        title: '',
        subTitle: ''
    };
    const mixin = {
        methods: {
            subscribeMove: function (cb) {
                var layoutConfig = this.$parent;
                while (layoutConfig.$options.name !== 'LayoutConfigComponent' && layoutConfig !== this.$root) {
                    layoutConfig = layoutConfig.$parent;
                }
                if (layoutConfig !== this.$root) {
                    layoutConfig.moveSubscriptions.push({
                        scope: this,
                        cb: cb
                    });
                }
            },
            subscribeResize: function (cb) {
                var layoutConfig = this.$parent;
                while (layoutConfig.$options.name !== 'LayoutConfigComponent' && layoutConfig !== this.$root) {
                    layoutConfig = layoutConfig.$parent;
                }
                if (layoutConfig !== this.$root) {
                    layoutConfig.resizeSubscriptions.push({
                        scope: this,
                        cb: cb
                    });
                }
            }
        }
    };
    function calcGutterWidth() {
        const outer = document.createElement('div');
        outer.className = 'el-scrollbar__wrap';
        outer.style.visibility = 'hidden';
        outer.style.width = '100px';
        outer.style.position = 'absolute';
        outer.style.top = '-9999px';
        document.body.appendChild(outer);

        const widthNoScroll = outer.offsetWidth;
        outer.style.overflow = 'scroll';

        const inner = document.createElement('div');
        inner.style.width = '100%';
        outer.appendChild(inner);

        const widthWithScroll = inner.offsetWidth;
        outer.parentNode.removeChild(outer);
        return widthNoScroll - widthWithScroll;
    }
    return {
        template: tmpl,
        props: {
            layoutId: String,
            // resourceId: String,
            mode: {
                type: String,
                default: 'read'
            },
            fullState: {
                type: Boolean,
                default: false
            },
            needCalcPosition: Boolean
        },
        watch: {
            layoutId: {
                handler: function () {
                    this.layoutId && this.loadCard();
                    this.layoutId && this.loadAllCanAddCards();
                },
                immediate: true
            },
            availableCards: function (allCards) {
                if (allCards && allCards.length) {
                    var tempObj = {};
                    allCards.forEach((i) => {
                        tempObj[i.oid] = i;
                    });
                    this.availableCardsMap = tempObj;
                }
            }
        },
        computed: {
            cardEditFormConfigs: function () {
                return [
                    {
                        field: 'title',
                        component: 'erd-input',
                        label: this.i18nMappingObj.title,
                        required: true,
                        col: 24,
                        props: {
                            maxlength: 60
                        }
                    },
                    {
                        field: 'subTitle',
                        component: 'erd-input',
                        label: this.i18nMappingObj.subTitle,
                        col: 24,
                        props: {
                            maxlength: 60
                        }
                    }
                ];
            },
            appList: function () {
                return this.$store.state.app.appNames || [];
            },
            isEditMode: function () {
                return this.mode === 'edit';
            }
        },
        components: {
            FamEmpty: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamEmpty/index.js')),
            GridLayout: VueGridLayout.GridLayout,
            GridItem: VueGridLayout.GridItem
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'system-dashboard'),
                i18nMappingObj: {
                    create: this.getI18nByKey('创建'),
                    success: this.getI18nByKey('成功'),
                    confirm: this.getI18nByKey('确定'),
                    title: this.getI18nByKey('标题'),
                    subTitle: this.getI18nByKey('副标题'),
                    sure_delect: this.getI18nByKey('确认移除'),
                    confirm_delete: this.getI18nByKey('确认删除'),
                    edit: this.getI18nByKey('编辑'),
                    wxts: this.getI18nByKey('温馨提示'),
                    config: this.getI18nByKey('配置'),
                    deleteCard: this.getI18nByKey('删除'),
                    cancel: this.getI18nByKey('取消')
                },
                cards: [],
                cardsComponentDefine: {},
                cardsConfig: {},
                layoutCardClass: 'erd.cloud.dashboard.entity.DashboardLayoutCardLink',
                layoutClass: 'erd.cloud.dashboard.entity.DashboardLayout',
                availableCards: [],
                availableCardsMap: {},
                defaultIcon: ELMP.resource('system-dashboard/images/default.png'),
                dropCard: null,
                mouseXY: { x: null, y: null },
                currentCard: null,
                visibleForCardConfig: false,
                visibleForCardEdit: false,
                cardEditForm: Object.assign({}, defaultCardEdit),
                moveSubscriptions: [],
                resizeSubscriptions: [],
                gutterWidth: calcGutterWidth(),
                currentLan: window.LS.get('lang_current'),
                ErrorComponent: ErrorComponent,
                appName: this.$route.query.appName || '',
                searchStr: '',
                cardData: [],
                isFull: false
            };
        },
        methods: {
            editCard: function (card) {
                this.currentCard = card;
                this.cardEditForm = {
                    title: card.title,
                    subTitle: card.subTitle
                };
                this.visibleForCardEdit = true;
            },
            setFull(id) {
                if (screenfull.isEnabled && !screenfull.isFullscreen) {
                    this.isFull = true;
                    screenfull.request(this.$refs[`card${id}`][0]);
                } else {
                    this.isFull = false;
                    screenfull.exit();
                }
            },
            configCard: function (card) {
                var self = this;
                if (!this.cardsConfig[card.widget]) {
                    require([ELMP.resource('config.js', card.widget)], function (cardConfig) {
                        if (cardConfig) {
                            self.cardsConfig[card.widget] = cardConfig;
                        } else {
                            self.cardsConfig.isError = true;
                            self.cardsConfig[card.widget] = ErrorComponent;
                        }
                        self.currentCard = card;
                        self.visibleForCardConfig = true;
                    }, function () {
                        self.cardsConfig.isError = true;
                        self.cardsConfig[card.widget] = ErrorComponent;
                        self.currentCard = card;
                        self.visibleForCardConfig = true;
                    });
                } else {
                    this.currentCard = card;
                    this.visibleForCardConfig = true;
                }
            },
            cancelAddCard: function () {
                this.cards = this.cards.filter((i) => i.oid);
                this.currentCard = null;
                this.visibleForCardConfig = false;
            },
            setMouseXY: function (e) {
                this.mouseXY.x = e.clientX;
                this.mouseXY.y = e.clientY;
            },
            dragstart: function (card) {
                this.dropCard = card;
            },
            drag: function () {
                let parentRect = document.querySelector('.system-dashboard_com_content').getBoundingClientRect();
                let mouseInGrid = false;
                if (
                    this.mouseXY.x > parentRect.left &&
                    this.mouseXY.x < parentRect.right &&
                    this.mouseXY.y > parentRect.top &&
                    this.mouseXY.y < parentRect.bottom
                ) {
                    mouseInGrid = true;
                }
                if (mouseInGrid === true && this.cards.findIndex((item) => item.i === 'drop') === -1) {
                    this.cards.push({
                        x: (this.cards.length * 2) % 24,
                        y: this.cards.length + 24,
                        w: 8,
                        h: 8,
                        i: 'drop',
                        id: 'drop',
                        widget: '',
                        apiType: '',
                        title: '',
                        menu: ''
                    });
                }
                let index = this.cards.findIndex((item) => item.i === 'drop');
                if (index !== -1) {
                    try {
                        this.$refs.gridlayout.$children[this.cards.length].$refs.item.style.display = 'none';
                    } catch (ex) {
                        // do noting
                    }
                    let el = _.find(this.$refs.gridlayout.$children, function (i) {
                        return i.$el.className.indexOf('vue-grid-placeholder') > -1;
                    });
                    el.dragging = {
                        top: this.mouseXY.y - parentRect.top,
                        left: this.mouseXY.x - parentRect.left
                    };
                    let new_pos = el.calcXY(this.mouseXY.y - parentRect.top, this.mouseXY.x - parentRect.left);
                    if (mouseInGrid === true) {
                        this.$refs.gridlayout.dragEvent(
                            'dragmove',
                            'drop',
                            new_pos.x,
                            new_pos.y,
                            this.cards[index].h,
                            this.cards[index].w
                        );
                        this.dropCard.x = this.cards[index].x;
                        this.dropCard.y = this.cards[index].y;
                    }
                    if (mouseInGrid === false) {
                        this.$refs.gridlayout.dragEvent('dragend', 'drop', new_pos.x, new_pos.y, 0, 0);
                        this.cards = this.cards.filter((obj) => obj.oid);
                    }
                }
            },
            dragend: function () {
                var self = this;
                this.mouseXY = { x: null, y: null };
                let index = this.cards.findIndex((item) => item.i === 'drop');
                if (index !== -1) {
                    // var dropCard = this.cards[index];
                    var menu = this.dropCard.menu;
                    _.extend(this.cards[index], {
                        widget: this.dropCard.widget,
                        apiType: this.dropCard.apiType,
                        title: this.dropCard.title,
                        menus: menu
                    });
                    try {
                        this.$refs.gridlayout.$children[this.cards.length].$refs.item.style.display = 'block';
                    } catch (ex) {
                        // do noting
                    }
                    this.$nextTick(function () {
                        var configFlag = _.some(menu, function (item) {
                            return item.clazz === 'dashboard-card-config-btn';
                        });
                        if (configFlag) {
                            if (self.cardsConfig[this.dropCard.widget]) {
                                self.currentCard = this.cards[index];
                                self.visibleForCardConfig = true;
                            } else {
                                var widget = this.dropCard.widget;
                                var dragCard = this.cards[index];
                                require([ELMP.resource('config.js', widget)], function (cardConfig) {
                                    if (cardConfig) {
                                        self.cardsConfig[widget] = cardConfig;
                                    } else {
                                        self.cardsConfig.isError = true;
                                        self.cardsConfig[widget] = ErrorComponent;
                                    }
                                    self.currentCard = dragCard;
                                    self.visibleForCardConfig = true;
                                }, function () {
                                    self.cardsConfig.isError = true;
                                    self.cardsConfig[widget] = ErrorComponent;
                                    self.currentCard = dragCard;
                                    self.visibleForCardConfig = true;
                                });
                            }
                        } else {
                            self.addCard();
                        }
                        this.$refs.gridlayout.dragEvent('dragend');
                    });
                }
            },
            updateCardConfig: function () {
                var self = this;
                if (this.$refs.cardConfig && this.$refs.cardConfig.values) {
                    var config = this.$refs.cardConfig.values() || {};
                    this.updateCard({
                        config: Object.assign(this.currentCard.config, config)
                    }).then((resp) => {
                        if (resp.success) {
                            this.$message.success(self.i18nMappingObj.success);
                            Object.assign(self.currentCard.config, config);
                            self.cancelAddCard();
                        } else {
                            this.$message.error(resp.message);
                        }
                    });
                } else {
                    this.cancelAddCard();
                }
            },
            updateCardEdit: function () {
                var self = this;
                self.$refs.form.submit().then(({ valid }) => {
                    if (valid) {
                        this.updateCard(this.cardEditForm).then((resp) => {
                            if (resp.success) {
                                this.$message.success(self.i18nMappingObj.success);
                                Object.assign(self.currentCard, self.cardEditForm);
                                this.visibleForCardEdit = false;
                            } else {
                                this.$message.error(resp.message);
                            }
                        });
                    }
                });
            },
            updateCard: function (params) {
                var self = this;
                var attrRawList = [];
                _.each(params, function (value, key) {
                    attrRawList.push({
                        attrName: key,
                        value: value
                    });
                });
                if (attrRawList.length) {
                    return this.$famHttp({
                        url: '/fam/update',
                        method: 'post',
                        data: {
                            className: this.layoutCardClass,
                            oid: self.currentCard.oid,
                            attrRawList: attrRawList
                        }
                    });
                }
                return Promise.resolve();
            },
            deleteCard: function (card) {
                var self = this;
                this.$confirm(
                    `${this.i18nMappingObj.confirm_delete}【${card?.title || ''}】?`,
                    this.i18nMappingObj.confirm_delete,
                    {
                        confirmButtonText: this.i18nMappingObj.confirm,
                        cancelButtonText: this.i18nMappingObj.cancel,
                        type: 'warning'
                    }
                ).then(() => {
                    this.$famHttp({
                        url: '/common/delete',
                        method: 'DELETE',
                        params: {
                            oid: card.oid,
                            category: 'DELETE'
                        }
                    }).then((resp) => {
                        if (resp.success) {
                            self.cards = self.cards.filter((i) => i !== card);
                            this.$message.success(self.i18nMappingObj.success);
                        }
                    });
                });
            },
            addCard: function () {
                var self = this;
                if (!this.dropCard) {
                    return;
                }
                var cardId = this.dropCard.oid;
                var widgetData = this.dropCard;
                var config = {};
                if (this.$refs.cardConfig && this.$refs.cardConfig.values) {
                    config = this.$refs.cardConfig.values() || {};
                }
                Object.assign(config, {
                    offset: {
                        x: widgetData.x,
                        y: widgetData.y
                    },
                    widget: widgetData.widget
                });
                this.$famHttp({
                    url: '/fam/create',
                    method: 'post',
                    data: {
                        className: this.layoutCardClass,
                        attrRawList: [
                            {
                                attrName: 'roleAObjectRef',
                                value: self.layoutId
                            },
                            {
                                attrName: 'roleBObjectRef',
                                value: cardId
                            },
                            {
                                attrName: 'title',
                                value: widgetData.nameI18nJson.value
                            },
                            {
                                attrName: 'subTitle',
                                value: widgetData.descriptionI18nJson.value
                            },
                            {
                                attrName: 'config',
                                value: config
                            },
                            {
                                attrName: 'width',
                                value: '8'
                            },
                            {
                                attrName: 'height',
                                value: '8'
                            }
                        ]
                    }
                })
                    .then((resp) => {
                        if (resp.success) {
                            this.dropCard = null;
                            this.$message.success(this.i18nMappingObj.success);
                            self.cards[self.cards.length - 1].componentDefine = LoadingComponent;
                            require([ELMP.resource(widgetData.widget + '/content.js')], function (cardDefine) {
                                if (cardDefine.mixins && cardDefine.mixins.length) {
                                    cardDefine.mixins.push(mixin);
                                } else {
                                    cardDefine.mixins = [mixin];
                                }
                                self.cards[self.cards.length - 1] = Object.assign(self.cards[self.cards.length - 1], {
                                    id: resp.data,
                                    i: resp.data,
                                    oid: resp.data,
                                    widget: widgetData.widget,
                                    roleBObjectRef: cardId,
                                    title: widgetData.nameI18nJson.value,
                                    componentDefine: cardDefine,
                                    config: config
                                });
                                self.cancelAddCard();
                            }, function () {
                                self.cards[self.cards.length - 1] = Object.assign(self.cards[self.cards.length - 1], {
                                    id: resp.data,
                                    i: resp.data,
                                    oid: resp.data,
                                    widget: widgetData.widget,
                                    roleBObjectRef: cardId,
                                    title: widgetData.nameI18nJson.value,
                                    componentDefine: ErrorComponent,
                                    isError: true,
                                    config: config
                                });
                            });
                        }
                    })
                    .catch(() => {
                        self.cancelAddCard();
                    });
            },
            /**
             * 系统管理员配置的布局，可能在某个用户使用的时候，某些卡片没有权限，所以需要将位置压缩重新计算一下，否则位置会看起来很乱
             */
            compactPosition: function (cards) {
                cards?.forEach((i) => {
                    var x = i.x,
                        w = i.w;
                    i.x = 24 - i.y - i.h;
                    i.y = x;
                    i.w = i.h;
                    i.h = w;
                });
                cards = horizontalCompact(cards, true);
                cards?.forEach((i) => {
                    var y = i.y,
                        w = i.w;
                    i.y = 24 - i.x - w;
                    i.x = y;
                    i.w = i.h;
                    i.h = w;
                });
                if (cards.length > 0) {
                    return this.layoutUpdatedEvent(cards).then(() => {
                        return cards;
                    });
                } else {
                    return new Promise((resolve, reject) => {
                        resolve(cards);
                    });
                }
            },
            loadCard: function () {
                var self = this;
                this.$famHttp({
                    url: `/common/dashboard/layout/${this.layoutId}/get`
                }).then((resp) => {
                    if (resp.success) {
                        var cards = resp.data?.filter((i) => i.config && i.config.widget && i.config.offset);
                        // 初始化部分数据,因为后端返回的key跟前端的key不一致
                        cards?.forEach((i) => {
                            i.widget = i.config.widget;
                            var offset = i.config.offset;
                            i.w = i.width || 8;
                            i.h = i.height || 8;
                            i.x = offset.x || 0;
                            i.y = offset.y || 0;
                            i.i = i.oid;
                        });
                        if (this.needCalcPosition) {
                            this.compactPosition(cards).then((newCards) => {
                                self.loadCardContent(newCards);
                            });
                        } else {
                            self.loadCardContent(cards);
                        }
                    }
                });
            },
            loadCardContent: function (cards) {
                let self = this;
                cards?.forEach((i) => {
                    i.componentDefine = LoadingComponent;
                    require([ELMP.resource(i.widget + '/content.js')], function (cardContent) {
                        if (cardContent) {
                            if (cardContent.mixins && cardContent.mixins.length) {
                                cardContent.mixins.push(mixin);
                            } else {
                                cardContent.mixins = [mixin];
                            }
                            i.componentDefine = cardContent;
                        } else {
                            i.isError = true;
                            i.componentDefine = ErrorComponent;
                        }
                    }, function () {
                        i.isError = true;
                        i.componentDefine = ErrorComponent;
                    });
                });
                self.cards = cards;
                self.$emit('cards-loaded', cards);
            },
            loadAllCanAddCards: function () {
                if (this.isLoadingAllCanAddCards) {
                    return;
                }
                this.isLoadingAllCanAddCards = true;
                this.$famHttp({
                    appName: this.appName,
                    url: '/common/dashboard/card/available/list',
                    params: {
                        layoutOid: this.layoutId
                    }
                }).then((resp) => {
                    if (resp.success) {
                        this.isLoadingAllCanAddCards = false;
                        this.cardData = resp.data;
                        this.availableCards = resp.data;
                    }
                });
            },
            movedEvent: function (i, newX, newY) {
                _.each(this.cards, function (card) {
                    if (card.oid === i || card.i === i) {
                        card.x = newX;
                        card.y = newY;
                    }
                });
                this.moveSubscriptions.forEach((i) => {
                    i.cb.call(i.scope);
                });
                this.layoutUpdatedEvent();
            },
            resizedEvent: function (i, newH, newW) {
                _.each(this.cards, function (card) {
                    if (card.oid === i || card.i === i) {
                        card.w = newW;
                        card.h = newH;
                    }
                });
                this.resizeSubscriptions.forEach((i) => {
                    i.cb.call(i.scope);
                });
                this.layoutUpdatedEvent();
            },
            layoutUpdatedEvent: function (cards) {
                var self = this;
                cards = cards || this.cards;
                var newCards = _.map(cards, function (item) {
                    return {
                        className: self.layoutCardClass,
                        oid: item.oid,
                        attrRawList: [
                            {
                                attrName: 'config',
                                value: Object.assign(item.config || {}, {
                                    offset: {
                                        x: item.x,
                                        y: item.y
                                    },
                                    widget: item.widget
                                })
                            },
                            {
                                attrName: 'width',
                                value: item.w
                            },
                            {
                                attrName: 'height',
                                value: item.h
                            }
                        ]
                    };
                });
                return this.$famHttp({
                    url: '/common/saveOrUpdate',
                    method: 'post',
                    data: {
                        className: self.layoutCardClass,
                        rawDataVoList: newCards
                    }
                }).then((resp) => {
                    if (!resp.success) {
                        this.$message.error(resp.message);
                    }
                });
                // this.$famHttp();
            },
            setUsed(id) {
                const temp = this.cards.find((ele) => ele.widget === id);
                if (temp) {
                    return true;
                } else {
                    return false;
                }
            },
            searchCard() {
                const allCards = JSON.parse(JSON.stringify(this.cardData));
                const result = allCards.filter((item) => item.displayName.includes(this.searchStr));
                this.availableCards = result;
            },
            clearSearch() {
                this.searchStr = '';
                this.searchCard();
            },
            screenFullChange() {
                if (!screenfull.isFullscreen) {
                    this.isFull = false;
                }
            }
        },
        created() {
            screenfull.on('change', this.screenFullChange);
        },
        mounted() {
            var self = this;
            document.addEventListener('dragover', self.setMouseXY, false);
        },
        destroyed() {
            var self = this;
            document.removeEventListener('dragover', self.setMouseXY, false);
            screenfull.off('change', this.screenFullChange);
        }
    };
});
