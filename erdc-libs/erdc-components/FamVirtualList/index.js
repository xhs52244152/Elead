define([
    'text!' + ELMP.resource('erdc-components/FamVirtualList/index.html'),
    'css!' + ELMP.resource('erdc-components/FamVirtualList/style.css')
], function (template) {
    const throttle = (fn, delay) => {
        let tag = false;
        return function (...args) {
            if (tag) return;
            tag = true;
            setTimeout(() => {
                fn.apply(this, args);
                tag = false;
            }, delay);
        };
    };

    return {
        name: 'FamVirtualList',
        template: template,
        props: {
            // 要渲染的数据
            items: {
                type: Array,
                default: () => []
            },
            // 每条数据渲染的节点的高度
            itemHeight: {
                type: Number,
                default: 30
            },
            // 每次渲染的 DOM 节点个数
            showNumber: {
                type: Number,
                default: 20
            },
            // 容器的高度
            containerHeight: {
                type: Number,
                default: 500
            },
            selectItem: {
                type: Object,
                default: () => {
                    return null;
                }
            },
            searchValue: {
                type: String,
                default: ''
            },
            appName: String
        },
        data() {
            return {
                dataList: [],
                start: 0, // 要展示的数据的起始下标
                end: this.showNumber, // 要展示的数据的结束下标
                pageIndex: 1,
                pageSize: 20,
                totalCount: 0,
                selectedItem: {},
                numberOfPerPage: 0
            };
        },
        computed: {
            // 最终筛选出的要展示的数据
            showData() {
                return this.dataList.slice(this.start, this.end);
            },
            // 容器的高度
            // containerHeight() {
            //     return this.itemHeight * this.shownumber + 'px';
            // },
            // 撑开容器内容高度的元素的高度
            barHeight() {
                return this.itemHeight * this.dataList.length + 'px';
            },
            // 列表向上滚动时要动态改变 top 值
            listTop() {
                return this.start * this.itemHeight + 'px';
            }
        },
        watch: {
            pageIndex(val) {
                val > 0 && this.queryNextPageData();
            },
            containerHeight: {
                immediate: true,
                handler(val) {
                    this.initPage(val);
                }
            },
            selectItem: {
                immediate: true,
                handler(val) {
                    this.selectedItem = val || {};
                }
            },
            showNumber(val) {
                this.numberOfPerPage = val;
            },
            searchValue() {
                this.initPage(this.containerHeight);
            },
            appName() {
                this.initPage(this.containerHeight);
            }
        },
        // mounted() {
        //     this.initPage();
        // },
        methods: {
            // 容器的滚动事件
            onScroll() {
                throttle(this.handleScroll(), 50);
            },
            handleScroll() {
                // 获取容器顶部滚动的尺寸
                const scrollTop = this.$refs.container.scrollTop;
                // 计算卷去的数据条数，用计算的结果作为获取数据的起始和结束下标

                const scrollHeight = this.$refs.container.scrollHeight;

                // 增加10px 避免缩放分辨率后的计算偏差 导致不触发滚动加载
                if (scrollTop + this.containerHeight + 10 >= scrollHeight) {
                    this.pageIndex++;
                }
                // 起始的下标就是卷去的数据条数，向下取整
                this.start = Math.floor(scrollTop / this.itemHeight);
                // 结束的下标就是起始的下标加上要展示的数据条数
                this.end = this.start + this.numberOfPerPage;
            },
            initPage(containerHeight) {
                this.dataList = [];
                // this.pageSize = this.shownumber;
                // 通过容器的高度 / 每个item的高度， 向上取整数，得到容器内可展示的条数
                // 根据容器内可展示的条数 / 接口的pageSize = 需要查询的页数，循环调用接口获取 页数 +1 页的数据
                if (containerHeight === 0) return;
                this.numberOfPerPage = Math.ceil(containerHeight / this.itemHeight);
                const pageCounts = Math.ceil(this.numberOfPerPage / this.pageSize) + 1;
                const promiseArr = [];
                let i = 1;
                while (i <= pageCounts) {
                    promiseArr.push(this.getDataList({ pageIndex: i }));
                    i++;
                }
                this.pageIndex = pageCounts;
                this.end = this.numberOfPerPage;
                Promise.all(promiseArr).then((resArr) => {
                    resArr.forEach((res) => {
                        if (res?.code === '200') {
                            this.dataList = this.dataList.concat(res.data.records || []);
                            this.totalCount = Number(res.data.total);
                        }
                    });
                });
            },
            getDataList(data) {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/fam/container/queryContainerInfoPage',
                        method: 'post',
                        data: {
                            appNames: this.appName === 'ALL' ? [] : [this.appName],
                            pageIndex: data?.pageIndex || this.pageIndex,
                            pageSize: this.pageSize,
                            searchKey: this.searchValue
                        }
                    })
                        .then((resp) => {
                            resolve(resp);
                        })
                        .catch((err) => {
                            reject('查询失败');
                        });
                });
            },
            queryNextPageData() {
                if (this.dataList.length === this.totalCount) return;
                this.getDataList().then((res) => {
                    if (res?.code === '200') {
                        this.dataList = this.dataList.concat(res.data.records || []);
                    }
                });
            },
            handlerCheckItem(item) {
                this.selectedItem = item;
                this.$emit('handler-change-node', this.selectedItem);
            }
        }
    };
});
