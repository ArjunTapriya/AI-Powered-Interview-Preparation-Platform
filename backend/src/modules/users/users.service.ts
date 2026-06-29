import { usersRepository } from "./users.repository";
import { UserProfileDto, toUserProfileDto, toUpdateUserData } from "./users.dto";
import { UpdateUserInput } from "./users.validation";
import { NotFoundError } from "../../utils/AppError";

export class UsersService {
  /**
   * Retrieve the authenticated user's full profile.
   * Throws NotFoundError if the token references a deleted account.
   */
  async getCurrentUser(userId: string): Promise<UserProfileDto> {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return toUserProfileDto(user);
  }

  /**
   * Apply a partial profile update for the authenticated user.
   *
   * Only the fields that arrive in `input` are written; all others retain
   * their current database values. Immutable fields (email, password,
   * subscription) are excluded by the repository type contract.
   */
  async updateCurrentUser(
    userId: string,
    input: UpdateUserInput
  ): Promise<UserProfileDto> {
    // Verify the account still exists before attempting an update
    const existing = await usersRepository.findById(userId);

    if (!existing) {
      throw new NotFoundError("User not found");
    }

    const updateData = toUpdateUserData(input);

    const updated = await usersRepository.updateProfile(userId, updateData);

    return toUserProfileDto(updated);
  }

  async pingStreak(userId: string): Promise<UserProfileDto> {
    const updated = await usersRepository.pingStreak(userId);
    return toUserProfileDto(updated);
  }

  async toggleManualQuestion(userId: string, questionId: string, completed: boolean): Promise<UserProfileDto> {
    const updated = await usersRepository.toggleManualQuestion(userId, questionId, completed);
    return toUserProfileDto(updated);
  }
}

export const usersService = new UsersService();
