import "./register.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { Link } from "react-router-dom";


export default function RegisterStudent() {

    const navigate = useNavigate();
    const [profilePicture, setProfilePicture] = useState(null);
    const [cv, setCv] = useState(null);
    const [motivation, setMotivation] = useState(null);
    const [userExist, setUserExist] = useState("");

    const [controleProfilePicture, setcontroleProfilePicture] = useState("");
    const [controleMotivation, setcontroleMotivation] = useState("");
    const [controleCv, setcontroleCv] = useState("");

    const [domain, setDomain] = useState([]);
    const [searchType, setSearchType] = useState([]);
    //test error of form 
    
    const yupValidation = Yup.object().shape({
        firstname: Yup.string()
          .required('Veuillez saisir un prénom'),
        lastname: Yup.string()
          .required('Veuillez saisir un nom'),
        email: Yup.string().required('Email requise').email(),
        date: Yup.date().required('Date de naissance requise'),
        city: Yup.string().required('Ville requise'),
        startDate: Yup.date().required('choisissez une date de debut'),
        endDate: Yup.date().required('choisissez une date de fin'),
        searchType: Yup.string().required('type de recherche requis!'),
        domain: Yup.string().required('choisisez un domain!'),
        desc: Yup.string().required('Description requise'),
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
        acceptTerms: Yup.bool().oneOf(
            [true],
            "Accepter les conditions est obligatoire"
        ),
        })
      const formOptions = { resolver: yupResolver(yupValidation) }
      const { register, handleSubmit, reset, formState } = useForm(formOptions)
      const { errors } = formState;


    //test error of form 

    useEffect(() => {
        // Axios version
        axios.get("/api/domains").then((result) => setDomain(result.data));
      }, []);

    useEffect(() => {
        // Axios version
        axios.get("/api/searchTypes").then((result) => setSearchType(result.data));
      }, []);


    
  
    const handleClick = async (data) => {
   
        try {
            await axios.get("/api/users/email/"+ data.email)
            //Test if Email already exists in the database
            //console.log(data);
            setUserExist('Email already exists in the database');
        } catch (error) {
             // Continue with the form submission if the email does not exist
             //console.log(error);
             //alert('Email does not exist. Form submission successful');
             const user = {
                firstname: data.firstname,
                lastname: data.lastname,
                date: data.date,
                domain: data.domain,
                searchType: data.searchType,
                startDate: data.startDate,
                endDate: data.endDate,
                email: data.email,
                desc: data.desc,
                city: data.city,
                isStudent: true,
                status: true,
                password: data.password,
              };
              if ( profilePicture && profilePicture.size < 2 * 1024 * 1024 && (profilePicture.type === "image/png" || profilePicture.type === "image/jpg" || profilePicture.type === "image/jpeg")) {
                  const data = new FormData();
                  const fileName = Date.now() + profilePicture.name;
                  data.append("name", fileName);
                  data.append("file", profilePicture);
                  user.profilePicture = fileName;
                  try {
                      await axios.post("/api/uploads",data);
                  } catch (error) {
                      console.log(error);
                  }
              }else{
                setcontroleProfilePicture("type d'image invalide, seulement: jpeg, png , jpg et inferieur à 2MB");
            }
              if (cv && cv.size < 2 * 1024 * 1024 && (cv.type === "image/png" || cv.type === "image/jpg" || cv.type === "image/jpeg" || cv.type === "application/pdf")) {
                  const data = new FormData();
                  const fileName = Date.now() + cv.name;
                  data.append("name", fileName);
                  data.append("file", cv);
                  user.cv = fileName;
                  try {
                      await axios.post("/api/uploads",data);
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
                      await axios.post("/api/uploads",data);
                  } catch (error) {
                      console.log(error);
                  }
              } else {
                setcontroleMotivation("lettre de Motivation invalide, seulement: jpeg, png , jpg, pdf et inferieur à 2MB");
            }
            if ((!profilePicture || (profilePicture && profilePicture.size < 2 * 1024 * 1024)) && (!cv || (cv && cv.size < 2 * 1024 * 1024)) && (!motivation || (motivation && motivation.size < 2 * 1024 * 1024)) ) {
              try {
                await axios.post("/api/users", user);
                navigate("/login");
                reset();
                
              } catch (err) {
                console.log(err);
              }
            } else{
                setcontroleMotivation("type de fichier invalide, seulement: jpeg, png , jpg, pdf et inferieur à 2MB");
                setcontroleProfilePicture("type de fichier invalide, seulement: jpeg, png , jpg, pdf et inferieur à 2MB");
                setcontroleCv("type de fichier invalide, seulement: jpeg, png , jpg, pdf et inferieur à 2MB");
            }
        }    
    
    
        };




  return (
<div className="container">
        <div className="form-inscription">
            <div className="headersubscribe">
                <h2>Inscription</h2>
                <h3>
                    <label htmlFor="profilePicture">

                     <img style={{ cursor: 'pointer' }} src="assets/svg/icon-img-etudiant.svg" alt="upload-img-student"/>
                    </label>
                </h3>
                <p>Ajoutez votre photo</p>
                {controleProfilePicture && <div className="alert alert-danger">{controleProfilePicture}</div>}
            </div>
            <form className="form-container" onSubmit={handleSubmit(handleClick)} >
                <div className="form-group form-group-css">
                    <label className="form-label">Prénom</label>
                    <input type="file" className="form-control form-control-lg" style={{display: "none"}}  id="profilePicture" accept=".png,.jpeg,.jpg" onChange={(e) => setProfilePicture(e.target.files[0])}/>
                    <input type="text" className={`form-control ${errors.firstname ? 'is-invalid' : ''} form-control-lg`} name="firstname" {...register('firstname')} placeholder="Entrez votre prénom"/>
                    <div className="invalid-feedback">{errors.firstname?.message}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input type="text" className={`form-control ${errors.lastname ? 'is-invalid' : ''} form-control-lg`} name="lastname" {...register('lastname')} placeholder="Entrez votre nom"/>
                    <div className="invalid-feedback">{errors.lastname?.message}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Date de Naissance</label>
                    <input type="date" className={`form-control ${errors.date ? 'is-invalid' : ''} form-control-lg`} name="date" {...register('date')} />
                </div>

                <div className="form-group">
                    <label className="form-label">Ville</label>
                    <input type="text" className={`form-control ${errors.city ? 'is-invalid' : ''} form-control-lg`} name="city" {...register('city')} placeholder="Entrez votre ville"/>
                    <div className="invalid-feedback">{errors.city?.message}</div>
                </div>

                <div className="form-group">
                    <label className="form-label">Je cherche</label>
              
                       {
                             searchType.map((s, i) =>
                             <div key={i} className="form-check">
                             <input  className={`form-check-input ${errors.searchType ? 'is-invalid' : ''}`} {...register('searchType')}  value={s._id} type="radio" name="searchType"  />
                             <label className="form-check-label"> {s.name} </label>
                             </div>
                             )
                       }
                   
                   <div className="invalid-feedback">{errors.searchType?.message}</div>
                </div>

                <label className="form-label">Durée</label>
                <div className="date-form-container">
                    <p>De : </p>
                    <input type="date"  className={`form-control ${errors.startDate ? 'is-invalid' : ''} form-control-lg date-form`} name="startDate" {...register('startDate')}/>
                    <p id="date-delai">à : </p>
                    <input type="date" className={`form-control ${errors.endDate ? 'is-invalid' : ''} form-control-lg date-form`} name="endDate" {...register('endDate')}/>

                </div>

                <label className="my-1 mr-2" >Domaine</label><br/>
                <select className={`form-control ${errors.domain ? 'is-invalid' : ''} form-control-lg`} name="domain" {...register('domain')}>
                    {
                     domain.map((d, i) =>
                    <option key={i} value={d._id}>{d.name}</option>
                     )
                    }
                </select>
                <div className="invalid-feedback">{errors.domain?.message}</div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className={`form-control ${errors.desc ? 'is-invalid' : ''} form-control-lg`} {...register('desc')} name="desc" rows="6" />
                    <div className="invalid-feedback">{errors.desc?.message}</div>
                </div>

                <label className="form-label">Ajoutez votre CV et lettre de motivation</label>

                <div className="row">
                    <label className="cv-lm-svg" htmlFor="cv">
                    <img style={{ cursor: 'pointer' }} src="assets/svg/icon-cv.svg" alt="cv-logo" className="cv-lm-svg"/>
                    </label>
                    <label className="cv-lm-svg" htmlFor="motivation">

                    <img style={{ cursor: 'pointer' }} src="assets/svg/icon-lm.svg" alt="lm-logo" className="cv-lm-svg"/>
                    </label>
                    <input type="file" style={{display: "none"}} id="cv" accept=".png,.jpeg,.jpg,.pdf" onChange={(e) => setCv(e.target.files[0])}/>
                    <input type="file" style={{display: "none"}}  id="motivation" accept=".png,.jpeg,.jpg,.pdf" onChange={(e) => setMotivation(e.target.files[0])}/>
                    {controleCv && <div className="alert alert-danger">{controleCv}</div>}
                    {controleMotivation && <div className="alert alert-danger">{controleMotivation}</div>}
                </div>


                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="text" className={`form-control ${errors.email ? 'is-invalid' : ''} form-control-lg`} {...register('email')} placeholder="Entrez votre email" name="email" />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                    {userExist && <div className="alert alert-danger">{userExist}</div>}
                </div>

                <div className="form-group">
                    <label className="form-label">Mot de passe</label>
                    <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''} form-control-lg`} {...register('password')} name="password" placeholder="Entrez votre mot de passe" />
                    <div className="invalid-feedback">{errors.password?.message}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Confirmation de mot de passe</label>
                    <input type="password" className={`form-control ${errors.cpassword ? 'is-invalid' : ''} form-control-lg`} {...register('cpassword')} name="cpassword" placeholder="Confirmez votre mot de passe" />
                    <div className="invalid-feedback">{errors.cpassword?.message}</div>
                </div>

                <div className="form-group">
                    <label className="form-label">J'ai lu et j'accepte  <Link to="/cgu">les conditions</Link></label>
                    <input type="checkbox" className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''} `} {...register('acceptTerms')} style={{padding: "10px", margin: "0px 0px 10px 10px" }} name="acceptTerms" />
                    <div className="invalid-feedback">{errors.acceptTerms?.message}</div>
                </div>

                <div className="form-group submit-subscribe-button-div">
                    <input type="submit" className="form-control form-control-lg submit-subscribe-button" value="Envoi"/>
                </div>
            </form>
        </div>
    </div>
  );
}
