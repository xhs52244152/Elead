define([
    'text!' + ELMP.resource('codesign-list/index.html'),
    ELMP.resource('erdc-pdm-components/CoDesignConfig/index.js')
], function (template, config) {
    const ErdcKit = require('erdc-kit');
    const axios = require('fam:http');
    const _ = require('underscore');
    const { apiPrefix } = config;
    return {
        template,
        created() {
            this.judgmentServiceStart();
        },
        methods: {
            // 判断codesign的服务是否已经启动了
            judgmentServiceStart() {
                axios
                    .get(`${apiPrefix}/echo`)
                    .then((res) => {
                        if (res?.success) {
                            this.handleJump();
                        }
                    })
                    .catch(() => {
                        this.handleJumpToPortal();
                    });
            },
            // 直接用工具服务方式
            handleJump() {
                axios.get(`${apiPrefix}/api/getMainWorkspace`).then((resp) => {
                    let { data } = resp;
                    if (_.isEmpty(data)) {
                        this.handleJumpToPortal();
                    } else {
                        let { rawData } = data;
                        this.handleJumpToALibrary(rawData);
                    }
                });
            },
            handleJumpToPortal() {
                const portalUrl = '/erdc-app/erdc-portal-web/index.html#/portal/erdc-workspace/workspace/list';
                const portalName = 'erdc-portal-web';
                const portalWindow = window.open(portalUrl, portalName);
                if (portalWindow) {
                    window.close();
                }
            },
            handleJumpToALibrary(data) {
                const workspaceData = data;
                const title = workspaceData?.displayName;
                const pid = workspaceData?.pid;
                const oid = workspaceData?.oid;
                const typeOid = workspaceData?.typeOid;
                const activeName = 'relationObj';
                let space = pid?.split(':')[1].indexOf('PdmProduct') > -1;
                let appName = space ? 'erdc-product-web' : 'erdc-library-web';
                let spaceName = space ? 'product' : 'library';
                let targetPath = `/space/${spaceName}/erdc-workspace/workspace/detail`;
                let query = {
                    title,
                    pid,
                    oid,
                    typeOid,
                    activeName
                };
                // path组装query参数
                let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                var newWindow = window.open(url, appName);
                if (newWindow) {
                    // 确保新窗口已经打开后关闭
                    window.close();
                }
            }
        }
    };
});
