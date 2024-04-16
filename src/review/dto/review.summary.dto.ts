export class ReviewSummaryDto {
  image: string;
  title: string;
  rate: number;

  constructor(image: string, title: string, rate: number) {
    this.image = image;
    this.title = title;
    this.rate = rate;
  }
}
