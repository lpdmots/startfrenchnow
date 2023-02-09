import Image from "next/image";

function Logo(props: any) {
    const { renderDefault, title } = props;
    return (
        <div className="flex items-center space-x-2">
            <Image height={50} width={50} src="/images/logoWhite.png" alt="logo" style={{ width: "auto" }} />
            <>{renderDefault(props)}</>
        </div>
    );
}

export default Logo;
