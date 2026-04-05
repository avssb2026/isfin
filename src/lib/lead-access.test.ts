import { describe, expect, it } from "vitest";
import {
  canAccessChatSession,
  canModifyLeadAsOperator,
  canReadLeadDetail,
} from "./lead-access";

const op = { id: "op1", role: "OPERATOR" as const };
const admin = { id: "a1", role: "ADMIN" as const };

describe("canReadLeadDetail", () => {
  it("allows admin for any lead", () => {
    expect(
      canReadLeadDetail({ user: admin } as never, { assignedOperatorId: "other" }),
    ).toBe(true);
  });

  it("allows operator for own and unassigned", () => {
    expect(
      canReadLeadDetail({ user: { ...op, id: "op1" } } as never, {
        assignedOperatorId: "op1",
      }),
    ).toBe(true);
    expect(
      canReadLeadDetail({ user: { ...op, id: "op1" } } as never, { assignedOperatorId: null }),
    ).toBe(true);
  });

  it("denies operator for someone else's lead", () => {
    expect(
      canReadLeadDetail({ user: { ...op, id: "op1" } } as never, {
        assignedOperatorId: "op2",
      }),
    ).toBe(false);
  });
});

describe("canModifyLeadAsOperator", () => {
  it("allows admin always", () => {
    expect(
      canModifyLeadAsOperator({ user: admin } as never, { assignedOperatorId: null }),
    ).toBe(true);
  });

  it("allows operator only when assigned to self", () => {
    expect(
      canModifyLeadAsOperator({ user: { ...op, id: "op1" } } as never, {
        assignedOperatorId: "op1",
      }),
    ).toBe(true);
    expect(
      canModifyLeadAsOperator({ user: { ...op, id: "op1" } } as never, {
        assignedOperatorId: null,
      }),
    ).toBe(false);
  });
});

describe("canAccessChatSession", () => {
  it("allows admin for closed chat", () => {
    expect(
      canAccessChatSession({ user: admin } as never, {
        assignedOperatorId: "x",
        status: "CLOSED",
      }),
    ).toBe(true);
  });

  it("denies operator for closed chat", () => {
    expect(
      canAccessChatSession({ user: { ...op, id: "op1" } } as never, {
        assignedOperatorId: "op1",
        status: "CLOSED",
      }),
    ).toBe(false);
  });

  it("allows operator for own or unassigned open chat", () => {
    expect(
      canAccessChatSession({ user: { ...op, id: "op1" } } as never, {
        assignedOperatorId: "op1",
        status: "OPEN",
      }),
    ).toBe(true);
    expect(
      canAccessChatSession({ user: { ...op, id: "op1" } } as never, {
        assignedOperatorId: null,
        status: "OPEN",
      }),
    ).toBe(true);
    expect(
      canAccessChatSession({ user: { ...op, id: "op1" } } as never, {
        assignedOperatorId: "op2",
        status: "OPEN",
      }),
    ).toBe(false);
  });
});
