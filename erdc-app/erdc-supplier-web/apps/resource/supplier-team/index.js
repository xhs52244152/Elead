define([ELMP.resource('erdc-pdm-components/ContainerTeam/index.js')], function (ContainerTeam) {
    return {
        mixins: [ContainerTeam],
        data() {
            return {
                teamTableType: 'supplier'
            };
        }
    };
});
