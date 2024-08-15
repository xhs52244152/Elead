define([], () => {
    const mapping = {
        ServiceInfo: [
            {
                name: 'basicInformation',
                isShow: true,
                components: [
                    {
                        refName: 'basicInformation',
                        detail: 'TypeManageBasicInfo'
                    }
                ]
            }
        ],
        TypeDefinition: [
            {
                name: 'basicInformation',
                isShow: true,
                components: [
                    {
                        refName: 'basicInformation',
                        detail: 'TypeManageBasicInfo'
                    }
                ]
            },
            {
                name: 'attributes',
                isShow: true,
                components: [
                    {
                        refName: 'attributes',
                        detail: 'TypeManageAttr'
                    }
                ]
            },
            {
                name: 'operate',
                isShow: true,
                components: [
                    {
                        refName: 'operate',
                        detail: 'TypeManageOperate'
                    }
                ]
            },
            {
                name: 'layout',
                isShow: true,
                components: [
                    {
                        refName: 'layout',
                        detail: 'TypeManageLayout'
                    }
                ]
            },
            {
                name: 'propertyGroup',
                isShow: true,
                components: [
                    {
                        refName: 'propertyGroup',
                        detail: 'TypeManageAttrGroup'
                    }
                ]
            },
            {
                name: 'signatureRule',
                isShow: true,
                components: [
                    {
                        refName: 'signatureRule',
                        detail: 'TypeManageSignRule'
                    }
                ]
            }
        ]
    };
    return function (type) {
        return mapping[type] || mapping['ServiceInfo'];
    };
});
