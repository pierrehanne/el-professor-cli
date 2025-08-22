import { RetryHelper } from '../../utils/RetryHelper';


describe('RetryHelper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('executeWithRetry', () => {
        it('should execute operation successfully on first try', async () => {
            const operation = jest.fn().mockResolvedValue('success');
            const result = await RetryHelper.executeWithRetry(operation);
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(1);
        });
    });

    describe('executeWithTimeout', () => {
        it('should resolve when operation completes within timeout', async () => {
            const operation = jest.fn().mockResolvedValue('success');
            
            const promise = RetryHelper.executeWithTimeout(operation, 1000);
            jest.advanceTimersByTime(500);
            
            const result = await promise;
            expect(result).toBe('success');
        });

        it('should reject when operation exceeds timeout', async () => {
            const operation = jest.fn().mockImplementation(() => 
                new Promise(resolve => setTimeout(resolve, 2000))
            );

            const promise = RetryHelper.executeWithTimeout(operation, 1000, 'test');
            
            jest.advanceTimersByTime(1001);
            
            await expect(promise).rejects.toThrow('Operation timed out after 1000ms in test');
        });
    });

});