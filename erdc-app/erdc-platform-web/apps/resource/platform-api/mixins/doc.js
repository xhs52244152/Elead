define([
    'erdcloud.kit',
    'file-saver',
    ELMP.resource('platform-api/util/DubboDoc.js'),
    ELMP.resource('platform-api/util/RestDoc.js'),
    ELMP.resource('platform-api/util/markdown.js'),
    ELMP.resource('platform-api/components/VersionCompareSelect/version-compare-select.js'),
    ELMP.resource('platform-api/components/DocHeader/index.js'),
    ELMP.resource('platform-api/components/DocCatlog/docCatlog.js'),
    'erdc-kit',
    ELMP.resource('platform-api/util/index.js'),
    'word-export'
], function (ErdcloudKit, saveAs, DubboDoc, RestDoc, markdown, VersionCompareSelect, DocHeader, DocCatlog, FamUtils) {
    'use strict';

    return {
        components: {
            VersionCompareSelect,
            DocHeader,
            DocCatlog
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-api/views/ApiManagement/locale/index.js'),
                versionArr: [], // 聚合版本数组
                curVersion: null, // 当前选中的版本
                versionList: [],
                currentId: null,
                currentInstance: {
                    serviceName: '',
                    description: '',
                    version: '',

                    paths: [],
                    pathArrs: [],
                    difArrs: [],
                    tags: [],
                    securityArrs: [],
                    firstLoad: false,
                    pathsDictionary: {}
                },

                catelog: [],
                noData: false
            };
        },
        computed: {
            query() {
                return this.$route.query;
            },
            paramVersion() {
                return this.query.version;
            },
            paramAppName() {
                return this.query.appName;
            },
            docType() {
                return this.query.docType;
            }
        },
        created() {
            this.initData();
        },
        methods: {
            initData() {
                this.currentInstance.name = this.paramAppName;

                this.getVersionList().then(this.getApiDoc);
            },
            handleVersionChange(version) {
                this.curVersion = version;
                this.currentId = version.id;
                this.getApiDoc();
            },

            markdownToTabContent() {
                const docContainer = this.$el.querySelector('.content-document');
                const doms = docContainer.querySelectorAll('h1,h2,h3,h4,h5,h6');

                const catelog = [];

                // 因为标题标签是h1 ~ 6，所以这里第一个0实际上永远是被忽略的
                const levelIndex = [0, 0, 0, 0, 0, 0, 0];
                doms.forEach((dom, i) => {
                    const title = dom.textContent || dom.innerText;

                    const tagName = dom.nodeName.toLowerCase();
                    const level = parseInt(tagName.replace('h', ''));

                    const levelIdx = levelIndex[level];
                    levelIndex[level] = levelIdx + 1;
                    levelIndex.fill(0, level + 1);

                    const indexArr = levelIndex.filter((item) => item !== 0);
                    const index = indexArr.join('.');

                    const id = `catlog_${indexArr.join('_')}`;
                    dom.setAttribute('id', id);

                    catelog.push({
                        index,
                        title,
                        id,
                        level
                    });
                });

                this.catelog = catelog;
            },

            menuClick(catelogItem) {
                const dom = this.$el.querySelector(`#${catelogItem.id}`);
                if (dom) {
                    dom.scrollIntoView();
                }
            },

            /**
             * 版本对比。
             * 选择需要对比的版本号
             */
            handleCompare() {
                this.$refs.compareRef.show();
            },

            getVersionList() {
                let { currentInstance, paramVersion, docType } = this;

                return this.$famHttp({
                    url: `/common/apiauth/v1/doc/versions/${currentInstance.name}`,
                    method: 'GET',
                    data: {
                        docType: docType
                    }
                })
                    .then((response) => {
                        const versionArr = response.data;
                        versionArr.forEach((item) => {
                            this.versionList.push({
                                label: item.version,
                                value: item.id
                            });
                        });
                        let curVersion = null;
                        if (paramVersion) {
                            curVersion = versionArr.find((item) => item.verison === paramVersion);
                        }

                        if (!curVersion) {
                            curVersion = versionArr[0];
                        }

                        this.versionArr = versionArr;
                        this.curVersion = curVersion;
                        this.currentId = curVersion.id;
                    })
                    .catch((err) => {
                        // this.$message({
                        //     showClose: true,
                        //     message: err?.data?.message,
                        //     type: 'error'
                        // });
                    });
            },

            getApiDoc() {
                const { curVersion, currentInstance, versionArr, docType } = this;

                if (!curVersion) return;

                const data = {
                    version: curVersion.version,
                    docType
                };

                const appName = currentInstance.name;

                return this.$famHttp({
                    url: `/common/apiauth/v1/doc/${appName}`,
                    method: 'GET',
                    data
                })
                    .then((res) => {
                        const data = res.data;
                        if (_.isEmpty(data)) {
                            this.noData = true;
                            return;
                        }
                        const menu = typeof data === 'string' ? JSON.parse(data) : data;

                        const findVersion = versionArr.find((item) => item.id === menu.versionId);
                        if (findVersion) {
                            this.curVersion = findVersion;
                            this.currentId = findVersion.id;
                            currentInstance.crateTime = findVersion.time;
                            currentInstance.createBy = findVersion.createBy;
                        }

                        this.setInstanceBasicPorperties(menu);
                        this.parseApiDoc(menu);

                        this.$nextTick(() => {
                            this.markdownToTabContent();
                        });
                    })
                    .catch((err) => {
                        // this.$message({
                        //     showClose: true,
                        //     message: err?.data?.message,
                        //     type: 'error'
                        // });
                    });
            },

            /***
             * 基础实例赋值
             * @param menu
             */
            setInstanceBasicPorperties(menu) {
                if (!menu) return;

                const currentInstance = {};

                const info = menu.info ?? {};
                currentInstance.serviceName = info.serviceName;
                currentInstance.description = info.description;
                currentInstance.version = info.version;
                currentInstance.createTime = new Date(info.createTime).toLocaleString().replaceAll('/', '-');

                this.currentInstance = Object.assign(this.currentInstance, currentInstance);
            },

            parseApiDoc(menu) {
                const { docType, currentInstance } = this;

                let apiDoc = null;
                if (docType === 'rest') {
                    apiDoc = new RestDoc(currentInstance);
                } else {
                    apiDoc = new DubboDoc(currentInstance);
                }

                apiDoc.parseApiDoc(menu);
            },

            /**
             * 下载接口文档
             * @param {*} fileType 下载的文件类型
             */
            download(fileType) {
                const { currentInstance, docType, curVersion } = this;
                if (!curVersion) return;

                switch (fileType) {
                    case 'markdown':
                        // eslint-disable-next-line no-case-declarations
                        const name = currentInstance.serviceName;
                        // eslint-disable-next-line no-case-declarations
                        const version = currentInstance.version;
                        // eslint-disable-next-line no-case-declarations
                        let markdownText = '';
                        if (docType === 'rest') {
                            markdownText = markdown.getRestMarkdown(currentInstance);
                        } else {
                            markdownText = markdown.getDubboMarkdown(currentInstance);
                        }
                        var blob = new Blob([markdownText], { type: 'text/plain;charset=utf-8' });
                        saveAs(blob, name + '-' + version + '-' + docType + '.md');
                        break;
                    case 'word':
                        // eslint-disable-next-line no-case-declarations
                        const cloneOfflineMarkDown = $('#offlineMarkdownShow').clone();
                        // eslint-disable-next-line no-case-declarations
                        const style =
                            'body,p,pre,code{font-size:13px !important;} table{  border: 1px solid #000000; border-collapse: collapse;width:100%}th,td{border: 1px solid #000000;}';
                        cloneOfflineMarkDown.wordExport(
                            currentInstance.serviceName + '-' + currentInstance.version + `-${docType}`,
                            style
                        );
                        break;
                    case 'json':
                        this.$famHttp({
                            url: `common/apiauth/v1/doc/export/${docType}?versionId=${curVersion.id}`,
                            method: 'get',
                        })
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.exporting,
                            showClose: true,
                            dangerouslyUseHTMLString: true
                        });
                        break;
                    default:
                        break;
                }
            }
        }
    };
});
