define([ELMP.resource('erdc-pdm-components/ContainerTeam/index.js')], function (ContainerTeam) {
    return {
        name: 'productTeam',
        mixins: [ContainerTeam],
        data() {
            return {
                teamTableType: 'product'
            };
        }
    };
});
