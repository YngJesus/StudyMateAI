import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFiltersDto } from './dto/event-filters.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ---------------------------------------
  // CREATE EVENT
  // ---------------------------------------
  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  // ---------------------------------------
  // GET ALL EVENTS (WITH FILTERS)
  // ---------------------------------------
  @Get()
  @ApiOperation({ summary: 'Get all events (optional filters)' })
  getAll(@Query() filters: EventFiltersDto) {
    return this.eventsService.getAll(filters);
  }

  // ---------------------------------------
  // GET SINGLE EVENT BY ID
  // ---------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get single event by ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // ---------------------------------------
  // UPCOMING EVENTS (NEXT 7 DAYS)
  // ---------------------------------------
  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events (next 7 days)' })
  getUpcoming() {
    return this.eventsService.getUpcoming();
  }

  // ---------------------------------------
  // DATE RANGE FILTER
  // ---------------------------------------
  @Get('range')
  @ApiOperation({ summary: 'Get events in a date range' })
  @ApiQuery({ name: 'from', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'to', required: true, example: '2025-12-31' })
  getRange(@Query('from') from: string, @Query('to') to: string) {
    return this.eventsService.getRange(from, to);
  }

  // ---------------------------------------
  // UPDATE EVENT
  // ---------------------------------------
  @Patch(':id')
  @ApiOperation({ summary: 'Update event' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  // ---------------------------------------
  // DELETE EVENT
  // ---------------------------------------
  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
