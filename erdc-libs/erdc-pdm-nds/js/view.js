define([
    'EventBus',
    ELMP.resource('erdc-pdm-nds/thirdparty/2DView/coreViewer/res/axios.min.js'),
    ELMP.resource('erdc-pdm-nds/mixins/expended-handle.js'),
    'text!' + ELMP.resource('erdc-pdm-nds/htmls/view.html'),
    'css!' + ELMP.resource('erdc-pdm-nds/css/index.css')
], function (EventBus, axios, customExpend, template) {
    const _ = require('underscore');
    window._pdmNdsUtils = {
        // 先固化一些 axios 默认配置参数
        setAxiosDefaultOpts() {
            window.axios = axios;
            window.axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            // 设置axios全局token为pdm的token;后续第三方插件使用axios调用pdm资源时自动携带
            // 非axios的方式不会携带
            window.axios.defaults.headers.common['Authorization'] = this.getToken();
        },
        // token的获取和设置（axios上）
        getToken() {
            var Authorization = '';
            if (_.isFunction(window.ELCONF.loadAuthorization)) {
                Authorization = window.ELCONF.loadAuthorization() || '';
            } else {
                Authorization = window.localStorage.getItem('accessToken');
            }
            return Authorization;
        }
    };
    window._pdmNdsUtils.setAxiosDefaultOpts();
    var options = {
        // 设置一些全局 axios 的配置
        template,
        // 混入自定义的方法用来扩展新迪配置对象
        mixins: [customExpend],
        props: {
            viewData: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                setupUrl: '',
                // 存储了所有批注信息的数组
                commentsArr: [],
                // 新迪模型在加载中么?
                ndsIsLoading: true
            };
        },
        components: {
            // 评论区
            commentsSection: (resolve) => require([ELMP.resource('erdc-pdm-nds/js/comments-section.js')], resolve)
        },
        computed: {
            // 过滤一些标注；这里先过滤纯文本标注
            filterSomeTags() {
                if (_.isEmpty(this.commentsArr)) {
                    return [];
                }
                return this.commentsArr.filter((d) => {
                    // 可能是json字符串，处理一下
                    let obj = _.isString(d.commentContent) ? JSON.parse(d.commentContent) : d.commentContent;
                    return obj._pdmExpended && obj._pdmExpended.type != 'plain-text';
                });
            },
            getTags() {
                return (
                    this.filterSomeTags.map((item) => {
                        // 可能是json字符串，处理一下
                        return _.isString(item.commentContent) ? JSON.parse(item.commentContent) : item.commentContent;
                    }) || []
                );
            }
        },
        mounted() {
            // 将新迪轻量化model.js的文件路径挂载到 prefixUrl
            this.setNDSUrl();
            // 启动新迪第三方插件模块
            this.setup();
            // 绑定相关事件
            this.bindEvents();
        },
        methods: {
            async setup() {
                // 这里要使用外界指针，baseOpts内部指针被新迪插件劫持了
                const _this = this;
                // 先获取已有的批注
                await this.setCommentArr();

                // 判断图纸类型3d or 2d
                let is2D = false;
                try {
                    is2D = _this.getParams.content.raw.viewType === 5;
                } catch (e) {}
                // 新迪轻量化的基础配置
                const baseOpts = {
                    // 3D轻量化文件所在文件夹路径 'models/bim/'
                    // 2D轻量化文件所在文件夹路径 'models/bim_32/'
                    // 使用本地models目录的模拟数据
                    // src: '/apps' + ELMP.resource('/erdc-pdm-nds/thirdparty/models/bim/model.js'),
                    // 服务器上轻量化文件所在文件夹路径
                    src: _this.setupUrl,
                    // 是否是2D图纸，加载2D图纸需要将此值改为true
                    is2D,
                    tags: _this.getTags,
                    // 加载完成
                    loadedBack() {
                        _this.ndsIsLoading = false;
                    },
                    // a增加的标记，i截图，cc插件提供的回调方法
                    async onAddTag(a, i, cc) {
                        // 增加一个pdm的扩展对象，用于评论区
                        a._pdmExpended = {
                            // 标记当前批注是文字批注
                            type: 'text',
                            // 当前截图添加到批注对象里面
                            tagImg: i
                        };
                        // 调用混入文件里存储批注信息的方法;
                        await _this.saveTagAjax(a, i, _this.getParams);
                        // 全量更新评论区的批注信息
                        await _this.setCommentArr();
                        // 添加批注后的回调
                        cc && cc();
                    },
                    // d增加的图片批注（不含用户上传的图片信息）, i(用户上传的图片base64), cc插件提供的回调方法
                    async onAddPicTag(d, i, cc) {
                        /**
                         * 将用户上传的图片信息绑定到标注上
                         * 新迪插件回显图片批注的图片会用到 imgURL这个属性;
                         * imgUrl 这个属性暂时不知道干嘛用的
                         * type 用来告诉插件这是一个图片批注
                         */
                        d.imgURL = d.imgUrl = i;
                        d.type = 'image';
                        // 增加一个pdm的扩展对象，用于评论区
                        d._pdmExpended = {
                            // 标记当前批注是图片批注
                            type: 'img-text',
                            // 用户上传的图片base64
                            tagImg: i
                        };
                        // 调用混入文件里存储批注信息的方法;
                        await _this.saveTagAjax(d, i, _this.getParams);
                        // 全量更新评论区的批注信息
                        await _this.setCommentArr();
                        // 添加批注后的回调
                        cc && cc(i);
                    }
                };
                await this.initView(baseOpts);
            },
            // 组装新迪轻量化 model.js 的文件路径
            setNDSUrl() {
                let params = this.getParams;
                /**
                 * pdm的接口前缀、转图接口返回的资源路径、新迪轻量化指定的文件后缀
                 * Configurations.json 文件不存在时才会使用这个路径;
                 * 否则走 thirdparty/viewer.js 的 checkConfig 方法
                 */
                // 用于后端本地调试; epm -> epm-ly
                const serverName = JSON.parse(localStorage.getItem('serviceRoute'))['entityMapping'][
                    'erd.cloud.pdm.epm.entity.EcadDocument'
                ];
                const prefix = `/${serverName}`,
                    main = params.content.prefixUrl,
                    postfix = '/model.js';
                // 最终路径
                this.setupUrl = `${prefix}${main}${postfix}`;
            },
            async setCommentArr() {
                this.commentsArr = await this.getAllTags(this.getParams);
                return this.commentsArr;
            },
            initView(options) {
                let { fetchGetRealServe } = this;
                return new Promise((resolve) => {
                    let viewerUrl = options.is2D
                        ? ELMP.resource('erdc-pdm-nds/thirdparty/2DView/viewer.js')
                        : ELMP.resource('erdc-pdm-nds/thirdparty/3DView/viewer.js');
                    require([viewerUrl], function () {
                        fetchGetRealServe().then((fingerHttp) => {
                            // 设置实际服务地址
                            window.nd_viewCtrl.fingerHttp = fingerHttp;
                            // 设置其它选项
                            window.nd_viewCtrl.init(options);
                            resolve();
                        });
                    });
                });
            },
            // 获取并设置实际服务地址
            fetchGetRealServe() {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/pdm/cad/getNdsConfig',
                        className: 'erd.cloud.pdm.epm.entity.EpmDocument'
                    })
                        .then((resp) => {
                            if (resp.code === '200' && resp?.data?.apiDomain) {
                                resolve(resp.data.apiDomain);
                            } else {
                                reject();
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            // 更新批注列表
            updateComments() {
                // console.log("更新批注列表:", data)
                this.$nextTick(() => {
                    // 更新批注
                    this.setCommentArr();
                });
            },
            // 绑定相关事件总线
            bindEvents() {
                // 刷新新迪模型
                EventBus.once('refresh:nds:model', () => {
                    // console.log(data)
                    this.setup();
                });
            }
        }
    };
    return options;
});
