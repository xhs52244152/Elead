/**
 * 是否纯粹对象
 * reference to jQuery
 * @param {object} obj
 * @return {boolean}
 */
export default function isPlainObject(obj) {
    let proto, Ctor;
    if (!obj || toString.call(obj) !== '[object Object]') {
        return false;
    }
    proto = Object.getPrototypeOf(obj);
    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if (!proto) {
        return true;
    }
    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = Object.hasOwnProperty.call(proto, 'constructor') && proto.constructor;
    return (
        typeof Ctor === 'function' &&
        Object.hasOwnProperty.toString.call(Ctor) === Object.hasOwnProperty.toString.call(Object)
    );
}
