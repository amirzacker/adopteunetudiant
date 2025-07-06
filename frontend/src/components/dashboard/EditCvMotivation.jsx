import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FlashMessage from "../alert/FlashMessage";

export default function EditCvMotivation({ currentUser, token }) {
  const [cv, setCv] = useState(null);
  const [motivation, setMotivation] = useState(null);
  const [controleMotivation, setcontroleMotivation] = useState("");
  const [controleCv, setcontroleCv] = useState("");

  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");

  const { handleSubmit, reset } = useForm();


  const handleClick = async (data) => {
    const user = {
      id: currentUser?._id,
    };
    if (cv && cv.size < 2 * 1024 * 1024 && (cv.type === "image/png" || cv.type === "image/jpg" || cv.type === "image/jpeg" || cv.type === "application/pdf")) {
      const data = new FormData();
      const fileName = Date.now() + cv.name;
      data.append("name", fileName);
      data.append("file", cv);
      user.cv = fileName;
      try {
        await axios.post("/api/uploads", data);
      } catch (error) {
        console.log(error);
      }
    } else {
      setcontroleCv("Cv invalide, seulement: jpeg, png , jpg, pdf et inferieur à 2MB");
  }
    if (motivation && motivation.size < 2 * 1024 * 1024 && (motivation.type === "image/png" || motivation.type === "image/jpg" || motivation.type === "image/jpeg" || motivation.type === "application/pdf")) {
      const data = new FormData();
      const fileName = Date.now() + motivation.name;
      data.append("name", fileName);
      data.append("file", motivation);
      user.motivationLetter = fileName;
      try {
        await axios.post("/api/uploads", data);
      } catch (error) {
        console.log(error);
      } 
    } else {
      setcontroleMotivation("lettre de Motivation invalide, seulement: jpeg, png , jpg, pdf et inferieur à 2MB");
  }


  if ((!cv || (cv && cv.size < 2 * 1024 * 1024)) && (!motivation || (motivation && motivation.size < 2 * 1024 * 1024)) ) {
    try {
      const res = await axios.put("/api/users/" + currentUser?._id, user, {
        headers: { "x-access-token": token },
      });
      const storedObject = JSON.parse(localStorage.getItem("user"));
      // Update the object
      storedObject.user = res.data;

      // Save the updated object back to localStorage
      localStorage.setItem("user", JSON.stringify(storedObject));
      setMessage("profile mise à jour avec succès");
      setSuccess(true);
      window.location.reload();
      reset();
    } catch (err) {
      console.log(err);
    }
  } else{
    setcontroleMotivation("type de fichier invalide, seulement: jpeg, png , jpg, pdf et inferieur à 2MB");
    setcontroleCv("type de fichier invalide, seulement: jpeg, png , jpg, pdf et inferieur à 2MB");
}

}

  return (
    <div>
      {success ? <FlashMessage message={message} color={true} /> : ""}

      <form onSubmit={handleSubmit(handleClick)}>
        <div className="row">
          <label className="cv-lm-svg" htmlFor="cv">
            <img
              style={{ cursor: "pointer" }}
              src="assets/svg/icon-cv.svg"
              alt="cv-logo"
              className="cv-lm-svg"
            />
          </label>
          <label className="cv-lm-svg" htmlFor="motivation">
            <img
              style={{ cursor: "pointer" }}
              src="assets/svg/icon-lm.svg"
              alt="lm-logo"
              className="cv-lm-svg"
            />
          </label>
          <input
            type="file"
            style={{ display: "none" }}
            id="cv"
            accept=".png,.jpeg,.jpg,.pdf"
            onChange={(e) => setCv(e.target.files[0])}
          />
          <input
            type="file"
            style={{ display: "none" }}
            id="motivation"
            accept=".png,.jpeg,.jpg,.pdf"
            onChange={(e) => setMotivation(e.target.files[0])}
          />
        </div>
        {controleCv && <div className="alert alert-danger">{controleCv}</div>}
        {controleMotivation && <div className="alert alert-danger">{controleMotivation}</div>}
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
