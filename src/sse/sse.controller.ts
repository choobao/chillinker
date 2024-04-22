import { Sse, MessageEvent, Controller, Param } from '@nestjs/common';
import { interval, map, Observable } from 'rxjs';
import { SseService } from './sse.service';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse(':userId')
  //   sse(): Observable<MessageEvent> {
  //     return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
  //   }
  sendClientAlarm(@Param('userId') userId: string): Observable<MessageEvent> {
    return this.sseService.sendAlarm(+userId);
  }
}
