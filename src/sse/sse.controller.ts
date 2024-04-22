import { Sse, MessageEvent, Controller, Param } from '@nestjs/common';
import { fromEvent, interval, map, Observable } from 'rxjs';
import { SseService } from './sse.service';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse(':userId')
  // sse(@Param('userId') userId: number): Observable<MessageEvent> {
  // return fromEvent(this.eventEmitter, 'sse').pipe(
  //   map((_data: { userId: number }) => {
  //     if(_data.userId == userId){
  //       return { data: { type: 'new event' } };
  //     }
  //   }),
  // )}
  // sse(): Observable<MessageEvent> {
  //   return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
  // }
  sse(@Param('userId') userId: string): Observable<MessageEvent> {
    return this.sseService.sendAlarm(+userId);
  }
}
