define(['erdcloud.kit'], function (ErdcKit) {
    return {
        template: `
            <div ref="content" :style="style">
              <iframe ref="frame" :src="url" style="width: 100%;height: 100%;outline: none;border: none;"></iframe>
            </div>
        `,
        props: {
            processDefinitionId: {
                required: true,
                type: String
            },
            processInstanceId: {
                type: String,
                default: ''
            },
            taskId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                height: '100%'
            };
        },
        computed: {
            url() {
                return (
                    ELMP.resource('bpm-resource/components/BpmFlowchart/BpmFlowchart/index.html') +
                    '?' +
                    ErdcKit.serializeString({
                        processDefinitionId: this.processDefinitionId,
                        processInstanceId: this.processInstanceId,
                        taskId: this.taskId
                    })
                );
            },
            style() {
                return {
                    width: '100%',
                    height: this.height
                };
            }
        },
        mounted() {
            this.height = Math.ceil(window.innerHeight - ErdcKit.offset(this.$refs.content).top - 16 - 26) + 'px';
            this.$refs.frame.contentWindow.ELCONF = window.ELCONF;
            this.$refs.frame.contentWindow.ELMP = window.ELMP;
            this.$refs.frame.contentWindow.require = window.require;
        }
    };
});
