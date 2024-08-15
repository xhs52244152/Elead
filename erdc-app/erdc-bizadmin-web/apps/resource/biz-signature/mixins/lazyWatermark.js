define([ELMP.resource('biz-signature/CONST.js')], function (CONST) {
    const FamKit = require('fam:kit');
    return {
        data: function () {
            return {
                waterPageIndex: 1,
                waterTotal: 0,
                waterPageSize: 10,
                // 水印列表数据
                watermarkOptions: [],
                // 当前已经选中的水印数据
                watermarkForm: {}
            };
        },
        directives: {
            'el-select-selectLazy': {
                bind(el, binding) {
                    let SELECT_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
                    SELECT_DOM?.addEventListener('scroll', function () {
                        let condition = Math.floor(this.scrollHeight - this.scrollTop) <= this.clientHeight;
                        if (condition) {
                            binding.value();
                        }
                    });
                }
            }
        },
        computed: {
            isDefaultValueInOptions: function () {
                return this.watermarkOptions.find((i) => i.code === this.watermarkForm.code);
            }
        },
        methods: {
            loadWatermarkDetail: function (watermarkCode) {
                return this.$famHttp({
                    url: '/fam/search',
                    method: 'post',
                    data: {
                        className: CONST.className.watermark,
                        conditionDtoList: [
                            {
                                attrName: 'code',
                                oper: 'EQ',
                                value1: watermarkCode
                            }
                        ]
                    }
                }).then((resp) => {
                    let result = {};
                    if (resp.success) {
                        let records = resp.data.records || [];
                        if (records && records.length) {
                            let data = records[0];
                            let attrRawList = data.attrRawList || [];
                            delete data.attrRawList;
                            result = Object.assign(
                                data,
                                FamKit.deserializeArray(attrRawList, {
                                    valueKey: 'displayName',
                                    isI18n: true
                                })
                            );
                        }
                    }
                    return result;
                });
            },
            /**
             * 滚动加载
             */
            selectLazy() {
                if (this.waterPageIndex * this.waterPageSize < this.waterTotal) {
                    this.waterPageIndex++;
                    this.loadWatermarkPage({
                        pageIndex: this.waterPageIndex
                    }).then((data) => {
                        this.watermarkOptions = this.watermarkOptions.concat(data);
                    });
                }
            },
            queryWatermark(keyword) {
                this.waterPageIndex = 1;
                this.loadWatermarkPage({
                    keyword: keyword,
                    pageIndex: this.waterPageIndex
                }).then((data) => {
                    this.watermarkOptions = data;
                });
            },
            loadWatermarkPage: function (param) {
                param = param || {};
                param.pageIndex = param.pageIndex || this.waterPageIndex;
                param.pageSize = param.pageSize || this.waterPageSize;
                return this.$famHttp({
                    url: '/fam/search',
                    method: 'post',
                    data: {
                        searchKey: param.keyword,
                        appName: ['plat'],
                        className: CONST.className.watermark,
                        pageIndex: param.pageIndex,
                        pageSize: param.pageSize
                    }
                }).then((resp) => {
                    if (resp.success) {
                        this.waterTotal = resp.data.total * 1;
                        return resp.data.records.map((i) => {
                            let attrRawData = FamKit.deserializeArray(i.attrRawList, {
                                valueKey: 'displayName',
                                isI18n: true
                            });
                            return Object.assign(
                                {
                                    oid: i.oid
                                },
                                attrRawData
                            );
                        });
                    }
                });
            },
            previewWatermark(watermarkCode) {
                if (!watermarkCode) return;
                let watermark = this.watermarkOptions.find((i) => i.code === watermarkCode);
                if (watermark) {
                    this.$famHttp({
                        url: '/fam/attr',
                        params: {
                            className: CONST.className.watermark,
                            oid: watermark.oid
                        }
                    }).then((resp) => {
                        let rawData = resp.data.rawData;
                        let previewData = {
                            content: rawData.content.value,
                            paveStyle: rawData.paveStyle.value,
                            size: rawData.size.value,
                            name: rawData.name.value,
                            angle: rawData.angle.value,
                            opacity: rawData.opacity.value,
                            contentType: rawData.contentType.value,
                            className: 'erd.cloud.signature.entity.SignatureTmpl'
                        };
                        this.$famHttp({
                            url: '/doc/watermark/v1/preview',
                            method: 'POST',
                            data: previewData,
                            responseType: 'blob'
                        })
                            .then((resp) => {
                                return new Promise(function (resolve) {
                                    var reader = new FileReader();
                                    reader.readAsDataURL(resp.data);
                                    reader.onload = function (e) {
                                        resolve(e.target.result);
                                    };
                                });
                            })
                            .then((imgData) => {
                                FamKit.previewImg(imgData);
                            });
                    });
                }
            }
        },
        mounted: function () {
            // this.loadSystemSignatures();
        }
    };
});
