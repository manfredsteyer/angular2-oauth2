import LoginOptions from "./login-options"
import LoginResult from "./login-result"

export class TokenHandler {

    private _options: LoginOptions
    private _storage: Storage

    public initialise(options: LoginOptions, storage: Storage = localStorage) {
        this.logOut()
        this._options = options
        this._storage = storage
    }

    // Call to perform the redirect to the login page
    public login() {
        location.href = this.createLoginUrl()
    }

    // Called when the reference token has been received on the url
    public loginCallback(): LoginResult {

        let result = new LoginResult()

        const parts = this.getFragment()
        const accessToken = parts["access_token"]
        const state = parts["state"]

        if (!accessToken || !state) {
            result.errorMessage = "either the token or state is missing from the url"
        }
        else {
            const savedNonce = this._storage.getItem("nonce")
            const stateParts = state.split(";")
            const nonceInState = stateParts[0]

            if (savedNonce === nonceInState) {

                this._storage.setItem("access_token", accessToken)
                result.referenceToken = accessToken

                const expiresInMilliSeconds = parseInt(parts["expires_in"] || "432000") * 1000
                const now = new Date()
                const expiresAt = now.getTime() + expiresInMilliSeconds
                this._storage.setItem("expires_at", expiresAt.toString())

                if (stateParts.length > 1) {
                    result.state = stateParts[1]
                }

                result.isSuccessful = true
            }
            else {
                result.errorMessage = "nonce doesn't match"
            }
        }

        return result
    }


    // Gets whether a valid access token exists in storage
    public hasValidToken(): boolean {
        const expiresAt = this._storage.getItem("expires_at")
        const now = new Date()
        return expiresAt && parseInt(expiresAt) > now.getTime()
    }

    public getAuthorizationHeader(): string {
        return "Bearer " + this._storage.getItem("access_token")
    }

    public logOut() {
        this._storage.removeItem("access_token")
        this._storage.removeItem("nonce")
        this._storage.removeItem("expires_at")

        if (this.hasValidToken() && this._options.logoutUrl) {
            location.href = this._options.logoutUrl.replace(/\{\{id_token\}\}/, "mytoken")
        }
    }

    private validateLoginOptions() {
        if (!this._options) throw new Error("Token Handler has not been initialised. Initialise before login.")
        if (!this._options.clientId) throw new Error("Client Id has not been set on initialision options.")
        if (!this._options.redirectUri) throw new Error("redirectUri has not been set on initialision options.")
        if (!this._options.loginUrl) throw new Error("loginUrl has not been set on initialision options.")
        if (!this._options.scope) throw new Error("scope has not been set on initialision options.")
    }

    private createLoginUrl() {
        this.validateLoginOptions()
        let nonce = this.createAndSaveNonce()

        if (this._options.state) {
            nonce = nonce + ";" + this._options.state
        }

        let url = this._options.loginUrl
            + "?response_type=token"
            + "&client_id=" + encodeURIComponent(this._options.clientId)
            + "&state=" + encodeURIComponent(nonce)
            + "&redirect_uri=" + encodeURIComponent(this._options.redirectUri)
            + "&scope=" + encodeURIComponent(this._options.scope)

        if (this._options.resource) {
            url += "&resource=" + encodeURIComponent(this._options.resource)
        }

        if (this._options.acr_values) {
            url += "&acr_values=" + encodeURIComponent(this._options.acr_values)
        }

        return url
    }

    private createAndSaveNonce(): string {
        let nonce = ""
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        for (let i = 0; i < 40; i++)
            nonce += possible.charAt(Math.floor(Math.random() * possible.length))
        this._storage.setItem("nonce", nonce)
        return nonce
    }

    private getFragment(): any {
        if (window.location.hash.indexOf("#") === 0) {
            return this.parseQueryString(window.location.hash.substr(1))
        } else {
            return {}
        }
    }

    private parseQueryString(queryString): any {
        let data = {}, pairs, pair, separatorIndex, escapedKey, escapedValue, key, value

        if (queryString === null) {
            return data
        }

        pairs = queryString.split("&")

        for (let i = 0; i < pairs.length; i++) {
            pair = pairs[i]
            separatorIndex = pair.indexOf("=")

            if (separatorIndex === -1) {
                escapedKey = pair
                escapedValue = null
            } else {
                escapedKey = pair.substr(0, separatorIndex)
                escapedValue = pair.substr(separatorIndex + 1)
            }

            key = decodeURIComponent(escapedKey)
            value = decodeURIComponent(escapedValue)

            if (key.substr(0, 1) === "/")
                key = key.substr(1)

            data[key] = value
        }

        return data
    }
}