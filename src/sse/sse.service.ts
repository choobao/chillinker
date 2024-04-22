import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, filter, map, merge } from 'rxjs';

@Injectable()
export class SseService {
  private commentLikes$: Subject<any> = new Subject();
  private collectionLikes$: Subject<any> = new Subject();

  private commentObserver = this.commentLikes$.asObservable();
  private collectionObserver = this.collectionLikes$.asObservable();

  // 이벤트 발생 함수
  emitReviewLikeCountEvent(
    webContent: string,
    userId: number,
    likeCount: number,
  ) {
    // next를 통해 이벤트를 생성
    console.log(
      `emitReviewLikeCountEvent 호출됨: webContent=${webContent}, userId=${userId}, likeCount=${likeCount}`,
    );
    this.commentLikes$.next({ webContent, userId, likeCount });
  }

  // 컬렉션 좋아요 이벤트 발생 함수
  emitCollectionLikeCountEvent(
    webContent: string,
    userId: number,
    likeCount: number,
  ) {
    // 컬렉션 좋아요 이벤트를 발생시킴
    this.collectionLikes$.next({ webContent, userId, likeCount });
  }

  sendAlarm(userId: number): Observable<any> {
    // 댓글 알림과 컬렉션 알림을 합침
    const commentAlarm = this.commentObserver.pipe(
      filter((user) => user.id === userId),
      map((user) => {
        const isMatch = user.id === userId;
        console.log(
          `filter 조건 확인: user.id=${user.id}, userId=${userId}, isMatch=${isMatch}`,
        );
        return {
          data: {
            message: `${user.webContent}에 작성한 댓글 좋아요 수 ${user.likeCount}개를 달성했습니다.`,
          },
        } as MessageEvent;
      }),
    );

    const collectionAlarm = this.collectionObserver.pipe(
      filter((user) => user.id === userId),
      map((user) => {
        return {
          data: {
            message: `${user.webContent}에 작성한 컬렉션 좋아요 수 ${user.likeCount}개를 달성했습니다.`,
          },
        } as MessageEvent;
      }),
    );

    // 댓글 알림과 컬렉션 알림을 합친 옵저버블 반환
    return merge(commentAlarm, collectionAlarm);
  }

  //   sendAlarm(userId: number): Observable<any> {
  //     // return new Observable((observer) => {
  //     // 댓글 알림과 컬렉션 알림을 합침
  //     console.log('댓글알림까지 연결');
  //     return this.commentObserver.pipe(
  //       filter((user) => user.id === userId),
  //       map((user) => {
  //         return {
  //           data: {
  //             message: `${user.webContent}에 작성한 댓글 좋아요 수 ${user.likeCount}개를 달성했습니다.`,
  //           },
  //         } as MessageEvent;
  //       }),
  //     );

  //   const collectionAlarm = this.collectionObserver.pipe(
  //     filter((user) => user.id === userId),
  //     map((user) => {
  //       return {
  //         data: {
  //           message: `${user.webContent}에 작성한 컬렉션 좋아요 수 ${user.likeCount}개를 달성했습니다.`,
  //         },
  //       } as MessageEvent;
  //     }),
  //   );

  // 클라이언트로 SSE 이벤트 전송
  //   observer.next(commentAlarm);
  //   observer.next(collectionAlarm);

  //  return merge(commentAlarm, collectionAlarm);
}
