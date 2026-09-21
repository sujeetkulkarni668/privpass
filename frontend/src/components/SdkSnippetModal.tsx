import { useState } from "react";

interface SdkSnippetModalProps {
  requestId: string;
  onClose: () => void;
}

export default function SdkSnippetModal({ requestId, onClose }: SdkSnippetModalProps) {
  const [tab, setTab] = useState<"react" | "node" | "html">("react");
  const [copied, setCopied] = useState(false);

  const snippets = {
    react: `import { PrivPassButton } from "@privpass/sdk-react";

export function KycCheck() {
  return (
    <PrivPassButton
      requestId="${requestId}"
      onVerified={(receipt) => {
        console.log("Verified! Nullifier:", receipt.nullifier);
        console.log("Claims attested:", receipt.claimResults);
      }}
      onError={(err) => console.error("Verification failed", err)}
      theme="dark"
    />
  );
}`,
    node: `import { PrivPassClient } from "@privpass/sdk-node";

const client = new PrivPassClient({
  apiKey: process.env.PRIVPASS_API_KEY,
  network: "preprod"
});

// Verify proof payload sent by frontend
const verification = await client.verifyRequest("${requestId}");
if (verification.proofValid) {
  console.log("User satisfied all claims on Midnight ledger!");
}`,
    html: `<!-- Embed PrivPass QR & Modal -->
<script src="https://cdn.privpass.id/v1/widget.js"></script>
<button data-privpass-request="${requestId}">
  Verify with PrivPass (Zero-Knowledge)
</button>`,
  };

  function copyCode() {
    navigator.clipboard.writeText(snippets[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Integrate into your dApp</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--slate)", fontSize: "1.2rem", cursor: "pointer" }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: "0.88rem", color: "var(--slate)", marginBottom: 16 }}>
          Drop this verification flow into your React application, Node.js backend, or static website:
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {(["react", "node", "html"] as const).map((t) => (
            <button
              key={t}
              className={`btn ${tab === t ? "btn-accent" : "btn-secondary"}`}
              style={{ padding: "6px 14px", fontSize: "0.8rem", textTransform: "uppercase" }}
              onClick={() => setTab(t)}
            >
              {t === "react" ? "React SDK" : t === "node" ? "Node.js / Express" : "HTML / Widget"}
            </button>
          ))}
        </div>

        <div style={{ position: "relative" }}>
          <pre
            className="mono"
            style={{
              background: "var(--ink)",
              padding: "16px",
              borderRadius: 8,
              border: "1px solid var(--ink-line)",
              fontSize: "0.82rem",
              color: "#a5f3fc",
              overflowX: "auto",
              maxHeight: 240,
            }}
          >
            {snippets[tab]}
          </pre>
          <button
            onClick={copyCode}
            className="btn btn-secondary"
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              padding: "4px 10px",
              fontSize: "0.75rem",
            }}
          >
            {copied ? "✓ Copied!" : "Copy Code"}
          </button>
        </div>

        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
