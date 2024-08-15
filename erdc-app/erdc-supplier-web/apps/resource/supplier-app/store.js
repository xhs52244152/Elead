define(['erdcloud.store'], function () {
    const FamStore = require('erdcloud.store');
    return function useStore(store) {
        return new Promise((resolve) => {
            FamStore.registerModule('pdmSupplierStore', store);
            resolve();
        });
    };
});
