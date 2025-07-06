import axios from "axios";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import FlashMessage from "../alert/FlashMessage";

export default function EditProfilStudent({ currentUser , token }) {

  const [profilePicture, setProfilePicture] = useState(null);
  const [domain, setDomain] = useState([]);
  const [searchType, setSearchType] = useState([]);

  const [controleProfilePicture, setcontroleProfilePicture] = useState("");


  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");

  function convertDate(date) {
    const month = date.toLocaleString('fr', { month: 'numeric' });
    const day = date.getDate();
    const year = date.getFullYear();
    const paddedDay = day < 10 ? `0${day}` : day;
    const paddedMonth = month < 10 ? `0${month}` : month;
    return `${year}-${paddedMonth}-${paddedDay}`;
  }

  const startDate = convertDate(new Date(currentUser?.startDate));
  const date = convertDate(new Date(currentUser?.date));
  const endDate = convertDate(new Date(currentUser?.endDate));


  const [firstname, setFistname] = useState(currentUser?.firstname);
  const [lastname, setLastname] = useState(currentUser?.lastname);
  const [city, setCity] = useState(currentUser?.city);
  const [start, setStartDate] = useState(startDate);
  const [end, setEndDate] = useState(endDate);
  const [desc, setDesc] = useState(currentUser?.desc);
  const [age, setAge] = useState(date);

  const yupValidation = Yup.object().shape({
    firstname: Yup.string().required("Veuillez saisir un prénom"),
    lastname: Yup.string().required("Veuillez saisir un nom"),
    email: Yup.string().email(),
    city: Yup.string().required("Ville requise"),
    startDate: Yup.date(),
    date: Yup.date(),
    endDate: Yup.date(),
    searchType: Yup.string().required("type de recherche requis!"),
    domain: Yup.string().required("choisisez un domain!"),
    desc: Yup.string().required("Description requise"),
    cemail: Yup.string()
      .email()
      .oneOf([Yup.ref("email")], "Email non identiques"),
  });
  const formOptions = { resolver: yupResolver(yupValidation) };
  const { register, handleSubmit, reset, formState } = useForm(formOptions);
  const { errors } = formState;

  useEffect(() => {
    // Axios version
    axios.get("/api/domains").then((result) => setDomain(result.data));
  }, []);

  useEffect(() => {
    // Axios version
    axios.get("/api/searchTypes").then((result) => setSearchType(result.data));
  }, []);

  const handleClick = async (data) => {

    const user = {
      id: currentUser?._id,
      firstname: firstname,
      lastname: lastname,
      domain: data.domain,
      searchType: data.searchType,
      startDate : start,
      date : age,
      endDate : end,
      desc: desc,
      city: city,
    };
    if ( profilePicture && profilePicture.size < 2 * 1024 * 1024 && (profilePicture.type === "image/png" || profilePicture.type === "image/jpg" || profilePicture.type === "image/jpeg")) {
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
    } else{
      setcontroleProfilePicture("type d'image invalide, seulement: jpeg, png , jpg et inferieur à 2MB");
  }

    if (data.email) {
      user.email = data.email;
    }
if (!profilePicture || (profilePicture && profilePicture.size < 2 * 1024 * 1024)) {
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
}else{
  setcontroleProfilePicture("type d'image invalide, seulement: jpeg, png , jpg et inferieur à 2MB");
}

}
    

  

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
      {controleProfilePicture && <div className="alert alert-danger">{controleProfilePicture}</div>}
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
          className={`form-control ${errors.firstname ? "is-invalid" : ""}`}
          name="firstname"
          {...register("firstname")}
          value={firstname}
          onChange={(e)=> setFistname(e.target.value)}
          placeholder="Entrez votre prénom"
        />
        <div className="invalid-feedback">{errors.firstname?.message}</div>
        <input
          type="text"
          className={`form-control ${errors.lastname ? "is-invalid" : ""} `}
          name="lastname"
          {...register("lastname")}
          value={lastname}
          onChange={(e)=> setLastname(e.target.value)}
          placeholder="Entrez votre nom"
        />
        <div className="invalid-feedback">{errors.lastname?.message}</div>

        <input
          type="date"
          className={`form-control ${errors.date ? "is-invalid" : ""} `}
          name="date"
          {...register("date")}
          onChange={(e)=> setAge(e.target.value)}
          value={age}
        />

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
        <select
          className={`form-control ${errors.searchType ? "is-invalid" : ""}`}
          name="searchType"
          {...register("searchType")}
        >
          <option value={currentUser?.searchType?._id}>
            {currentUser?.searchType?.name}
          </option>
          {searchType.map((s, i) => (
            <option key={i} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <div className="invalid-feedback">{errors.searchType?.message}</div>

        <label className="form-label">Durée</label>
        <div className="date-form-container">
          <p>De : </p>
          <input
            type="date"
            className={`form-control ${
              errors.startDate ? "is-invalid" : ""
            }  date-form`}
            name="startDate"
            value={start}
            onChange={(e)=> setStartDate(e.target.value)}
            {...register("startDate")}
          />
          <p id="date-delai">à : </p>
          <input
            type="date"
            className={`form-control ${errors.endDate ? "is-invalid" : ""} date-form`}
            name="endDate"
            value={end}
            {...register("endDate")}
            onChange={(e)=> setEndDate(e.target.value)}
          />
        </div>

        <select
          className={`form-control ${errors.domain ? "is-invalid" : ""} `}
          name="domain"
          {...register("domain")}
        >
          <option value={currentUser.domain?._id}>
            {currentUser.domain?.name}
          </option>
          {domain.map((d, i) => (
            <option key={i} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <div className="invalid-feedback">{errors.domain?.message}</div>
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
