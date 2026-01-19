
import { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    telephone: "",
    avatar: ""
  });

  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Upload image avatar to Cloudinary
  const serverOptions = () => {
    return {
      process: (fieldName, file, metadata, load, error, progress, abort) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "rbzoyji0"); // ton upload preset Cloudinary
        data.append("cloud_name", "dlj8nno5x");

        fetch("https://api.cloudinary.com/v1_1/dlj8nno5x/image/upload", {
          method: "POST",
          body: data,
        })
          .then((res) => res.json())
          .then((data) => {
            setForm((prev) => ({ ...prev, avatar: data.url }));
            load(data);
          })
          .catch((err) => {
            console.error(err);
            error("Échec d'upload");
            abort();
          });
      }
    };
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.msg || "Une erreur est survenue");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Inscription</h2>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Nom</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="Entrez votre nom"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="Entrez votre email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
     
          <div className="mb-3">
            <label htmlFor="telephone" className="form-label">Téléphone</label>
            <input
              id="telephone"
              name="telephone"
              type="text"
              className="form-control"
              placeholder="Entrez votre téléphone"
              value={form.telephone}
              onChange={handleChange}
            />
          </div>
       
          <div className="mb-3">
            <label htmlFor="avatar" className="form-label">Avatar</label>
            <FilePond
              files={files}
              onupdatefiles={setFiles}
              allowMultiple={false}
              server={serverOptions()}
              acceptedFileTypes={["image/*"]}
              name="file"
              labelIdle='Glissez ou <span class="filepond--label-action">cliquez ici</span>'
              className="filepond"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">S'inscrire</button>
        </form>
        <p className="text-center mt-3">
          Déjà inscrit ? <a href="/login" className="link-primary">Se connecter</a>
        </p>
      </div>
    </div>
  );
}

