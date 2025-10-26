/**
 * API 재시도 유틸리티
 */

export interface RetryOptions {
  maxRetries?: number;
  timeout?: number; // milliseconds
  backoff?: number; // milliseconds
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  timeout: 60000, // 60초
  backoff: 1000, // 1초
  onRetry: () => {}
};

/**
 * 타임아웃 기능이 있는 Promise wrapper
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: string = 'API 요청 시간 초과'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
    )
  ]);
};

/**
 * 지수 백오프와 함께 함수를 재시도합니다
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // 첫 시도인지 재시도인지 로그
      if (attempt === 0) {
        console.warn('🚀 First attempt...');
      } else {
        console.warn(`🔄 Retry attempt ${attempt}/${opts.maxRetries}...`);
      }
      
      // 타임아웃과 함께 함수 실행
      const result = await withTimeout(
        fn(),
        opts.timeout,
        `요청 시간 초과 (${opts.timeout / 1000}초)`
      );
      
      // 성공 시 즉시 반환
      if (attempt > 0) {
        console.warn(`✅ Success on retry attempt ${attempt}`);
      } else {
        console.warn('✅ Success on first attempt');
      }
      return result;
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error?.message || error);

      // 마지막 시도가 아니면 재시도
      if (attempt < opts.maxRetries) {
        const delay = opts.backoff * Math.pow(2, attempt);
        console.warn(`⏳ Waiting ${delay}ms before retry...`);
        opts.onRetry(attempt + 1, error);
        
        // 백오프 대기
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`❌ All ${opts.maxRetries + 1} attempts failed`);
      }
    }
  }

  throw lastError;
};

/**
 * AbortController를 사용한 취소 가능한 Promise
 */
export class CancellablePromise<T> {
  private abortController: AbortController;
  private promise: Promise<T>;

  constructor(
    executor: (signal: AbortSignal) => Promise<T>
  ) {
    this.abortController = new AbortController();
    this.promise = executor(this.abortController.signal);
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<T | TResult> {
    return this.promise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<T> {
    return this.promise.finally(onfinally);
  }

  cancel() {
    this.abortController.abort();
  }
}

