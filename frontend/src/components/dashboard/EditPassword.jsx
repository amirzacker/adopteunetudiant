import axios from "axios";
import { useState } from "react";

import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import FlashMessage from "../alert/FlashMessage";

export default function EditPassword({ currentUser , token}) {
  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");
  const yupValidation = Yup.object().shape({
    password: Yup.string()
      .required("Mot de passe requis")
      .min(10, "Mot de passe requis minimum 10 caractères") 
      .max(20, "Mot de passe requis maximum 20 caractères")
      .matches(/([0-9])/, "Au moins un entier")
      .matches(/[@$!%*?&]/, "Au moins un caractere special"),
    cpassword: Yup.string()
      .required("Mot de passe de confirmation requis")
      .min(10, "Mot de passe requis minimum 10 caractères")
      .max(20, "Mot de passe requis maximum 20 caractères")
      .matches(/([0-9])/, "Au moins un entier")
      .matches(/[@$!%*?&]/, "Au moins un caractere special")
      .oneOf([Yup.ref("password")], "Mot de passe non identiques"),
  });
  const formOptions = { resolver: yupResolver(yupValidation) };
  const { register, handleSubmit, reset, formState } = useForm(formOptions);
  const { errors } = formState;

  const handleClick = async (data) => {
    const user = {
      id: currentUser?._id,
      password: data.password,
    };
  
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
      <form onSubmit={handleSubmit(handleClick)}>
        
        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <input
            type="password"
            className={`form-control ${errors.password ? "is-invalid" : ""} `}
            {...register("password")}
            name="password"
            placeholder="Entrez votre mot de passe"
          />
          <div className="invalid-feedback">{errors.password?.message}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Confirmation de mot de passe</label>
          <input
            type="password"
            className={`form-control ${errors.cpassword ? "is-invalid" : ""}`}
            {...register("cpassword")}
            name="cpassword"
            placeholder="Confirmez votre mot de passe"
          />
          <div className="invalid-feedback">{errors.cpassword?.message}</div>
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
