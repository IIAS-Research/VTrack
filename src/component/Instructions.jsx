import React from "react";
import Menu from "./components/menu";
import tuto_keypoint from "../assets/keypoint_tuto.gif";
import tuto_skeleton from "../assets/tuto_skeleton.gif";

export default function Instructions() {
    return (
        <section className="flex flex-col">
        <Menu />
        <div className="p-4 mt-16 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4 text-indigo-700">Instructions</h1>
            <article className="w-4/5 bg-white border border-slate-200 shadow-md rounded p-4">
                <h2 className="text-xl font-bold mb-2 text-indigo-500">
                    Creating keypoints
                </h2>
                <p>
                    To create a keypoint, select your labeled keypoint and click on the image where you want to place the keypoint. A keypoint will be created at the clicked location.
                </p>
                <img src={tuto_keypoint} alt="Creating keypoints" className="my-4"/>
                <h2 className="text-xl font-bold my-2 text-indigo-500">
                    Create a line to connect keypoints
                </h2>
                <p>
                    To create a line between two keypoints, select the first keypoint and click on the second keypoint. A line will be created between the two keypoints.
                </p>
                <img src={tuto_skeleton} alt="Creating a line" className="my-4"/>
            </article>
        </div>
        </section>
    );
}
