define([ELMP.resource('erdc-guideline/help/useSkeleton.js')], function (useSkeleton) {
    return function (markdownEntry) {
        return () => {
            /**
             * @param {string} markdownCode
             * @returns {import('vue').ComponentOptions}
             */
            const useComponent = (markdownCode) => ({
                setup() {
                    const { ref, onMounted } = require('vue');
                    let html = ref(null);

                    onMounted(() => {
                        require([
                            '/erdc-thirdparty/platform/markdown-it/dist/markdown-it.min.js',
                            '/erdc-thirdparty/platform/@highlightjs/cdn-assets/highlight.min.js',
                            'css!/erdc-thirdparty/platform/@highlightjs/cdn-assets/styles/github.min.css',
                            'css!/erdc-thirdparty/platform/github-markdown-css/github-markdown-light.css'
                        ], function (MarkdownIt) {
                            const hljs = window.hljs;
                            const md = MarkdownIt({
                                html: false,
                                linkify: true,
                                typographer: true,
                                highlight: function (str, lang) {
                                    if (lang && hljs.getLanguage(lang)) {
                                        try {
                                            return hljs.highlight(lang, str, true).value;
                                        } catch (error) {
                                            console.warn(error);
                                        }
                                    }
                                    return '';
                                }
                            });
                            html.value = md.render(markdownCode);
                        });
                    });

                    return {
                        html
                    };
                },
                template: `
                        <div class="markdown-body p-normal" v-html="html"></div>
                    `
            });

            const component = /\.md/i.test(markdownEntry)
                ? new Promise((resolve, reject) => {
                      require([`text!${markdownEntry}`], function (_markdown) {
                          resolve(useComponent(_markdown));
                      }, function (error) {
                          let err = new Error('加载帮助失败：' + error.message);
                          err.code = 'ERDC_HELP_LOAD_FAILED';
                          reject(err);
                      });
                  })
                : Promise.resolve(useComponent(markdownEntry));

            return {
                loading: useSkeleton(),
                component
            };
        };
    };
});
