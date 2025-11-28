import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { catchError, Observable, tap } from 'rxjs'

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const httpContext = context.switchToHttp()
    const req = httpContext.getRequest()
    const res = httpContext.getResponse()

    const startedTimestamp = Date.now()

    return next.handle().pipe(
      tap(() => {
        req.url && this.log(req, res, startedTimestamp)
      }),
      catchError(error => {
        req.url && this.log(req, res, startedTimestamp)
        throw error
      }),
    )
  }

  log(req: Application.Request, res: Application.Response, startedTimestamp: number) {
    const { url, method } = req
    const { statusCode } = res

    this.logger.log(`[${method}] ${url} ${statusCode} - +${Date.now() - startedTimestamp}ms`)
  }
}
