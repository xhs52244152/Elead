define([], function () {
    return {
        props: {
            vertical: Boolean
        },
        beforeDestroy() {
            if (this.resize) {
                this.resize.removeEventListener('mousedown', this.handleResizeMousedown);
            }
            this.resize = null;
            this.domStart = null;
            this.domEnd = null;
            this.domBox = null;
        },
        methods: {
            dragControllerDiv: function () {
                if (!this.resize) {
                    return;
                }
                this.resize.addEventListener('mousedown', this.handleResizeMousedown);
            },
            handleResizeMousedown(event) {
                event.preventDefault();
                const _this = this;
                _this.resize.style.background = '#818181';

                const startX = event.clientX;
                const startY = event.clientY;
                if (_this.vertical) {
                    _this.resize.top = _this.resize.offsetTop;
                } else {
                    _this.resize.left = _this.resize.offsetLeft;
                }

                const onMousemove = function (evt) {
                    const endX = evt.clientX;
                    const endY = evt.clientY;

                    let moveLenX = _this.resize.left + (endX - startX);
                    let moveLenY = _this.resize.top + (endY - startY);

                    if (_this.vertical) {
                        const maxY = _this.domBox.clientHeight - _this.resize.offsetHeight;
                        const bottomMinHeight = _this.bottom?.minHeight === undefined ? 150 : _this.bottom?.minHeight;
                        if (moveLenY < _this.top?.minHeight) moveLenY = _this.top?.minHeight;
                        if (moveLenY > maxY - bottomMinHeight) {
                            moveLenY = maxY - bottomMinHeight;
                        }
                    } else {
                        const maxX = _this.domBox.clientWidth - _this.resize.offsetWidth;
                        const rightMinWidth = _this.right?.minWidth === undefined ? 150 : _this.right?.minWidth;
                        if (moveLenX < _this.left?.minWidth) moveLenX = _this.left?.minWidth; // 左边区域的最小宽度
                        if (moveLenX > maxX - rightMinWidth) {
                            moveLenX = maxX - rightMinWidth;
                        }
                    }

                    if (_this.vertical) {
                        _this.resize.style.top = moveLenY;
                        _this.domStart.style.height = moveLenY + 'px';
                        _this.domEnd.style.height = _this.domBox.clientHeight - moveLenY - 10 + 'px';
                    } else {
                        _this.resize.style.left = moveLenX;
                        _this.domStart.style.width = moveLenX + 'px';
                        _this.domEnd.style.width = _this.domBox.clientWidth - moveLenX - 10 + 'px';
                    }
                };
                const onMouseUp = function () {
                    _this.resize.style.background = '#d9d9d9';
                    document.removeEventListener('mousemove', onMousemove);
                    document.removeEventListener('mouseup', onMouseUp);
                    if (_this.resize?.releaseCapture) {
                        _this.resize.releaseCapture();
                    }

                    _this.$emit('update:left', { ..._this.left, width: _this.domStart.style.width });
                    _this.$emit('update:top', { ..._this.top, height: _this.domStart.style.height });
                    _this.$emit('resized', {
                        width: _this.domStart.style.width,
                        height: _this.domStart.style.height,
                        startDom: _this.domStart,
                        endDom: _this.domEnd
                    });
                };
                document.addEventListener('mousemove', onMousemove);
                document.addEventListener('mouseup', onMouseUp);
                if (_this.resize.setCapture) {
                    _this.resize.setCapture();
                }
            }
        }
    };
});
