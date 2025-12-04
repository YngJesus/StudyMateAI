import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Studyai } from './studyai';

describe('Studyai', () => {
  let component: Studyai;
  let fixture: ComponentFixture<Studyai>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Studyai]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Studyai);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
