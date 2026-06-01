import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { SportEvent } from '../../models/omni-sports.models';

@Component({
  selector: 'app-event-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-control.component.html',
  styleUrls: ['./event-control.component.css']
})
export class EventControlComponent implements OnInit {
  events: SportEvent[] = [];
  showCreateForm = false;

  // Form Fields
  eventName = '';
  eventLocation = '';
  eventSport: 'cricket' | 'badminton' = 'cricket';
  eventDescription = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadAllEvents();
  }

  loadAllEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (data) => this.events = data,
      error: (err) => console.error('Failed to load events from Spring backend', err)
    });
  }

  onSubmitEvent(): void {
    if (!this.eventName || !this.eventLocation) return;

    this.eventService.createEvent({
      name: this.eventName,
      location: this.eventLocation,
      sportType: this.eventSport,
      description: this.eventDescription,
      status: 'published'
    }).subscribe({
      next: (savedEvent) => {
        this.events.unshift(savedEvent);
        this.resetForm();
        alert('Tournament published to Spring-Boot successfully!');
      },
      error: (err) => alert('Failed to publish tournament: ' + err.message)
    });
  }

  resetForm(): void {
    this.eventName = '';
    this.eventLocation = '';
    this.eventDescription = '';
    this.showCreateForm = false;
  }
}
