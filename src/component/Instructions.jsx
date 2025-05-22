import React from "react";
import Menu from "./components/menu";
import tuto_keypoints_1 from "../assets/tuto_keypoints_1.gif";
import tuto_keypoints_2 from "../assets/tuto_keypoints_2.gif";
import tuto_skeleton from "../assets/tuto_skeleton.gif";
import tuto_bbox from "../assets/tuto_bbox.gif";
import tuto_move from "../assets/move.gif";

export default function Instructions() {
    return (
        <section className="flex flex-col">
            <Menu />
            <div className="p-4 mt-20 flex flex-col items-center">
                <h1 className="text-4xl font-bold mb-4 text-indigo-700">Instructions</h1>
                <article className="w-4/5 bg-white border border-slate-200 shadow-md rounded p-6 m-4">

                    {/* Tuto Keypoint */}
                    <h2 className="text-2xl font-bold mb-2 text-indigo-500">
                        Créer des keypoints
                    </h2>
                    <p className="text-lg">
                        L’objectif de cet outil est d’annoter précisément les artères visibles sur les images médicales. Pour cela, il vous est demandé de placer des points d’intérêt (ou keypoints) le long des vaisseaux sanguins. Chaque keypoint doit être associé à un label anatomique (ex. : artère carotide gauche, artère vertébrale droite, etc.).
                           
                        <ul className="list-disc list-inside ml-4 mt-2 text-lg">
                        <li>
                            Pour créer un keypoints, <strong>sélectionnez le label</strong> désiré puis cliquez sur l’image à l’endroit souhaité. Un point sera automatiquement créé.
                        </li>
                        <li>
                            Les points appartenant à un même label sont <strong>automatiquement reliés entre eux</strong> par une ligne, ce qui permet de suivre le tracé du vaisseau de manière cohérente.
                        </li>
                    </ul>
                    </p>
                    <img src={tuto_keypoints_1} alt="Création de keypoints" className="my-4 mx-auto w-[1000px]" />

                    <p className="text-lg">
                        <ul className="list-disc list-inside ml-4 mt-2">
                        <li>
                            Pour annoter un embranchement entre deux vaisseaux, ajoutez un point au niveau de l’intersection avec le label <strong>bifurcation</strong>.
                        </li>
                        </ul>
                    </p>
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
                    <img src={tuto_move} alt="Déplacement de keypoint" className="my-4 mx-auto w-[1000px]" />
                </article>
            </div>
        </section>
    );
}
