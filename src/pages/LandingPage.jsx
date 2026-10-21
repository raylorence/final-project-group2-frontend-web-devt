
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <main className="hk-landing">
            <section className="hk-hero">
                <div className="hk-hero-content">
                    <p className="hk-system-label">
                        BIOLOGICAL CONTAINMENT SYSTEM // HK-01
                    </p>

                    <h1>
                        HULING
                        <br />
                        <span>KAPSULA</span>
                    </h1>

                    <div className="hk-divider" />

                    <p className="hk-tagline">
                        THE BODY'S FINAL LINE OF DEFENSE.
                    </p>

                    <p className="hk-description">
                        An experimental antibiotic has been deployed
                        into a compromised immune system. Surrounded
                        by endless swarms of aggressive bacteria and
                        pathogens, your mission is simple: survive,
                        eliminate the threat, and beat your high score.
                    </p>

                    <div className="hk-actions">
                        <button
                            className="hk-primary-btn"
                            onClick={() => navigate("/register")}
                        >
                            CREATE ACCOUNT
                        </button>

                        <button
                            className="hk-secondary-btn"
                            onClick={() => navigate("/login")}
                        >
                            LOGIN
                        </button>
                    </div>

                    <p className="hk-warning">
                        [ ALERT ] HOSTILE PATHOGENS DETECTED
                    </p>
                </div>

                <div className="hk-status">
                    <span>ZONE: COMPROMISED</span>
                    <span>MISSION: SURVIVE</span>
                    <span>THREAT LEVEL: CRITICAL</span>
                </div>
            </section>
        </main>
    );
}
