import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Collections } from './collections.entity';
import { WebContents } from '../../web-content/entities/webContents.entity';

@Entity({ name: 'content_collections' })
export class ContentCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Collections, (collection) => collection.contentCollections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collections;

  @ManyToOne(() => WebContents, (webContent) => webContent.contentCollections)
  @JoinColumn({ name: 'webContent_id' })
  webContent: WebContents;

  @Column('int', { name: 'collection_id', nullable: false })
  collectionId: number;

  @Column('int', { name: 'webContent_id', nullable: false })
  webContentId: number;

  @CreateDateColumn()
  createdAt: Date;
}
