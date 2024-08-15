const _deepClone = function (target, cache = new Map()) {
    const isObject = (obj) => typeof obj === 'object' && obj !== null;

    if (isObject(target)) {
        // 解决循环引用
        const cacheTarget = cache.get(target);
        if (cacheTarget) {
            return cacheTarget;
        }

        let cloneTarget = Array.isArray(target) ? [] : {};
        cache.set(target, cloneTarget);

        if (target instanceof FormData) {
            let result = new FormData();
            for (let [key, value] of target.entries()) {
                result.append(key, value);
            }
            return result;
        }

        for (const key in target) {
            if (Object.hasOwn(target, key)) {
                const value = target[key];
                cloneTarget[key] = isObject(value) ? _deepClone(value, cache) : value;
            }
        }
        return cloneTarget;
    } else {
        return target;
    }
};
/**
 * 简单深拷贝
 * @param {any} target
 * @return {any}
 */
export default function deppClone(target) {
    return _deepClone(target);
}
