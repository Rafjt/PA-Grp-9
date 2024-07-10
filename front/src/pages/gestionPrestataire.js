import React, { useEffect, useState } from "react";
import { fetchNonValidatedPrestataires, fetchDemandesCertification, BASE_URL,handleRefuseDemande ,handleValidateDemande } from "../services.js";
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { changeUserStatus } from "../services.js";

function GestionPrestataire() {
    const [prestataires, setPrestataires] = useState([]);
    const [demandesCertification, setDemandesCertification] = useState([]);

    useEffect(() => {
        fetchNonValidatedPrestataires().then(data => {
            console.log(data);
            setPrestataires(data);
        });
        fetchDemandesCertification().then(data => {
            console.log(data);
            setDemandesCertification(data);
        });
    }, []);

    const handleValidatePrestataire = (id) => {
        changeUserStatus(id, "prestataires", 1).then(response => {
            console.log("Validate prestataire with id:", id);
            setPrestataires(prevState => prevState.filter(prestataire => prestataire.id !== id));
        }).catch(error => {
            console.error("Error validating prestataire:", error);
        });
    };

    const handleRefusePrestataire = (id) => {
        changeUserStatus(id, "prestataires", 0).then(response => {
            console.log("Refuse prestataire with id:", id);
            setPrestataires(prevState => prevState.filter(prestataire => prestataire.id !== id));
        }).catch(error => {
            console.error("Error refusing prestataire:", error);
        });
    };

    const handleValidateDemande = (id) => {
        fetch(`${BASE_URL}/handleDemandeDomaine`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, statut: 'valider' })
        }).then(response => response.json()).then(data => {
            console.log("Validate demande with id:", id);
            setDemandesCertification(prevState => prevState.filter(demande => demande.ID !== id));
        }).catch(error => {
            console.error("Error validating demande:", error);
            setDemandesCertification(prevState => prevState.filter(demande => demande.ID !== id));
        });
    };

    const handleRefuseDemande = (id) => {
        fetch(`${BASE_URL}/handleDemandeDomaine`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, statut: 'refuser' })
        }).then(response => response.json()).then(data => {
            console.log("Refuse demande with id:", id);
            setDemandesCertification(prevState => prevState.filter(demande => demande.ID !== id));
        }).catch(error => {
            console.error("Error refusing demande:", error);
            setDemandesCertification(prevState => prevState.filter(demande => demande.ID !== id));
        });
    };

    const handleDownload = (cheminDoc) => {
        cheminDoc = cheminDoc.replace('uploads/', '');
        const url = `${BASE_URL}/download/${cheminDoc}`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = cheminDoc.split('/').pop(); 
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
            })
            .catch(error => console.error('Error:', error));
    };

    return (
        <div>
            <Container>
                <h1 className="my-4">Gestion des Prestataires</h1>
                <hr />
                <Row>
                    {prestataires.map((prestataire, index) => (
                        <Col key={index} sm={12} md={6} lg={4} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{prestataire.nom} {prestataire.prenom}</Card.Title>
                                    <Card.Text>
                                        <strong>Email:</strong> {prestataire.adresseMail}<br />
                                        <strong>Date de Naissance:</strong> {prestataire.dateDeNaissance}<br />
                                    </Card.Text>
                                    <Button
                                        variant="success"
                                        className="me-2"
                                        onClick={() => handleValidatePrestataire(prestataire.id)}
                                    >
                                        Valider
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRefusePrestataire(prestataire.id)}
                                    >
                                        Refuser
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
            <Container>
                <h1 className="my-4">Gestion des Demandes de Certification</h1>
                <hr />
                <Row>
                    {demandesCertification.map((demande, index) => (
                        <Col key={index} sm={12} md={6} lg={4} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>Demande de Certification</Card.Title>
                                    <Card.Text>
                                        <strong>ID Prestataire:</strong> {demande.ID_Prestataire}<br />
                                        <strong>Domaine:</strong> {demande.domaine}<br />
                                        {demande.cheminDoc && (
                                            <Button onClick={() => handleDownload(demande.cheminDoc)}>
                                                Télécharger le document
                                            </Button>
                                        )}
                                    </Card.Text>
                                    <Button
                                        variant="success"
                                        className="me-2"
                                        onClick={() => handleValidateDemande(demande.ID)}
                                    >
                                        Valider
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRefuseDemande(demande.ID)}
                                    >
                                        Refuser
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
}

export default GestionPrestataire;
