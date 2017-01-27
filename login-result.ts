export default class LoginResult {
    constructor() {
        this.isSuccessful = false
    }

    public isSuccessful: boolean
    public referenceToken: string
    public state: string
    public errorMessage: string
}