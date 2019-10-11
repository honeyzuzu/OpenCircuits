import {Importer} from "core/utils/io/Importer";

import {MainDesignerController} from "../../shared/controllers/MainDesignerController";
import {ItemNavController} from "./ItemNavController";
import {HeaderController} from "./HeaderController";
import {SideNavCircuitPreview} from "../views/SideNavCircuitPreview";
import {RemoteController} from "./RemoteController";
import {CircuitMetadata,
        CircuitMetadataBuilder} from "digital/models/CircuitMetadata";


export class SideNavController {
    private tab = $("header-sidenav-open-tab");
    private sidenav = $("sidenav");
    private overlay = $("overlay");
    private context = $("content");
    private sidenavModeCheckbox = $("sidenav-mode-checkbox");
    private exampleCircuitsList = $("example-circuit-list");

    private open: boolean;
    private disabled: boolean;

    private editMode: boolean;

    private userCircuits: SideNavCircuitPreview[];

    public constructor() {
        this.open = false;
        this.disabled = false;

        this.editMode = true;

        this.userCircuits = [];

        this.tab.click(() => this.toggle());

        this.sidenavModeCheckbox.change(() => this.toggleEditMode());

        this.overlay.click(() => {
            if (this.isOpen())
                this.toggle();
        });

        // Set up onclick listeners to example circuits
        const exampleCircuits = Array.from(this.exampleCircuitsList.children()) as HTMLElement[];
        for (const exampleCircuit of exampleCircuits) {
            const id = exampleCircuit.id.split("-").slice(2).join('-');
            const name = exampleCircuit.children[1].children[0].innerHTML;
            const desc = exampleCircuit.children[1].children[1].innerHTML;
            const data = new CircuitMetadataBuilder()
                    .withId(id)
                    .withName(name)
                    .withDesc(desc)
                    .withVersion("1.1")
                    .build();
            exampleCircuit.onclick = () => RemoteController.LoadExampleCircuit(data, this.loadCircuit);
        }
    }

    private toggleEditMode() {
        this.editMode = !this.editMode;

        MainDesignerController.SetEditMode(!editMode);

        // Toggle ItemNavController
        if (ItemNavController.IsOpen())
            ItemNavController.Toggle();

        // Disable or re-enable ItemNavController
        if (editMode)
            ItemNavController.Enable();
        else
            ItemNavController.Disable();

        // Toggle SideNavController if entering play mode
        if (this.isOpen() && !this.editMode)
            this.toggle();
    }

    private loadCircuit(contents: XMLDocument): void {
        const name = Importer.PromptLoadCircuit(MainDesignerController.GetDesigner(), contents);
        HeaderController.setProjectName(name);
        if (this.isOpen)
            this.toggle();
    }

    public clearUserCircuits(): void {
        this.userCircuits.forEach((c) => c.remove());
        this.userCircuits = [];
    }

    public updateUserCircuits(): void {
        this.clearUserCircuits();

        RemoteController.ListCircuits(async (data: CircuitMetadata[]) => {
            data.forEach((d) => {
                const preview = new SideNavCircuitPreview(d);
                preview.onClick(() => RemoteController.LoadUserCircuit(d, this.loadCircuit));
                this.userCircuits.push(preview);
            });
        });
    }

    public toggle(): void {
        if (this.disabled)
            return;

        this.open = !this.open;
        this.sidenav.toggleClass("sidenav__move");
        this.overlay.toggleClass("invisible");
        this.context.toggleClass("sidenav__shift");
    }

    public isOpen(): boolean {
        return this.open;
    }

    public enable(): void {
        this.disabled = false;
    }

    public disable(): void {
        this.disabled = true;
    }

}
