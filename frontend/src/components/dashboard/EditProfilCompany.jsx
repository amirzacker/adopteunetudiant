import axios from "axios";
import { useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import FlashMessage from "../alert/FlashMessage";

export default function EditProfilCompany({ currentUser , token }) {

  const [profilePicture, setProfilePicture] = useState(null);


  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState(""); 

  
  const [name, setName] = useState(currentUser?.name);
  const [city, setCity] = useState(currentUser?.city);

  const [desc, setDesc] = useState(currentUser?.desc);


  const yupValidation = Yup.object().shape({
    name: Yup.string().required("Veuillez saisir un nom"),
    email: Yup.string().email(),
    city: Yup.string().required("Ville requise"),
    desc: Yup.string().required("Description requise"),
    cemail: Yup.string()
      .email()
      .oneOf([Yup.ref("email")], "Email non identiques"),
  });
  const formOptions = { resolver: yupResolver(yupValidation) };
  const { register, handleSubmit, reset, formState } = useForm(formOptions);
  const { errors } = formState;

  const handleClick = async (data) => {

    const user = {
      id: currentUser?._id,
      name: name,
      desc: desc,
      city: city,
    };
    if (profilePicture) {
      const data = new FormData();
      const fileName = Date.now() + profilePicture.name;
      data.append("name", fileName);
      data.append("file", profilePicture);
      user.profilePicture = fileName;
      try {
        await axios.post("/api/uploads", data);
      } catch (error) {
        console.log(error);
      }
    }
    if (data.email) {
      user.email = data.email;
    }

    try {
      const res = await axios.put("/api/users/" + currentUser?._id, user, {
        headers: { "x-access-token": token },
      });
      const storedObject = JSON.parse(localStorage.getItem("user"));
      // Update the object
      storedObject.user = res.data;

      // Save the updated object back to localStorage
      localStorage.setItem("user", JSON.stringify(storedObject));
      setMessage("profile mise à jour avec succès")
      setSuccess(true)
      window.location.reload();
      reset();
      
    } catch (err) {
      console.log(err);
    }
  };

  

  return (
    <div>
                {
                  success ? <FlashMessage message={message} color={true} /> : ""
                }
      <label htmlFor="profilePicture">
        <img
          style={{ cursor: "pointer" }}
          src="/assets/svg/icon-img-etudiant.svg"
          alt="upload-img-student"
        />
      </label>
      <form onSubmit={handleSubmit(handleClick)}>
        <input
          type="file"
          className=""
          style={{ display: "none" }}
          id="profilePicture"
          accept=".png,.jpeg,.jpg"
          onChange={(e) => setProfilePicture(e.target.files[0])}
        />
        <input
          type="text"
          className={`form-control ${errors.name ? "is-invalid" : ""}`}
          name="name"
          {...register("name")}
          value={name}
          onChange={(e)=> setName(e.target.value)}
          placeholder="Entrez le nom"
        />
       
        <div className="invalid-feedback">{errors.name?.message}</div>


        <input
          type="text"
          className={`form-control ${errors.city ? "is-invalid" : ""}`}
          name="city"
          {...register("city")}
          value={city}
          onChange={(e)=> setCity(e.target.value)}
          placeholder="Entrez votre ville"
        />
        <div className="invalid-feedback">{errors.city?.message}</div>
  
        <label className="form-label">Description</label>
        <textarea
          className={`form-control ${errors.desc ? "is-invalid" : ""} `}
          {...register("desc")}
          value={desc}
          onChange={(e)=> setDesc(e.target.value)}
          name="desc"
          rows="6"
        />
        <div className="invalid-feedback">{errors.desc?.message}</div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="text"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            {...register("email")}
            placeholder="Entrez votre email"
            name="email"
          />
          <div className="invalid-feedback">{errors.email?.message}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="text"
            className={`form-control ${errors.cemail ? "is-invalid" : ""}`}
            {...register("cemail")}
            placeholder="Entrez votre email"
            name="cemail"
          />
          <div className="invalid-feedback">{errors.cemail?.message}</div>
        </div>

        <div className="form-group submit-subscribe-button-div">
          <input
            type="submit"
            className="form-control form-control-lg submit-subscribe-button"
            value="Envoi"
          />
        </div>
      </form>
    </div>
  );
}
