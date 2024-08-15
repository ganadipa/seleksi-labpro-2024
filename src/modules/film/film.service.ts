import { ForbiddenException, Injectable, Query } from '@nestjs/common';
import { FilmDto } from './dto/film.dto';
import { FirebaseRepository } from '../firebase/firebase.repository';
import { v4 as uuidv4 } from 'uuid';
import { Film } from './film.entity';
import { FilmRepository } from './repository/film.repository';
import { TPrismaFilm } from 'src/common/types';
import { BoughtFilmRepository } from '../bought-film/repository';
import { UserService } from '../user/user.service';

@Injectable()
export class FilmService {
  constructor(
    private firebaseRepository: FirebaseRepository,
    private readonly filmRepository: FilmRepository,
    private readonly boughtFilmRepository: BoughtFilmRepository,
    private readonly userService: UserService,
  ) {}

  async createFilm(
    film: FilmDto,
    files: {
      video: Express.Multer.File[];
      cover_image?: Express.Multer.File[];
    },
  ) {
    // Generate unique file names then upload the files to Firebase Storage
    const videoFileName = `video_${uuidv4()}_${files.video[0].originalname}`;
    const videoUrl = await this.firebaseRepository.addFile(
      files.video[0],
      videoFileName,
    );

    let imageUrl: string | null = null;
    if (files.cover_image && files.cover_image.length > 0) {
      const coverImageFileName = `cover_image_${uuidv4()}_${files.cover_image[0].originalname}`;
      imageUrl = await this.firebaseRepository.addFile(
        files.cover_image[0],
        coverImageFileName,
      );
    }

    const { release_year: releaseYear, ...otherFilmAttributes } = film;

    // Create the film in the database
    const filmData = {
      ...otherFilmAttributes,
      releaseYear,
      videoUrl,
      imageUrl,
    };
    imageUrl;

    const prismaFilm = await this.filmRepository.create(filmData);
    const filmInstance = new Film(prismaFilm);

    // OK
    return filmInstance.toJSON();
  }

  async getFilm(id: string) {
    const film = await this.filmRepository.findById(id);
    if (!film) {
      throw new Error('Film not found!');
    }

    return new Film(film).toJSON();
  }

  async getFilms(q: string) {
    const byTitle = await this.filmRepository.getFilmsLikeTitle(q);
    const byDirector = await this.filmRepository.getFilmsLikeDirector(q);

    const filmMap = new Map<string, TPrismaFilm>();
    byTitle.forEach((film) => filmMap.set(film.id, film));

    let combinedFilms = byTitle;
    byDirector.forEach((film) => {
      if (!filmMap.has(film.id)) {
        combinedFilms.push(film);
      }
    });

    const filmInstances = Array.from(combinedFilms).map(
      (film) => new Film(film),
    );

    return filmInstances.map((film) => {
      const filmJson = film.toJSON();
      delete filmJson.video_url;
      return filmJson;
    });
  }

  async updateFilm(
    newFilm: FilmDto,
    files: {
      video?: Express.Multer.File[];
      cover_image?: Express.Multer.File[];
    },
    id: string,
  ) {
    const oldFilm = await this.filmRepository.findById(id);
    if (!oldFilm) {
      throw new Error('Film not found!');
    }

    let videoUrl = oldFilm.videoUrl;
    if (files.video && files.video.length > 0) {
      this.firebaseRepository.removeFileByUrl(videoUrl);
      const videoFileName = `video_${uuidv4()}_${files.video[0].originalname}`;
      videoUrl = await this.firebaseRepository.addFile(
        files.video[0],
        videoFileName,
      );
    }

    let imageUrl = oldFilm.imageUrl;
    if (files.cover_image && files.cover_image.length > 0) {
      this.firebaseRepository.removeFileByUrl(imageUrl);
      const coverImageFileName = `cover_image_${uuidv4()}_${files.cover_image[0].originalname}`;
      imageUrl = await this.firebaseRepository.addFile(
        files.cover_image[0],
        coverImageFileName,
      );
    }

    const { release_year: releaseYear, ...otherFilmAttributes } = newFilm;

    const updatedFilmData = {
      ...otherFilmAttributes,
      releaseYear,
      videoUrl,
      imageUrl,
    };

    const updatedFilm = await this.filmRepository.update(id, updatedFilmData);

    // OK
    return new Film(updatedFilm).toJSON();
  }

  async deleteFilm(id: string) {
    const film = await this.filmRepository.findById(id);
    if (!film) {
      // Not Found
      throw new Error('Film not found!');
    }

    const prismaFilm = await this.filmRepository.delete(id);
    this.firebaseRepository.removeFileByUrl(prismaFilm.videoUrl);
    this.firebaseRepository.removeFileByUrl(prismaFilm.imageUrl);

    const deletedFilm = new Film(prismaFilm).toJSON();
    delete deletedFilm.cover_image_url;

    // OK
    return deletedFilm;
  }

  async buyFilm(userId: string, filmId: string) {
    // Check if the user has already bought the film
    const boughtFilm =
      await this.boughtFilmRepository.getBoughtFilmByUserIdAndFilmId(
        userId,
        filmId,
      );
    if (boughtFilm) {
      throw new Error('Film already bought!');
    }

    const user = await this.userService.getUser(userId);
    const film = await this.filmRepository.findById(filmId);

    if (user.balance < film.price) {
      throw new Error('Insufficient balance!');
    }

    // Update the user's balance
    await this.userService.addBalance(userId, -film.price);

    // Create a new bought film record
    await this.boughtFilmRepository.create({ userId, filmId });

    const filmJson = new Film(film).toJSON();

    // OK
    return { ...filmJson, is_bought: true };
  }
}
