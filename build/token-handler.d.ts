import LoginOptions from "./login-options";
import LoginResult from "./login-result";
export declare class TokenHandler {
    private _options;
    private _storage;
    initialise(options: LoginOptions, storage?: Storage): void;
    login(): void;
    loginCallback(): LoginResult;
    hasValidToken(): boolean;
    getAuthorizationHeader(): string;
    logOut(): void;
    private validateLoginOptions();
    private createLoginUrl();
    private createAndSaveNonce();
    private getFragment();
    private parseQueryString(queryString);
}
