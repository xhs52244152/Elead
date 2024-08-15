define([
    '/erdc-thirdparty/platform/echarts/dist/echarts.min.js'
], function(echarts) {
    return {
        name: 'visualProcess',
        template: '<div id="my-echarts" style="width: 900px;height:600px;"></div>',
        data() {
            return {
                data: {
                    title: {
                        text: 'ECharts'
                    },
                    tooltip: {},
                    xAxis: {
                        data: ['Gucci', 'Louis', 'Fendi', 'Prada', 'Armani', 'Dior', 'Hermes', 'Balenciaga']
                    },
                    yAxis: {},
                    series: [
                        {
                            name: '销量',
                            type: 'bar',
                            data: [5, 20, 36, 10, 10, 20, 30, 18]
                        }
                    ]
                }
            }
        },
        mounted() {
            this.seeEcharts();
        },
        methods: {
            seeEcharts() {
                const myChart = echarts.init(document.getElementById('my-echarts'));
                myChart.setOption(this.data);
            }
        }
    };
});
