define(['vue', 'erdcloud.store', 'storage', 'underscore', 'erdcloud.kit'], function (Vue, erdcloudStore) {
    const ErdcKit = require('erdcloud.kit');

    let globalI18n = {};
    let lang = window.LS.get('lang_current') || 'zh_cn';
    let languages = [
        {
            language: 'zh_cn',
            deprecatedKey: 'CN',
            displayName: '简体中文',
            active: lang === 'zh_cn'
        },
        {
            language: 'en_us',
            deprecatedKey: 'EN',
            displayName: 'English(US)',
            active: lang === 'en_us'
        }
    ];

    if (languages.every((item) => item.language !== lang)) {
        lang = 'zh_cn';
    }

    // 兼容旧版的locale/index.js中的CN和EN
    let i18nFileNameAndOldIndexJsKeyMap = languages.reduce((prev, item) => {
        prev[item.language] = item.deprecatedKey;
        return prev;
    }, {});
    const i18nStore = {
        namespaced: true,
        state: {
            lang: lang,
            languages: languages
        },
        mutations: {
            SET_LANG(state, langParam) {
                window.LS.set('lang_current', langParam);
                lang = langParam;
                state.lang = lang;
            },
            changeLanguages(state, languagesParam) {
                state.languages = languagesParam;
                languages = languagesParam;
                i18nFileNameAndOldIndexJsKeyMap = languagesParam.reduce((prev, item) => {
                    prev[item.language] = item.deprecatedKey;
                    return prev;
                }, {});
            }
        },
        actions: {
            switchLanguage({ commit }, { language, i18nLocalePath }) {
                lang = language;
                i18nLocalePath = i18nLocalePath || 'FrameworkI18n';
                return registerI18n({
                    i18nLocalePath: i18nLocalePath,
                    cover: true
                }).then(() => {
                    commit('SET_LANG', language);
                });
            },
            initLanguages({ commit }, languagesParam) {
                if (!_.isEmpty(languagesParam)) {
                    let activeLanguage = languagesParam.find((i) => i.active);
                    activeLanguage = activeLanguage || languagesParam[0];
                    activeLanguage.active = true;
                    commit('SET_LANG', activeLanguage.language);
                    commit('changeLanguages', languagesParam);
                    return registerI18n({
                        i18nLocalePath: activeLanguage.url,
                        cover: true
                    }).then(() => {
                        return Promise.resolve();
                    });
                }
                return Promise.resolve();
            }
        }
    };
    erdcloudStore.registerModule('i18n', i18nStore);

    function getFilenameExt(filename) {
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    const getModule = (path) => {
        return new Promise((resolve) => {
            let pathArray = path.split('/');
            let fileExt = getFilenameExt(pathArray[pathArray.length - 1]);
            let isJSONFile = fileExt.toLowerCase() === 'json';
            if (isJSONFile) {
                path = 'text!' + path;
            }
            require([path], (module) => {
                if (isJSONFile) {
                    resolve(JSON.parse(module));
                } else {
                    if (module.i18n) {
                        let newI18nModule = {};
                        for (let key in module.i18n) {
                            newI18nModule[key] = module.i18n[key][i18nFileNameAndOldIndexJsKeyMap[lang]];
                        }
                        resolve(newI18nModule);
                    } else {
                        resolve(module);
                    }
                }
            });
        });
    };

    /**
     * 注册国际化
     * @param {string} [i18nLocalePath]
     * @param {string} [i18nDirPath]
     * @param {boolean} [global=false] 是否需要作为全局国际化数据
     * @param {boolean} [cover=false] 是否覆盖全局国际化
     * @returns {Promise<Object>}
     */
    function registerI18n({ i18nDirPath, i18nLocalePath, global, cover }) {
        let i18nPath = i18nLocalePath;
        if (!i18nPath && i18nDirPath) {
            i18nPath = `${i18nDirPath}/${lang}.json`;
        }
        //  单独处理一下framework的国际化包
        let i18nPathArr = i18nPath.split('/');
        if (i18nPathArr.length > 1) {
            let isDir = i18nPathArr[i18nPathArr.length - 1].indexOf('.') === -1;
            i18nPath = isDir ? `${i18nPath}/${lang}.json` : i18nPath;
        }
        if (i18nPath) {
            return getModule(i18nPath).then((i18nData) => {
                if (global) {
                    Object.assign(globalI18n, i18nData);
                }
                if (cover) {
                    globalI18n = i18nData;
                }
                return i18nData;
            });
        }
        return Promise.resolve({});
    }

    const translate = function (langKey, options, i18n = {}) {
        const i18nObj = Object.assign(i18n, globalI18n);
        let string = i18nObj[langKey] || langKey || '';
        return ErdcKit.template(string, options);
    };

    Vue.prototype.$t = function (langKey, options) {
        return translate(langKey, options, this.i18nMappingObj || globalI18n);
    };
    Vue.prototype.$translateI18n = function (...args) {
        return ErdcKit.translateI18n(...args);
    };

    Vue.mixin({
        data() {
            return {
                i18nMappingObj: {}
            };
        },
        computed: {
            i18n: function () {
                return this.i18nMappingObj;
            },
            language: function () {
                return this.$store?.state.i18n.lang;
            }
        },
        watch: {
            language: {
                immediate: true,
                handler() {
                    if (this.language) {
                        this.setI18nData();
                    }
                }
            }
        },
        created() {
            this.setI18nData();
        },
        methods: {
            setI18nData: function () {
                if (this.i18nDirPath || this.i18nLocalePath || this.i18nPath) {
                    registerI18n({
                        i18nLocalePath: this.i18nLocalePath || this.i18nPath,
                        i18nDirPath: this.i18nDirPath
                    }).then((i18nData) => {
                        const originI18n = this._originI18n || this.i18nMappingObj || {};
                        this._originI18n = originI18n;
                        const i18nMappingObj = this.i18nMappingObj || {};
                        let keys = Array.isArray(originI18n) ? originI18n : Object.keys(originI18n);
                        const result = Object.create(globalI18n);
                        Object.assign(result, i18nData);
                        this.i18nMappingObj = Object.assign(
                            {},
                            i18nMappingObj,
                            keys.reduce((prev, key) => {
                                prev[key] = result[originI18n[key] || key];
                                return prev;
                            }, {}),
                            globalI18n,
                            i18nData
                        );
                        this.$emit('i18n:loaded', this.i18nMappingObj);
                    });
                } else {
                    this.i18nMappingObj = Object.create(globalI18n);
                }
            },
            getI18nByKey: function (key) {
                return key;
            },
            getI18nKeys: function (keysArray) {
                let result = {};
                keysArray.forEach((i) => {
                    result[i] = this.getI18nByKey(i);
                });
                return result;
            }
        }
    });

    function wrap(i18nConfig) {
        const i18nData = i18nConfig.i18n || {};
        const currentLanguage = lang || 'zh_cn';
        const deprecatedKey = languages.find((i) => i.language === currentLanguage)?.deprecatedKey;
        const result = Object.create(globalI18n);
        Object.keys(i18nData).forEach((key) => {
            if (i18nData[key][currentLanguage]) {
                result[key] = i18nData[key][currentLanguage] || '';
            } else {
                result[key] = i18nData[key][deprecatedKey] || '';
            }
        });
        return {
            ...result,
            t(key, options) {
                return translate(key, options, result);
            }
        };
    }

    return {
        init: function (languages) {
            if (_.isEmpty(languages)) {
                return registerI18n({
                    i18nLocalePath: 'FrameworkI18n',
                    global: true,
                    cover: true
                });
            } else {
                return erdcloudStore.dispatch('i18n/initLanguages', languages);
            }
        },
        wrap,
        registerI18n,
        translate,
        t: translate,
        languages: function () {
            return languages;
        },
        currentLanguage: function () {
            return lang;
        },
        switchLanguage: function (language, i18nLocalePath) {
            return erdcloudStore.dispatch('i18n/switchLanguage', {
                language: language,
                i18nLocalePath: i18nLocalePath
            });
        },
        useI18n(i18n) {
            return wrap(i18n);
        }
    };
});
