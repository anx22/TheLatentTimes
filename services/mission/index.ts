
import { Id } from "../../convex/_generated/dataModel";

export interface MissionTelemetry {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export const UsageTracker = {
    data: {} as Record<string, MissionTelemetry>,
    
    record(missionId: string | undefined, usage: any) {
        if (!missionId || !usage) return;
        if (!this.data[missionId]) {
            this.data[missionId] = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
        }
        this.data[missionId].promptTokens += usage.promptTokenCount || 0;
        this.data[missionId].completionTokens += usage.candidatesTokenCount || 0;
        this.data[missionId].totalTokens += usage.totalTokenCount || 0;
    },
    
    get(missionId: string | undefined) {
        return missionId ? this.data[missionId] : null;
    },
    
    clear(missionId: string) {
        delete this.data[missionId];
    }
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

  async log(agent: string, message: string, level: string = 'info', step: string = 'MISSION') {
    await this.mutations.logMessage({
      agentName: agent,
      message,
      level,
      step,
      missionId: this.id
    });
  }

  async complete(resultId?: string) {
    const telemetry = UsageTracker.get(this.id);
    await this.mutations.completeMission({
      missionId: this.id,
      resultId,
      tokenUsage: telemetry ?? undefined
    });
    UsageTracker.clear(this.id);
  }

  async fail(error: string) {
    await this.mutations.failMission({
      missionId: this.id,
      error
    });
    UsageTracker.clear(this.id);
  }
}

export class MissionRegistry {
  constructor(private mutations: any) {}

  async start(type: 'editorial' | 'scout' | 'system', topic: string, parentMissionId?: Id<"missions">, metadata?: any): Promise<MissionInstance> {
    const mId = await this.mutations.startMission({ type, topic, parentMissionId, metadata });
    return new MissionInstance(mId, this.mutations);
  }

  // Helper for effortless sub-missions
  async sub(parent: MissionInstance, type: 'editorial' | 'scout' | 'system', topic: string, metadata?: any): Promise<MissionInstance> {
    return this.start(type, topic, parent.id, metadata);
  }
}
