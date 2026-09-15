import { describe, it, expect, beforeEach } from "vitest";
import { getWalletState, disconnectWallet, getShortAddress } from "../lib/wallet.js";

describe("Frontend Wallet State Management", () => {
  beforeEach(() => {
    disconnectWallet();
  });

  it("should initialize with disconnected state", () => {
    const state = getWalletState();
    expect(state.connected).toBe(false);
    expect(state.address).toBeNull();
  });

  it("should format short addresses with ellipsis correctly", () => {
    const fullAddress = "midnight1zqp8xy2z5v6k8q4w9j2t7r5e3y1u4i6o8p0a";
    const short = getShortAddress(fullAddress);
    expect(short).toContain("...");
    expect(short.startsWith("midnight1z")).toBe(true);
  });
});
