define([
    'text!' + ELMP.resource('erdc-components/FamImgCropTool/index.html'),
    '/erdc-thirdparty/platform/jquery-plugins/jcrop-0.9.15/js/jquery.Jcrop.min.js',
    'css!' + '/erdc-thirdparty/platform/jquery-plugins/jcrop-0.9.15/css/jquery.Jcrop.css',
    'css!' + ELMP.resource('erdc-components/FamImgCropTool/index.css')
], function (template) {
    return {
        template: template,
        props: {
            disabled: Boolean,
            imgSrc: String,
            toolBar: {
                type: Boolean,
                default: true
            },
            toolTitle: String,
            toolWidth: String,
            beforeHideTool: Function,
            extendTools: {
                type: Array,
                default: () => []
            },
            cropHolderBgColor: {
                type: String,
                default: 'rgb(76,76,76)'
            }
        },
        computed: {
            tools: function () {
                return [
                    {
                        code: 'drag',
                        name: '拖拽',
                        icon: 'erd-iconfont erd-icon-double-drag'
                    }
                ]
                    .concat(
                        this.disabled
                            ? []
                            : [
                                  {
                                      code: 'crop',
                                      name: '编辑',
                                      icon: 'erd-iconfont erd-icon-edit'
                                  }
                              ]
                    )
                    .concat(
                        this.fullscreen
                            ? [
                                  {
                                      code: 'existFullscreen',
                                      name: '退出全屏',
                                      icon: 'erd-iconfont erd-icon-zoom-out',
                                      onclick: this._activeExistFullscreen
                                  }
                              ]
                            : [
                                  {
                                      code: 'fullscreen',
                                      name: '全屏',
                                      icon: 'erd-iconfont erd-icon-zoom-in',
                                      onclick: this._activeFullscreen
                                  }
                              ]
                    )
                    .concat(this.extendTools);
            }
        },
        watch: {
            scale: function () {
                this.$emit(
                    'scaling',
                    {
                        scaleX: this._scaleX(),
                        scaleY: this._scaleY()
                    },
                    this.originSize
                );
            },
            imgSrc: {
                handler: function () {
                    this.originSize = null;
                    this.fit();
                }
            }
        },
        data: function () {
            return {
                scale: null,
                points: [],
                originSize: null,
                jcropApi: null,
                visibleForTool: false,
                activeTool: this.disabled ? 'drag' : 'crop',
                fullscreen: false
            };
        },
        methods: {
            destroyJcrop: function () {
                if (this.jcropApi) {
                    // this.jcropApi.release();
                    this._releaseJcrop();
                    this.jcropApi.destroy();
                    this.jcropApi = null;
                }
            },
            onActiveTool: function (toolName, tool) {
                tool = tool || this.tools.find((i) => i.code === toolName);
                if (tool && tool.onclick && _.isFunction(tool.onclick)) {
                    tool.onclick(toolName, tool);
                    this.$emit('active-tool', toolName);
                    return;
                }
                this.activeTool = toolName;
                switch (toolName) {
                    case 'drag':
                        this._activeDrag();
                        break;
                    case 'crop':
                        this._activeCrop();
                        break;
                }
                this.$emit('active-tool', toolName);
            },
            _activeFullscreen: function () {
                this.fullscreen = true;
                this.$nextTick(() => {
                    let currentScale = this.scale;
                    this.fit().then(() => {
                        this.$emit('fullscreen', this.scale, currentScale);
                    });
                });
            },
            _activeExistFullscreen: function () {
                this.fullscreen = false;
                let currentScale = this.scale;
                this.$nextTick(() => {
                    this.fit().then(() => {
                        this.$emit('existFullscreen', this.scale, currentScale);
                    });
                });
            },
            _activeDrag: function () {
                this.destroyJcrop();
                this._hideTool();
            },

            _activeCrop: function () {
                this.destroyJcrop();
                let self = this;
                $('img', this.imgCanvasDom());
                $('img', this.imgCanvasDom()).Jcrop(
                    {
                        addClass: 'fam-img-crop-holder',
                        bgColor: this.cropHolderBgColor,
                        keySupport: false,
                        onSelect: function () {
                            let rect = self.jcropApi.tellScaled();
                            let canvasPosition = $(self.$refs.canvas).position();
                            $(self.$refs.popoverPlaceholder).css({
                                width: rect.w,
                                height: rect.h,
                                left: canvasPosition.left + rect.x,
                                top: canvasPosition.top + rect.y
                            });
                            self.showTool();
                            self.$emit('crop-select', self.jcropApi);
                        },
                        onChange: function () {
                            self._hideTool();
                            self.$emit('crop-change', self.jcropApi);
                        },
                        onRelease: function () {
                            self._hideTool();
                            self.$emit('crop-release', self.jcropApi);
                        }
                    },
                    function () {
                        self.jcropApi = this;
                        self.$emit('crop-ready', self.jcropApi);
                    }
                );
            },
            fit() {
                return this._fitImgScale()
                    .then(this._fitImgPosition)
                    .then(this._calcScale)
                    .then(() => {
                        this.onActiveTool(this.activeTool);
                    });
            },
            /**
             * 承载图片容器元素
             * @returns jquery对象
             */
            imgCanvasDom: function () {
                return this.containerDom().find('.fam-img-crop-tool_canvas');
            },

            /**
             * 容器
             * @returns {jQuery|HTMLElement|*}
             */
            containerDom: function () {
                return $(this.$el);
            },
            _fitImgPosition: function fitImgPosition() {
                var $imgContainer = this.imgCanvasDom();
                var boxW = this.containerDom().width();
                var imgW = $imgContainer.width();
                var left = (boxW - imgW) / 2;
                // 这里的10对应下面 _fitImgScale 中计算图片缩放比中将容器的高度少算了10
                $imgContainer.css({ left: left > 0 ? left : 0, top: 10 });
                return Promise.resolve();
            },
            _fitImgScale: function () {
                let self = this;
                var $container = this.containerDom();
                var $canvas = this.imgCanvasDom();
                var w = $container.width();
                var h = $container.height() - 10;
                if (this.originSize) {
                    let nw = this.originSize.width,
                        nh = this.originSize.height;
                    if (nw > w && w > 0) {
                        nw = w;
                        nh = (w / self.originSize.width) * self.originSize.height;
                    }
                    if (nh > h && h > 0) {
                        nh = h;
                        nw = (h / self.originSize.height) * self.originSize.width;
                    }
                    $canvas.width(nw).height(nh);
                    $canvas.find('.img-container>img').width(nw).height(nh);
                    return Promise.resolve();
                } else {
                    return new Promise(function (resolve) {
                        var img = new Image();
                        img.src = self.imgSrc;
                        img.onload = function () {
                            let nw = this.width,
                                nh = this.height;
                            self.originSize = {
                                width: nw,
                                height: nh
                            };
                            if (nw > w && w > 0) {
                                nw = w;
                                nh = (w / self.originSize.width) * self.originSize.height;
                            }
                            if (nh > h && h > 0) {
                                nh = h;
                                nw = (h / self.originSize.height) * self.originSize.width;
                            }
                            $canvas.width(nw).height(nh);
                            $(this).width(nw).height(nh);
                            $canvas.find('.img-container').html(img);
                            resolve();
                        };
                    });
                }
            },
            _calcScale: function () {
                this.scale = {
                    scaleX: this._scaleX(),
                    scaleY: this._scaleY()
                };
            },
            cancel: function () {
                this.$emit('cancel');
            },
            positionData: function () {
                var scaleX = this.scale.scaleX;
                var scaleY = this.scale.scaleY;
                var rect = this.jcropApi.tellSelect();
                rect.x = rect.x / scaleX;
                rect.y = rect.y / scaleY;
                rect.w = rect.w / scaleX;
                rect.h = rect.h / scaleY;
                if (rect.x === 0 && rect.y === 0 && rect.w === 0 && rect.h === 0) {
                    return {
                        left: 0,
                        top: 0,
                        width: this.originSize.width,
                        height: this.originSize.height
                    };
                } else {
                    return {
                        left: rect.x,
                        top: rect.y,
                        width: rect.w,
                        height: rect.h
                    };
                }
            },
            submit: function () {
                let result = this.positionData();
                this.$emit('done', result, this.originSize);
                this.hideTool();
            },
            _scaleX: function () {
                return this.imgCanvasDom().width() / this.originSize.width;
            },
            _scaleY: function () {
                return this.imgCanvasDom().height() / this.originSize.height;
            },
            calcX: function (realX) {
                return realX * this._scaleX();
            },
            calcY: function (realY) {
                return realY * this._scaleY();
            },
            showTool: function () {
                this.toolBar && (this.visibleForTool = true);
            },
            hideTool: function () {
                if (typeof this.beforeHideTool === 'function') {
                    this.beforeHideTool(() => {
                        this._releaseJcrop();
                        this._hideTool();
                    });
                } else {
                    this._releaseJcrop();
                    this._hideTool();
                }
            },
            _releaseJcrop: function () {
                this.jcropApi && this.jcropApi.release();
            },
            _hideTool: function () {
                this.visibleForTool = false;
            }
        },
        mounted() {
            this.fit();
            let self = this;
            this.imgCanvasDom().on('mousewheel', function (e) {
                e.preventDefault();
                e.stopPropagation();
                // 编辑状态下不允许缩放
                if (self.activeTool !== 'drag') {
                    return false;
                }
                var $container = $(this);
                var originEvent = e.originalEvent;

                //wheelDelta的值为正（120.240...）则是鼠标向上；为负（-120，-240）则是向下
                var step = originEvent.wheelDelta > 0 ? 0.2 : -0.2;
                // 限制最大最小缩放
                var maxScale = 2;
                var minScale = 0.2;
                var imgOriginWidth = self.originSize.width;
                var imgWidth = $container.find('.img-container > img').width();
                if ((imgWidth * (1 + step)) / imgOriginWidth > maxScale && step > 0) {
                    return;
                } else if ((imgWidth * (1 + step)) / imgOriginWidth < minScale && step < 0) {
                    return;
                }
                //获取图片的宽高
                var offsetWidth = $container.width();
                var offsetHeight = $container.height();
                //获取图片距离后面那个黑框左上角的距离
                var left = $container.position().left,
                    top = $container.position().top;
                // 图片距离视口的位置,从而确定,当前鼠标距离当前容器左上角的距离
                var offsetPosition = $container.offset(),
                    offsetLeft = offsetPosition.left,
                    offsetTop = offsetPosition.top;
                //获取定点的位置（鼠标在图片上的位置）
                var disX = originEvent.clientX - offsetLeft,
                    disY = originEvent.clientY - offsetTop;

                var sizeW = offsetWidth * step;
                var sizeH = offsetHeight * step;

                let scaleSize = {
                    width: offsetWidth + sizeW,
                    height: offsetHeight + sizeH
                };
                let scalePosition = {
                    left: left - disX * step,
                    top: top - disY * step
                };
                $container.css({
                    width: scaleSize.width + 'px',
                    height: scaleSize.height + 'px',
                    left: scalePosition.left + 'px',
                    top: scalePosition.top + 'px'
                });
                // 裁剪状态下的缩放: img,.jcrop-holder,.jcrop-holder>.jcrop-tracker
                $container.find('img').each(function () {
                    $(this).css({
                        width: $(this).width() * (1 + step) + 'px',
                        height: $(this).height() * (1 + step) + 'px'
                    });
                });
                self._calcScale();
            });
            this.containerDom().on('mousemove', 'img', function (e) {
                e.preventDefault();
            });
            this.containerDom().on('mousedown', '.fam-img-crop-tool_move', function (e) {
                e.stopPropagation();
                if ($(this).data('drag') && $(this).data('drag').length > 0) {
                    var dragClass = $(this).data('drag');
                    if ($(dragClass, $(this)).length === 0) {
                        return;
                    }
                }
                // 编辑状态下不允许移动
                if (self.activeTool !== 'drag') {
                    return;
                }
                var $container = $(this);
                var originEvent = e.originalEvent;
                var startX = originEvent.clientX;
                var startY = originEvent.clientY;
                var position = $(this).position();
                $($container[0].ownerDocument)
                    .on(
                        'mousemove',
                        _.throttle(function (e) {
                            e.stopPropagation();
                            var mouseMoveEvent = e.originalEvent;
                            var currentX = mouseMoveEvent.clientX;
                            var currentY = mouseMoveEvent.clientY;
                            var currentOffset = {
                                left: position.left + currentX - startX,
                                top: position.top + currentY - startY
                            };
                            $container.data('scalePosition', {
                                left: position.left + currentX - startX,
                                top: position.top + currentY - startY
                            });
                            $container.css(currentOffset);
                            self.$emit('moving');
                        }, 50)
                    )
                    .on('mouseup', function () {
                        self.$emit('move-done');
                        $(this).off('mousemove mouseup');
                    });
            });
        }
    };
});
