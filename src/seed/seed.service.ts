import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PokeResponse } from './interfaces/poke-response.interface';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapter/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    //borrar todos los registros de la base de datos
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    // const insertPromisesArray: Promise<Pokemon>[] = []; /* 2da version */
    const pokemonToInsert: { name: string; no: number }[] = [];

    data.results.forEach(
      /*async*/ ({ name, url }) => {
        const segments = url.split('/');
        const no = +segments[segments.length - 2];

        // const pokemon = await this.pokemonModel.create({ name, no }); /*almacena uno x uno*/
        // insertPromisesArray.push(this.pokemonModel.create({ name, no }));  /* 2da version */
        pokemonToInsert.push({ name, no });
      },
    );

    // await Promise.all(insertPromisesArray);  /* 2da version */
    await this.pokemonModel.insertMany(pokemonToInsert);

    return { message: 'Seed executed' };
  }
}
