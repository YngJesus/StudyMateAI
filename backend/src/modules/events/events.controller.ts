import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFiltersDto } from './dto/event-filters.dto';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Events')
@UseGuards(JwtAuthGuard) // ✅ Protect all routes
@ApiBearerAuth('JWT-auth')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ---------------------------------------
  // CREATE EVENT
  // ---------------------------------------
  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  create(@Req() req, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(req.user.userId, createEventDto);
  }

  // ---------------------------------------
  // GET ALL EVENTS (WITH FILTERS)
  // ---------------------------------------
  @Get()
  @ApiOperation({ summary: 'Get all events with optional filters' })
  getAll(@Req() req, @Query() filters: EventFiltersDto) {
    return this.eventsService.getAll(req.user.userId, filters);
  }

  // ---------------------------------------
  // UPCOMING EVENTS (NEXT 7 DAYS)
  // ✅ SPECIFIC ROUTE BEFORE :id
  // ---------------------------------------
  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events (next 7 days by default)' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    example: 7,
    description: 'Number of days to look ahead',
  })
  getUpcoming(@Req() req, @Query('days') days?: number) {
    const daysAhead = days ? parseInt(String(days), 10) : 7;
    return this.eventsService.getUpcoming(req.user.userId, daysAhead);
  }

  // ---------------------------------------
  // DATE RANGE FILTER
  // ✅ SPECIFIC ROUTE BEFORE :id
  // ---------------------------------------
  @Get('range')
  @ApiOperation({ summary: 'Get events in a date range' })
  @ApiQuery({ name: 'from', required: true, example: '2025-01-01' })
  @ApiQuery({ name: 'to', required: true, example: '2025-12-31' })
  getRange(@Req() req, @Query('from') from: string, @Query('to') to: string) {
    return this.eventsService.getRange(req.user.userId, from, to);
  }

  // ---------------------------------------
  // GET SINGLE EVENT BY ID
  // ✅ :id ROUTE LAST
  // ---------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get single event by ID' })
  findOne(@Req() req, @Param('id') id: string) {
    return this.eventsService.findOne(req.user.userId, id);
  }

  // ---------------------------------------
  // UPDATE EVENT
  // ---------------------------------------
  @Patch(':id')
  @ApiOperation({ summary: 'Update event' })
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(req.user.userId, id, updateEventDto);
  }

  // ---------------------------------------
  // DELETE EVENT
  // ---------------------------------------
  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  remove(@Req() req, @Param('id') id: string) {
    return this.eventsService.remove(req.user.userId, id);
  }
}
