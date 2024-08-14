define([], function () {
    async function init() {
        await register();
    }
    function register() {
        let arr = [];
        arr.push(
            new Promise((resolve) => {
                require([ELMP.resource('ppm-app/config/index.js')], async (register) => {
                    await register.init();
                    resolve();
                });
            })
        );
        return new Promise((resolve) => {
            Promise.all(arr).then(() => {
                resolve();
            });
        });
    }
    return {
        init
    };
});
