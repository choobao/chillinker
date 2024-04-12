import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Collections } from './collections.entity';
import { WebContents } from 'src/web-content/entities/webContents.entity';

@Entity({ name: 'content_collections' })
export class ContentCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Collections, (collection) => collection.contentCollections)
  collection: Collections;

  @ManyToOne(() => WebContents, (webContent) => webContent.contentCollections)
  webContent: WebContents;
}
