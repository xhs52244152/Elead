define([
    'erdc-kit',
    ELMP.resource('platform-site-setting/api.js'),
    'text!' + ELMP.resource('platform-site-setting/siteList/index.html'),
    'css!' + ELMP.resource('platform-site-setting/siteList/index.css')
], function (ErdcKit, api, template) {
    const average = function (nums) {
        return nums.reduce((a, b) => a + b, 0) / nums.length;
    };

    const toFixed2 = function (num) {
        return Number.prototype.toFixed.call(num, 2);
    };

    return {
        template: template,
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'platform-site-setting'),

                visible: false,
                loading: false,
                siteData: [],

                rowConfig: {
                    useKey: true,
                    keyField: 'code'
                },
                radioConfig: {
                    strict: true
                },
                scrollY: {
                    gt: 0
                },

                speedClassify: [
                    {
                        description: '<=50ms',
                        className: 'speed-excellent'
                    },
                    {
                        description: '50~100ms',
                        className: 'speed-good'
                    },
                    {
                        description: '100~150ms',
                        className: 'speed-normal'
                    },
                    {
                        description: '150~200ms',
                        className: 'speed-slow'
                    },
                    {
                        description: '>200ms',
                        className: 'speed-veryslow'
                    }
                ]
            };
        },
        computed: {
            columns() {
                const { i18nMappingObj } = this;

                return [
                    {
                        type: 'radio',
                        fixed: 'left',
                        align: 'center'
                    },
                    {
                        minWidth: '200',
                        title: i18nMappingObj.siteName,
                        prop: 'name'
                    },
                    {
                        width: '110',
                        title: i18nMappingObj.minTime + '(ms)',
                        prop: 'minSpeed'
                    },
                    {
                        width: '110',
                        title: i18nMappingObj.maxTime + '(ms)',
                        prop: 'maxSpeed'
                    },
                    {
                        width: '110',
                        title: i18nMappingObj.avgTime + '(ms)',
                        prop: 'avgSpeed'
                    },
                    {
                        width: '100',
                        title: i18nMappingObj.jitterTime + '(ms)',
                        prop: 'jitter'
                    }
                ];
            }
        },
        methods: {
            getSpeedClass(speed) {
                let className = '';
                if (speed > 0 && speed <= 50) {
                    className = 'speed-excellent';
                } else if (speed > 50 && speed <= 100) {
                    className = 'speed-good';
                } else if (speed > 100 && speed <= 150) {
                    className = 'speed-normal';
                } else if (speed > 150 && speed <= 200) {
                    className = 'speed-slow';
                } else if (speed > 200) {
                    className = 'speed-veryslow';
                }

                return className;
            },
            show() {
                this.visible = true;
                this.getAllSites();
            },
            handleTestSpeed() {
                this.siteData.forEach((site) => {
                    this.getSiteSpeedInfo(site);
                });
            },
            getSiteSpeedInfo(site) {
                const reqNum = 10; // 测试站点速度的请求次数。
                const reqList = [];
                for (let i = 0; i < reqNum; i += 1) {
                    reqList.push(this.getSpeedPromise(site));
                }

                Promise.all(reqList).then((speeds) => {
                    site.minSpeed = toFixed2(Math.min(...speeds));
                    site.maxSpeed = toFixed2(Math.max(...speeds));
                    site.avgSpeed = toFixed2(average(speeds));
                    site.jitter = toFixed2(site.maxSpeed - site.minSpeed);
                });
            },
            getSpeedPromise(site) {
                return new Promise((resolve, reject) => {
                    // const params = {
                    //     serverAddr: `${site.serverAddr}/doc/site/storage/v1/health`,
                    // };

                    const headers = ErdcKit.defaultHeaders();

                    const start = performance.now();

                    this.$famHttp({
                        url: site.serverAddr + api.url.site.health,
                        method: 'GET',
                        headers: headers
                    }).then(() => {
                        const end = performance.now();

                        resolve(end - start);
                    });
                });
            },
            /**
             * 获取所有站点
             */
            getAllSites() {
                this.loading = true;

                api.site
                    .list()
                    .then((res) => {
                        const data = res.data ?? [];
                        this.siteList2Table(data);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            siteList2Table(sites) {
                const siteData = sites.map((item) => {
                    item.avgSpeed = 0;
                    item.minSpeed = 0;
                    item.maxSpeed = 0;
                    item.jitter = 0;

                    return item;
                });

                this.siteData = siteData;
            },
            confirm() {
                const selectedSite = this.$refs.tableRef.$table.getRadioRecord();
                this.visible = false;
                this.$emit('confirm', selectedSite);
            },
            cancel() {
                this.visible = false;
            }
        }
    };
});
