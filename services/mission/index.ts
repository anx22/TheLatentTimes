import { Id } from "../../convex/_generated/dataModel";

/**
 * Mission lifecycle helpers.
 *
 * Token usage used to be aggregated in-memory by `UsageTracker` and shipped
 * with `completeMission`. Since the Gemini transport moved server-side
 * (see `convex/gemini.ts`), the running total is patched onto the mission
 * record by `recordTokenUsage` on every call. We no longer need a client
 * tracker; the stub below is kept only so the architecture drill can call
 * `record()` without crashing.
 */

export interface MissionTelemetry {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export const UsageTracker = {
  record(_missionId: string | undefined, _usage: any) {
    // no-op: telemetry now lives in the mission record on Convex.
  },
  get(_missionId: string | undefined): MissionTelemetry | null {
    return null;
  },
  clear(_missionId: string) {
    // no-op
  },
};

export class MissionInstance {
  constructor(
    public readonly id: Id<"missions">,
    private mutations: {
      logMessage: (args: any) => Promise<void>;
      completeMission: (args: any) => Promise<void>;
      failMission: (args: any) => Promise<void>;
    }
  ) {}

  async log(
    agent: string,
    message: string,
    level: string = "info",
    step: string = "MISSION"
  ) {
    await this.mutations.logMessage({
      agentName: agent,
      message,
      level,
      step,
      missionId: this.id,
    });
  }

  async complete(resultId?: string) {
    await this.mutations.completeMission({
      missionId: this.id,
      resultId,
    });
  }

  async fail(error: string) {
    await this.mutations.failMission({
      missionId: this.id,
      error,
    });
  }
}

export class MissionRegistry {
  constructor(private mutations: any) {}

  async start(
    type: "editorial" | "scout" | "system",
    topic: string,
    parentMissionId?: Id<"missions">,
    metadata?: any
  ): Promise<MissionInstance> {
    const mId = await this.mutations.startMission({
      type,
      topic,
      parentMissionId,
      metadata,
    });
    return new MissionInstance(mId, this.mutations);
  }

  async sub(
    parent: MissionInstance,
    type: "editorial" | "scout" | "system",
    topic: string,
    metadata?: any
  ): Promise<MissionInstance> {
    return this.start(type, topic, parent.id, metadata);
  }
}
