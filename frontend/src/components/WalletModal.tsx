/**
 * WalletModal.tsx — two-screen modal: wallet picker → consent/store.
 *
 * Fixes in this version:
 *   - Modal always dismissible: ✕ button on every screen, backdrop click everywhere,
 *     Escape key anywhere.
 *   - ConnectWalletButton auto-closes modal the moment wallet state turns connected.
 *   - Modal never opens when a wallet is already connected.
 */
import { useEffect, useCallback, useState } from "react";
import {
  detectWallets,
  connectWallet,
  disconnectWallet,
  getWalletState,
  onWalletStateChange,
  type DetectedWallet,
  type WalletState,
} from "../lib/wallet.js";
import { api } from "../lib/api.js";

// ── Wallet icons ──────────────────────────────────────────────────────────────

function Icon1AM() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#1a1a2e" />
      <circle cx="20" cy="20" r="11" fill="#0f3460" />
      <circle cx="20" cy="20" r="5" fill="#e94560" />
      <circle cx="20" cy="20" r="2" fill="#fff" opacity="0.9" />
    </svg>
  );
}

function IconLace() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#1d1b4e" />
      <path d="M20 8 L32 30 H8 Z" fill="none" stroke="#9b8ec4" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="20" cy="23" r="4" fill="#7b5ea7" />
    </svg>
  );
}

function IconDemo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#0f2e1f" />
      <path d="M13 20C13 15.58 16.58 12 21 12C25.42 12 29 15.58 29 20"
        stroke="#3ecf8e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="21" cy="25" r="3.5" fill="#3ecf8e" />
      <line x1="14" y1="30" x2="28" y2="30" stroke="#3ecf8e" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WalletIcon({ wallet }: { wallet: DetectedWallet }) {
  if (wallet.icon) return <img src={wallet.icon} alt={wallet.name} width={40} height={40} style={{ borderRadius: 10, flexShrink: 0 }} />;
  if (wallet.isDemo) return <IconDemo />;
  const n = wallet.name.toLowerCase();
  if (n.includes("1am")) return <Icon1AM />;
  if (n.includes("lace")) return <IconLace />;
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10, background: "var(--ink-line)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "1.1rem", fontWeight: 700, color: "var(--slate)", flexShrink: 0,
    }}>
      {wallet.name[0]?.toUpperCase()}
    </div>
  );
}

// ── Modal screen types ────────────────────────────────────────────────────────

type Screen =
  | { kind: "picker" }
  | { kind: "connecting"; wallet: DetectedWallet }
  | { kind: "consent"; wallet: DetectedWallet; address: string; networkId: string }
  | { kind: "storing" }
  | { kind: "success"; address: string };

// ── WalletModal ───────────────────────────────────────────────────────────────

interface WalletModalProps {
  onClose: () => void;
  onConnected?: (address: string) => void;
}

export function WalletModal({ onClose, onConnected }: WalletModalProps) {
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [scanning, setScanning] = useState(true);
  const [screen, setScreen] = useState<Screen>({ kind: "picker" });
  const [connectError, setConnectError] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    detectWallets().then((w) => { setWallets(w); setScanning(false); });
  }, []);

  // Escape key always closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // If wallet connects from outside (e.g. session restore), close modal
  useEffect(() => {
    return onWalletStateChange((s) => {
      if (s.connected && s.address && screen.kind === "picker") {
        onConnected?.(s.address);
        onClose();
      }
    });
  }, [screen.kind, onClose, onConnected]);

  useEffect(() => {
    if (screen.kind === "consent") setConsentChecked(false);
  }, [screen.kind]);

  const handleSelectWallet = useCallback(async (walletKey: string) => {
    const wallet = wallets.find((w) => w.key === walletKey);
    if (!wallet) return;
    setConnectError(null);
    setScreen({ kind: "connecting", wallet });

    const state = await connectWallet(walletKey);

    if (!state.connected || !state.address) {
      setScreen({ kind: "picker" });
      setConnectError(state.error ?? "Connection failed. Please try again.");
      return;
    }
    setScreen({ kind: "consent", wallet, address: state.address, networkId: state.networkId ?? "unknown" });
  }, [wallets]);

  const handleConsentAndStore = useCallback(async () => {
    if (screen.kind !== "consent") return;
    const { address } = screen;
    setScreen({ kind: "storing" });
    try {
      await api.linkWallet(address);
    } catch {
      // non-fatal
    }
    setScreen({ kind: "success", address });
    onConnected?.(address);
    setTimeout(onClose, 1400);
  }, [screen, onClose, onConnected]);

  const handleSkipStore = useCallback(() => {
    if (screen.kind !== "consent") return;
    onConnected?.(screen.address);
    onClose();
  }, [screen, onClose, onConnected]);

  // Backdrop click always closes
  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const realWallets = wallets.filter((w) => !w.isDemo);
  const demoWallets = wallets.filter((w) => w.isDemo);

  // Whether to show the ✕ close button on the current screen
  const showClose = screen.kind !== "success";

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <style>{`
        @keyframes ppSlideUp {
          from { opacity:0; transform:translateY(14px) scale(0.98); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }
        @keyframes ppPulse {
          0%,100% { opacity:.25; transform:scale(.9); }
          50%      { opacity:1;  transform:scale(1.15); }
        }
        .pp-wallet-row:hover {
          background: var(--ink-raised-2) !important;
          border-color: var(--ink-line) !important;
        }
      `}</style>

      <div
        style={{
          background: "var(--ink-raised)",
          border: "1px solid var(--ink-line)",
          borderRadius: 18,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 32px 96px rgba(0,0,0,0.75)",
          animation: "ppSlideUp 0.18s ease",
          // Prevent clicks inside modal from bubbling to backdrop
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Universal close button — always visible except on success */}
        {showClose && (
          <button
            onClick={onClose}
            aria-label="Close wallet modal"
            style={{
              position: "absolute", top: 14, right: 14, zIndex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--ink-line)",
              borderRadius: 8, cursor: "pointer",
              color: "var(--slate)",
              width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.9rem", fontWeight: 700,
              transition: "background 0.12s, color 0.12s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--paper)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--slate)";
            }}
          >
            ✕
          </button>
        )}

        {/* ── PICKER SCREEN ──────────────────────────────────────────────── */}
        {screen.kind === "picker" && (
          <>
            <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid var(--ink-line)" }}>
              <div style={{ fontWeight: 700, fontSize: "1.08rem", color: "var(--paper)", paddingRight: 36 }}>
                Select Midnight Wallet
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--slate)", marginTop: 3 }}>
                Connect to issue government documents on-chain
              </div>
            </div>

            <div style={{ padding: "16px 20px 24px" }}>
              {connectError && (
                <div style={{
                  background: "rgba(232,97,93,0.1)", border: "1px solid rgba(232,97,93,0.3)",
                  borderRadius: 8, padding: "10px 14px",
                  fontSize: "0.83rem", color: "#fca5a5", marginBottom: 14,
                }}>
                  {connectError}
                </div>
              )}

              {scanning ? (
                <div style={{ textAlign: "center", padding: "28px 0", color: "var(--slate)", fontSize: "0.9rem" }}>
                  Scanning for wallets…
                </div>
              ) : (
                <>
                  {realWallets.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      {realWallets.map((w) => (
                        <WalletRow
                          key={w.key} wallet={w}
                          badge="Installed" badgeColor="#3ecf8e"
                          onClick={() => handleSelectWallet(w.key)}
                        />
                      ))}
                    </div>
                  )}
                  {demoWallets.map((w) => (
                    <WalletRow
                      key={w.key} wallet={w}
                      badge="Instant" badgeColor="#e8a33d"
                      subtitle="Ephemeral session address · testing only"
                      onClick={() => handleSelectWallet(w.key)}
                    />
                  ))}

                  <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--ink-line)" }}>
                    <div style={{
                      fontSize: "0.72rem", fontWeight: 700, color: "var(--slate-dim)",
                      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10,
                    }}>
                      Need a wallet?
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <InstallLink href="https://www.lace.io/" label="Get Lace Wallet" />
                      <InstallLink href="https://docs.midnight.network/develop/tutorial/using-lace" label="Get 1AM Wallet" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* ── CONNECTING SCREEN ──────────────────────────────────────────── */}
        {screen.kind === "connecting" && (
          <div style={{ padding: "52px 32px", textAlign: "center" }}>
            <WalletIcon wallet={screen.wallet} />
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--paper)", marginTop: 18, marginBottom: 8 }}>
              Connecting to {screen.wallet.name}…
            </div>
            <div style={{ fontSize: "0.83rem", color: "var(--slate)" }}>
              Approve the connection in your wallet extension.
            </div>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--signal)", display: "inline-block",
                  animation: `ppPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* ── CONSENT SCREEN ─────────────────────────────────────────────── */}
        {screen.kind === "consent" && (
          <>
            <div style={{
              padding: "20px 24px 16px", paddingRight: 52,
              borderBottom: "1px solid var(--ink-line)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <WalletIcon wallet={screen.wallet} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--paper)" }}>
                  {screen.wallet.name} Connected
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--signal)", marginTop: 2 }}>
                  ● Active
                </div>
              </div>
            </div>

            <div style={{ padding: "20px 24px 28px" }}>
              {/* Network badge */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em",
                textTransform: "uppercase", color: "#818cf8",
                background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)",
                borderRadius: 999, padding: "3px 10px", marginBottom: 18,
              }}>
                {screen.networkId === "demo" ? "Demo Network" : `Midnight ${screen.networkId}`}
              </span>

              {/* Address */}
              <div style={{
                background: "var(--ink)", border: "1px solid var(--ink-line)",
                borderRadius: 10, padding: "12px 14px", marginBottom: 18,
              }}>
                <div style={{
                  fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em",
                  textTransform: "uppercase", color: "var(--slate-dim)", marginBottom: 6,
                }}>
                  Your Preprod Address
                </div>
                <div className="mono" style={{ fontSize: "0.75rem", color: "var(--paper)", wordBreak: "break-all", lineHeight: 1.6 }}>
                  {screen.address}
                </div>
              </div>

              {/* Privacy notice */}
              <div style={{
                background: "rgba(62,207,142,0.06)", border: "1px solid rgba(62,207,142,0.18)",
                borderRadius: 10, padding: "12px 14px", marginBottom: 18,
              }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--signal)", marginBottom: 8 }}>
                  What PrivPass will store
                </div>
                {[
                  ["✓", "var(--signal)", "Your Midnight preprod wallet address (above)"],
                  ["✓", "var(--signal)", "Timestamp of when the wallet was linked"],
                  ["✗", "var(--danger)",  "Private key or seed phrase"],
                  ["✗", "var(--danger)",  "Transaction history or balances"],
                ].map(([mark, color, text], i) => (
                  <div key={i} style={{ display: "flex", gap: 10, fontSize: "0.78rem", marginBottom: 4 }}>
                    <span style={{ color, fontWeight: 700, flexShrink: 0, width: 14 }}>{mark}</span>
                    <span style={{ color: mark === "✓" ? "var(--paper)" : "var(--slate)" }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Consent checkbox */}
              <label htmlFor="wallet-consent" style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                cursor: "pointer", marginBottom: 20,
                padding: "10px 12px",
                background: consentChecked ? "rgba(62,207,142,0.06)" : "transparent",
                border: "1px solid", borderColor: consentChecked ? "rgba(62,207,142,0.3)" : "var(--ink-line)",
                borderRadius: 10, transition: "all 0.15s",
              }}>
                <input
                  id="wallet-consent"
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "var(--signal)", width: 16, height: 16, flexShrink: 0, cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.8rem", color: "var(--paper)", lineHeight: 1.5 }}>
                  I consent to PrivPass storing my wallet address to link my on-chain identity
                  with my account. I can remove this link at any time.
                </span>
              </label>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-primary"
                  disabled={!consentChecked}
                  onClick={handleConsentAndStore}
                  style={{
                    flex: 1, opacity: consentChecked ? 1 : 0.4,
                    cursor: consentChecked ? "pointer" : "not-allowed",
                    background: "linear-gradient(135deg, #3ecf8e, #2bb377)", border: "none",
                  }}
                >
                  Store Address & Continue
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleSkipStore}
                  style={{ padding: "12px 16px", fontSize: "0.84rem" }}
                >
                  Skip
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: "0.7rem", color: "var(--slate-dim)", textAlign: "center" }}>
                Skip keeps wallet connected this session without saving to your account.
              </div>
            </div>
          </>
        )}

        {/* ── STORING SCREEN ─────────────────────────────────────────────── */}
        {screen.kind === "storing" && (
          <div style={{ padding: "52px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>🔒</div>
            <div style={{ fontWeight: 700, color: "var(--paper)", marginBottom: 6 }}>
              Saving address…
            </div>
            <div style={{ fontSize: "0.83rem", color: "var(--slate)" }}>
              Linking your preprod address to your account.
            </div>
          </div>
        )}

        {/* ── SUCCESS SCREEN ─────────────────────────────────────────────── */}
        {screen.kind === "success" && (
          <div style={{ padding: "52px 32px", textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(62,207,142,0.15)", border: "2px solid var(--signal)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: "1.5rem", color: "var(--signal)",
            }}>
              ✓
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--paper)", marginBottom: 8 }}>
              Wallet linked!
            </div>
            <div className="mono" style={{ fontSize: "0.72rem", color: "var(--slate)", wordBreak: "break-all" }}>
              {screen.address}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── WalletRow ─────────────────────────────────────────────────────────────────

function WalletRow({ wallet, badge, badgeColor, subtitle, onClick }: {
  wallet: DetectedWallet; badge: string; badgeColor: string;
  subtitle?: string; onClick: () => void;
}) {
  return (
    <button
      className="pp-wallet-row"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 14, width: "100%",
        background: "transparent", border: "1px solid transparent",
        borderRadius: 12, padding: "11px 12px", cursor: "pointer",
        textAlign: "left", marginBottom: 6,
        transition: "background 0.12s, border-color 0.12s",
      }}
    >
      <WalletIcon wallet={wallet} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: "var(--paper)", fontSize: "0.95rem" }}>{wallet.name}</div>
        {subtitle && <div style={{ fontSize: "0.72rem", color: "var(--slate-dim)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      <span style={{
        fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em",
        color: badgeColor, background: `${badgeColor}18`,
        border: `1px solid ${badgeColor}50`,
        borderRadius: 999, padding: "3px 10px", flexShrink: 0,
      }}>
        {badge}
      </span>
    </button>
  );
}

// ── InstallLink ───────────────────────────────────────────────────────────────

function InstallLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", color: "var(--slate)", textDecoration: "none" }}>
      {label} <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>↗</span>
    </a>
  );
}

// ── ConnectWalletButton ───────────────────────────────────────────────────────

export function ConnectWalletButton() {
  const [walletState, setWalletState] = useState<WalletState>(getWalletState());
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    return onWalletStateChange((s) => {
      setWalletState(s);
      // Auto-close modal the moment wallet becomes connected
      if (s.connected) setModalOpen(false);
    });
  }, []);

  // If wallet is connected, never show the modal
  const handleOpen = () => {
    if (!walletState.connected) setModalOpen(true);
  };

  if (walletState.connected && walletState.address) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          title={walletState.address}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.3)",
            borderRadius: 999, padding: "5px 13px",
            fontSize: "0.78rem", color: "var(--signal)", fontWeight: 600, maxWidth: 200,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--signal)", flexShrink: 0 }} />
          <span className="mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {walletState.address.slice(0, 18)}…
          </span>
        </div>
        <button
          className="btn btn-secondary"
          style={{ padding: "5px 11px", fontSize: "0.76rem" }}
          onClick={() => disconnectWallet()}
          title="Disconnect wallet"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={handleOpen}
        style={{
          gap: 7, fontSize: "0.86rem", padding: "7px 16px",
          background: "linear-gradient(135deg, #3ecf8e, #2bb377)", border: "none",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
        </svg>
        Connect Wallet
      </button>
      {modalOpen && (
        <WalletModal
          onClose={() => setModalOpen(false)}
          onConnected={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
