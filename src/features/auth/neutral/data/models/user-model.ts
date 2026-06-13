import { JsonReader } from '@/core/serialization/json-reader';
import { User } from '@/features/auth/neutral/domain/entities/user';

/**
 * Serializable user shape used to transfer authenticated-user data across the
 * web app boundaries.
 *
 * This model is intended for both:
 * - web client <-> web server exchanges
 * - web server <-> backend exchanges
 */
export type UserModel = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
};

/**
 * Helpers for parsing and mapping `UserModel` values.
 */
export const UserModel = {
  /**
   * Creates one `UserModel` from a JSON object.
   */
  fromJson(json: Record<string, unknown>): UserModel {
    return {
      id: JsonReader.readString(json, 'id', 'User payload'),
      name: JsonReader.readString(json, 'name', 'User payload'),
      email: JsonReader.readString(json, 'email', 'User payload'),
    };
  },

  /**
   * Creates one `UserModel` from the domain entity.
   */
  fromEntity(user: User): UserModel {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  },

  /**
   * Converts one `UserModel` into the domain entity.
   */
  toEntity(dto: UserModel): User {
    return new User(dto.id, dto.name, dto.email);
  },
};
