import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { GameComponent } from "./components/game/game.component";
import { StartScreenComponent } from "./components/start-screen/start-screen.component";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [RouterOutlet, GameComponent, StartScreenComponent],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.css",
})
export class AppComponent {
    protected isGameRunning: boolean = false;

    protected onStart() {
        this.isGameRunning = true;
    }

    protected onBack() {
        this.isGameRunning = false;
    }
}
