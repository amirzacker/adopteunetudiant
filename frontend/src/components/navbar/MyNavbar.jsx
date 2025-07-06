import './navbar.css'
import React, { useContext } from 'react';
import { Navbar, Nav, Image, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { AuthContext } from '../../context/AuthContext';

function MyNavbar () {
const { user } = useContext(AuthContext);

  return (
    <div>  
      <header className="sticky-top">
        
      <Navbar id='navbarmobile' bg="dark" expand="lg" sticky="top">
      <div className="container">
        <Navbar.Brand>
          <Link to="/">
            <Image src="/assets/logos/logodef.svg" alt="Adopte-logo" id="adopte-logo" />
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarSupportedContent" />
        <Navbar.Collapse id="navbarSupportedContent">
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/students">Students</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contactez Nous</Nav.Link>
            <Nav.Link as={Link} to="/about-us">A propos</Nav.Link>
            <div className="login-container1">
              <Nav.Link as={Link} to="/login" className="nav-login">
                {!user ? 'Connexion' : 'Dashboard'}
              </Nav.Link>
            </div>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
    <nav id='navbarpc' className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div className="container">
                <h1>
                    <Link to="/"><img src="/assets/logos/logodef.svg" alt="Adopte-logo" id="adopte-logo"/></Link>
                </h1>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 w-100 justify-content-end">

                        <li className="nav-item navbarhover">
                            <Link className="link link--thebe" to="/">Home</Link>
                        </li>

                        <li className="nav-item navbarhover">
                            <Link className="link link--thebe" to="/students">Students</Link>
                        </li>
                        <li className="nav-item navbarhover">
                            <Link className="link link--thebe" to="/contact">Contactez Nous</Link>
                        </li>
                        <li className="nav-item navbarhover">
                            <Link className="link link--thebe" to="/about-us">A propos</Link>
                        </li>
                  
                        <li className="nav-item nav-item-login  glow-on-hover">
                            <div className="login-container1">
                                <Link className="nav-link nav-login" to="/login">{! user ? "Connexion" : "Dashboard"}</Link>

                            </div>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    </header>
    <div className="container login-responsive">
        <div className="login-container">
            <Link className="nav-link nav-login glow-on-hover2" to="/login">{! user ? "Connexion" : "Dashboard"}</Link>

        </div>
    </div>

    </div>
  )
}

export default MyNavbar
