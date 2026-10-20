export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(7, 11, 16, 0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, backdropFilter: "blur(3px)"
        }}>
            <div className="card" style={{ textAlign: "center", minWidth: 320, margin: 0, padding: "32px 24px" }}>
                <h3 style={{ marginBottom: 12 }}>System Override</h3>
                <p className="muted" style={{ marginBottom: 24, fontSize: 15 }}>{message}</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <button className="danger" onClick={onConfirm}>Confirm</button>
                    <button className="secondary" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}