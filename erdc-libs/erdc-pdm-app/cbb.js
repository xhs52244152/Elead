define([], function () {
    return {
        /**
         * 加载 CBB
         * @param {string} cbbName - CBB 微功能包名
         * @returns {Promise<null|Object>}
         */
        useCBB(cbbName) {
            return new Promise((resolve) => {
                require([ELMP.func(`${cbbName}/index.js`)], function (CBBModule) {
                    resolve(CBBModule);
                }, function () {
                    resolve(null);
                });
            });
        }
    };
});
