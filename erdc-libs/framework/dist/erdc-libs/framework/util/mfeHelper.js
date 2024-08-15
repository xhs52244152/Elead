define(['erdcloud.store', 'erdcloud.kit', 'TreeUtil', 'erdcloud.router'], function (
    erdcloudStore,
    ErdcloudKit,
    TreeUtil
) {
    // path-to-regex截取----------------开始---------------------
    function flags(options) {
        return options && options.sensitive ? '' : 'i';
    }
    function escapeString(str) {
        return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
    }
    function tokensToFunction(tokens, options) {
        if (options === void 0) {
            options = {};
        }
        var reFlags = flags(options);
        var _a = options.encode,
            encode =
                _a === void 0
                    ? function (x) {
                          return x;
                      }
                    : _a,
            _b = options.validate,
            validate = _b === void 0 ? true : _b;
        // Compile all the tokens into regexps.
        var matches = tokens.map(function (token) {
            if (typeof token === 'object') {
                return new RegExp('^(?:'.concat(token.pattern, ')$'), reFlags);
            }
        });
        return function (data) {
            var path = '';
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                if (typeof token === 'string') {
                    path += token;
                    continue;
                }
                var value = data ? data[token.name] : undefined;
                var optional = token.modifier === '?' || token.modifier === '*';
                var repeat = token.modifier === '*' || token.modifier === '+';
                if (Array.isArray(value)) {
                    if (!repeat) {
                        throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
                    }
                    if (value.length === 0) {
                        if (optional) continue;
                        throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
                    }
                    for (var j = 0; j < value.length; j++) {
                        var segment = encode(value[j], token);
                        if (validate && !matches[i].test(segment)) {
                            throw new TypeError(
                                'Expected all "'
                                    .concat(token.name, '" to match "')
                                    .concat(token.pattern, '", but got "')
                                    .concat(segment, '"')
                            );
                        }
                        path += token.prefix + segment + token.suffix;
                    }
                    continue;
                }
                if (typeof value === 'string' || typeof value === 'number') {
                    let segment = encode(String(value), token);
                    if (validate && !matches[i].test(segment)) {
                        throw new TypeError(
                            'Expected "'
                                .concat(token.name, '" to match "')
                                .concat(token.pattern, '", but got "')
                                .concat(segment, '"')
                        );
                    }
                    path += token.prefix + segment + token.suffix;
                    continue;
                }
                if (optional) continue;
                var typeOfMessage = repeat ? 'an array' : 'a string';
                throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
            }
            return path;
        };
    }
    function lexer(str) {
        var tokens = [];
        var i = 0;
        while (i < str.length) {
            var char = str[i];
            if (char === '*' || char === '+' || char === '?') {
                tokens.push({ type: 'MODIFIER', index: i, value: str[i++] });
                continue;
            }
            if (char === '\\') {
                tokens.push({ type: 'ESCAPED_CHAR', index: i++, value: str[i++] });
                continue;
            }
            if (char === '{') {
                tokens.push({ type: 'OPEN', index: i, value: str[i++] });
                continue;
            }
            if (char === '}') {
                tokens.push({ type: 'CLOSE', index: i, value: str[i++] });
                continue;
            }
            if (char === ':') {
                var name = '';
                var j = i + 1;
                while (j < str.length) {
                    var code = str.charCodeAt(j);
                    if (
                        // `0-9`
                        (code >= 48 && code <= 57) ||
                        // `A-Z`
                        (code >= 65 && code <= 90) ||
                        // `a-z`
                        (code >= 97 && code <= 122) ||
                        // `_`
                        code === 95
                    ) {
                        name += str[j++];
                        continue;
                    }
                    break;
                }
                if (!name) throw new TypeError('Missing parameter name at '.concat(i));
                tokens.push({ type: 'NAME', index: i, value: name });
                i = j;
                continue;
            }
            if (char === '(') {
                var count = 1;
                var pattern = '';
                let j = i + 1;
                if (str[j] === '?') {
                    throw new TypeError('Pattern cannot start with "?" at '.concat(j));
                }
                while (j < str.length) {
                    if (str[j] === '\\') {
                        pattern += str[j++] + str[j++];
                        continue;
                    }
                    if (str[j] === ')') {
                        count--;
                        if (count === 0) {
                            j++;
                            break;
                        }
                    } else if (str[j] === '(') {
                        count++;
                        if (str[j + 1] !== '?') {
                            throw new TypeError('Capturing groups are not allowed at '.concat(j));
                        }
                    }
                    pattern += str[j++];
                }
                if (count) throw new TypeError('Unbalanced pattern at '.concat(i));
                if (!pattern) throw new TypeError('Missing pattern at '.concat(i));
                tokens.push({ type: 'PATTERN', index: i, value: pattern });
                i = j;
                continue;
            }
            tokens.push({ type: 'CHAR', index: i, value: str[i++] });
        }
        tokens.push({ type: 'END', index: i, value: '' });
        return tokens;
    }
    function parse(str, options) {
        if (options === void 0) {
            options = {};
        }
        var tokens = lexer(str);
        var _a = options.prefixes,
            prefixes = _a === void 0 ? './' : _a;
        var defaultPattern = '[^'.concat(escapeString(options.delimiter || '/#?'), ']+?');
        var result = [];
        var key = 0;
        var i = 0;
        var path = '';
        var tryConsume = function (type) {
            if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
        };
        var mustConsume = function (type) {
            var value = tryConsume(type);
            if (value !== undefined) return value;
            var _a = tokens[i],
                nextType = _a.type,
                index = _a.index;
            throw new TypeError('Unexpected '.concat(nextType, ' at ').concat(index, ', expected ').concat(type));
        };
        var consumeText = function () {
            var result = '';
            var value;
            while ((value = tryConsume('CHAR') || tryConsume('ESCAPED_CHAR'))) {
                result += value;
            }
            return result;
        };
        while (i < tokens.length) {
            var char = tryConsume('CHAR');
            var name = tryConsume('NAME');
            var pattern = tryConsume('PATTERN');
            if (name || pattern) {
                var prefix = char || '';
                if (prefixes.indexOf(prefix) === -1) {
                    path += prefix;
                    prefix = '';
                }
                if (path) {
                    result.push(path);
                    path = '';
                }
                result.push({
                    name: name || key++,
                    prefix: prefix,
                    suffix: '',
                    pattern: pattern || defaultPattern,
                    modifier: tryConsume('MODIFIER') || ''
                });
                continue;
            }
            var value = char || tryConsume('ESCAPED_CHAR');
            if (value) {
                path += value;
                continue;
            }
            if (path) {
                result.push(path);
                path = '';
            }
            var open = tryConsume('OPEN');
            if (open) {
                let prefix = consumeText();
                var name_1 = tryConsume('NAME') || '';
                var pattern_1 = tryConsume('PATTERN') || '';
                var suffix = consumeText();
                mustConsume('CLOSE');
                result.push({
                    name: name_1 || (pattern_1 ? key++ : ''),
                    pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                    prefix: prefix,
                    suffix: suffix,
                    modifier: tryConsume('MODIFIER') || ''
                });
                continue;
            }
            mustConsume('END');
        }
        return result;
    }
    function stringToRegexpCompile(str, options) {
        if (_.isEmpty(str)) return;
        return tokensToFunction(parse(str, options), options);
    }
    function tokensToRegexp(tokens, keys, options) {
        if (options === void 0) {
            options = {};
        }
        var _a = options.strict,
            strict = _a === void 0 ? false : _a,
            _b = options.start,
            start = _b === void 0 ? true : _b,
            _c = options.end,
            end = _c === void 0 ? true : _c,
            _d = options.encode,
            encode =
                _d === void 0
                    ? function (x) {
                          return x;
                      }
                    : _d,
            _e = options.delimiter,
            delimiter = _e === void 0 ? '/#?' : _e,
            _f = options.endsWith,
            endsWith = _f === void 0 ? '' : _f;
        var endsWithRe = '['.concat(escapeString(endsWith), ']|$');
        var delimiterRe = '['.concat(escapeString(delimiter), ']');
        var route = start ? '^' : '';
        // Iterate over the tokens and create our regexp string.
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            if (typeof token === 'string') {
                route += escapeString(encode(token));
            } else {
                var prefix = escapeString(encode(token.prefix));
                var suffix = escapeString(encode(token.suffix));
                if (token.pattern) {
                    if (keys) keys.push(token);
                    if (prefix || suffix) {
                        if (token.modifier === '+' || token.modifier === '*') {
                            var mod = token.modifier === '*' ? '?' : '';
                            route += '(?:'
                                .concat(prefix, '((?:')
                                .concat(token.pattern, ')(?:')
                                .concat(suffix)
                                .concat(prefix, '(?:')
                                .concat(token.pattern, '))*)')
                                .concat(suffix, ')')
                                .concat(mod);
                        } else {
                            route += '(?:'
                                .concat(prefix, '(')
                                .concat(token.pattern, ')')
                                .concat(suffix, ')')
                                .concat(token.modifier);
                        }
                    } else {
                        if (token.modifier === '+' || token.modifier === '*') {
                            route += '((?:'.concat(token.pattern, ')').concat(token.modifier, ')');
                        } else {
                            route += '('.concat(token.pattern, ')').concat(token.modifier);
                        }
                    }
                } else {
                    route += '(?:'.concat(prefix).concat(suffix, ')').concat(token.modifier);
                }
            }
        }
        if (end) {
            if (!strict) route += ''.concat(delimiterRe, '?');
            route += !options.endsWith ? '$' : '(?='.concat(endsWithRe, ')');
        } else {
            var endToken = tokens[tokens.length - 1];
            var isEndDelimited =
                typeof endToken === 'string'
                    ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1
                    : endToken === undefined;
            if (!strict) {
                route += '(?:'.concat(delimiterRe, '(?=').concat(endsWithRe, '))?');
            }
            if (!isEndDelimited) {
                route += '(?='.concat(delimiterRe, '|').concat(endsWithRe, ')');
            }
        }
        return new RegExp(route, flags(options));
    }
    function stringToRegexp(path, keys, options) {
        return tokensToRegexp(parse(path, options), keys, options);
    }
    // path-to-regex截取----------------结束---------------------

    // vue-router 代码截取-------------------开始-----------------
    function decode(str) {
        try {
            return decodeURIComponent(str);
        } catch (err) {
            // console.log(err)
        }
        return str;
    }

    /**
     *
     * @param regex stringToRegexp 返回的正则
     * @param path
     * @param params
     * @returns {boolean}
     */
    function matchRoute(regex, path, params) {
        const m = path.match(regex);
        if (!m) {
            return false;
        } else if (!params) {
            return true;
        }
        for (let i = 1, len = m.length; i < len; ++i) {
            const key = regex.keys[i - 1];
            if (key) {
                // Fix #1994: using * with props: true generates a param named 0
                params[key.name || 'pathMatch'] = typeof m[i] === 'string' ? decode(m[i]) : m[i];
            }
        }
        return true;
    }
    // vue-router 代码截取-------------------结束-----------------
    //
    function normalizePath(path) {
        return path?.replace(/^\//, '').replace(/\/\//g, '/');
    }

    const matchResourcePath = () => (route, resources) => {
        route = route || {};
        const { matched = [] } = route;
        function matcher(route, index, matchType) {
            if (!route) {
                return [];
            }
            const { fullPath, path, meta } = route;
            if (_.isEmpty(resources)) {
                resources = erdcloudStore.state.mfe.menus;
            }
            if (!_.isArray(resources)) {
                resources = [resources];
            }
            const resourcePath = TreeUtil.findPath(resources, {
                target(resource) {
                    return matchType === 'path'
                        ? [normalizePath(fullPath), normalizePath(path)]
                              .filter((i) => !!i)
                              .some((i) => {
                                  if (resource.href && i) {
                                      let tempSourceHref = resource.href.split('?')[0];
                                      let tempIHref = i.split('?')[0];
                                      return matchRoute(stringToRegexp(normalizePath(tempSourceHref)), tempIHref);
                                  }
                                  return false;
                              })
                        : [
                              matchType === 'resourceCode' && meta?.resourceCode ? meta.resourceCode : route.name
                          ].includes(resource.identifierNo);
                }
            });
            if (!resourcePath.length) {
                index++;
                return matcher(matched?.[index], index);
            }
            return resourcePath || [];
        }

        let result = matcher(route, 0, 'resourceCode');
        if (!result.length) {
            result = matcher(route, 0, 'name');
            if (!result.length) {
                result = matcher(route, 0, 'path');
            }
        }
        return result;
    };

    /**
     * 通过将微功能路由拼接上前缀, 微功能的路由
     */
    function relateRouteAndMenuInfo(routes, parentPath) {
        // initPrefixRoute = initPrefixRoute || prefixRoute;
        parentPath = parentPath || '';
        if (!_.isArray(routes)) {
            routes = [routes];
        }
        _.each(routes, (route) => {
            let path = route.path.startsWith('/')
                ? `/${route.meta.prefixRoute}${parentPath}${route.path}`
                : `${route.meta.prefixRoute}${parentPath}/${route.path}`;
            if (path.endsWith('/')) {
                path = path.substring(0, path.length - 1);
            }
            let tempRoute = ErdcloudKit.deepClone(route);
            tempRoute.path = path;
            let menuInfo = erdcloudStore.getters['mfe/matchResourcePath'](tempRoute)?.at(-1);
            if (menuInfo) {
                let menuMeta = menuInfo?.meta || {};
                menuMeta = Object.assign(
                    {
                        title: ErdcloudKit.translateI18n(menuInfo?.nameI18nJson),
                        titleI18nJson: menuInfo?.nameI18nJson
                    },
                    menuMeta,
                    route.meta,
                    {
                        resourceCode: menuInfo?.identifierNo
                    },
                    _.isUndefined(route.meta?.keepAlive)
                        ? {
                              keepAlive: true
                          }
                        : {}
                );
                route.meta = menuMeta;
                let namePrefix = menuInfo?.identifierNo ? `${menuInfo?.identifierNo}_` : '';
                route.name && (route.name = `${namePrefix}${route.name}`);
            } else {
                route.meta = Object.assign(
                    route.meta || {},
                    _.isUndefined(route.meta?.keepAlive)
                        ? {
                              keepAlive: true
                          }
                        : {}
                );
            }
            if (route.children && route.children.length > 0) {
                relateRouteAndMenuInfo(route.children, path.replace(route.meta.prefixRoute, ''));
            }
        });
    }

    /**
     * 将微功能的meta里面的_fullPath填充完整
     * @param routes
     * @param parentPath
     */
    function fillFullPath(routes, parentPath) {
        parentPath = parentPath || '';
        _.each(routes, function (route) {
            route.meta = route.meta || {};
            route.meta._fullPath = route.path.startsWith('/') ? route.path : `${parentPath}/${route.path}`;
            if (route.children && route.children.length > 0) {
                fillFullPath(route.children, route.meta._fullPath);
            }
        });
    }

    /**
     * 调整微功能下路由的前缀
     * 同一个微功能下,parentRouteCode可能不同，不能用当前的前缀补充全部的前缀
     * @param routes
     * @param resourceKey
     */
    function adjustPrefixRoute(routes, resourceKey, prefixRoute) {
        // let parentRoutePathMap = {};
        _.each(routes, (route) => {
            route.meta = route.meta || {};
            // let parentRouteCode = route?.meta?.parentRouteCode || 'root';
            // if (!parentRoutePathMap[parentRouteCode]) {
            //     let parentRoute = erdcloudRouter.resolve({
            //         name: parentRouteCode
            //     });
            //     parentRoutePathMap[parentRouteCode] =
            //         parentRoute.route.fullPath === '/' ? '' : parentRoute.route.fullPath;
            // }

            route.meta.prefixRoute = prefixRoute; //`${parentRoutePathMap[parentRouteCode]}${prefixRoute}`;
            // route.meta.prefixRoute = `${prefixRoute}/${resourceKey}`;
            route.meta.resourceKey = resourceKey;
            // route.meta._fullPath = route.path.startsWith('/') ? route.path : `/${route.path}`;

            if (route.children && route.children.length > 0) {
                recursionSetPrefixRoute(route.children, route.meta.prefixRoute, resourceKey, route.meta._fullPath);
            }
        });
    }
    function recursionSetPrefixRoute(routes, prefixRoute, resourceKey) {
        _.each(routes, (route) => {
            route.meta = route.meta || {};
            route.meta.prefixRoute = prefixRoute;
            route.meta.resourceKey = resourceKey;
            // route.meta._fullPath = route.path.startsWith('/') ? route.path : `${parentPath}/${route.path}`;
            if (route.children && route.children.length > 0) {
                recursionSetPrefixRoute(route.children, prefixRoute, resourceKey, route.meta._fullPath);
            }
        });
    }
    function parseErdcData(lists) {
        lists.forEach((i) => {
            if (i.erdcData && _.isString(i.erdcData)) {
                try {
                    i.erdcData = JSON.parse(i.erdcData);
                } catch (e) {
                    console.log(e);
                }
            }
        });
    }
    function extractCustomInfo(resources) {
        let customMapping = {};
        resources.forEach((i) => {
            if (i?.erdcData?.originName && i.erdcData.originName !== i.code) {
                customMapping[i.erdcData.originName] = i.code;
            }
        });
        return customMapping;
    }
    return {
        /**
         * 将VueRouter的路由转为正则表达式，从而可以找到符合规则的地址
         * eg: /workflowActivator/OR:erd.cloud.bpm.pbo.entity.ProcessInstance:1753315239545524225 = /workflowActivator/:pid
         */
        stringToRegexp,
        stringToRegexpCompile,
        matchRoute,
        normalizePath,
        extractCustomInfo,
        parseErdcData,
        adjustPrefixRoute,
        fillFullPath,
        relateRouteAndMenuInfo,
        matchResourcePath
    };
});
