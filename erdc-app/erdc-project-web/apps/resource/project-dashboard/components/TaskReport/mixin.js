define([], function () {
    return {
        methods: {
            changeData(val) {
                if (val instanceof Array) {
                    this.startTime = val[0] || '';
                    this.endTime = val[1] || '';
                } else {
                    this.startTime = '';
                    this.endTime = '';
                }
                this.getData();
            },
        }
    };
});
