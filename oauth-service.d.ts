export declare class OAuthService {
    clientId: string;
    redirectUri: string;
    loginUrl: string;
    scope: string;
    resource: string;
    rngUrl: string;
    oidc: boolean;
    options: any;
    state: string;
    issuer: string;
    validationHandler: any;
    logoutUrl: string;
    acr_values: string;
    setStorage(storage: Storage): void;
    private _storage;
    createLoginUrl(state: any): Promise<string>;
    initImplicitFlow(additionalState?: string): void;
    callEventIfExists(options: any): void;
    tryLogin(options: any): boolean;
    processIdToken(idToken: any, accessToken: any): boolean;
    getIdentityClaims(): any;
    getIdToken(): string;
    padBase64(base64data: any): any;
    tryLoginWithIFrame(): void;
    tryRefresh(timeoutInMsec: any): void;
    getAccessToken(): string;
    hasValidAccessToken(): boolean;
    hasValidIdToken(): boolean;
    authorizationHeader(): string;
    logOut(): void;
    createAndSaveNonce(): Promise<any>;
    createNonce(): Promise<{}>;
    getFragment(): {};
    parseQueryString(queryString: any): {};
    checkAtHash(accessToken: any, idClaims: any): boolean;
}
