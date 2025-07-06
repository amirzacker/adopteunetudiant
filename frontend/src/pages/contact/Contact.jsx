import { useRef, useState } from "react";
import "./contact.css";

import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import emailjs from '@emailjs/browser';
import FlashMessage from "../../components/alert/FlashMessage";


export default function Contact() {
    const form = useRef();
    const [success, setSuccess] = useState(false);

    const [message, setMessage] = useState("");


    //test error of form 
    
    const yupValidation = Yup.object().shape({
        name: Yup.string()
          .required('Veuillez saisir une valeur.'),
        email: Yup.string().required('Email requise').email(),
        autor: Yup.string().required('Auteur  requis'),
        subject: Yup.string().required('Sujet requis'),
        message: Yup.string().required('Message requise'),
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

        
          emailjs.sendForm('service_7s3s4up', 'template_ydlmofw', form.current, 'vZuhD0JUkXi3hPizJ')
          .then((result) => {
              setMessage("Email de contact envoyé avec succès");
              setSuccess(true)
              reset()
          }, (error) => {
              console.log(error.text);
          });

          setSuccess(false)

    };

  return (

    <div className="container">
        <div className="form-inscription">
            <div className="headersubscribe">
                <h2>Formulaire de contact</h2>
            </div>
            <form className="form-container" ref={form} onSubmit={handleSubmit(handleClick)}>
                      <select className={`form-control ${errors.autor ? 'is-invalid' : ''} form-control-lg`} name="autor" {...register('autor')} >
                      <option value="">Vous etes ? </option>
                        <option  value="Etudiant"> Etudiant </option>
                        <option  value="Entreprise"> Entreprise </option>
                    </select>
                    <div className="invalid-feedback">{errors.autor?.message}</div>
         
                <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''} form-control-lg`} placeholder="Entrez votre nom"   name="name" {...register('name')}/>
                    <div className="invalid-feedback">{errors.name?.message}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Sujet :</label>
                    <input type="text" className={`form-control ${errors.subject ? 'is-invalid' : ''} form-control-lg`} {...register('subject')} name="subject" placeholder="Votre sujet " />
                    <div className="invalid-feedback">{errors.subject?.message}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="text" className={`form-control ${errors.email ? 'is-invalid' : ''} form-control-lg`} {...register('email')} placeholder="Entrez votre email" name="email" />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className={`form-control ${errors.message ? 'is-invalid' : ''} form-control-lg`} {...register('message')} name="message" rows="6" />
                    <div className="invalid-feedback">{errors.message?.message}</div>
                </div>
            
                <div className="form-group">
                    <label className="form-label">J'ai lu et j'accepte les conditions</label>
                    <input type="checkbox" className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''} `} {...register('acceptTerms')} style={{padding: "10px", margin: "0px 0px 10px 10px" }} name="acceptTerms" />
                    <div className="invalid-feedback">{errors.acceptTerms?.message}</div>
                </div>

                <div className="form-group submit-subscribe-button-div">
                    <input type="submit" className="form-control form-control-lg submit-subscribe-button" value="Envoi"/>
                </div>
                {
                    success ? <FlashMessage message={message} color={true} /> : ""
                }
            </form>
        </div>
    </div>
  );
}
