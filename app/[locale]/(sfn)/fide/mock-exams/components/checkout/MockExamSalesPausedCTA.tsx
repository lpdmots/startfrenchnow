"use client";

type MockExamSalesPausedCTAProps = {
    label: string;
    message: string;
    containerClassName?: string;
    buttonClassName?: string;
    messageClassName?: string;
};

export function MockExamSalesPausedCTA({
    label,
    message,
    containerClassName = "flex flex-col gap-2",
    buttonClassName = "btn btn-secondary inline-flex w-full cursor-not-allowed items-center justify-center gap-2 opacity-75 sm:w-auto",
    messageClassName = "mb-0 text-center text-xs text-neutral-600",
}: MockExamSalesPausedCTAProps) {
    return (
        <div className={containerClassName}>
            <button type="button" disabled aria-disabled="true" className={buttonClassName}>
                {label}
            </button>
            <p className={messageClassName}>{message}</p>
        </div>
    );
}
