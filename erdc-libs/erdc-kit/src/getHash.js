/**
 * 获取地址栏 hash 字符串
 * @returns {string}
 */
export default function getHash() {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    let href = window.location.href;
    const index = href.indexOf('#');
    // empty path
    if (index < 0) return '';

    href = href.slice(index + 1);

    return href;
}
