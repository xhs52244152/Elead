/**
 * 获取元素的offset信息
 * @param {HTMLElement} el
 * @return { { top: number, left: number } }
 */
export default function offset(el) {
    let rect, win;
    if (!el || !el.getClientRects().length) {
        return { top: 0, left: 0 };
    }
    rect = el.getBoundingClientRect();
    win = el.ownerDocument.defaultView;
    return {
        top: rect.top + win.pageYOffset,
        left: rect.left + win.pageXOffset
    };
}
