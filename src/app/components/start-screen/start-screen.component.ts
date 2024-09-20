import { Component, EventEmitter, Output } from "@angular/core";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

@Component({
  selector: 'app-start-screen',
  standalone: true,
  imports: [],
  templateUrl: './start-screen.component.html',
  styleUrl: './start-screen.component.css'
})
export class StartScreenComponent {
  protected author: string = 'Xavier Fernandes';

  protected date = format(new Date(), "LLLL d, eeee")


  @Output() start = new EventEmitter<void>();

}
