define([], function () {
    return {
        api: {
            // 预实对比
            accountCompare: async function (vm, data) {
                vm.canLoading && (vm.loading = true);
                let res = await vm
                    .$famHttp({
                        url: '/ppm/budget/budgetChartInfo',
                        params: data,
                        method: 'get',
                        className: vm.budgetClassName
                    })
                    .finally(() => {
                        vm.canLoading && (vm.loading = false);
                    });
                return res;
            },
            // 各科目费用支出
            expensesDetail: async function (vm, data) {
                vm.canLoading && (vm.loading = true);
                let res = await vm
                    .$famHttp({
                        url: '/ppm/budget/budgetChartSubjectInfo',
                        params: data,
                        method: 'get',
                        className: vm.budgetClassName
                    })
                    .finally(() => {
                        vm.canLoading && (vm.loading = false);
                    });
                return res;
            },
            // 各科目费用支出
            totalExpenses: async function (vm, data) {
                vm.canLoading && (vm.loading = true);
                let res = await vm
                    .$famHttp({
                        url: '/ppm/budget/budgetChartTotalInfo',
                        params: data,
                        method: 'get',
                        className: vm.budgetClassName
                    })
                    .finally(() => {
                        vm.canLoading && (vm.loading = false);
                    });
                return res;
            }
        }
    };
});
