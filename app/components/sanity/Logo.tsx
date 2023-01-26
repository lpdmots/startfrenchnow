import Image from "next/image";

function Logo(props: any) {
    const { renderDefault, title } = props;
    return (
        <div className="flex items-center space-x-2">
            <Image className="rounded-full object-cover" height={50} width={50} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwcjsRrgLHSTfF4MAB2a2NeH4V_YoQT5lreg&usqp=CAU" alt="logo" />
            <>{renderDefault(props)}</>
        </div>
    );
}

export default Logo;
