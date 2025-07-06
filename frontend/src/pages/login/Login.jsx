import { useContext, useEffect, useRef, useState } from "react";
import "./login.css";
import { loginCall } from "../../apiCalls";
import { AuthContext } from "../../context/AuthContext";
import { CircularProgress } from "@material-ui/core";
import { Link } from "react-router-dom";


export default function Login() {
  const email = useRef();
  const password = useRef();
  const { isFetching, dispatch, error } = useContext(AuthContext);
  const [authError, setAuthError] = useState('');

 

  const handleClick = (e) => {
    e.preventDefault();
    loginCall(
      { email: email.current.value, password: password.current.value },
      dispatch
    );
  };
  
  useEffect(() => {
  error ? setAuthError("password and user don't match") : setAuthError("") 
  }, [error]);


  return (
    <main>
    <div className="mapage">
        <div className="container-login">
            <form className="login" onSubmit={handleClick}>
            <img src="assets/logos/logodef.svg" alt="adopte-logo" className="adopte-logo-login"/>
                <p className="welcome">Bienvenue</p>
                <input type="email" name="email" placeholder="Email" ref={email} onChange={(e) => (e.target.value)} required/><br/>
                <input type="password" name="password" placeholder="Mot de passe" required minLength="6" ref={password}/><br/>
                {authError && <div className="alert alert-danger">{authError}</div>}
                <input type="submit" name="submit" value="Connexion" disabled={isFetching} /> 
                {isFetching ? (
                <CircularProgress color="secondary" size="30px" />
              ) : (
                ""
              )}
                <br/>
              <Link to="/forgot-password">Mot de passe oublié?</Link><br/>
              <Link to="/registerStudent">Vous etes un nouveau étudiant?</Link><br/>
              <Link to="/registerCompany">une entreprise?</Link>
            </form>
        </div>
    </div>
</main>
  );
}
