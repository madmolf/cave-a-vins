import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVinDto } from './dto/create-vin.dto';
import { UpdateVinDto } from './dto/update-vin.dto';
import { Vin } from './entities/vin.entity';
import * as crypto from 'crypto';

@Injectable()
export class VinsService {
  constructor(
    @InjectRepository(Vin)
    private readonly vinRepository: Repository<Vin>,
  ) {}

  // tags store: { id_tag, id_vin, id_utilisateur, content }
  private tags: any[] = [];
  private tagCounter = 1;

  // simple shared secret for token verification (should use AuthService ideally)
  private readonly SECRET = 'dev-secret-change-me';

  create(createVinDto: CreateVinDto) {
    return this.vinRepository.save(this.vinRepository.create(createVinDto));
  }

  findAll() {
    return this.vinRepository.find();
  }

  findOne(id: number) {
    return this.vinRepository.findOneBy({ id_vin: id });
  }

  findByName(name: string) {
    return this.vinRepository
      .createQueryBuilder('vin')
      .where('LOWER(vin.nom) LIKE LOWER(:name)', { name: `%${name}%` })
      .getMany();
  }

  update(id: number, updateVinDto: UpdateVinDto) {
    return this.vinRepository
      .preload({ id_vin: id, ...updateVinDto })
      .then((vin) => (vin ? this.vinRepository.save(vin) : null));
  }

  remove(id: number) {
    return this.vinRepository.findOneBy({ id_vin: id }).then(async (vin) => {
      if (!vin) return null;
      await this.vinRepository.remove(vin);
      return vin;
    });
  }

  isAuthenticatedCookie(cookieHeader: string) {
    if (!cookieHeader) return false;
    const parts = cookieHeader.split(';').map((p) => p.trim());
    const tokenPart = parts.find((p) => p.startsWith('token='));
    if (!tokenPart) return false;
    const token = tokenPart.replace('token=', '');
    try {
      const [b64, sig] = token.split('.');
      const str = Buffer.from(b64, 'base64').toString('utf8');
      const expected = crypto
        .createHmac('sha256', this.SECRET)
        .update(str)
        .digest('hex');
      return crypto.timingSafeEqual(
        Buffer.from(sig, 'hex'),
        Buffer.from(expected, 'hex'),
      );
    } catch (e) {
      return false;
    }
  }

  getTagsForVin(id_vin: number) {
    return this.tags.filter((t) => t.id_vin === id_vin);
  }

  addTag(id_vin: number, id_utilisateur: number, content: string) {
    const tag = { id_tag: this.tagCounter++, id_vin, id_utilisateur, content };
    this.tags.push(tag);
    return { message: 'Tag added', tag };
  }

  editTag(
    id_vin: number,
    id_utilisateur: number,
    id_tag: number,
    content: string,
  ) {
    const idx = this.tags.findIndex(
      (t) =>
        t.id_tag === id_tag &&
        t.id_vin === id_vin &&
        t.id_utilisateur === id_utilisateur,
    );
    if (idx === -1) return { message: 'Tag not found' };
    this.tags[idx].content = content;
    return { message: 'Tag updated', tag: this.tags[idx] };
  }

  deleteTag(id_vin: number, id_utilisateur: number, id_tag: number) {
    const idx = this.tags.findIndex(
      (t) =>
        t.id_tag === id_tag &&
        t.id_vin === id_vin &&
        t.id_utilisateur === id_utilisateur,
    );
    if (idx === -1) return { message: 'Tag not found' };
    this.tags.splice(idx, 1);
    return { message: 'Tag deleted' };
  }
}
