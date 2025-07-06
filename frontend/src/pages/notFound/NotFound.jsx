import React from 'react'
import { Link } from 'react-router-dom'
import "./not-found.css"
function NotFound () {
  return (
    <div className="error404">
    <div className="col">
        <div className="container-error404">
            <h1>
                <span className="num">4 </span>
                <i className="fas fa-cog"></i>
                <span className="num"> 4</span>
            </h1>
            <p>Oups , Lien en cours de construction</p>
        </div>
    </div>
</div>
  )
}

export default NotFound
