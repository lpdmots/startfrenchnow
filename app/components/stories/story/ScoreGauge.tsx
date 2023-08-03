import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface ScoreGaugeProps {
    score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
    const getColor = (score: number) => {
        if (score < 25) {
            return "red";
        } else if (score < 50) {
            return "orange";
        } else if (score < 75) {
            return "gold";
        } else {
            return "green";
        }
    };

    return (
        <div style={{ width: "100%", maxWidth: 200 }}>
            <CircularProgressbar
                value={score}
                text={`${score}`}
                styles={buildStyles({
                    pathColor: getColor(score),
                    textColor: "var(--neutral-800)",
                    textSize: "24px",
                })}
            />
        </div>
    );
};

export default ScoreGauge;
