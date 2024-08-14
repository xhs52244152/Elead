define([], () => {
    return function (type, show) {
        const mapping = {
            Products: [
                {
                    name: 'basicInformation',
                    isShow: true,
                    components: [
                        {
                            className: 'erd.cloud.cbb.pbi.entity.ProductInfo',
                            refName: 'basicInformation',
                            detail: 'TypeManageBasicInfo'
                        }
                    ]
                },
                {
                    name: 'relativeTeam',
                    isShow: show,
                    components: [
                        {
                            className: 'erd.cloud.cbb.pbi.entity.ProductInfo',
                            refName: 'relativeTeam',
                            detail: 'RelativeTeam'
                        }
                    ]
                }
            ],
            HeavyweightTeam: [
                {
                    name: 'basicInformation',
                    isShow: true,
                    components: [
                        {
                            className: 'erd.cloud.cbb.pbi.entity.HeavyTeam',
                            refName: 'basicInformation',
                            detail: 'TypeManageBasicInfo'
                        }
                    ]
                },
                {
                    name: 'roleMembers',
                    isShow: true,
                    components: [
                        {
                            className: 'erd.cloud.cbb.pbi.entity.HeavyTeam',
                            refName: 'roleMembers',
                            detail: 'RoleMembers'
                        }
                    ]
                }
            ]
        };
        return mapping[type] || mapping['Products'];
    };
});
