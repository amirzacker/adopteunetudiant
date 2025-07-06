import "./footer.css";
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  /*  const { context, dispatch } = useContext(Context)
  const switchTheme = useCallback(() => {
    dispatch({ type: 'switchTheme' })
  }, [dispatch]) */
  return (
    <footer className="footer">
      <div className="container" id="footersize">
        <div className="rowfooter">
          <div className="footer-col">
            <h4>Adopteunetudiant</h4>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/contact">Contactez nous</Link>
              </li>
              <li>
                <Link to="/about-us">Qui sommes-nous</Link>
              </li>
              <li>
                <Link to="/students">Students</Link>
              </li>
              <li>
                <Link to="/registerStudent">
                  Vous etes un nouveau étudiant?
                </Link>
              </li>
              <li>
                <Link to="/registerCompany">Vous etes une entreprise?</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contraintes légales </h4>
            <ul>
              <li>
                <Link to="/politique">Politique de confidentialité</Link>
              </li>
              <li>
                <Link to="/mentions">Mentions Légales</Link>
              </li>
              <li>
                <Link to="/cgu">CGU</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Follow Us</h4>
            <div className="social-links">
              <Link to="error404">
                <i className="fab fa-facebook-f"></i>
              </Link>
              <Link to="error404">
                <i className="fab fa-twitter"></i>
              </Link>
              <Link to="error404">
                <i className="fab fa-linkedin-in"></i>
              </Link>
              <Link to="error404">
                <i className="fab fa-youtube"></i>
              </Link>
            </div>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>
                <Link to="#">info@adopte1etudiant.fr</Link>
              </li>
              <li>
                <Link to="#">166 rue abdcef 60000 AXY</Link>
              </li>
              <li>
                <Link to="#">070707070807</Link>
              </li>
              <li>
                <Link to="#">0986525524426</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
