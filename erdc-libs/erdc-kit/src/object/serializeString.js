import isPlainObject from './isPlainObject';

/**
 将 JavaScript 对象序列化为 URL 查询字符串
 * Reference to jQuery.js
 * @example
 * serialize({ foo: 'bar', flag: 1 }); // foo=bar&flag=1
 * serialize({}); // ''
 * serialize({ name: '张三' }); // 'name=%E5%BC%A0%E4%B8%89'
 *
 * @param {Object} sourceObject - 要序列化的 JavaScript 对象。
 * @param {boolean} [traditional=false] - 是否使用传统的方式来处理数组。
 * @return {string} - 序列化后的 URL 查询字符串。
 */
export default function serializeString(sourceObject, traditional) {
    let prefix;
    const s = [];
    const add = (key, valueOrFunction) => {
        // If value is a function, invoke it and use its return value
        const value = typeof valueOrFunction === 'function' ? valueOrFunction() : valueOrFunction;
        s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value == null ? '' : value);
    };
    const buildParams = (prefix, obj, traditional, add) => {
        let name;
        if (Array.isArray(obj)) {
            // Serialize array item.
            _.each(obj, function (i, v) {
                if (traditional || /\[]$/.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);
                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams(
                        prefix + '[' + (typeof v === 'object' && v != null ? i : '') + ']',
                        v,
                        traditional,
                        add
                    );
                }
            });
        } else if (!traditional && typeof obj === 'object') {
            // Serialize object item.
            for (name in obj) {
                buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
            }
        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    };
    if (sourceObject == null) {
        return '';
    }
    // If an array was passed in, assume that it is an array of form elements.
    if (Array.isArray(sourceObject) || !isPlainObject(sourceObject)) {
        // Serialize the form elements
        _.each(sourceObject, function (value, name) {
            add(name, value);
        });
    } else {
        // If traditional, encode the "old" way (the way 1.3.2 or older
        // did it), otherwise encode params recursively.
        for (prefix in sourceObject) {
            buildParams(prefix, sourceObject[prefix], traditional, add);
        }
    }
    // Return the resulting serialization
    return s.join('&');
}
