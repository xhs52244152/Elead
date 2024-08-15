define(['vs/editor/editor.main'], function (monaco) {
    return {
        name: 'FamMonacoEditor',

        template: /*html*/ `
            <div id="MonacoEditor" :style="style()"></div>
        `,
        props: {
            data: {
                type: String,
                default: ''
            },
            editorConfig: {
                type: Object,
                default() {
                    return {
                        language: 'json'
                    };
                }
            },
            width: {
                type: [String, Number],
                default: '100%'
            },
            minWidth: {
                type: [String, Number],
                default: 500
            },
            maxWidth: {
                type: [String, Number],
                default: null
            },
            height: {
                type: [String, Number],
                default: 'auto'
            },
            minHeight: {
                type: [String, Number],
                default: 200
            },
            maxHeight: {
                type: [String, Number],
                default: null
            }
        },
        computed: {
            monacoConfig() {
                return {
                    ...this.editorConfig,
                    value: this.data
                };
            }
        },
        data() {
            return {};
        },
        watch: {
            data() {
                const newModel = monaco.editor.createModel(this.data, this.editorConfig.language);
                this.monacoEditor.setModel(newModel);
            }
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            this.monacoEditor.dispose();
        },
        methods: {
            init() {
                monaco.editor.defineTheme('myTheme', {
                    base: 'vs',
                    inherit: true,
                    colors: {
                        'editor.background': '#ffffff',
                        'editor.lineHighlightBackground': '#ffffff',
                        'editor.lineHighlightBorder': '#eee'
                    },
                    rules: {}
                });
                monaco.editor.setTheme('myTheme');
                this.monacoEditor = monaco.editor.create(this.$el, this.monacoConfig);

                this.monacoEditor.onDidChangeModelContent(() => {
                    this.$emit('change', this.monacoEditor.getValue());
                });
            },
            style() {
                return {
                    'width': this.width && _.isNumber(this.width) ? `${this.width}px` : this.width,
                    'min-width': this.minWidth && _.isNumber(this.minWidth) ? `${this.minWidth}px` : this.minWidth,
                    'max-width': this.maxWidth && _.isNumber(this.maxWidth) ? `${this.maxWidth}px` : this.maxWidth,
                    'height': this.height && _.isNumber(this.height) ? `${this.height}px` : this.height,
                    'min-height': this.minHeight && _.isNumber(this.minHeight) ? `${this.minHeight}px` : this.minHeight,
                    'max-height': this.maxHeight && _.isNumber(this.maxHeight) ? `${this.maxHeight}px` : this.maxHeight
                };
            },
            getValue() {
                return this.monacoEditor.getValue();
            }
        }
    };
});
