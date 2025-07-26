
import { Link } from "react-router-dom";

export default function Student({ student }) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  return (
    <div className="card">
      <Link to={"/student/" + student._id}>
        {" "}
        <img className="card-img-top" src={`${student?.profilePicture ? PF + student?.profilePicture : PF + "pic2.jpg"}`} alt={`Profil de ${student?.firstname || 'étudiant'}`} />
      </Link>
      <div className="card-body">
        <span className="card-text fw-bold">{student?.firstname}</span>
        <br />
        <span className="fw-normal">Recherche:</span>
        <span className="fw-bold text-danger">
          {" "}
          {student?.searchType?.name}
        </span>
        <br />
        <span className="card-text fw-lighter fst-italic ">
          Du: 01-01-1997 Au: 01-01-1997{" "}
        </span>
        <p>{student?.domain?.name}</p>
        <Link to={"/student/" + student?._id}>
          <h6 className="text-center btn btn-secondary btn-bg">Voir profil</h6>
        </Link>
      </div>
    </div>
  );
}
