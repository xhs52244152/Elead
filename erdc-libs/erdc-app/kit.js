define(['erdcloud.kit', 'erdcloud.http', 'erdcloud.i18n', 'vue', 'erdcloud.store'], function (
    erdcloudKit,
    erdcloudHttp,
    ErdcloudI18n,
    Vue,
    ErdcloudStore
) {
    function getPublicKey() {
        return erdcloudHttp.get('/fam/public/publickey');
    }

    function getDurationByMessage(message, type) {
        let duration;
        if (!message || message?.length <= 30) {
            duration = type === 'error' ? 3000 : 2000;
        } else if (message?.length <= 60) {
            duration = type === 'error' ? 3500 : 3000;
        } else if (message?.length <= 128) {
            duration = type === 'error' ? 4000 : 3500;
        } else if (message?.length <= 256) {
            duration = type === 'error' ? 5000 : 4000;
        } else {
            duration = type === 'error' ? 0 : 3000;
        }
        return duration;
    }

    function encrypt({ password, publicKey }) {
        return new Promise((resolve) => {
            require(['jsencrypt'], function (JSEncrypt) {
                const encrypt = new JSEncrypt();
                encrypt.setPublicKey(publicKey);
                resolve(encrypt.encrypt(password));
            });
        });
    }

    let erdcAuthIns = null;
    // 防抖定时器
    var debounceTimer = null;
    const defaultFileServeClassName = 'erd.cloud.site.console.file.entity.FileInfo';

    /**
     * 防抖方法 全局防抖 非次数防抖
     * @param {function} fn
     * @param {Number} awit 间隔时间戳
     * **/
    const debounceFn = function (fn, awit) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fn && fn();
        }, awit);
        return debounceTimer;
    };

    /**
     * 生成map储存对象
     * @param {obj} obj 要处理的对象
     * **/
    const creatMapByObj = function (obj) {
        const mapObj = new Map();
        // 存储到map
        Object.keys(obj).forEach((key) => {
            mapObj.set(key, obj[key]);
        });
        return mapObj;
    };

    /**
     * 获取系统当前语言配置
     * @returns {string} EN CN
     * **/
    const getLanguageBySystem = function () {
        const language = window.LS.get('lang_current');
        let lanMap = {
            'zh-CN': 'CN',
            zh_cn: 'CN',
            en_us: 'EN',
            'en-US': 'EN'
        };
        return language ? (lanMap[language] ?? language) : 'CN';
    };

    /**
     * 根据当前语言环境动态设置文案
     * @param {obj} textObj --> 文案对象 {EN:'',CN:''}
     * @param {string} language --> 外部直接传进来的当前语言
     * **/
    const setTextBySysLanguage = function (textObj, language) {
        const lan = getLanguageBySystem() || language;
        return textObj[lan] || '';
    };

    // 获取节点图标
    const getNodeIcon = function (propertyMap) {
        var iconName = '';
        Object.keys(propertyMap).forEach(function (key) {
            if (propertyMap[key].name === 'icon') {
                if (propertyMap[key].propertyValue) {
                    if (propertyMap[key].propertyValue.i18nValue === 'WTUnknown.gif') {
                        iconName = '';
                    } else {
                        iconName = 'erd-iconfont erd-icon-' + propertyMap[key].propertyValue.i18nValue;
                    }
                } else {
                    iconName = '';
                }
            }
        });
        return iconName;
    };

    /**
     * 对象数组去重
     * @param {Array} arr 数组
     * @param {String} key 要去重的key
     * @retur Array
     * **/
    const uniqBy = function (arr, key) {
        let result = [];
        let index = []; // 重复值的下标
        for (let i = 0; i < arr.length; i++) {
            const keyOne = arr[i][key];
            for (let j = i + 1; j < arr.length; j++) {
                const keyTwo = arr[j][key];
                if (keyOne === keyTwo) {
                    index.push(j);
                }
            }
            if (!index.includes(i)) {
                result.push(arr[i]);
            }
        }
        return result;
    };

    /**
     * 复制内容到粘贴板
     * @param {String} text -- 需要复制内容
     * **/
    const copyTxt = function (text) {
        if (window.parent.navigator.clipboard) {
            return window.parent.navigator.clipboard.writeText(text);
        } else {
            let textarea = document.createElement('textarea');
            document.body.appendChild(textarea);
            // 隐藏此输入框
            textarea.style.position = 'fixed';
            textarea.style.clip = 'rect(0 0 0 0)';
            textarea.style.opacity = 0;
            textarea.style.top = '10px';
            // 赋值
            textarea.value = text;
            // 选中
            textarea.select();
            return new Promise((resolve, reject) => {
                // 复制
                document.execCommand('copy', true) ? resolve() : reject();
                // 移除输入框
                document.body.removeChild(textarea);
            });
        }
    };

    /**
     * blob转Base64
     * **/
    const blobToBase64 = function (blob, callback) {
        if (!blob) return callback && callback('');
        let reader = new FileReader();
        reader.readAsDataURL(blob); // 转换为base64
        reader.onload = function () {
            callback(reader);
        };
    };

    const downloadContentFile = function (contentId, className, callback = downloadFileByBrowser) {
        if (!/^[0-9]+$/.test(contentId)) {
            console.log(new Error('contentId 是一个Long类型'));
            return;
        }
        const defaultConfig = {
            url: urlServicePrefix('/file/content/file/pre/download', className),
            data: {
                id: contentId
            }
        };
        return erdcloudHttp(defaultConfig).then(({ data }) => {
            let noAuthDownloadUrl = urlServicePrefix('/file/content/file/noauth/download', className);
            callback(`${noAuthDownloadUrl}?token=${data}`);
        });
    };

    function rgbaToHexAndOpacity(rgba) {
        let rgbaArray = rgba
            .toLowerCase()
            .replace('rgba', '')
            .replace('rgb', '')
            .replace('(', '')
            .replace(')', '')
            .split(',');
        // 将每个RGB值转换为十六进制，并补零
        if (rgbaArray && rgbaArray.length > 2) {
            let hex =
                '#' +
                ('0' + rgbaArray[0].toString(16)).slice(-2) +
                ('0' + rgbaArray[1].toString(16)).slice(-2) +
                ('0' + rgbaArray[2].toString(16)).slice(-2);

            let opacity = rgbaArray[3] || '0.09';
            opacity = parseFloat(opacity) * 100;

            return { color: hex.toUpperCase(), opacity };
        } else {
            return { color: rgba, opacity: 0.09 };
        }
    }

    /**
     *
     * @param fileId {String} - UUID
     * @param authCode {String} - 通过调用自己业务端提供的方法,返回的授权码
     * @param needValidateUser {Boolean} - 是否需要在cookie里面带上 Authorization
     * @param callback {Function} - 调用了相应接口之后的回调处理，下载的话，就通过a标签下载,下载并添加水印，则弹框跳转到我的导出
     * @param securityLabel {String} - 文件的密级，暂未使用
     * @param watermark {Boolean} - 是否需要打水印
     * @param watermarkOption {Object} - 水印配置项，参考erdcloudUI的水印组件
     */
    const downloadFile = function (
        fileId,
        authCode,
        needValidateUser = true,
        callback,
        securityLabel,
        watermark,
        watermarkOption
    ) {
        if (_.isObject(fileId)) {
            let options = fileId;
            fileId = options.fileId;
            authCode = options.authCode;
            needValidateUser = options.needValidateUser;
            callback = options.callback;
            securityLabel = options.securityLabel;
            watermark = options.watermark;
            watermarkOption = options.watermarkOption;
            downloadFile(fileId, authCode, needValidateUser, callback, securityLabel, watermark, watermarkOption);
        } else {
            if (!authCode) {
                console.error(new Error('authCode 是必须传的'));
                return;
            }
            if (_.isUndefined(watermark)) {
                var erdcloudRouter = require('erdcloud.router');
                if (erdcloudRouter.currentRoute.query.pid) {
                    watermark = ErdcloudStore.state.space.context.watermark;
                } else {
                    watermark = ErdcloudStore.state.app.user.watermark;
                }
            }
            if (watermark) {
                let watermarkOption = {
                    content: ErdcloudStore.state.app.user.displayName + ' ' + ErdcloudStore.state.app.user.email,
                    contentType: 'TEXT',
                    paveStyle: '2',
                    angle: 30
                };
                let frontedWaterOption;
                if (_.isFunction(window.ELCONF.watermark.option)) {
                    frontedWaterOption = window.ELCONF.watermark.option();
                } else {
                    frontedWaterOption = window.ELCONF.watermark.option || {};
                }
                if (_.isFunction(ELCONF.watermark.content)) {
                    ELCONF.watermark.content(watermarkOption);
                }
                if (frontedWaterOption.font && frontedWaterOption.font.color) {
                    let colorResult = rgbaToHexAndOpacity(frontedWaterOption.font.color);
                    watermarkOption.color = colorResult.color;
                    watermarkOption.opacity = colorResult.opacity;
                }
                if (frontedWaterOption.font && frontedWaterOption.font.fontSize) {
                    watermarkOption.size = parseInt(frontedWaterOption.font.fontSize);
                }
                if (frontedWaterOption.font && frontedWaterOption.font.rotate) {
                    watermarkOption.angle = parseInt(frontedWaterOption.font.rotate);
                }
                callback =
                    callback ||
                    function (url) {
                        let formData = new FormData();
                        formData.append('fileId', fileId);
                        _.each(watermarkOption, (val, key) => {
                            formData.append(key, val);
                        });
                        erdcloudHttp
                            .post(url, formData, {
                                errorMessage: false
                            })
                            .then((resp) => {
                                if (resp.success) {
                                    Vue.prototype.$message({
                                        type: 'success',
                                        dangerouslyUseHTMLString: true,
                                        message: ErdcloudI18n.translate('downloadingAndWatermark'),
                                        showClose: true
                                    });
                                } else {
                                    downloadFile(
                                        fileId,
                                        authCode,
                                        needValidateUser,
                                        null,
                                        securityLabel,
                                        false,
                                        watermarkOption
                                    );
                                }
                            })
                            .catch(() => {
                                downloadFile(
                                    fileId,
                                    authCode,
                                    needValidateUser,
                                    null,
                                    securityLabel,
                                    false,
                                    watermarkOption
                                );
                            });
                    };
                let url = urlServicePrefix('/doc/watermark/v1/file/export', 'erd.cloud.watermark.entity.DocWatermark');
                url = `${url}?authCode=${authCode}`;
                if (needValidateUser) {
                    getErdcAuth()
                        .then((erdcAuthIns) => {
                            erdcAuthIns.tempToken().then((tempToken) => {
                                url = `${url}&Authorization=${tempToken}`;
                                callback(url);
                            });
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    callback(url);
                }
            } else {
                callback = callback || downloadFileByBrowser;
                let service = ErdcloudStore.state.app.fileSite?.serverAddr || '';
                let defaultAction = `/file/file/site/storage/v1/${fileId}/download`;
                let url = `${service}${urlServicePrefix(defaultAction, defaultFileServeClassName)}`;
                url = `${url}?authCode=${authCode}`;
                if (needValidateUser) {
                    getErdcAuth()
                        .then((erdcAuthIns) => {
                            erdcAuthIns.tempToken().then((tempToken) => {
                                url = `${url}&Authorization=${tempToken}`;
                                callback(url);
                            });
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    callback(url);
                }
            }
        }
    };
    /**
     * 图片存在单独的一个接口，不需要鉴权，所以单独进行处理
     * @param fileId UUID
     */
    const downloadImgFile = function (fileId) {
        downloadFileByBrowser(imgUrlCreator(fileId));
    };
    const imgUrlCreator = function (fileId, params) {
        if (fileId.indexOf('/') > -1) {
            return fileId;
        }
        let service = ErdcloudStore.state.app.fileSite?.serverAddr || '';
        let defaultAction = `/file/file/site/storage/v1/img/${fileId}/download`;
        let url = `${service}${urlServicePrefix(defaultAction, defaultFileServeClassName)}`;
        return erdcloudKit.joinUrl(url, params || {});
    };
    const downloadFileByBrowser = function (url, filename) {
        if (!url) return;
        try {
            let link = document.createElement('a'); //创建a标签
            link.style.display = 'none'; //使其隐藏
            link.href = url; //赋予文件下载地址
            link.setAttribute('download', filename); //设置下载属性 以及文件名
            document.body.appendChild(link); //a标签插至页面中
            link.click(); //强制触发a标签事件
            document.body.removeChild(link);
        } catch (e) {
            console.log(e);
        }
    };
    const getImgBase64 = function (src, options = {}) {
        return erdcloudHttp({
            method: options.method || 'get',
            url: src,
            type: 'file', // 标准指定非标准结果接口
            data: options.data || {},
            responseType: 'blob'
        }).then((res) => {
            return new Promise((resolve) => {
                blobToBase64(res.data, (reader) => {
                    resolve(reader.result);
                });
            });
        });
    };

    const downFile = function (options = {}) {
        const getFile = (res, fileName) => {
            // 文件描述
            const contentDisposition = res?.headers?.['content-disposition'] || '';
            // 类型
            const contentType = res?.headers?.['content-type'] || '';
            const suffix = contentType ? contentType.split('/')[1] : '';
            let dispositionArr = contentDisposition.match(/(filename=(.*))(?=;)|(filename=(.*))$/) || [];
            dispositionArr = dispositionArr.filter((item) => item).map((item) => item.replace(/\\/gi, ''));

            const name = dispositionArr[2] || dispositionArr[4] || (suffix ? 'download.' + suffix : '');

            let newFileName = fileName || name;
            if (!newFileName) {
                throw new Error(`[下载出错 error] 文件名称未传${fileName},eg:download.xlsx`);
            }
            // 去除双引号
            newFileName = newFileName.replace(/"/gi, '');
            const blob = new Blob([res.data]);
            // 创建 url 并指向 blob
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            // 兼容
            if (typeof a.download === 'undefined') {
                a.setAttribute('target', '_blank');
            }
            a.href = url;

            a.download = decodeURIComponent(newFileName);
            // 模拟下载
            a.click();
            // 释放该 ur
            window.URL.revokeObjectURL(url);
        };
        let $notify;
        let percentage = typeof options?.percentage === 'undefined' ? true : options?.percentage;

        if (options?.notify) {
            $notify = Vue.prototype.$notify({
                title: ErdcloudI18n.translate('info'),
                type: 'info',
                duration: '0',
                message: ErdcloudI18n.translate('downloading')
            });
        }
        return erdcloudHttp({
            method: options.method || 'get',
            url: options.url || '',
            className: options.className,
            type: 'file', // 标准指定非标准结果接口
            data: options.data || {},
            responseType: 'blob',
            onDownloadProgress:
                options?.notify && percentage
                    ? function (progressEvent) {
                          if (progressEvent.lengthComputable && progressEvent.total > 0) {
                              $notify.message = ErdcloudI18n.translate('downloadingWithPercentage', {
                                  percentage: (progressEvent.loaded / progressEvent.total) * 100
                              });
                          }
                      }
                    : null
        })
            .then((res) => {
                getFile(res, options.fileName || '');
                if ($notify) {
                    $notify.message = ErdcloudI18n.translate('downloadSuccess');
                    $notify.type = 'success';
                } else {
                    Vue.prototype.$message({
                        message: ErdcloudI18n.translate('downloadSuccess'),
                        type: 'success'
                    });
                }
            })
            .catch(() => {
                if ($notify) {
                    $notify.title = ErdcloudI18n.translate('error');
                    $notify.message = ErdcloudI18n.translate('downloadFailed');
                    $notify.type = 'error';
                } else {
                    Vue.prototype.$message({
                        message: ErdcloudI18n.translate('downloadFailed'),
                        type: 'error'
                    });
                }
            })
            .finally(() => {
                if ($notify) {
                    setTimeout(() => {
                        $notify.close();
                    }, 3000);
                }
            });
    };

    /**
     * XEUtills
     * 从树结构中查找匹配第一条数据的键、值、路径
     * @param {Object} obj 对象/数组
     * @param {Function} iterate(item, index, items, path, parent, nodes) 回调
     * @param {Object} options {children: 'children'}
     * @param {Object} context 上下文
     * @return {Object} { item, index, items, path, parent, nodes }
     */
    function helperCreateTreeFunc(handle) {
        return function (obj, iterate, options, context) {
            const opts = options || {};
            const optChildren = opts.children || 'children';
            return handle(null, obj, iterate, context, [], [], optChildren, opts);
        };
    }

    function findTreeItem(parent, obj, iterate, context, path, node, parseChildren, opts) {
        if (obj) {
            var item, index, len, paths, nodes, match;
            for (index = 0, len = obj.length; index < len; index++) {
                item = obj[index];
                paths = path.concat(['' + index]);
                nodes = node.concat([item]);
                if (iterate.call(context, item, index, obj, paths, parent, nodes)) {
                    return { index: index, item: item, path: paths, items: obj, parent: parent, nodes: nodes };
                }
                if (parseChildren && item) {
                    match = findTreeItem(
                        item,
                        item[parseChildren],
                        iterate,
                        context,
                        paths.concat([parseChildren]),
                        nodes,
                        parseChildren,
                        opts
                    );
                    if (match) {
                        return match;
                    }
                }
            }
        }
    }

    const findTree = helperCreateTreeFunc(findTreeItem);

    /**
     * 获取拖拽后的表格数据
     * @param params
     * **/
    const getTableDataByDrag = (params = {}) => {
        // 配置的树key名称
        const options = { children: params.childrenKey || 'children', selfKey: params.selfKey || 'id' };
        const targetTrElem = params.item || {};
        const prevTrElem = targetTrElem.previousElementSibling;
        const tableTreeData = params.tableData || [];
        const selfRow = params.$table.getRowNode(targetTrElem).item;
        const selfNode = findTree(tableTreeData, (row) => row === selfRow, options); // 当前拖拽节点

        if (prevTrElem) {
            // 移动到节点
            const prevRow = params.$table.getRowNode(prevTrElem).item;
            const prevNode = findTree(tableTreeData, (row) => row === prevRow, options);
            let currRow = selfNode.items.splice(selfNode.index, 1)[0];

            if (params.$table.isTreeExpandByRow(prevRow)) {
                // 移动到当前的子节点
                prevRow[options.children].splice(0, 0, currRow);
            } else {
                if (params.isEmbedded) {
                    // 作为当前元素的子集
                    if (!prevNode.items[prevNode.index][options.children]) {
                        prevNode.items[prevNode.index][options.children] = [];
                    }
                    prevNode.items[prevNode.index][options.children].splice(0, 0, currRow);
                } else {
                    // 移动到相邻节点
                    prevNode.items.splice(prevNode.index + (selfNode.index < prevNode.index ? 0 : 1), 0, currRow);
                }
            }
        } else {
            // 移动到第一行
            const currRow = selfNode.items.splice(selfNode.index, 1)[0];
            tableTreeData.unshift(currRow);
        }
        return tableTreeData;
    };

    /**
     * 获取子级属性集
     */
    const childAttr = (basicData, children, key) => {
        let attr = [];
        basicData.forEach((item) => {
            if (item[children] && item[children].length) {
                attr = [...attr, ...childAttr(item[children], children, key)];
            }
            attr.push(item[key]);
        });
        return attr;
    };
    /**
     * 获取拖拽中的进行控制的事件
     */

    const getTableDataInDrag = (params = {}) => {
        // 配置的树key名称
        const options = { children: params.childrenKey || 'children', selfKey: params.selfKey || 'id' };
        const evt = params.evt; // 拖拽事件
        const targetTrElem = params.item || {};
        const originalEvent = params.originalEvent;

        const selfRow = params.$table.getRowNode(targetTrElem).item; // 当前拖拽的节点数据
        const prevRow = params.$table.getRowNode(evt.related).item;

        const selfKey = selfRow[options.children]
            ? childAttr(selfRow[options.children], options.children, options.selfKey)
            : []; // 当前拖拽节点的子节点key集合

        const clientHeight = evt.related.clientHeight;
        const clientY = originalEvent.clientY; // 鼠标的位置
        const relatedRectTop = evt.relatedRect.top; // 被拖拽对象所在的top
        const heightDiff = clientY - relatedRectTop;

        let isDrag = false;
        if (!selfKey.includes(prevRow[options.selfKey])) {
            isDrag = true;
        }
        if (heightDiff >= clientHeight / 2) {
            isDrag = false;
        }
        return isDrag;
    };
    /**
     * 根据多层次字符串在对象中获取值，例：res对象中获取 data.records
     * @param sourceObj 数据源对象
     * @param multilevelStr 多层次的字符串
     * @returns
     */
    const getValueByStr = function (sourceObj, multilevelStr = '') {
        let res = undefined;
        // 如果参数为空，直接返回undefined
        if (!sourceObj || !multilevelStr) return res;
        // prev 表示初始值或上一次 return 的值， cur 表示当前迭代器里的元素，从左到右依次迭代
        res = multilevelStr.split('.').reduce((prev, field) => {
            // 上一次值是
            if (prev && Object.prototype.hasOwnProperty.call(prev, field)) {
                return prev[field];
            } else {
                return undefined;
            }
        }, sourceObj); // 这里的 body 就是需要判断的对象
        return res;
    };

    /**
     * 时间戳 其他时间 转为年月日时分秒
     * @param {string || number} date -- 时间戳或者标准时间 格式 【1997/01/01 12:00:00】
     * @param {string} type 要转换输出的时间格式类型
     * @return {string} 拼接返回不同类型的时间字符串
     * **/
    const formatDateTime = function (date, type) {
        // 字符串时间戳统一转标准格式
        if (date && isNaN(date)) {
            date = date.replace(/-/g, '/');
        }
        const _date = new Date(date);
        const y = _date.getFullYear();
        let m = _date.getMonth() + 1;
        m = m < 10 ? '0' + m : m;
        let d = _date.getDate();
        d = d < 10 ? '0' + d : d;
        let h = _date.getHours();
        h = h < 10 ? '0' + h : h;
        let minute = _date.getMinutes();
        let second = _date.getSeconds();
        minute = minute < 10 ? '0' + minute : minute;
        second = second < 10 ? '0' + second : second;
        const dataMap = {
            'yyyy-mm-dd': `${y}-${m}-${d}`, // 年-月-日
            ymd: y + '.' + m + '.' + d, // 取年月日 2022.12.01
            ymCh: y + '年' + m + '月', // 取年月中文 2022年12月
            ymdCh: y + '年' + m + '月' + d + '日', // 取年月日中文 2022年12月01日
            mdCh: m + '月' + d + '日', // 月日取中文 12月01日
            y: y, // 年 2022年
            d: d, // 日 01日
            h: h, // 小时
            ym: y + '.' + m, // 年月
            md: m + '.' + d, // 月日
            mdhm: m + '-' + d + ' ' + h + ':' + minute, // 月日时分
            ymdhm: y + '-' + m + '-' + d + ' ' + h + ':' + minute, // 年月日时分
            ymdhms: y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second, // 年月日时分秒
            hm: h + ':' + minute, // 时分
            ms: minute + ':' + second, // 分秒
            hms: h + ':' + minute + ':' + second // 时分秒
        };
        return (type && dataMap[type]) || y + '.' + m + '.' + d + ' ' + h + ':' + minute + ':' + second;
    };

    /**
     * 国际化组件去除前后空格
     * @param {Object} data 国际化组件返回的数据
     */
    const trimI18nJson = function (data) {
        let value = data || {};
        Object.keys(value).forEach((key) => {
            value[key] = value[key] && value[key].trim();
        });
    };
    const urlServicePrefix = function (url, className) {
        if (!className) {
            return url;
        }
        const regexp = /^\/?[^/]+/;
        let prefix = ErdcloudStore.getters.getEntityPrefix?.(className);
        if (prefix && regexp.test(url)) {
            url = url.replace(regexp, `/${prefix}`);
        }
        url = ErdcloudStore.getters.routePrefix(url);
        return url;
    };
    const defaultHeaders = function () {
        let customHeaders = {};
        if (_.isFunction(window.ELCONF.getDefaultAjaxHeaders)) {
            customHeaders = window.ELCONF.getDefaultAjaxHeaders();
        }
        let tenantId = localStorage.getItem('tenantId');
        tenantId = tenantId ? window.encodeURIComponent(JSON.parse(tenantId)) : '';
        return Object.assign(
            {
                'User-Language': ErdcloudI18n.currentLanguage(),
                Authorization: ErdcloudStore.state.app.accessToken, //这块不能取store里面的,因为存在多个tab页签的时候,别的切换了登录状态,这个就不准了
                'Tenant-Id': tenantId
            },
            customHeaders
        );
    };
    const clearStorageData = function () {
        window.LS.remove('screenLock');
        window.LS.remove(`${window.__currentAppName__}_screenLockFrom`);
        window.LS.remove('screenLockTimestamp');
        window.LS.remove('accessToken');
        window.LS.remove('loginInfo');
        window.LS.remove('isDesktop');
        // 退出登录后清空本地存储
        window.LS.remove('visitedRoutes');
        require(['jquery.cookie'], function ($) {
            $.removeCookie('Authorization', { path: '/' });
        });
    };
    /**
     * 跳入其它应用
     * @param {string} appName
     * @param to
     */
    const switchApp = function (appName, to = '/') {
        const toRoute = typeof to === 'string' ? { fullPath: to } : to;
        require(['erdcloud.store', 'erdcloud.http'], function (store) {
            const app = store.state.mfe?.apps?.find((i) => i.code === appName);
            let appUrl = app?.url || `${window.location.origin}/erdc-app/${appName}/index.html`;
            const query = toRoute.query;
            if (!/^(http|https)/.test(appUrl)) {
                appUrl = `${window.location.origin}/erdc-app/${appName}/index.html`;
            }
            const url = new URL(appUrl);
            if (toRoute.fullPath || toRoute.path) {
                url.hash = toRoute.fullPath || toRoute.path;
            }
            if (query) {
                url.hash = url.hash || '/';
                const params = erdcloudKit.getParams(url.hash);
                url.hash =
                    url.hash.split('?')[0] +
                    '?' +
                    erdcloudKit.serializeString({
                        ...params,
                        ...query
                    });
            }
            window.open(url.toString(), appName);
        });
    };
    /**
     * 跳入指定页面
     * @param {string} href
     * @param {Object} options
     * @param {string} options.appName
     * @param {string} options.target
     */
    const open = function (href, { appName = window.__currentAppName__, ...route } = {}) {
        if (appName !== window.__currentAppName__) {
            switchApp(appName, { path: href, ...route }, null, _.noop);
        } else {
            if (/^https?:/.test(href)) {
                window.open(href, appName);
                return;
            }
            require(['erdcloud.router'], function (router) {
                router.push({ path: href, ...route });
            });
        }
    };

    function getErdcAuth() {
        return new Promise((resolve, reject) => {
            if (erdcAuthIns) {
                erdcAuthIns
                    .init()
                    .then(() => {
                        resolve(erdcAuthIns);
                    })
                    .catch(() => {
                        reject();
                    });
            } else {
                require(['erdc-auth'], function ({ ErdcAuth }) {
                    erdcAuthIns = new ErdcAuth({
                        configUrl: '/fam/public/client/info'
                    });
                    erdcAuthIns
                        .init()
                        .then(() => {
                            resolve(erdcAuthIns);
                        })
                        .catch(() => {
                            reject();
                        });
                });
            }
        });
    }

    return {
        getErdcAuth: getErdcAuth,
        login({ username, password, type }) {
            return new Promise((resolve, reject) => {
                if (_.isEmpty(username) || _.isEmpty(password)) {
                    reject(new Error('用户名或密码不能为空'));
                } else {
                    return getPublicKey()
                        .then((resp) => {
                            let publicKey = resp.data.data;
                            if (_.isObject(publicKey) && publicKey.encryption) {
                                publicKey = publicKey.data;
                            }
                            return encrypt({ password, publicKey });
                        })
                        .then((encryptedPassword) => {
                            return getErdcAuth()
                                .then(() => {
                                    if (type) {
                                        return erdcAuthIns.loginSSO({
                                            username,
                                            password: encryptedPassword,
                                            type: type
                                        });
                                    } else {
                                        return erdcAuthIns.login({
                                            username,
                                            password: encryptedPassword
                                        });
                                    }
                                })
                                .then((token) => {
                                    resolve(token);
                                })
                                .catch(reject);
                        });
                }
            });
        },
        /**
         * 跳入登录页面
         * @param {string|false} [redirect] - 重定向地址
         */
        toLogin(redirect) {
            function _doToLogin(loginType, redirectPath) {
                let targetResource = ErdcloudStore.state.mfe.resources.find((i) => i.code === loginType);
                if (targetResource && targetResource?.erdcData?.whiteResource) {
                    let loginPath = window.location.protocol
                        .concat('//')
                        .concat(window.location.host)
                        .concat(window.location.pathname)
                        .concat(`#/${loginType}`);
                    if (redirect) {
                        loginPath = `${loginPath}?redirect=${window.encodeURIComponent(redirectPath)}`;
                    }
                    window.location.href = loginPath;
                    window.location.reload();
                } else {
                    Vue.prototype
                        .$alert('该登录方式没有对应的前端包', '提示', {
                            showClose: false,
                            type: 'error'
                        })
                        .then();
                }
            }

            function logoutFn() {
                clearStorageData();
                const fullPath = window.location.hash.substring(1);
                let redirectPath = fullPath;
                let redirectParam = erdcloudKit.queryString(fullPath)?.redirect;
                if (redirectParam) {
                    redirectPath = redirectParam;
                }
                if (redirect && !redirectParam && ['/403', '/404', '/NoPermission', '/screenLock'].includes(fullPath)) {
                    redirectPath = '/';
                }
                let loginType = window.LS.get('loginType');
                if (!loginType) {
                    getErdcAuth()
                        .then(() => {
                            return erdcAuthIns.loginSchemes();
                        })
                        .then((loginTypes) => {
                            loginTypes.forEach((i) => {
                                if (i.defaultSelect) {
                                    loginType = `erdc-login-${i.type}`;
                                }
                            });
                            if (!loginType) {
                                loginType = 'erdc-login-erdcloud';
                            }
                            _doToLogin(loginType, redirectPath);
                        });
                } else {
                    _doToLogin(loginType, redirectPath);
                }
            }

            function doLogout() {
                getErdcAuth()
                    .then(() => {
                        return erdcAuthIns.logout();
                    })
                    .then(() => {
                        logoutFn();
                    })
                    .catch(() => {
                        Vue.prototype
                            .$confirm('用户鉴权失败，请尝试重新登录', '提示', {
                                type: 'error'
                            })
                            .then(logoutFn);
                    });
            }

            if (_.isFunction(window.ELCONF.logout)) {
                window.ELCONF.logout(function () {
                    doLogout();
                });
            } else {
                doLogout();
            }
        },
        /**
         * 文件预览
         * @param { Object } options
         * @param { string } options.fileName - 文件名，包括文件后缀
         * @param { string } [options.fileId] - 文件 ID，与 contentId 二选一
         * @param { string } [options.contentId] - 附件 ID，与 fileId 二选一
         * @param { string } [options.authCode] - 临时授权码
         * @param { string } [options.className] - 业务对象类型
         * @param { string } [options.appName] - 应用标识
         * @param { string } [options.oid] - deprecated 业务对象 oid
         * @param { string } [options.staticClassName] - deprecated 业务对象类型，效果与 className 相同
         * @param { 'edit'|'view' } [options.action='edit'] - 使用 OnlyOffice 功能时的模式设置。edit 为编辑模式，view 为只读模式
         *
         * @example
         *
         * ```javascript
         * previewFile({ fileName: 'test.jpg', fileId: '123', authCode: 'abc' });
         * previewFile({ fileName: 'test.jpg', contentId: '123', authCode: 'abc' });
         * ```
         * @returns {Promise<VueInstance>}
         */
        previewFile(options = {}) {
            let div = document.createElement('div');
            div.style.display = 'none';
            document.body.appendChild(div);
            return require
                .promise(ELMP.resource('erdc-components/FamFilePreview/index.js'), 'erdcloud.store', 'vue')
                .then(([FamFilePreview, store, Vue]) => {
                    return new Promise((resolve) => {
                        let vm = new Vue({
                            setup() {
                                const { ref, onBeforeUnmount, onMounted, nextTick } = Vue;
                                const appName = ref(options.appName);
                                const staticClassName = ref(options.staticClassName || options.className);
                                const filePreview = ref(null);
                                const handleClosed = () => {
                                    vm.$destroy();
                                    vm = null;
                                };
                                onMounted(() => {
                                    nextTick(() => {
                                        filePreview.value && filePreview.value.preview(options);
                                        resolve(filePreview.value);
                                    });
                                });
                                onBeforeUnmount(() => {
                                    div.remove();
                                    div = null;
                                });
                                return {
                                    filePreview,
                                    appName,
                                    staticClassName,
                                    handleClosed
                                };
                            },
                            components: { FamFilePreview },
                            template: `<FamFilePreview ref="filePreview" :appName="appName" :staticClassName="staticClassName" @closed="handleClosed"></FamFilePreview>`,
                            store
                        }).$mount(div);
                    });
                });
        },
        /**
         *
         * @param url { string | string[] } 图片的地址
         * @param options { Object } viewer.js Options, 参看https://gitee.com/sop_github/viewerjs#options
         * @returns { Promise<Object> }
         */
        previewImg(url, options) {
            return new Promise((resolve) => {
                require([
                    '/erdc-thirdparty/platform/viewerjs/dist/viewer.min.js',
                    'css!' + '/erdc-thirdparty/platform/viewerjs/dist/viewer.min.css'
                ], function (Viewer) {
                    const img = document.createElement('img');
                    let navbar = false;
                    let $container = document.createElement('div');
                    if (Array.isArray(url)) {
                        navbar = true;
                        url.forEach((i) => {
                            const img = document.createElement('img');
                            img.src = i;
                            $container.push(img);
                        });
                    } else {
                        img.src = url;
                        $container.appendChild(img);
                    }
                    const viewer = new Viewer(
                        $container,
                        Object.assign(
                            {
                                title: false,
                                zIndex: 99999,
                                navbar: false,
                                toolbar: navbar
                            },
                            options || {}
                        )
                    );
                    viewer.show();
                    resolve(viewer);
                });
            });
        },
        /**
         * 关闭当前tab页
         * @returns {Promise<unknown>}
         */
        closeCurrentTab() {
            return new Promise((resolve) => {
                require(['erdcloud.router', 'erdcloud.store'], function (router, store) {
                    let route = router.currentRoute;
                    let delItemIndex = store.state.route.visitedRoutes.findIndex((item) => {
                        return item.fullPath === route.fullPath;
                    });

                    store.dispatch('route/delVisitedRoute', route).then((visitedRoutes) => {
                        let nextRoute = visitedRoutes.at(delItemIndex) || visitedRoutes.at(delItemIndex - 1);
                        if (!nextRoute) {
                            nextRoute = '/';
                        }
                        router.push(nextRoute);
                        resolve();
                    });
                });
            });
        },
        /**
         *
         * @param id 复制的目标元素,可选
         * @param attr 复制的目标元素的属性 | 复制的内容
         * @param tips 复制成功之后的提示语
         */
        copy: function copy(id, attr, tips) {
            let target;
            if (attr) {
                target = document.createElement('div');
                target.id = 'tempTarget';
                target.style.opacity = '0';
                if (id) {
                    var curNode = document.querySelector('#' + id);
                    target.innerText = curNode[attr];
                } else {
                    target.innerText = attr;
                }
                document.body.appendChild(target);
            } else {
                target = document.querySelector('#' + id);
            }
            try {
                var range = document.createRange();
                range.selectNode(target);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                document.execCommand('copy');
                window.getSelection().removeAllRanges();
                Vue.prototype.$message({
                    message: tips || ErdcloudI18n.translate('copySuccess'),
                    type: 'info'
                });
            } catch (e) {
                console.log(e);
            }
            if (attr) {
                // remove temp target
                target.parentElement.removeChild(target);
            }
        },
        debounceFn,
        creatMapByObj,
        getLanguageBySystem,
        setTextBySysLanguage,
        getNodeIcon,
        uniqBy,
        copyTxt,
        getImgBase64,
        blobToBase64,
        downFile,
        downloadFile,
        downloadContentFile,
        downloadImgFile,
        imgUrlCreator,
        downloadFileByBrowser,
        findTree,
        getTableDataByDrag,
        getTableDataInDrag,
        getValueByStr,
        formatDateTime,
        trimI18nJson,
        urlServicePrefix,
        defaultHeaders,
        clearStorageData,
        open,
        getDurationByMessage,
        ...erdcloudKit
    };
});
