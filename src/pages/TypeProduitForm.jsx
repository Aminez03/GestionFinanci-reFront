import { useState } from "react";
import { FaCube, FaBriefcase } from "react-icons/fa";

function TypeProduitForm() {
  const [selected, setSelected] = useState("matériel");

  return (
    <div className="flex flex-col items-center p-6 font-sans">
      {/* Navigation étapes */}
      <div className="flex gap-8 mb-8 text-lg font-medium">
        <span className="text-blue-600 border-b-2 border-blue-600 pb-1">
          Type de produit
        </span>
        <span className="text-gray-500">Informations sur le produit</span>
        <span className="text-gray-500">Informations supplémentaires</span>
        <span className="text-gray-500">Terminé</span>
      </div>

      {/* Bloc principal */}
      <div className="bg-white border shadow rounded-xl p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-6">Type de produit</h2>

        <div className="flex gap-6">
          {/* Carte Matériel */}
          <div
            onClick={() => setSelected("matériel")}
            className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer w-1/2 transition ${
              selected === "matériel"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-300"
            }`}
          >
            <FaCube size={28} className="text-gray-600" />
            <span className="text-lg">Matériel</span>
          </div>

          {/* Carte Service */}
          <div
            onClick={() => setSelected("service")}
            className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer w-1/2 transition ${
              selected === "service"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-300"
            }`}
          >
            <FaBriefcase size={28} className="text-gray-600" />
            <span className="text-lg">Service</span>
          </div>
        </div>
      </div>

      {/* Boutons navigation */}
      <div className="flex justify-between w-full max-w-2xl mt-6">
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
          ← Retour
        </button>
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
          Continuer →
        </button>
      </div>
    </div>
  );
}

export default TypeProduitForm;
