import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/folder/home', icon: 'home' },
    { title: 'About', url: '/folder/about', icon: 'person' },
    { title: 'Explore', url: '/folder/explore', icon: 'chevron-expand' },
    { title: 'Contact', url: '/folder/contact', icon: 'paper-plane' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor() { }
}
