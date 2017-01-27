import { expect } from "chai"
import { spy, stub } from "sinon"


/*
describe("the errorHandler attribute on invalid object", function () {
    describe("should barf", function () {
        it("if no logger defined on test class", function () {
            let badClass = new TestClassNoLogger()
            expect(() => badClass.testMethod()).to.throw()
        });
    });
});

describe("the errorHandler on a valid object", function () {
    var _loggerStub: any
    var _testClass: TestClass

    beforeEach(function () {
        _loggerStub = {
            error: stub()
        }
        _testClass = new TestClass(_loggerStub)
    })

    describe("on methods that don't return a value", function () {
        it("should not log if no error", function () {
            _testClass.testReturnVoidMethod(false)
            expect(_loggerStub.error.calledOnce).to.eql(false)
        });
        it("should log if error thrown", function () {
            expect(() => _testClass.testReturnVoidMethod(true)).to.throw()
            expect(_loggerStub.error.calledOnce).to.eql(true)
            var firstcall = _loggerStub.error.firstCall
            expect(firstcall.args.length).to.equal(4)
            expect(firstcall.args[0]).not.to.be.null
            expect(firstcall.args[1]).to.eql("Unhandled error caught in {methodName} with args {args}")
            expect(firstcall.args[2]).to.eql("testReturnVoidMethod")
            expect(firstcall.args[3][0]).is.true
        });

        describe("On methods that return simple object", function () {
            it("should not log if no error", function () {
                let testResult = _testClass.testReturnNumberMethod(false)
                expect(_loggerStub.error.calledOnce).to.eql(false)
                expect(testResult).to.equal(10)
            });
            it("should not log if no error with pass through", function () {
                let testResult = _testClass.testPassNumberMethod(98765, false)
                expect(_loggerStub.error.calledOnce).to.eql(false)
                expect(testResult).to.equal(98765)
            });
            it("should log if error thrown", function () {
                expect(() => _testClass.testReturnNumberMethod(true)).to.throw()
                expect(_loggerStub.error.calledOnce).to.eql(true)
                var firstcall = _loggerStub.error.firstCall
                expect(firstcall.args.length).to.equal(4)
                expect(firstcall.args[0]).not.to.be.null
                expect(firstcall.args[1]).to.eql("Unhandled error caught in {methodName} with args {args}")
                expect(firstcall.args[2]).to.eql("testReturnNumberMethod")
                expect(firstcall.args[3][0]).is.true
            });
            it("should log if error thrown with param", function () {
                expect(() => _testClass.testPassNumberMethod(98775, true)).to.throw()
                expect(_loggerStub.error.calledOnce).to.eql(true)
                var firstcall = _loggerStub.error.firstCall
                expect(firstcall.args.length).to.equal(4)
                expect(firstcall.args[0]).not.to.be.null
                expect(firstcall.args[1]).to.eql("Unhandled error caught in {methodName} with args {args}")
                expect(firstcall.args[2]).to.eql("testPassNumberMethod")
                expect(firstcall.args[3][1]).is.true
                expect(firstcall.args[3][0]).is.equal(98775)
            });
        });

        describe("On methods that return a promise", function () {
            it("should not log if no error", function () {
                return _testClass.testReturnPromiseMethod(false)
                    .then((result) => {
                        expect(result).to.equal("SuccessPromise")
                        expect(_loggerStub.error.calledOnce).to.eql(false)
                    })
            });
            it("should not log if no error With parameters", function () {
                let testResultPromise = _testClass.testReturnPromiseWithParamMethod(12345, false)
                testResultPromise.then(val => {
                    expect(_loggerStub.error.calledOnce).to.eql(false)
                    expect(val).to.equal(12345)
                })
            });
            it("should log if promise rejected with an error without parameters", function () {
                let testResultPromise = _testClass.testReturnPromiseThrowsMethod()
                testResultPromise
                    .catch(reason => {
                        expect(reason).to.be.equal("ExceptionThrown")
                        expect(_loggerStub.error.calledOnce).to.eql(true)
                        var firstcall = _loggerStub.error.firstCall
                        expect(firstcall.args.length).to.equal(4)
                        expect(firstcall.args[0]).not.to.be.null
                        expect(firstcall.args[1]).to.eql("Unhandled error caught in {methodName} with args {args}")
                        expect(firstcall.args[2]).to.eql("testReturnPromiseMethod")
                        expect(firstcall.args[3][0]).is.true
                    })
                    .then(() => expect.fail("Should not get here"))
            });
            it("should log if promise rejected with an error with parameters", function () {
                let testResultPromise = _testClass.testReturnPromiseRejectsWithParamsMethod(456654)
                testResultPromise
                    .catch(reason => {
                        expect(reason).to.be.equal("ExceptionThrown")
                        expect(_loggerStub.error.calledOnce).to.eql(true)
                        var firstcall = _loggerStub.error.firstCall
                        expect(firstcall.args.length).to.equal(4)
                        expect(firstcall.args[0]).not.to.be.null
                        expect(firstcall.args[1]).to.eql("Unhandled error caught in {methodName} with args {args}")
                        expect(firstcall.args[2]).to.eql("testReturnPromiseWithParamMethod")
                        expect(firstcall.args[3][0]).is.equal(456654)
                        expect(firstcall.args[3][1]).is.true
                    })
                    .then(() => expect.fail("Should not get here"))
            });
            it("should not log if promise rejected with NO error", function () {
                let testResultPromise = _testClass.testReturnPromiseRejectsMethod()
                testResultPromise
                    .catch(reason => {
                        expect(reason).to.be.equal("RejectedTest")
                        expect(_loggerStub.error.calledOnce).to.eql(false)
                    })
                    .then(() => expect.fail("Should not get here"))
            });
        });
    });
});

*/