define(['vue', ELMP.resource('ppm-store/index.js')], function (Vue, store) {
    const famHttp = require('erdcloud.http');

    /**
     * 继承element弹窗等公用组件
     * **/
    let ElementVue;
    const getElementUI = function () {
        if (!ElementVue) {
            ElementVue = new Vue();
        }
        return ElementVue;
    };

    var util = {
        // 项目类型接口  val: 类型的id
        getType: function (val) {
            return new Promise((resolve) => {
                famHttp({
                    url: '/fam/type/typeDefinition/findAccessTypes',
                    viewProperty: 'displayName',
                    valueProperty: 'typeOid',
                    params: {
                        typeName: store.state.classNameMapping.project,
                        containerRef: 'OR:erd.cloud.foundation.core.container.entity.OrgContainer',
                        subTypeEnum: 'LEAF_NODE',
                        accessControl: false
                    },
                    appName: 'PPM'
                })
                    .then((res) => {
                        if (res.code === '200') {
                            let arr = res.data;
                            const currentTypeName = arr.filter((item) => item.typeOid === val)[0]?.typeName || '';
                            resolve(currentTypeName);
                        }
                    })
                    .catch((err) => {
                        getElementUI().$message({
                            message: err?.data?.message,
                            type: 'error',
                            showClose: true
                        });
                    });
            });
        }
    };
    return util;
});
