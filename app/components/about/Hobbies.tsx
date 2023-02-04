import { GiCroissant, GiMountainRoad, GiRunningShoe } from "react-icons/gi";
import { IoBeer, IoLanguageSharp } from "react-icons/io5";
import { SiYourtraveldottv } from "react-icons/si";
import { ImFilm } from "react-icons/im";

const HOBBIES = [
    {
        icon: <IoLanguageSharp style={{ fontSize: "79px" }} />,
        title: "Langues",
        description: (
            <p>
                J’adore apprendre de nouvelles langues et pas seulement parce que je suis professeur de français. Être capable de voyager et s’exprimer dans la langue du pays, c’est génial. Cela
                permet de rencontrer plus facilement les gens et de partager beaucoup plus de choses avec eux. Je parle français, anglais, espagnol et{" "}
                <span className="text-no-wrap">un peu mandarin.</span>
            </p>
        ),
        background: "bg-secondary-1",
    },
    {
        icon: <SiYourtraveldottv style={{ fontSize: "79px" }} />,
        title: "Voyages",
        description: (
            <p>
                Je voyage une grande partie de l’année mais rarement pour des vacances. Disons que je vis quelques mois dans un endroit puis me dirige vers une nouvelle destination. On parle beaucoup
                de « Digital Nomad » ou nomade numérique, peut-être que cela me définit. Ce qui est sûr c’est que j’adore voyager, découvrir de nouveaux paysages, de nouvelles cultures. Et même si je
                dois bien souvent tout recommencer à zéro pour m’adapter au nouveau pays, me créer une routine et me faire des amis, ça <span className="text-no-wrap">vaut le coup!</span>
            </p>
        ),
        background: "bg-neutral-200",
    },
    {
        icon: <GiRunningShoe style={{ fontSize: "79px" }} />,
        title: "Course à pied",
        description: (
            <p>
                Sportif depuis toujours, j’ai commencé par la gymnastique puis le handball quand j’étais adolescent. Puis à l’âge adulte et avec mon mode de vie, il était plus facile de pratiquer des
                activités individuelles donc je me suis naturellement orienté vers la course à pied et un peu l’escalade. En course à pied, ce que je préfère vraiment c’est le « trail », c’est-à-dire
                courir dans la nature, dans les montagnes et avoir accès à des paysages magnifiques. Je dois dire que le choix de chaque nouvelle destination est fortement influencé par cette passion.
                Je pratique aussi le padel, le tennis, le football et tout ce qui me
                <span className="text-no-wrap"> semble intéressant.</span>
            </p>
        ),
        background: "bg-neutral-200",
    },
    {
        icon: <GiMountainRoad style={{ fontSize: "79px" }} />,
        title: "Montagne",
        description: (
            <p>
                Je ne suis peut-être pas un vrai montagnard (une personne née ou qui passe tout son temps dans la montagne) mais c’est vraiment là où je me sens le mieux. La mer ? Pas trop, juste pour
                la vue ! Et plus que la montagne, j’adore les volcans et les îles volcaniques, je trouve que les paysages sont uniques et je me régale à courir ou faire de longues randonnées dans ces
                environnements <span className="text-no-wrap"> si particuliers.</span>
            </p>
        ),
        background: "bg-neutral-200",
    },
    {
        icon: <ImFilm style={{ fontSize: "79px" }} />,
        title: "Séries & Films",
        description: (
            <p>
                Cela dépend vraiment des périodes mais parfois je peux regarder une série entière en quelques jours. J’aime tous les genres cependant j’ai une préférence pour la science-fiction et le
                fantastique. Je connais aussi bien sûr mes classiques du cinéma français et me ferai un plaisir de vous partager mes meilleurs séries et{" "}
                <span className="text-no-wrap">films français !</span>
            </p>
        ),
        background: "bg-neutral-200",
    },
    {
        icon: <GiCroissant style={{ fontSize: "79px" }} />,
        title: "Croissants",
        description: (
            <p>
                Ce n’est pas très surprenant mais oui, j’adore les croissants. En fait, j’adore les viennoiseries et les pâtisseries françaises et je me retrouve parfois dans une situation de profonde
                tristesse lorsque je ne trouve pas ma petite boulangerie locale à l’autre bout du monde. Peut-être que j’exagère un peu mais les croissants, c’est quand{" "}
                <span className="text-no-wrap">même la base !</span>
            </p>
        ),
        background: "bg-neutral-200",
    },
    {
        icon: <IoBeer style={{ fontSize: "79px" }} />,
        title: "Sorties",
        description: (
            <p>
                Comme beaucoup, j’adore sortir boire un café ou un verre en terrasse avec des amis. J’adore la bière belge et les bières artisanales mais j’ai bien sûr aussi une petite connaissance du
                vin de par mes origines bourguignonnes ! Je suis un très mauvais danseur et il est assez rare de me voir dans les clubs ou « boîtes » <span className="text-no-wrap">en français.</span>
            </p>
        ),
        background: "bg-neutral-200",
    },
];

function Hobbies() {
    return (
        <div className="section wf-section pt-0">
            <div className="container-default w-container">
                <div className="inner-container _500px---mbl center">
                    <h2 className="display-2 text-center mg-bottom-56px">
                        Take a look at my <span className="heading-span-secondary-4">hobbies</span>
                    </h2>
                    <div className="inner-container _935px center">
                        <div className="grid-1-column gap-32px mg-bottom-64px">
                            {HOBBIES.map(({ title, description, icon, background }) => (
                                <div key={title} className="card resume-card-v2">
                                    <div className={`resume-card-left-content ${background} justify-center`}>
                                        <div className="resume-card-period-v2">{icon}</div>
                                    </div>
                                    <div className="resume-card-content-rigth">
                                        <div className="inner-container ">
                                            <h3 className="display-4">{title}</h3>
                                            {description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="buttons-row center">
                        <a href="contact.html" className="btn-primary w-button">
                            <span className="line-rounded-icon link-icon-left text-medium"></span>Get in touch
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hobbies;
