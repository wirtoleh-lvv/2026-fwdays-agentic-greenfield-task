export class InvalidProviderOutputError extends Error {
  constructor() {
    super("The extraction provider returned invalid output.");
    this.name = "InvalidProviderOutputError";
  }
}
