import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { AgeLimit } from "../types/ageLimit.type";
import { ContentStatus } from "../types/contentStatus.type";
import { ContentType } from "../types/webContent.type";
import { IsEnum, IsInt, IsString } from "class-validator";

@Entity("webContents")
export class WebContent {
  @IsInt()
  @PrimaryGeneratedColumn()
  id: number;

  @IsEnum(ContentType)
  @Column({ type: "enum", enum: ContentType })
  contentType: ContentType;

  @IsString()
  @Column({ type: "varchar", length: 30 })
  title: string;

  @Column({ type: "varchar", length: 200 })
  desc: string;

  @Column({ type: "varchar" })
  image: string;

  @Column({ type: "int" })
  bogosipCount: number;

  @Column({ type: "float" })
  rate: number;

  @Column({ type: "enum", enum: AgeLimit })
  ageLimit: AgeLimit;

  @Column({ type: "varchar", length: 20 })
  author: string;

  @Column({ type: "enum", enum: ContentStatus })
  status: ContentStatus;

  @Column({ type: "json", nullable: true })
  keyword?: JSON;

  @Column({ type: "varchar", length: 10 })
  category: string;

  @Column({ type: "varchar", length: 70 })
  term: string;

  @Column({ type: "json" })
  platform: JSON;

  @Column({ type: "date" })
  pubDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Bogosip, (bogosip) => bogosip.webContent)
  bogosips: Bogosip[];

  @OneToMany(() => PReview, (pReview) => pReview.webContent)
  pReviews: PReview[];

  @OneToMany(() => CReview, (cReview) => cReview.webContent)
  cReviews: CReview[];

  @ManyToOne(() => Collection, (collection) => collection.webContents, {
    onDelete: "CASCADE",
  })
  collection: Collection;
}
