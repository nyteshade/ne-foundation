const { Extensions } = require('../../dist/cjs/index.js')
const Deferred = Extensions.Deferred.class

describe('Deferred', () => {
  let deferred;

  beforeEach(() => {
    deferred = new Deferred();
  });

  test('should create a Deferred instance with a promise', () => {
    expect(deferred).toBeInstanceOf(Deferred);
    expect(deferred.promise).toBeInstanceOf(Promise);
  });

  test('should resolve with a value', async () => {
    const value = 'resolved value';
    deferred.resolve(value);
    await expect(deferred.promise).resolves.toBe(value);
    expect(deferred.value).toBe(value);
    expect(deferred.settled).toBe(true);
  });

  test('should reject with a reason', async () => {
    const reason = 'rejected reason';
    deferred.reject(reason);
    await expect(deferred.promise).rejects.toBe(reason);
    expect(deferred.reason).toBe(reason);
    expect(deferred.settled).toBe(true);
  });

  test('should call then with the resolved value', async () => {
    const value = 'resolved value';
    const onFulfilled = jest.fn();
    deferred.resolve(value);
    await deferred.then(onFulfilled);
    expect(onFulfilled).toHaveBeenCalledWith(value);
  });

  test('should call catch with the rejection reason', async () => {
    const reason = 'rejected reason';
    const onRejected = jest.fn();
    deferred.reject(reason);
    await deferred.catch(onRejected);
    expect(onRejected).toHaveBeenCalledWith(reason);
  });

  test('should call finally regardless of resolution or rejection', async () => {
    const onFinally = jest.fn();
    deferred.resolve('resolved value');
    await deferred.finally(onFinally);
    expect(onFinally).toHaveBeenCalled();

    deferred = new Deferred(); // Reset for rejection test
    deferred.reject('rejected reason')
    expect(deferred.settled).toBe(true)
    try { await deferred.finally(onFinally); } catch {}
    expect(onFinally).toHaveBeenCalledTimes(2);
  });

  test('should not track value or reason if doNotTrackAnswers is true', () => {
    const value = 'resolved value';
    const reason = 'rejected reason';
    const deferredNoTrack = new Deferred({ doNotTrackAnswers: true });

    deferredNoTrack.resolve(value);
    expect(deferredNoTrack.value).toBeNull();

    deferredNoTrack.reject(reason);
    expect(deferredNoTrack.reason).toBeNull();
  });

  test('should auto-resolve or auto-reject based on options', async () => {
    const resolvedDeferred = new Deferred({ resolve: 'auto-resolved value' });
    await expect(resolvedDeferred.promise).resolves.toBe('auto-resolved value');

    const rejectedDeferred = new Deferred({ reject: 'auto-rejected reason' });
    await expect(rejectedDeferred.promise).rejects.toBe('auto-rejected reason');
  });

  test('should throw an error if both resolve and reject options are provided', () => {
    expect(() => {
      new Deferred({ resolve: 'value', reject: 'reason' });
    }).toThrow(TypeError);
  });
});