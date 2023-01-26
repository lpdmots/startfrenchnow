interface Props {
    radius?: boolean;
    message?: string;
    maxHeight?: string;
}

function Spinner({ radius, message, maxHeight }: Props) {
    return (
        <>
            <div className={`loadingSpinnerContainer ${radius ? "rounded-lg" : undefined}`}>
                <div className="loadingSpinner " style={{ borderColor: `#fff transparent #000 transparent`, maxHeight, maxWidth: maxHeight }}></div>
            </div>
            <p>{message}</p>
        </>
    );
}

export default Spinner;
