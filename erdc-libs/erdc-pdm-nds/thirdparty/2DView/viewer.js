var nd_viewCtrl = {
    src: '',
    allTags: [],
    hidebtnCfg: [], //隐藏的按钮对应按钮id0
    _opt: {},
    fingerHttp: '', // 上送地址
    init: function (opt) {
        this.src = opt.src;
        this._opt = opt;
        this.allTags = opt.tags;
        let url = ELMP.resource('erdc-pdm-nds/thirdparty/2DView/index.html');
        document.querySelector('#iframeDiv').innerHTML =
            '<iframe id="viewer" src="' + url + '" allowFullScreen></iframe>';
    },
    initLoad: function () {
        //加载完成
        console.log('model loaded!');
        this.getInstance();
        this._opt && this._opt.loadedBack && this._opt.loadedBack();
    },
    loadFaild: function () {
        //资源加载错误
        console.log('model loaded error!');
    },
    getModelSrc: function (callbackInit) {
        //模型url
        callbackInit(this.src);
    },
    isModelConfig: function () {
        return this.isModelCfg;
    },

    getModelBgImg: function () {
        //模型背景图
        return this.bgImg;
    },

    getTags: function () {
        return this.allTags;
    },
    checkTags: function (cc) {
        //检查批注的逻辑
        if (this._opt.onCheck) this._opt.onCheck(cc);
        else cc();
    },
    addTags: function (a, i, cc) {
        //增加标记回调 (增加的标记，截图，回调方法)
        if (this._opt.onAddTag) this._opt.onAddTag(a, i, cc);
        else cc();
    },
    delTags: function (uid) {
        //删除标记 单个序号或者数组
        var _contentWindow = document.getElementById('viewer').contentWindow;
        if (_contentWindow) {
            _contentWindow.nd_delTags(uid);
        }
    },
    beDelTag: function (uid, cc) {
        //被删除标记
        if (this._opt.onDel) this._opt.onDel(uid, cc);
        else cc();
    },
    enterTag: function () {
        //进入标记模式
        var _contentWindow = document.getElementById('viewer').contentWindow;
        if (_contentWindow) {
            _contentWindow.nd_enterTag();
        }
    },
    isEnterTag: function () {
        //是否在标记模式
        var _contentWindow = document.getElementById('viewer').contentWindow;
        if (_contentWindow) {
            return _contentWindow.nd_isEnterTag();
        }
    },
    selectTag: function (uuid) {
        //打开标记模式
        document.getElementById('viewer').contentWindow.nd_selectTag(uuid);
    },
    exitTag: function () {
        //退出标记
    },
    beSelectTag: function (i) {
        //被选择标记
        this._opt.onSelect && this._opt.onSelect(i);
    },
    addPicTag: function (d, i, cc) {
        //增加的图片标记
        if (this._opt.onAddPicTag) this._opt.onAddPicTag(d, i, cc);
        else cc(i);
    },
    screenshot: function (callBack) {
        //截图
        var _contentWindow = document.getElementById('viewer').contentWindow;
        if (_contentWindow) {
            _contentWindow.nd_screenCapture(function (base64Img) {
                callBack && callBack(base64Img);
                console.log(base64Img);
            });
        }
    },
    screensbounding: function (callBack) {
        //包围盒截图
        var _contentWindow = document.getElementById('viewer').contentWindow;
        if (_contentWindow) {
            _contentWindow.nd_screenBounding(function (base64Img) {
                callBack && callBack(base64Img);
                console.log(base64Img);
            });
        }
    },
    configImgUpload: function (itemInfo, img) {
        this._opt.configImgUpload && this._opt.configImgUpload(itemInfo, img);
    },
    getInstance: function () {
        _contentWindow = document.getElementById('viewer').contentWindow;
        this.Instance = _contentWindow;
        if (_contentWindow) {
            for (var i in _contentWindow) {
                if (String(i).indexOf('nd_') == 0 && typeof _contentWindow[i] === 'function') {
                    nd_viewCtrl[i] = _contentWindow[i];
                }
            }
        }
    },
    log: function (str) {
        //提示框
        alert(str);
    }
};
