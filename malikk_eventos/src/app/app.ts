import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponents } from './components/navbar/navbar.components';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponents],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('malikk_eventos');
}
