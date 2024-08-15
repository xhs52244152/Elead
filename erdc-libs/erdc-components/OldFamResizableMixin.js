/**
 * @deprecated
 */
define([], function () {
    const getOffset = ($el, offset = { top: 0, left: 0 }) => {
        if ($el.offsetParent) {
            getOffset($el.offsetParent, offset);
        }
        if ($el) {
            offset.top += $el.offsetTop;
            offset.left += $el.offsetLeft;
        }
        return offset;
    };

    return {
        methods: {
            dragControllerLR($drag, { $box, $containerLeft } = {}) {
                const createProxy = function ({ left, top }) {
                    const $el = document.createElement('div');
                    $el.style.position = 'absolute';
                    $el.style.left = left;
                    $el.style.top = top;
                    $el.style.height = '100%';
                    $el.style.borderLeft = '1px solid #D9D9D9';
                    $el.style.zIndex = '10';
                    return $el;
                };
                let startX, moveLen, leftWidth, $ghost;
                const _onMouseDown = function (e) {
                    startX = e.clientX;
                    leftWidth = +$containerLeft.style.width.replace(/\D+/g, '');
                    document.addEventListener('mousemove', _onMouseMove);
                    document.addEventListener('mouseup', _onMouseUp);
                };
                const _onMouseMove = function (e) {
                    let endX = e.clientX;
                    moveLen = endX - startX;
                    e.preventDefault();
                    if ($box) {
                        if (!$ghost) {
                            $ghost = createProxy({ left: e.clientX - getOffset($box.offsetParent).left + 'px' });
                            $box.append($ghost);
                        } else {
                            $ghost.style.display = 'block';
                            $ghost.style.left = e.clientX - getOffset($box.offsetParent).left + 'px';
                        }
                    }
                };
                const _onMouseUp = function () {
                    $containerLeft.style.width = leftWidth + moveLen + 'px';
                    if ($ghost) {
                        $ghost.style.display = 'none';
                    }
                    moveLen = '';
                    document.removeEventListener('mousemove', _onMouseMove);
                    document.removeEventListener('mouseup', _onMouseUp);
                };
                $drag.addEventListener('mousedown', _onMouseDown);
            }
        }
    };
});
