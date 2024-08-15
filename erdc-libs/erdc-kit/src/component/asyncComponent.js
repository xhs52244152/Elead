import { dirname, parse } from 'path-browserify';

import pascalize from '../string/pascalize';

const componentCache = {};

/**
 * 返回一个异步组件
 * @param {string} uri
 * @return {AsyncComponent}
 */
export default function asyncComponent(uri) {
    const _uri = uri;
    if (componentCache[_uri]) {
        return componentCache[_uri];
    }
    return function () {
        const component = new Promise((resolve, reject) => {
            const dirName = dirname(_uri).split('/').at(-1);
            let fileName = parse(_uri).name;
            window.requirejs(
                [_uri],
                (Component = {}) => {
                    if (fileName === 'index' && dirName) {
                        fileName = dirName;
                    }
                    if (typeof Component !== 'function') {
                        Component.name = Component.name || Component.componentName || pascalize(fileName);
                    }
                    componentCache[_uri] = Component;
                    resolve(Component);
                },
                (err) => {
                    reject(err);
                }
            );
        });

        return {
            component
        };
    };
}
