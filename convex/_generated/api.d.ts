/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as gemini from "../gemini.js";
import type * as maintenance from "../maintenance.js";
import type * as media from "../media.js";
import type * as newsroom_actions from "../newsroom/actions.js";
import type * as newsroom_actions_autonomousActions from "../newsroom/actions/autonomousActions.js";
import type * as newsroom_actions_clusteringActions from "../newsroom/actions/clusteringActions.js";
import type * as newsroom_actions_fetchActions from "../newsroom/actions/fetchActions.js";
import type * as newsroom_mutations from "../newsroom/mutations.js";
import type * as newsroom_mutations_draftMutations from "../newsroom/mutations/draftMutations.js";
import type * as newsroom_mutations_issueMutations from "../newsroom/mutations/issueMutations.js";
import type * as newsroom_mutations_missionMutations from "../newsroom/mutations/missionMutations.js";
import type * as newsroom_mutations_signalMutations from "../newsroom/mutations/signalMutations.js";
import type * as newsroom_mutations_workbenchMutations from "../newsroom/mutations/workbenchMutations.js";
import type * as newsroom_queries from "../newsroom/queries.js";
import type * as newsroom_seedData from "../newsroom/seedData.js";
import type * as testing from "../testing.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  gemini: typeof gemini;
  maintenance: typeof maintenance;
  media: typeof media;
  "newsroom/actions": typeof newsroom_actions;
  "newsroom/actions/autonomousActions": typeof newsroom_actions_autonomousActions;
  "newsroom/actions/clusteringActions": typeof newsroom_actions_clusteringActions;
  "newsroom/actions/fetchActions": typeof newsroom_actions_fetchActions;
  "newsroom/mutations": typeof newsroom_mutations;
  "newsroom/mutations/draftMutations": typeof newsroom_mutations_draftMutations;
  "newsroom/mutations/issueMutations": typeof newsroom_mutations_issueMutations;
  "newsroom/mutations/missionMutations": typeof newsroom_mutations_missionMutations;
  "newsroom/mutations/signalMutations": typeof newsroom_mutations_signalMutations;
  "newsroom/mutations/workbenchMutations": typeof newsroom_mutations_workbenchMutations;
  "newsroom/queries": typeof newsroom_queries;
  "newsroom/seedData": typeof newsroom_seedData;
  testing: typeof testing;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
