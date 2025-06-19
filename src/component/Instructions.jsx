import React, { useState } from "react";
import Menu from "./components/menu";
import tuto_keypoints_1 from "../assets/tuto_keypoints_1.gif";
import tuto_keypoints_2 from "../assets/tuto_keypoints_2.gif";
import tuto_skeleton from "../assets/tuto_skeleton.gif";
import tuto_bbox from "../assets/tuto_bbox.gif";
import tuto_move from "../assets/move.gif";

export default function Instructions() {
    const [lang, setLang] = useState("fr");

    return (
        <section className="flex flex-col">
            <Menu />
            <div className="p-4 mt-20 flex flex-col items-center">
                <div className="flex gap-4 items-center mb-4">
                    <button onClick={() => setLang("fr")}
                        className={`rounded-full border-2 p-4 cursor-pointer ${lang === "fr" ? "border-indigo-500 bg-indigo-300" : "border-gray-200"}`}
                        title="Français"
                    >
                        <span role="img" aria-label="fr">🇫🇷</span>
                    </button>
                    <button onClick={() => setLang("en")}
                        className={`rounded-full border-2 p-4 cursor-pointer ${lang === "en" ? "border-indigo-500 bg-indigo-300" : "border-gray-200"}`}
                        title="English"
                    >
                        <span role="img" aria-label="en">🇬🇧</span>
                    </button>
                </div>
                <h1 className="text-4xl font-bold mb-4 text-indigo-700">{lang === "fr" ? "Instructions" : "Instructions"}</h1>
                <article className="w-4/5 bg-white border border-slate-200 shadow-md rounded p-6 m-4">
                    {/* Tuto Keypoint */}
                    {lang === "fr" && (
                        <>
                            <h2 className="text-2xl font-bold mb-2 text-indigo-500">
                                Créer des keypoints
                            </h2>
                            <p className="text-lg">
                                L’objectif de cet outil est d’annoter précisément les artères visibles sur les images médicales. Pour cela, il vous est demandé de placer des points d’intérêt (ou keypoints) le long des vaisseaux sanguins. Chaque keypoint doit être associé à un label anatomique (ex. : artère carotide gauche, artère vertébrale droite, etc.).
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-2 text-lg">
                                <li>
                                    Pour créer un keypoints, <strong>sélectionnez le label</strong> désiré puis cliquez sur l’image à l’endroit souhaité. Un point sera automatiquement créé.
                                </li>
                                <li>
                                    Les points appartenant à un même label sont <strong>automatiquement reliés entre eux</strong> par une ligne, ce qui permet de suivre le tracé du vaisseau de manière cohérente.
                                </li>
                            </ul>
                            <img src={tuto_keypoints_1} alt="Création de keypoints" className="my-4 mx-auto w-[1000px]" />
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>
                                    Pour annoter un embranchement entre deux vaisseaux, ajoutez un point au niveau de l’intersection avec le label <strong>bifurcation</strong>.
                                </li>
                            </ul>
                            <img src={tuto_keypoints_2} alt="Création de keypoints (suite)" className="my-4 mx-auto w-[1000px]" />
                            {/* Tuto Skeleton */}
                            <h2 className="text-2xl font-bold my-2 text-indigo-500">
                                Relier deux keypoints avec la fonctionnalité Skeleton
                            </h2>
                            <p className="text-lg">
                                La fonctionnalité <strong>Skeleton</strong> permet de tracer une connexion entre deux <em>keypoints</em>. Elle est utilisée pour relier les <strong>points de bifurcation</strong> aux <strong>vaisseaux</strong> qui en partent ou y arrivent.
                                <br />
                                Pour garantir une annotation homogène et logique lors de l’export en JSON, il est essentiel de suivre l’ordre suivant :
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-2 text-lg">
                                <li>
                                    <strong>1er clic :</strong> sur l’extrémité du vaisseau (artère)
                                </li>
                                <li>
                                    <strong>2e clic :</strong> sur le point de bifurcation correspondant
                                </li>
                            </ul>
                            <p className="mt-2 text-lg">
                                Autrement dit, on va <strong>du vaisseau vers la bifurcation</strong>, comme montré dans la vidéo.
                                <br />
                                <span className="text-red-600 font-semibold">Ne pas inverser l’ordre !</span> Cela pourrait compromettre l’interprétation des connexions lors du traitement automatique des données.
                            </p>
                            <img src={tuto_skeleton} alt="Création de ligne entre points" className="my-4 mx-auto w-[1000px]" />
                            {/* Tuto Bbox */}
                            <h2 className="text-2xl font-bold my-2 text-indigo-500">
                                Créer une boîte englobante (bounding box)
                            </h2>
                            <p className="text-lg">
                                Pour créer une boîte, cliquez pour définir le coin supérieur gauche, puis cliquez à nouveau pour définir le coin inférieur droit. La boîte s’ajustera automatiquement.
                            </p>
                            <img src={tuto_bbox} alt="Création de bounding box" className="my-4 mx-auto w-[1000px]" />
                            {/* Tuto Move Keypoint */}
                            <h2 className="text-2xl font-bold my-2 text-indigo-500">
                                Déplacer un keypoint
                            </h2>
                            <p className="text-lg">
                                Pour déplacer un keypoint cliquuer sur le bouton <strong>Move Keypoint</strong>. Ensuite cliquer sur le keypoint que vous souhaitez déplacer. Vous pouvez ensuite le déplacer à l’endroit souhaité.
                                <br />
                                Pour ne plus déplacer de keypoint, cliquer sur le bouton <strong>Cancel Move</strong>.
                            </p>
                            <img src={tuto_move} alt="Déplacement de keypoint" className="my-4 mx-auto w-[1000px]" />                            <h2 className="text-2xl font-bold my-2 text-indigo-500">
                                Créer une nouvelle branche d'un vaisseau sanguin
                            </h2>
                            <p className="text-lg">
                                Pour créer une nouvelle branche d'un vaisseau sanguin, il suffit de cliquer sur la touche <strong>Suppr</strong> du clavier. La nouvelle branche sera créée et il vous suffira de placer les keypoints comme d'habitude.
                            </p>
                            <p className="text-lg">
                                <strong>Important :</strong> Si vous avez fait une erreur dans la branche précédente, pour revenir dessus il suffit de cliquer sur Undo jusqu'à revenir sur l'erreur, sinon vous pouvez toujours déplacer les keypoints pour corriger.
                            </p>
                        </>
                    )}
                    {lang === "en" && (
                        <>
                            <h2 className="text-2xl font-bold mb-2 text-indigo-500">
                                Create keypoints
                            </h2>
                            <p className="text-lg">
                                The goal of this tool is to precisely annotate arteries visible on medical images. You are asked to place points of interest (keypoints) along the blood vessels. Each keypoint must be associated with an anatomical label (e.g.: left carotid artery, right vertebral artery, etc.).
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-2 text-lg">
                                <li>
                                    To create a keypoint, <strong>select the desired label</strong> then click on the image at the desired location. A point will be created automatically.
                                </li>
                                <li>
                                    Points belonging to the same label are <strong>automatically connected</strong> by a line, allowing you to follow the vessel path coherently.
                                </li>
                            </ul>
                            <img src={tuto_keypoints_1} alt="Create keypoints" className="my-4 mx-auto w-[1000px]" />
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>
                                    To annotate a bifurcation between two vessels, add a point at the intersection with the <strong>bifurcation</strong> label.
                                </li>
                            </ul>
                            <img src={tuto_keypoints_2} alt="Create keypoints (cont.)" className="my-4 mx-auto w-[1000px]" />
                            {/* Tuto Skeleton */}
                            <h2 className="text-2xl font-bold my-2 text-indigo-500">
                                Connect two keypoints with the Skeleton feature
                            </h2>
                            <p className="text-lg">
                                The <strong>Skeleton</strong> feature allows you to draw a connection between two <em>keypoints</em>. It is used to connect <strong>bifurcation points</strong> to the <strong>vessels</strong> that start or end there.
                                <br />
                                To ensure consistent and logical annotation when exporting to JSON, it is essential to follow this order:
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-2 text-lg">
                                <li>
                                    <strong>1st click:</strong> on the vessel end (artery)
                                </li>
                                <li>
                                    <strong>2nd click:</strong> on the corresponding bifurcation point
                                </li>
                            </ul>
                            <p className="mt-2 text-lg">
                                In other words, go <strong>from the vessel to the bifurcation</strong>, as shown in the video.
                                <br />
                                <span className="text-red-600 font-semibold">Do not reverse the order!</span> This could compromise the interpretation of connections during automatic data processing.
                            </p>
                            <img src={tuto_skeleton} alt="Create line between points" className="my-4 mx-auto w-[1000px]" />
                            {/* Tuto Bbox */}
                            <h2 className="text-2xl font-bold my-2 text-indigo-500">
                                Create a bounding box
                            </h2>
                            <p className="text-lg">
                                To create a box, click to set the top left corner, then click again to set the bottom right corner. The box will adjust automatically.
                            </p>
                            <img src={tuto_bbox} alt="Create bounding box" className="my-4 mx-auto w-[1000px]" />
                            {/* Tuto Move Keypoint */}
                            <h2 className="text-2xl font-bold my-2 text-indigo-500">
                                Move a keypoint
                            </h2>
                            <p className="text-lg">
                                To move a keypoint, click the <strong>Move Keypoint</strong> button. Then click on the keypoint you want to move. You can then move it to the desired location.
                                <br />
                                To stop moving keypoints, click the <strong>Cancel Move</strong> button.
                            </p>
                            <img src={tuto_move} alt="Move keypoint" className="my-4 mx-auto w-[1000px]" />
                            
                            <h2 className="text-2xl font-bold my-2 text-indigo-500">
                                Create a new branch of a blood vessel
                            </h2>
                            <p className="text-lg">
                                To create a new branch of a blood vessel, simply press the <strong>Delete</strong> key on your keyboard. The new branch will be created and you can place keypoints as usual.
                            </p>
                            <p className="text-lg">
                                <strong>Important:</strong> If you made a mistake in the previous branch, you can go back by clicking Undo until you reach the error, or you can always move keypoints to make corrections.
                            </p>
                        </>
                    )}
                </article>
            </div>
        </section>
    );
}
