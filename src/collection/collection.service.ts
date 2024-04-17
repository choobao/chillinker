import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Collections } from './entities/collections.entity';
import { WebContents } from 'src/web-content/entities/webContents.entity';
import { ContentCollection } from './entities/content-collections.entity';
import { CreateColDto } from './dto/createCol.dto';
import { UpdateColDto } from './dto/updateCol.dto';

import { StorageService } from '../storage/storage.service';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collections)
    private colRepository: Repository<Collections>,
    @InjectRepository(WebContents)
    private webContentRepository: Repository<WebContents>,
    @InjectRepository(ContentCollection)
    private contentCollectionRepository: Repository<ContentCollection>,

    private readonly storageService: StorageService,
  ) {}

  // 내 컬렉션 목록 조회
  async getMyColList(userId: number) {
    return await this.colRepository.find({
      where: { userId },
      select: ['id', 'title', 'desc'],
    });
  }

  // 타 유저 컬렉션 목록 조회
  async getUserColList(userId: number): Promise<Collections[]> {
    return await this.colRepository.find({
      where: { userId },
      select: ['id', 'title', 'desc'],
    });
  }

  // 컬렉션 상세 조회
  async getMyCol(collectionId: number) {
    // return await this.contentCollectionRepository.find({
    //   where: { collectionId },
    //   relations: { webContent: true },
    //   // select: ['contentCollections.webcontent'],
    // });
    return await this.colRepository
      .createQueryBuilder('collections')
      .leftJoinAndSelect('collections.contentCollections', 'contentCollection')
      .leftJoinAndSelect('contentCollection.webContent', 'webContent')
      .where('collections.id = :id', { id: collectionId })
      .getOne();
  }

  // 컬렉션 생성
  async createCol(
    file: Express.Multer.File,
    createColDto: CreateColDto,
    userId: number,
  ): Promise<Collections> {
    // let coverImage = createColDto.coverImage;
    // if (file) {
    //   //이미지 업로드
    //   coverImage = await this.storageService.upload(file);
    //   if (createColDto.coverImage) {
    //     await this.storageService.delete(createColDto.coverImage);
    //   }
    // }
    // const collection = this.colRepository.create({ ...createColDto, userId });
    // return await this.colRepository.save(collection);
    let coverImage: string;
    if (file) {
      // 이미지 업로드
      coverImage = await this.storageService.upload(file);
    }

    // 컬렉션 생성
    const collection = this.colRepository.create({
      ...createColDto,
      userId,
      coverImage, // 커버 이미지 추가
    });

    // 컬렉션 저장
    return await this.colRepository.save(collection);
  }

  // 컬렉션 수정 _작품 추가, 작품 삭제, 컬렉션 정보 수정
  async updateCol(
    collectionId: number,
    updateColDto: UpdateColDto,
  ): Promise<Collections> {
    const collection = await this.colRepository.findOneBy({
      id: collectionId,
    });
    if (!collection) {
      throw new NotFoundException('컬렉션이 존재하지 않습니다.');
    }

    collection.title = updateColDto.title;
    collection.desc = updateColDto.desc;

    return await this.colRepository.save(collection);
  }

  // 컬렉션 삭제
  async deleteCol(userId: number, collectionId: number): Promise<void> {
    const collection = await this.colRepository.findOneBy({
      id: collectionId,
    });

    if (!collection) {
      throw new NotFoundException('컬렉션이 존재하지 않습니다.');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('내 컬렉션만 삭제가 가능합니다.');
    }

    await this.colRepository.remove(collection);
  }

  // 컨텐츠 추가
  async addContentToCollection(
    userId: number,
    collectionId: number,
    webContentId: number,
  ): Promise<void> {
    const collection = await this.colRepository.findOne({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new NotFoundException('컬렉션이 존재하지 않습니다.');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('내 컬렉션에만 컨텐츠 추가가 가능합니다.');
    }

    const webContent = await this.webContentRepository.findOne({
      where: { id: webContentId },
    });
    if (!webContent) {
      throw new NotFoundException('작품이 존재하지 않습니다.');
    }

    const contentCollection = new ContentCollection();
    contentCollection.collection = collection;
    contentCollection.webContent = webContent;
    await this.contentCollectionRepository.save(contentCollection);
  }

  async isContentExistInCollection(
    userId: number,
    collectionId: number,
    contentId: number,
  ): Promise<boolean> {
    const contentCollection = await this.contentCollectionRepository.findOne({
      where: {
        collection: { id: collectionId },
        webContent: { id: contentId },
      },
      relations: ['collection', 'webContent'],
    });
    return !!contentCollection;
  }

  // 컨텐츠 삭제
  async removeContentFromCollection(
    userId: number,
    collectionId: number,
    webContentId: number,
  ): Promise<void> {
    const collection = await this.colRepository.findOne({
      where: { id: collectionId },
    });

    if (collection.userId !== userId) {
      throw new ForbiddenException('내 컬렉션에서만 컨텐츠 삭제가 가능합니다.');
    }

    const contentCollection = await this.contentCollectionRepository.findOne({
      where: {
        collection: { id: collectionId },
        webContent: { id: webContentId },
      },
    });

    if (!contentCollection) {
      throw new NotFoundException('컨텐츠가 컬렉션에 존재하지 않습니다.');
    }

    await this.contentCollectionRepository.remove(contentCollection);
  }
}
