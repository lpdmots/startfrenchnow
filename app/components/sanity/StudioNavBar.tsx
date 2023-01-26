import Link from "next/link";
import { IoArrowUndo } from "react-icons/io5";

function StudioNavBar(props: any) {
    return (
        <div>
            <div className="flex items-center justify-between p-5">
                <Link href="/" className="flex items-center font-bold">
                    <IoArrowUndo className="h-6 w-6 mr-2 text-primary" />
                    Retour au site
                </Link>
            </div>
            <>{props.renderDefault(props)}</>
        </div>
    );
}

export default StudioNavBar;
