import { Injectable } from '@nestjs/common';
import { BoughtFilmSeeder } from './bought-film.seeder';
import { FilmSeeder } from './film.seeder';
import { ISeeder } from './seeder.interface';
import { UserSeeder } from './user.seeder';
import { FilmReviewSeeder } from './film-review.seeder';

@Injectable()
export class SeederFactory {
  constructor(
    private userSeeder: UserSeeder,
    private filmSeeder: FilmSeeder,
    private boughtFilmSeeder: BoughtFilmSeeder,
    private filmReviewSeeder: FilmReviewSeeder,
  ) {}

  createSeeder(type: string): ISeeder<Object> {
    switch (type) {
      case 'User':
        return this.userSeeder;
      case 'Film':
        return this.filmSeeder;
      case 'BoughtFilm':
        return this.boughtFilmSeeder;
      case 'FilmReview':
        return this.filmReviewSeeder;
      default:
        throw new Error('Unknown seeder type');
    }
  }

  async run(): Promise<void> {
    await this.userSeeder.seed();
    await this.filmSeeder.seed();
    await this.boughtFilmSeeder.seed();
    await this.filmReviewSeeder.seed();
  }
}
