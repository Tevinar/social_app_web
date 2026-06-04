/**
 * Domain entity representing an authenticated application user.
 */
export class User {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
  ) {}

  /**
   * Returns the user's display name.
   */
  toString(): string {
    return this.name;
  }
}
