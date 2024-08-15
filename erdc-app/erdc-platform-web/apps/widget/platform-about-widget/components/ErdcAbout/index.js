define([
    ELMP.resource('platform-about-widget/api.js'),
    '/erdc-thirdparty/platform/html2canvas/dist/html2canvas.min.js'
], function (api, html2canvas) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template: `
            <div class="flex flex-column h-100p">
              <AboutTitle class="plr-16" style="height: 40px;" @downloadSystem="downloadSystem"/>
              <AboutDetail class="mlr-16"/>
              <erd-scrollbar class="plr-0 grow-1 h-0">
                  <SystemStatus :service-list="serviceList" ref="systemRef"/>
              </erd-scrollbar>
              <AboutFooter class="p-8"/>
            </div>
        `,
        components: {
            AboutTitle: ErdcKit.asyncComponent(ELMP.resource('platform-about-widget/components/AboutTitle/index.js')),
            AboutDetail: ErdcKit.asyncComponent(ELMP.resource('platform-about-widget/components/AboutDetail/index.js')),
            AboutFooter: ErdcKit.asyncComponent(ELMP.resource('platform-about-widget/components/AboutFooter/index.js')),
            SystemStatus: ErdcKit.asyncComponent(
                ELMP.resource('platform-about-widget/components/SystemStatus/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.resource('platform-about-widget/locale'),
                serviceList: []
            };
        },
        mounted() {
            this.initData().then(() => {
                // do nothing
            });
        },
        methods: {
            initData() {
                return Promise.all([this.fetchServiceList()]);
            },
            fetchServiceList() {
                return Promise.all([api.fetchServiceList(), api.fetchMicroFrontendApplicationList()]).then(
                    ([resp1, resp2]) => {
                        const serviceList = resp1.data?.map((service, index) => {
                            if (index === resp1.data?.length - 1) {
                                return {
                                    ...service,
                                    // 后端数据健康状况不正确，不显示到页面
                                    hideHealthy: true,
                                    online: true,
                                    hasBorder: true
                                };
                            } else {
                                return {
                                    ...service,
                                    // 后端数据健康状况不正确，不显示到页面
                                    hideHealthy: true,
                                    online: true
                                };
                            }
                        });
                        const mfeApps = resp2.data.records;
                        if (mfeApps && mfeApps.length > 0) {
                            serviceList.push(
                                ...mfeApps.map((app) => {
                                    return {
                                        version: app.pkgVersion,
                                        identifierNo: app.code,
                                        displayName: ErdcKit.translateI18n(app.nameI18nJson),
                                        healthy: true,
                                        online: app.online,
                                        mfe: true,
                                        url: app.url
                                    };
                                })
                            );
                        }
                        this.serviceList = serviceList;
                        this.$nextTick(() => {
                            this.fetchApplicationBuildVersion();
                        });
                    }
                );
            },
            fetchApplicationBuildVersion() {
                Promise.allSettled(
                    this.serviceList.map(({ mfe, url, identifierNo }) => {
                        const uri = url || `/erdc-app/${identifierNo}/index.html`;
                        if (!mfe) {
                            return Promise.resolve(null);
                        }
                        return new Promise((resolve, reject) => {
                            require([`text!${uri}`], function (indexHtml) {
                                const version = indexHtml?.match(/ver=([^"]+)/)[1];
                                resolve(version);
                            }, reject);
                        });
                    })
                ).then((results) => {
                    const mfeAppVersions = results.map((result) => result.value);
                    this.serviceList = this.serviceList.map((service, index) => ({
                        ...service,
                        version: mfeAppVersions[index] || service.version
                    }));
                });
            },
            downloadSystem() {
                html2canvas(this.$refs.systemRef.$refs.serviceRef).then((canvas) => {
                    const link = document.createElement('a');
                    link.download = '版本信息.png';
                    link.href = canvas.toDataURL();
                    link.click();
                });
            }
        }
    };
});
