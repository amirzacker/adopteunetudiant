import { useState } from "react";
import "./register.css";
import { useNavigate } from "react-router";
import axios from "axios";
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { Link } from "react-router-dom";

export default function RegisterCompany() {

    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [userExist, setUserExist] = useState("");
    const [controleProfilePicture, setcontroleProfilePicture] = useState("");


    //test error of form 
    
    const yupValidation = Yup.object().shape({
        name: Yup.string()
          .required('Veuillez saisir une valeur.')
          .min(4, '4 caracteres minimum'),
        email: Yup.string().required('Email requise').email(),
        city: Yup.string().required('Ville requise'),
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



  
    const handleClick = async (data) => {
   
    try {
        await axios.get("/api/users/email/"+ data.email)
        //Test if Email already exists in the database
        //console.log(uu);
        setUserExist('Email already exists in the database');
    } catch (error) {
         // Continue with the form submission if the email does not exist
         //alert('Email does not exist. Form submission successful');

         const user = {
            name: data.name,
            desc: data.desc,
            city: data.city,
            email: data.email,
            isCompany: true,
            password: data.password,
          };
          if (file && file.size < 2 * 1024 * 1024 && (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg")) {

                const data = new FormData();
                const fileName = Date.now() + file.name;
                data.append("name", fileName);
                data.append("file", file);
                user.profilePicture = fileName;
  
                try {
                    await axios.post("/api/uploads",data);
                } catch (error) {
                    console.log(error);
                }  
           
         
          } else{
            setcontroleProfilePicture("type d'image invalide, seulement: jpeg, png , jpg et inferieur à 2MB");
        }
        if (!file || (file && file.size < 2 * 1024 * 1024 && (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg"))) {
            try {
                await axios.post("/api/users", user);
                navigate("/login");
                reset();
              } catch (err) {
                console.log(err);
              }
        }
        else{
            setcontroleProfilePicture("type d'image invalide, seulement: jpeg, png , jpg et inferieur à 2MB");
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

                     <img src="assets/svg/icon-img-etudiant.svg" alt="upload-img-student"/>
                    </label>
                </h3>
                <p>Ajoutez votre logo</p>
                {controleProfilePicture && <div className="alert alert-danger">{controleProfilePicture}</div>}

            </div>
            <form className="form-container" onSubmit={handleSubmit(handleClick)}>
                <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input type="file" className="form-control form-control-lg" style={{display: "none"}}  id="profilePicture" accept=".png,.jpeg,.jpg" onChange={(e) => setFile(e.target.files[0])}/>
                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''} form-control-lg`} placeholder="Entrez votre nom"   name="name" {...register('name')}/>
                    <div className="invalid-feedback">{errors.name?.message}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Ville</label>
                    <input type="text" className={`form-control ${errors.city ? 'is-invalid' : ''} form-control-lg`} {...register('city')} name="city" placeholder="Entrez votre ville" />
                    <div className="invalid-feedback">{errors.city?.message}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className={`form-control ${errors.desc ? 'is-invalid' : ''} form-control-lg`} {...register('desc')} name="desc" rows="6" />
                    <div className="invalid-feedback">{errors.desc?.message}</div>
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
                    <div className="form-check">
                        <input type="checkbox" className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''}`} {...register('acceptTerms')} name="acceptTerms" id="acceptTerms" />
                        <label className="form-check-label" htmlFor="acceptTerms">
                            J'ai lu et j'accepte <Link to="/cgu">les conditions</Link>
                        </label>
                    </div>
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
