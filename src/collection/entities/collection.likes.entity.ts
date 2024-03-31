import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Collections } from './collections.entity';

@Entity({
  name: 'collection_likes',
})
export class Collection_likes {
  @PrimaryGeneratedColumn()
  id: number;

  // 컬렉션 좋아요 - 컬렉션
  @ManyToOne(() => Collections, (collections) => collections.collection_likes)
  collections: Collections[];
}
