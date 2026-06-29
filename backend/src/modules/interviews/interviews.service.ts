import { interviewsRepository } from "./interviews.repository";
import { CreateInterviewInput } from "./interviews.validation";
import { InterviewSessionDto, toSessionDto, parseInterviewType } from "./interviews.dto";
import { NotFoundError, ForbiddenError } from "../../utils/AppError";

export class InterviewsService {
  /**
   * Create a new interview session.
   */
  async createSession(
    userId: string,
    input: CreateInterviewInput
  ): Promise<InterviewSessionDto> {
    const { metrics, transcript, feedbackNotes, optimalCode, ...coreData } = input;
    
    // Map the string type to Prisma enum
    const prismaType = parseInterviewType(coreData.type);

    const sessionData = {
      ...coreData,
      interviewType: prismaType,
      status: "COMPLETED", // ensure status is provided
      transcript: transcript ? JSON.stringify(transcript) : undefined,
      feedbackNotes: feedbackNotes ? JSON.stringify(feedbackNotes) : undefined,
      optimalCode: optimalCode ? optimalCode : undefined,
    };
    delete (sessionData as any).type; // remove 'type' to avoid Prisma unknown arg error

    const created = await interviewsRepository.createSession(userId, sessionData, metrics);
    return toSessionDto(created);
  }

  /**
   * Get paginated sessions for a user.
   */
  async getUserSessions(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ sessions: InterviewSessionDto[]; pagination: any }> {
    const { sessions, total } = await interviewsRepository.getUserSessions(
      userId,
      page,
      limit
    );

    return {
      sessions: sessions.map(toSessionDto),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single session by ID, ensuring the user owns it.
   */
  async getSessionById(userId: string, sessionId: string): Promise<InterviewSessionDto> {
    const session = await interviewsRepository.getSessionById(sessionId);

    if (!session) {
      throw new NotFoundError("Interview session not found");
    }

    if (session.userId !== userId) {
      throw new ForbiddenError("You do not have permission to view this session");
    }

    return toSessionDto(session);
  }

  /**
   * Delete a session by ID, ensuring the user owns it.
   */
  async deleteSession(userId: string, sessionId: string): Promise<void> {
    const session = await interviewsRepository.getSessionById(sessionId);

    if (!session) {
      throw new NotFoundError("Interview session not found");
    }

    if (session.userId !== userId) {
      throw new ForbiddenError("You do not have permission to delete this session");
    }

    await interviewsRepository.deleteSession(sessionId);
  }
}

export const interviewsService = new InterviewsService();
