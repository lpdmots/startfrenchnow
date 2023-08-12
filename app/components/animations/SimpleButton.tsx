import { m } from "framer-motion";

function SimpleButton({ children, classname }: { children: React.ReactNode; classname?: string }) {
    return (
        <m.div
            className={"flex justify-center items-center cursor-pointer bg-blue-500 " + classname}
            whileHover={{ y: -2 }} // orange sur hover
            whileTap={{ scale: 0.9 }} // réduit la taille à 90% sur click
            transition={{ duration: 0.2 }} // transition smooth
        >
            {children}
        </m.div>
    );
}

export default SimpleButton;
