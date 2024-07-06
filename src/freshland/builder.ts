import { FreshlandMode } from "./types";

export class Builder {
    private mode: FreshlandMode
    private force: boolean;

    private source?: string;
    private destination?: string;

    private verbose: boolean;

    constructor() {
        this.mode = "tar";
        this.force = false;
        this.verbose = false;
    }

    public setSource(source: string) {
        this.source = source;
        return this;
    }

    public setForce(force: boolean) {
        this.force = force;
        return this;
    }

    public setMode(mode: FreshlandMode) {
        this.mode = mode;
        return this;
    }

    public setDestination(destination: string) {
        this.destination = destination;
        return this;
    }

    public setVerbose(verbose: boolean) {
        this.verbose = verbose;
        return this;
    }

    public useTemplate(template: "typescript-starter") {
        // todo: get template from repo
        const templateURL = "https://github.com/proxitystudios/typescript-starter"
        this.setSource(templateURL);
        return this;
    }

    public toJSON(): BuilderData {
        if (!this.source || !this.destination) throw new Error("Source or destination not set");

        return {
            mode: this.mode,
            force: this.force,
            source: this.source,
            destination: this.destination,
            verbose: this.verbose,
        }
    }
}

export interface BuilderData {
    mode: FreshlandMode
    force: boolean;
    verbose: boolean;

    source: string;
    destination: string;
}