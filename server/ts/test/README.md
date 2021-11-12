# Testing

## Ava guide

### Attributing uncaught exceptions to tests

AVA [can't trace uncaught exceptions](https://github.com/avajs/ava/issues/214) back to the test that triggered them. Callback-taking functions may lead to uncaught exceptions that can then be hard to debug. Consider promisifying and using `async`/`await`, as in the above example. This should allow AVA to catch the exception and attribute it to the correct test.

### Using .throws()

[Function should throw an error](https://github.com/avajs/ava#throwsfunctionpromise-error-message), so needs to wrap in () => functionWhichThrows() to ensure that throw doesn't happen until test is evaluated.