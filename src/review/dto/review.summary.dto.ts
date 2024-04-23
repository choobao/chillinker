export class ReviewSummaryDto {
  image: string;
  title: string;
  rate: number;
  id: number;

  constructor(image: string, title: string, rate: number, id: number) {
    this.image = image;
    this.title = title;
    this.rate = rate;
    this.id = id;
  }
}
