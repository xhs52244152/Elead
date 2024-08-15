define([], function () {
    return {
        setup() {
            return {};
        },
        template: `
            <div class="flex align-items-center justify-center">
                <erd-image 
                  src="${ELMP.resource('erdc-participant-helps/ParticipantManageGuideline/guideline.png')}"
                >
                    <template #placeholder>
                        <span style="color-placeholder">{{i18n.loading}} </span>
                    </template>
                </erd-image>
            </div>
        `
    };
});
