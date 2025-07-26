import { useRef, useState } from "react";
import "./contact.css";

import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import emailjs from '@emailjs/browser';
import FlashMessage from "../../components/alert/FlashMessage";
import { Link } from "react-router-dom";


export default function ForgotPassword() {
    const form = useRef();
    const [success, setSuccess] = useState(false);

    const [message, setMessage] = useState("");
    
    const yupValidation = Yup.object().shape({
        email: Yup.string().required('Email requise').email(),
        acceptTerms: Yup.bool().oneOf(
            [true],
            "Accepter les conditions est obligatoire"
        ),
        })
      const formOptions = { resolver: yupResolver(yupValidation) }
      const { register, handleSubmit, reset, formState } = useForm(formOptions)
      const { errors } = formState;

  
    const handleClick = async (data) => {

        
          emailjs.sendForm('service_7s3s4up', 'template_ydlmofw', form.current, 'vZuhD0JUkXi3hPizJ')
          .then((result) => {
              setMessage("Vous recevez un email si vous avez un compte");
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
                <h2>Mot de passe oublié</h2>
            </div>
            <form className="form-container" ref={form} onSubmit={handleSubmit(handleClick)}>
                 
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="text" className={`form-control ${errors.email ? 'is-invalid' : ''} form-control-lg`} {...register('email')} placeholder="Entrez votre email" name="email" />
                    <div className="invalid-feedback">{errors.email?.message}</div>
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
                {
                    success ? <FlashMessage message={message} color={true} /> : ""
                }
            </form>
        </div>
    </div>
  );
}
