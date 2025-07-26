import axios from "axios";
import { useEffect, useState } from "react";
import { Pagination } from "@material-ui/lab";
import { useCallback } from "react";
import { Modal, Form } from "react-bootstrap";

export default function MyAdoptionStudent({ currentUser }) {
  const [adoptions, setAdoption] = useState([]);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  const [selectedAdoption, setSelectedAdoption] = useState(null);

    useState(null);


    const [searchStatus, setSearchStatus] = useState("");
    const handleSatus = useCallback(
      (event) => { event.preventDefault(); setSearchStatus(event.target.value)} ,
      []
    );
  
    const [filteredAdoptions, setFilteredAdoptions] = useState([]);
    useEffect(() => {
      setFilteredAdoptions(
        adoptions.filter((adoption) =>
        adoption?.status?.toLowerCase().includes(searchStatus.toLowerCase())
        )
      );
    }, [searchStatus, adoptions]);

  const handleCloseModal = () => {
    setSelectedAdoption(null);
  };

  const handleShowModal = (adoption) => {
    setSelectedAdoption(adoption);
  };



  useEffect(() => {
    const source = axios.CancelToken.source();
    const getAdoptions = async () => {
      try {
        const res = await axios.get(`/api/adoptions/${currentUser?.user?._id}`, {
          headers: { "x-access-token": currentUser.token },
          cancelToken: source.token
        });
        //setAdoption(res.data);
        setAdoption(
          res.data.filter((adoption) => adoption.status !== "pending")
        );
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled");
        } else {
          // Error handled silently
        }
      }
    };
    getAdoptions();
    return () => {
      source.cancel("Component unmounted");
    };
  }, [currentUser, adoptions]);



  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pages = Math.ceil(filteredAdoptions.length / itemsPerPage);
  const paginatedData = filteredAdoptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (event, page) => {
    setCurrentPage(page);
  };


  function convertDate(date) {
    const month = date.toLocaleString("fr", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${day} ${month}  ${year}`;
  }


  return (
    <div>
      <h2>Mes Adoptions</h2>
      <div className="form">
        <form className="container" style={{ display: "flex" }}>
          <div>
            <select className="form-control  border border-danger " onChange={handleSatus}>
              <option value="">Filtrer mes adoptions</option>
              <option value="accepted">acceptée</option>
              <option value="rejected">rejettée</option>
            </select>
          </div>
        </form>
      </div>
      <>
        <div className="table-responsive">
          <table className="table table-striped striped bordered hover">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
                paginatedData.map((adoption, index) => (
                  <tr key={index}>
                    <td>{adoption.adopter?.name}</td>
                    <td>{adoption.adopter?.city}</td>
                    <td>{convertDate(new Date(adoption?.updatedAt))}</td>
                    <td>{adoption.status}</td>
                 
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleShowModal(adoption)}
                      >
                        Consulter
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                <td colSpan="7" className="">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="visually">Pas d'adoption encours...</span>
                </td>
              </tr>
              
              )}
            </tbody>
          </table>
        </div>
       

        {selectedAdoption && (
          <Modal show={!!selectedAdoption} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Details de l'entreprise</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <div className="d-flex justify-content-center mt-3 ">
                  <img
                    style={{ width: "10rem" }}
                    className="card-img-top w-65 "
                    src={`${PF + selectedAdoption?.adopter?.profilePicture}`}
                    alt="Card cap"
                  />
                </div>
                <Form.Group controlId="formAdopterName">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Nom
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedAdoption?.adopter.name}
                    disabled
                  />
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Email
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedAdoption?.adopter.email}
                    disabled
                  />
                </Form.Group>
                <Form.Group controlId="formPet">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Adresse
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedAdoption?.adopter.city}
                    disabled
                  />
                </Form.Group>
                <Form.Group controlId="formStatus">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Valeur de l'entreprise
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows="10"
                    type="texte"
                    value={selectedAdoption?.adopter.desc}
                    disabled
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
          </Modal>
        )}
      </>
      <div className="d-flex justify-content-center mt-3">
        <Pagination count={pages} page={currentPage} onChange={handleChange} />
      </div>
    </div>
  );
}
