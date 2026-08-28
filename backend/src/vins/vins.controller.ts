import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { VinsService } from './vins.service';
import { CreateVinDto } from './dto/create-vin.dto';
import { UpdateVinDto } from './dto/update-vin.dto';
import express from 'express';

@Controller('api/wine')
export class VinsController {
  constructor(private readonly vinsService: VinsService) {}

  @Post()
  create(@Body() createVinDto: CreateVinDto) {
    return this.vinsService.create(createVinDto);
  }

  @Get()
  findAll() {
    return this.vinsService.findAll();
  }

  // Handles both search by name (non-numeric) and get by id (numeric)
  @Get(':param')
  findByNameOrId(@Param('param') param: string, @Req() req: express.Request) {
    // Authentication expectation: token in cookie (simple check)
    const cookie = req.headers.cookie || '';
    if (!this.vinsService.isAuthenticatedCookie(cookie)) {
      return { error: 'Unauthorized' };
    }

    const maybeId = Number(param);
    if (!Number.isNaN(maybeId)) {
      return this.vinsService.findOne(maybeId);
    }
    return this.vinsService.findByName(param);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateVinDto: UpdateVinDto) {
    return this.vinsService.update(+id, updateVinDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vinsService.remove(+id);
  }

  // tags endpoints
  @Get(':id/tags')
  getTags(@Param('id') id: string, @Req() req: express.Request) {
    const cookie = req.headers.cookie || '';
    if (!this.vinsService.isAuthenticatedCookie(cookie))
      return { error: 'Unauthorized' };
    return this.vinsService.getTagsForVin(+id);
  }

  @Post(':id/tags')
  addTag(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: express.Request,
  ) {
    const cookie = req.headers.cookie || '';
    if (!this.vinsService.isAuthenticatedCookie(cookie))
      return { error: 'Unauthorized' };
    return this.vinsService.addTag(+id, body.userId, body.content);
  }

  @Put(':id/tags')
  editTag(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: express.Request,
  ) {
    const cookie = req.headers.cookie || '';
    if (!this.vinsService.isAuthenticatedCookie(cookie))
      return { error: 'Unauthorized' };
    return this.vinsService.editTag(+id, body.userId, body.tagId, body.content);
  }

  @Delete(':id/tags')
  deleteTag(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: express.Request,
  ) {
    const cookie = req.headers.cookie || '';
    if (!this.vinsService.isAuthenticatedCookie(cookie))
      return { error: 'Unauthorized' };
    return this.vinsService.deleteTag(+id, body.userId, body.tagId);
  }
}
