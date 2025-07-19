import './navbar.css'
import React, { useContext } from 'react';
import { Navbar, Nav, Image, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { AuthContext } from '../../context/AuthContext';
import { Context } from '../../context';
import { useAriaAttributes } from '../accessibility/AccessibilityProvider';

function MyNavbar () {
const { user } = useContext(AuthContext);
const { context } = useContext(Context);
const { getAriaAttributes } = useAriaAttributes();

  return (
    <div>
      <header className="sticky-top">

      <Navbar id='navbarmobile' bg="dark" expand="lg" sticky="top" role="navigation" aria-label="Navigation principale mobile">
      <div className="container">
        <Navbar.Brand>
          <Link to="/" {...getAriaAttributes({ label: 'Retour à l\'accueil' })}>
            <Image src="/assets/logos/logodef.svg" alt="Logo Adopte un étudiant" id="adopte-logo" />
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Ouvrir le menu de navigation"
        />
        <Navbar.Collapse id="navbarSupportedContent">
          <Nav className="ml-auto" role="menubar">
            <Nav.Link as={Link} to="/" role="menuitem">Accueil</Nav.Link>
            <Nav.Link as={Link} to="/students" role="menuitem">Étudiants</Nav.Link>
            <Nav.Link as={Link} to="/job-board" role="menuitem">Offres d'emploi</Nav.Link>
            <Nav.Link as={Link} to="/contact" role="menuitem">Contactez Nous</Nav.Link>
            <Nav.Link as={Link} to="/about-us" role="menuitem">À propos</Nav.Link>
            <div className="login-container1">
              <Nav.Link
                as={Link}
                to="/login"
                className="nav-login"
                role="menuitem"
                {...getAriaAttributes({
                  label: !user ? 'Se connecter à votre compte' : 'Accéder au tableau de bord'
                })}
              >
                {!user ? 'Connexion' : 'Dashboard'}
              </Nav.Link>
            </div>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
    <nav id='navbarpc' className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" role="navigation" aria-label="Navigation principale desktop">
            <div className="container">
                <h1>
                    <Link to="/" {...getAriaAttributes({ label: 'Retour à l\'accueil' })}>
                      <img src="/assets/logos/logodef.svg" alt="Logo Adopte un étudiant" id="adopte-logo"/>
                    </Link>
                </h1>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarSupportedContent"
                  aria-controls="navbarSupportedContent"
                  aria-expanded="false"
                  aria-label="Ouvrir le menu de navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 w-100 justify-content-end" role="menubar">

                        <li className="nav-item navbarhover" role="none">
                            <Link
                              className="link link--thebe"
                              to="/"
                              role="menuitem"
                              {...getAriaAttributes({ label: 'Aller à la page d\'accueil' })}
                            >
                              Accueil
                            </Link>
                        </li>

                        <li className="nav-item navbarhover" role="none">
                            <Link
                              className="link link--thebe"
                              to="/students"
                              role="menuitem"
                              {...getAriaAttributes({ label: 'Voir la liste des étudiants' })}
                            >
                              Étudiants
                            </Link>
                        </li>
                        <li className="nav-item navbarhover" role="none">
                            <Link
                              className="link link--thebe"
                              to="/job-board"
                              role="menuitem"
                              {...getAriaAttributes({ label: 'Consulter les offres d\'emploi' })}
                            >
                              Offres d'emploi
                            </Link>
                        </li>
                        <li className="nav-item navbarhover" role="none">
                            <Link
                              className="link link--thebe"
                              to="/contact"
                              role="menuitem"
                              {...getAriaAttributes({ label: 'Nous contacter' })}
                            >
                              Contactez Nous
                            </Link>
                        </li>
                        <li className="nav-item navbarhover" role="none">
                            <Link
                              className="link link--thebe"
                              to="/about-us"
                              role="menuitem"
                              {...getAriaAttributes({ label: 'En savoir plus sur nous' })}
                            >
                              À propos
                            </Link>
                        </li>

                        <li className="nav-item nav-item-login glow-on-hover" role="none">
                            <div className="login-container1">
                                <Link
                                  className="nav-link nav-login"
                                  to="/login"
                                  role="menuitem"
                                  {...getAriaAttributes({
                                    label: !user ? 'Se connecter à votre compte' : 'Accéder au tableau de bord'
                                  })}
                                >
                                  {!user ? "Connexion" : "Dashboard"}
                                </Link>
                            </div>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    </header>
    <div className="container login-responsive">
        <div className="login-container">
            <Link
              className="nav-link nav-login glow-on-hover2"
              to="/login"
              {...getAriaAttributes({
                label: !user ? 'Se connecter à votre compte' : 'Accéder au tableau de bord'
              })}
            >
              {!user ? "Connexion" : "Dashboard"}
            </Link>
        </div>
    </div>

    </div>
  )
}

export default MyNavbar
