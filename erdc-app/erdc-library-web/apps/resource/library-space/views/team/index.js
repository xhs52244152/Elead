define([ELMP.resource('erdc-pdm-components/ContainerTeam/index.js')], function (ContainerTeam) {
    return {
        name: 'libraryTeam',
        mixins: [ContainerTeam],
        data() {
            return {
                teamTableType: 'library'
            };
        }
    };
});
