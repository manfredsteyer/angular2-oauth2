import {Base64} from 'js-base64';
import {fromByteArray} from 'base64-js';
import * as _sha256 from 'sha256';

var sha256: any = _sha256;

export class OAuthService {

    public clientId = "";
    public redirectUri = "";
    public loginUrl = "";
    public scope = "";
    public resource = "";
    public rngUrl = "";
    public oidc = false;
    public options: any;
    public state = "";
    public issuer = "";
    public validationHandler: any;
    public logoutUrl = "";
    
    public setStorage(storage: Storage) {
        this._storage = storage;
    }
    
    private _storage: Storage = localStorage;
    
    createLoginUrl(state) {
        var that = this;

        if (typeof state === "undefined") { state = ""; }

        return this.createAndSaveNonce().then(function (nonce: any) {

            if (state) {
                state = nonce + ";" + state;
            }
            else {
                state = nonce;   
            }

            var response_type = "token";

            if (that.oidc) {
                response_type = "id_token+token";
            }

            var url = that.loginUrl 
                        + "?response_type="
                        + response_type
                        + "&client_id=" 
                        + encodeURIComponent(that.clientId)
                        + "&state=" 
                        + encodeURIComponent(state)
                        + "&redirect_uri=" 
                        + encodeURIComponent(that.redirectUri) 
                        + "&scope=" 
                        + encodeURIComponent(that.scope);

            if (that.resource) {
                url += "&resource=" + encodeURIComponent(that.resource);
            }
            
            if (that.oidc) {
                url += "&nonce=" + encodeURIComponent(nonce);
            }
            
            return url;
        });
    };

    initImplicitFlow(additionalState = "") {
        this.createLoginUrl(additionalState).then(function (url) {
            location.href = url;
        })
        .catch(function (error) {
            console.error("Error in initImplicitFlow");
            console.error(error);
        });
    };
    
    callEventIfExists(options: any) {
        var that = this;
        if (options.onTokenReceived) {
            var tokenParams = { 
                idClaims: that.getIdentityClaims(),
                idToken: that.getIdToken(),
                accessToken: that.getAccessToken(),
                state: that.state
            };
            options.onTokenReceived(tokenParams);
        }
    }

    tryLogin(options) {
        
        options = options || { };
        
        
        var parts = this.getFragment();

        var accessToken = parts["access_token"];
        var idToken = parts["id_token"];
        var state = parts["state"];
        
        var oidcSuccess = false;
        var oauthSuccess = false;

        if (!accessToken || !state) return false;
        if (this.oidc && !idToken) return false;

        var savedNonce = this._storage.getItem("nonce");

        var stateParts = state.split(';');
        var nonceInState = stateParts[0];
        if (savedNonce === nonceInState) {
            
            this._storage.setItem("access_token", accessToken);

            var expiresIn = parts["expires_in"];

            if (expiresIn) {
                var expiresInMilliSeconds = parseInt(expiresIn) * 1000;
                var now = new Date();
                var expiresAt = now.getTime() + expiresInMilliSeconds;
                this._storage.setItem("expires_at", "" + expiresAt);
            }
            if (stateParts.length > 1) {
                this.state = stateParts[1];
            }

            oauthSuccess = true;

        }
        
        if (!oauthSuccess) return false;

        if (!this.oidc && options.onTokenReceived) {
            options.onTokenReceived({ accessToken: accessToken});
        }
        
        if (this.oidc) {
            oidcSuccess = this.processIdToken(idToken, accessToken);
            if (!oidcSuccess) return false;  
        }
        
      
        
        if (options.validationHandler) {
            
            var validationParams = {accessToken: accessToken, idToken: idToken};
            
            options
                .validationHandler(validationParams)
                .then(() => {
                    this.callEventIfExists(options);
                })
                .catch(function(reason) {
                    console.error('Error validating tokens');
                    console.error(reason);
                })
        }
        else {
            this.callEventIfExists(options);
        }
        
        // NEXT VERSION: Notify parent-window (iframe-refresh)
        /*
        var win = window;
        if (win.parent && win.parent.onOAuthCallback) {
            win.parent.onOAuthCallback(this.state);
        }            
        */
        
        return true;
    };
    
    processIdToken(idToken, accessToken) {
            var tokenParts = idToken.split(".");
            var claimsBase64 = this.padBase64(tokenParts[1]);
            var claimsJson = Base64.decode(claimsBase64);
            var claims = JSON.parse(claimsJson);
            var savedNonce = this._storage.getItem("nonce");
            
            if (claims.aud !== this.clientId) {
                console.warn("Wrong audience: " + claims.aud);
                return false;
            }

            if (this.issuer && claims.iss !== this.issuer) {
                console.warn("Wrong issuer: " + claims.iss);
                return false;
            }

            if (claims.nonce !== savedNonce) {
                console.warn("Wrong nonce: " + claims.nonce);
                return false;
            }
            
            if (accessToken && !this.checkAtHash(accessToken, claims)) {
                console.warn("Wrong at_hash");
                return false;
            }
            
            // Das Prüfen des Zertifikates wird der Serverseite überlassen!

            var now = Date.now();
            var issuedAtMSec = claims.iat * 1000;
            var expiresAtMSec = claims.exp * 1000;
            
            var tenMinutesInMsec = 1000 * 60 * 10;

            if (issuedAtMSec - tenMinutesInMsec >= now  || expiresAtMSec + tenMinutesInMsec <= now) {
                console.warn("Token has been expired");
                console.warn({
                    now: now,
                    issuedAtMSec: issuedAtMSec,
                    expiresAtMSec: expiresAtMSec
                });
                return false;
            }

            this._storage.setItem("id_token", idToken);
            this._storage.setItem("id_token_claims_obj", claimsJson);
            this._storage.setItem("id_token_expires_at", "" + expiresAtMSec);
            
            if (this.validationHandler) {
                this.validationHandler(idToken)
            }
            
            return true;
    }
    
    getIdentityClaims() {
        var claims = this._storage.getItem("id_token_claims_obj");
        if (!claims) return null;
        return JSON.parse(claims);
    }
    
    getIdToken() {
        return this._storage.getItem("id_token");
    }
    
    padBase64(base64data) {
        while (base64data.length % 4 !== 0) {
            base64data += "=";
        }
        return base64data;
    }

    tryLoginWithIFrame() {
        throw new Error("tryLoginWithIFrame has not been implemented so far");
    };
    
    tryRefresh(timeoutInMsec) {
        throw new Error("tryRefresh has not been implemented so far");
    };

    getAccessToken() {
        return this._storage.getItem("access_token");
    };

    hasValidAccessToken() {
        if (this.getAccessToken()) {

            var expiresAt = this._storage.getItem("expires_at");
            var now = new Date();
            if (expiresAt && parseInt(expiresAt) < now.getTime()) {
                return false;
            }

            return true;
        }

        return false;
    };
    
    hasValidIdToken() {
        if (this.getIdToken()) {

            var expiresAt = this._storage.getItem("id_token_expires_at");
            var now = new Date();
            if (expiresAt && parseInt(expiresAt) < now.getTime()) {
                return false;
            }

            return true;
        }

        return false;
    };
    
    authorizationHeader() {
        return "Bearer " + this.getAccessToken();
    }
    
    logOut() {
        var id_token = this.getIdToken();
        this._storage.removeItem("access_token");
        this._storage.removeItem("id_token");
        this._storage.removeItem("nonce");
        this._storage.removeItem("expires_at");
        this._storage.removeItem("id_token_claims_obj");
        this._storage.removeItem("id_token_expires_at");
        
        if (!this.logoutUrl) return;
        
        var logoutUrl = this.logoutUrl.replace(/\{\{id_token\}\}/, id_token);
        location.href = logoutUrl;
    };

    createAndSaveNonce() {
        var that = this;
        return this.createNonce().then(function (nonce: any) {
            that._storage.setItem("nonce", nonce);
            return nonce;
        })

    };

    createNonce() {
        
        return new Promise((resolve, reject) => { 
        
            if (this.rngUrl) {
                throw new Error("createNonce with rng-web-api has not been implemented so far");
            }
            else {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 40; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                
                resolve(text);
            }
        
        });
    };

    getFragment() {
        if (window.location.hash.indexOf("#") === 0) {
            return this.parseQueryString(window.location.hash.substr(1));
        } else {
            return {};
        }
    };

    parseQueryString(queryString) {
        var data = {}, pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

        if (queryString === null) {
            return data;
        }

        pairs = queryString.split("&");

        for (var i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            separatorIndex = pair.indexOf("=");

            if (separatorIndex === -1) {
                escapedKey = pair;
                escapedValue = null;
            } else {
                escapedKey = pair.substr(0, separatorIndex);
                escapedValue = pair.substr(separatorIndex + 1);
            }

            key = decodeURIComponent(escapedKey);
            value = decodeURIComponent(escapedValue);

            if (key.substr(0, 1) === '/')
                key = key.substr(1);

            data[key] = value;
        }

        return data;
    };
    
    checkAtHash(accessToken, idClaims) {
        if (!accessToken || !idClaims || !idClaims.at_hash ) return true;
        var tokenHash: Array<any> = sha256(accessToken, { asBytes: true });
        var leftMostHalf = tokenHash.slice(0, (tokenHash.length/2) );
        var tokenHashBase64 = fromByteArray(leftMostHalf);
        var atHash = tokenHashBase64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
        var claimsAtHash = idClaims.at_hash.replace(/=/g, "");
        
        if (atHash != claimsAtHash) {
            console.warn("exptected at_hash: " + atHash);    
            console.warn("actual at_hash: " + claimsAtHash);
        }
        
        
        return (atHash == claimsAtHash);
    }
    
}