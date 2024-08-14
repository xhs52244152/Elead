define([
    'text!' + ELMP.resource('ppm-component/ppm-components/SvgCircle/index.html'),
    'erdcloud.store',
    'css!' + ELMP.resource('ppm-component/ppm-components/SvgCircle/style.css')
], function (template, store) {
    let ppm_svgcircle = {
        name: 'ppm_svgcircle',
        template: template,
        props: {
            // 圆环外圈的半径，为了好看，最小值半径19
            size: {
                default: store.state?.mfe?.currentTheme === 'general-ultra' ? 12 : 9
            },
            // 圆环的小宽度
            // strokeWidth: {
            //     default: 50
            // },
            // // 圆环的颜色
            // strokeColor: {
            //     default: '#20a0ff'
            // },
            // strokeBgColor: {
            //     default: '#e5e9f2'
            // },
            // 圆环显示的百分比 这边是小数
            rate: {
                default: 0.5
            }
        },
        data() {
            return {};
        },
        computed: {
            timesY() {
                return this.size * 1.5;
            },
            strokeWidthIn() {
                return Math.round(0.6 * this.strokeWidth);
            },
            // 圆半径
            raduisActual() {
                let size = 16;
                return size;
            },
            // svg的宽高，也就是圆环直径
            diameterShow() {
                return 2 * this.size;
            },
            viewbox() {
                return `0 0 ${this.diameterShow} ${this.diameterShow}`;
            },
            strokeDasharray() {
                const perimeter = Math.PI * 2 * this.raduisActual;
                const showLength = Math.round(this.rate * perimeter);
                return `${showLength}, 100`;
            },
            transform() {
                return `matrix(0,-1,1,0,0,${this.diameterShow})`;
            }
        },
        mounted() {},
        methods: {}
    };
    return ppm_svgcircle;
});
