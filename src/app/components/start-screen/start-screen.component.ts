import { Component, EventEmitter, Output } from "@angular/core";
import { format } from "date-fns";

@Component({
    selector: "app-start-screen",
    standalone: true,
    imports: [],
    templateUrl: "./start-screen.component.html",
    styleUrl: "./start-screen.component.css",
})
export class StartScreenComponent {
    protected author: string = "Xavier Fernandes";
    protected date: string = format(new Date(), "LLLL d, eeee");

    @Output() start = new EventEmitter<void>();
}
