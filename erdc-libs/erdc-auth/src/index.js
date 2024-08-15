import ErdcAuth from './ErdcAuth';

function useAuth(configUrl) {
    return new ErdcAuth(configUrl).init();
}

export { ErdcAuth, useAuth };

export default ErdcAuth;
