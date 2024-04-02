import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Collections } from './collections.entity';

@Entity({
  name: 'collectionLikes',
})
export class CollectionLikes {
  @PrimaryGeneratedColumn()
  id: number;

  // 컬렉션 좋아요 - 컬렉션
  @ManyToOne(() => Collections, (collections) => collections.collectionLikes)
  collections: Collections[];
}
