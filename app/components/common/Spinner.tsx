interface Props {
    radius?: boolean;
    message?: string;
    maxHeight?: string;
    color?: string;
}

function Spinner({ radius, message, maxHeight, color = "var(--neutral-100)" }: Props) {
    return (
        <div className="w-full">
            <div className="w-full p-2" style={{ transformStyle: "preserve-3d" }}>
                <div className={`loadingSpinnerContainer ${radius ? "rounded-lg" : undefined}`}>
                    <div className="loadingSpinner " style={{ borderColor: `${color} transparent ${color} transparent`, maxHeight, maxWidth: maxHeight }}></div>
                </div>
            </div>
            {message && (
                <p className="w-full text-center" style={{ paddingTop: maxHeight }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default Spinner;
