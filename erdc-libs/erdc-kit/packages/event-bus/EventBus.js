export default class EventBus {
    constructor() {
        this._listeners = {};
    }

    /**
     * 为一个事件类型注册事件，如果之前已经绑定事件，以最新事件为准
     * @param type 事件类型名
     * @param callback 事件回调
     * @param scope 作用域
     * @param args 附带参数
     */
    singleton(type, callback, scope, ...args) {
        this._listeners[type] = [{ scope: scope, callback: callback, args: args }];
    }

    /**
     * 为一个事件类型注册事件，事件触发后自动移除监听
     * @param type 事件类型名
     * @param callback 事件回调
     * @param scope 作用域
     * @param args 附带参数
     */
    once(type, callback, scope, ...args) {
        const that = this;
        this.on(type, function innerCallback(...args) {
            callback.call(scope, ...args);
            that.off(type, innerCallback, scope);
        }, scope, ...args);
    }

    /**
     * 判断事件是否存在
     * @param type 事件类型名
     * @param callback 事件回调
     * @param scope 作用域
     * @returns {boolean}
     */
    has(type, callback, scope) {
        if (typeof this._listeners[type] !== 'undefined') {
            const numOfCallbacks = this._listeners[type].length;
            if (callback === undefined && scope === undefined) {
                return numOfCallbacks > 0;
            }
            for (let i = 0; i < numOfCallbacks; i++) {
                let listener = this._listeners[type][i];
                if ((scope ? listener.scope === scope : true) && listener.callback === callback) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 注销事件
     * @param type 事件类型名
     * @param callback 事件回调
     * @param scope 作用域
     */
    off(type, callback, scope) {
        if (typeof this._listeners[type] !== 'undefined') {
            const newArray = [];
            if (callback && scope) {
                const numOfCallbacks = this._listeners[type].length;
                for (let i = 0; i < numOfCallbacks; i++) {
                    const listener = this._listeners[type][i];
                    if (listener.scope === scope && listener.callback === callback) {
                        // do nothing
                    } else {
                        newArray.push(listener);
                    }
                }
            }
            this._listeners[type] = newArray;
        }
    }

    /**
     * 注册事件，注册多次会被触发多次
     * @param type 事件类型名
     * @param callback 事件回调
     * @param scope 作用域
     * @param args 附带参数
     */
    on(type, callback, scope, ...args) {
        if (typeof this._listeners[type] !== 'undefined') {
            if (this.has(type, callback, scope)) {
                this.off(type, callback, scope);
            }
            this._listeners[type].push({ scope: scope, callback: callback, args: args });
        } else {
            this._listeners[type] = [{ scope: scope, callback: callback, args: args }];
        }
    }

    /**
     * 触发事件
     * @param type 事件类型名
     * @param args 附带参数
     */
    emit(type, ...args) {
        const event = {
            type: type
        };

        if (typeof this._listeners[type] !== 'undefined') {
            const listeners = this._listeners[type].slice();
            const numOfCallbacks = listeners.length;
            for (let j = 0; j < numOfCallbacks; j++) {
                let listener = listeners[j];
                if (listener && listener.callback) {
                    let concatArgs = [event, ...args, ...listener.args];
                    listener.callback.apply(listener.scope, concatArgs);
                }
            }
        }
    }


    /**
     * 获取已注册事件信息
     * @returns {array}
     */
    info() {
        const result = [];
        for (const type in this._listeners) {
            const numOfCallbacks = this._listeners[type].length;
            result[type] = [];
            for (let i = 0; i < numOfCallbacks; i++) {
                const listener = this._listeners[type][i];
                result[type].push(listener);
            }
        }
        return result;
    }
}
