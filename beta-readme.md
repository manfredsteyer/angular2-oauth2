# angular2-oauth2

Support for OAuth 2 and OpenId Connect (OIDC) for Angular 2.

## Router

Successfully tested with PathLocationStrategy and CommonJS-Bundling via webpack.

## Sample

You can use the following OIDC-Sample-Server for Testing. It assumes, that your Web-App runns on http://localhost:8080.

Username/Password: max/geheim

### Top-Level-Component

```
import { OAuthService } from 'angular2-oauth2/oauth-service';

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
    directives: [ROUTER_DIRECTIVES], // router-outlet, routerLink
    providers: [OAuthService]
})
@RouteConfig([ ... ])
export class AppComponent {

    constructor(
        private oauthService: OAuthService) {

        this.oauthService.loginUrl = "https://steyer-identity-server.azurewebsites.net/identity/connect/authorize"; //Id-Provider?
        this.oauthService.redirectUri = window.location.origin + "/index.html";
        this.oauthService.clientId = "spa-demo";
        this.oauthService.scope = "openid profile email voucher";
        this.oauthService.issuer = "https://steyer-identity-server.azurewebsites.net/identity";
        this.oauthService.oidc = true;

        this.oauthService.tryLogin({});
    }
}
```

### Home-Component (for login)

```
import {Component} from "angular2/core";
import { OAuthService } from 'angular2-oauth2/oauth-service';

@Component({
    templateUrl: 'app/home/home.html'
})
export class Home {

    info = "Willkommen!";
    message = "";

    constructor(private oauthService: OAuthService) {
    }

    login() {
        this.oauthService.initImplicitFlow();
    }

    logout() {
        this.oauthService.logOut();
        this.message = "You're logged off now";
    }

    get isLoggedIn() {
        return this.oauthService.hasValidAccessToken();
    }

    get name() {
        var claims = this.oauthService.getIdentityClaims();
        if (!claims) return null;
        return claims.given_name;
    }

}
```

```
<h1>{{info}}</h1>

<h1 *ngIf="name">Hello, {{ name }}</h1>

<p>
    Willkommen zu dieser Demo-Anwendung!
</p>

<p>
    {{ message }}
</p>
<p>
    <button class="btn btn-default" (click)="login()">Login</button>
    <button class="btn btn-default" (click)="logout()">Logout</button>
</p>
```

### Calling a Web API with OAuth-Token

Pass this Header to the used method of the ``Http``-Service within an Instance of the class ``Headers``:

```
var headers = new Headers({
    "Authorization": "Bearer " + this.oauthService.getAccessToken()
});
```