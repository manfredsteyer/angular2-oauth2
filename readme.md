# angular2-oauth2

Support for OAuth 2 and OpenId Connect (OIDC) for Angular 2.

## Router

Successfully tested with the Angular 2 (RC) Component Router, PathLocationStrategy and CommonJS-Bundling via webpack.

## Features

- Logging in via OAuth2 and OpenId Connect (OIDC)
- Using OIDC is optional
- Validating claims of the id_token regarding the specs (aud, iss, nbf, exp, at_hash)
- Hook for validating the signature of the received id_token
- Single-Sign-Out by redirecting to the auth-server's logout-endpoint

## Sample-Auth-Server

You can use the following OIDC-Sample-Server for Testing. It assumes, that your Web-App runns on http://localhost:8080.

Username/Password: max/geheim

## Resources

- Sample for using this lib: https://github.com/manfredsteyer/angular2-rc1-sample
- Sources of this lib: https://github.com/manfredsteyer/angular2-oauth2

## Usage

Following samples use Angular 2 RC 1 with the "newest RC1-Router". For samples regarding the "BETA-Router" 
that has been depricated after the BETA-phase, see the [older version of this readme-file](https://github.com/manfredsteyer/angular2-oauth2/blob/master/beta-readme.md).

### Setup Provider for OAuthService

```
import {bootstrap}    from '@angular/platform-browser-dynamic';
import {HTTP_PROVIDERS} from '@angular/http';
import {ROUTER_PROVIDERS} from '@angular/router';
import {AppComponent} from './app.component';

import { OAuthService } from 'angular2-oauth2/oauth-service';

var providers = [  
    OAuthService,   // <-- Provider for OAuthService
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS
];

bootstrap(AppComponent, providers);
``` 

### Top-Level-Component

```
import { OAuthService } from 'angular2-oauth2/oauth-service';

@Component({
    selector: 'flug-app',
    template: require("./app.component.html"),
    directives: [ROUTER_DIRECTIVES] // routerLink, router-outlet 
})
@Routes([
    { path: '/',                  component: HomeComponent },
    { path: '/flug-buchen',       component: FlugBuchen},
])
export class AppComponent { 
    
    constructor(private oauthService: OAuthService) {
        
        // Login-Url
        this.oauthService.loginUrl = "https://steyer-identity-server.azurewebsites.net/identity/connect/authorize"; //Id-Provider?
        
        // URL of the SPA to redirect the user to after login
        this.oauthService.redirectUri = window.location.origin + "/index.html";
        
        // The SPA's id. Register SPA with this id at the auth-server
        this.oauthService.clientId = "spa-demo";
        
        // The name of the auth-server that has to be mentioned within the token
        this.oauthService.issuer = "https://steyer-identity-server.azurewebsites.net/identity";

        // set the scope for the permissions the client should request
        this.oauthService.scope = "openid profile email voucher";
        
        // set to true, to receive also an id_token via OpenId Connect (OIDC) in addition to the
        // OAuth2-based access_token
        this.oauthService.oidc = true;
        
        // Use setStorage to use sessionStorage or another implementation of the TS-type Storage
        // instead of localStorage
        this.oauthService.setStorage(sessionStorage);
        
        // To also enable single-sign-out set the url for your auth-server's logout-endpoint here
        this.oauthService.logoutUrl = "https://steyer-identity-server.azurewebsites.net/identity/connect/endsession?id_token={{id_token}}";
        
        // This method just tries to parse the token within the url when
        // the auth-server redirects the user back to the web-app
        // It dosn't initiate the login
        this.oauthService.tryLogin({});
        
    }
    
}

```

### Home-Component (for login)

```
import { Component } from '@angular/core';
import { OAuthService } from 'angular2-oauth2/oauth-service';

@Component({
    templateUrl: "app/home.html" 
})
export class HomeComponent {
    
    constructor(private oAuthService: OAuthService) {
    }
    
    public login() {
        this.oAuthService.initImplicitFlow();
    }
    
    public logoff() {
        this.oAuthService.logOut();
    }
    
    public get name() {
        let claims = this.oAuthService.getIdentityClaims();
        if (!claims) return null;
        return claims.given_name; 
    }
    
}
```

```
<h1 *ngIf="!name">
    Hallo
</h1>
<h1 *ngIf="name">
    Hallo, {{name}}
</h1>

<button class="btn btn-default" (click)="login()">
    Login
</button>
<button class="btn btn-default" (click)="logoff()">
    Logout
</button>

<div>
    Username/Passwort zum Testen: max/geheim
</div>
```

### Calling a Web API with OAuth-Token

Pass this Header to the used method of the ``Http``-Service within an Instance of the class ``Headers``:

```
var headers = new Headers({
    "Authorization": "Bearer " + this.oauthService.getAccessToken()
});
```

### Validate id_token

In cases where security relies on the id_token (e. g. in hybrid apps that use it to provide access to local resources)
you could use the callback ``validationHandler`` to define the logic to validate the token's signature. 
The following sample uses the validation-endpoint of [IdentityServer3](https://github.com/IdentityServer/IdentityServer3) for this:

```
this.oauthService.tryLogin({
    validationHandler: context => {
        var search = new URLSearchParams();
        search.set('token', context.idToken); 
        search.set('client_id', oauthService.clientId);
        return http.get(validationUrl, { search }).toPromise();
    }
});
```

### Callback after successful login

There is a callback ``onTokenReceived``, that is called after a successful login. In this case, the lib received the access_token as
well as the id_token, if it was requested. If there is an id_token, the lib validated it in view of it's claims 
(aud, iss, nbf, exp, at_hash) and - if a ``validationHandler`` has been set up - with this ``validationHandler``, e. g. to validate
the signature of the id_token.

```
this.oauthService.tryLogin({
    onTokenReceived: context => {
        //
        // Output just for purpose of demonstration
        // Don't try this at home ... ;-)
        // 
        console.debug("logged in");
        console.debug(context);
    },
    validationHandler: context => {
        var search = new URLSearchParams();
        search.set('token', context.idToken); 
        search.set('client_id', oauthService.clientId);
        return http.get(validationUrl, { search}).toPromise();
    }
});
```