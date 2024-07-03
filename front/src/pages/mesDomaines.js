import React, { useEffect, useState } from "react";
import { fetchDomaines, createDemandeCertification } from "../services.js";
import { Form, Row, Col, Button } from 'react-bootstrap';

function MesDomaines() {
    const [domaines, setDomaines] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDomaine, setSelectedDomaine] = useState('');
    const [documentMessage, setDocumentMessage] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState(null);

    useEffect(() => {
        fetchDomaines().then(data => {
            console.log(data);
            setDomaines(data);
        });
        // Retrieve and display submission status from localStorage
        const status = localStorage.getItem('submissionStatus');
        if (status) {
            setSubmissionStatus(status);
            localStorage.removeItem('submissionStatus');
        }
    }, []);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSelectChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedDomaine(selectedValue);

        let message = '';
        switch (selectedValue) {
            case 'Conciergerie':
                message = 'Exemple de document requis: Attestation de formation en conciergerie.';
                break;
            case 'Entretien ménager':
                message = 'Exemple de document requis: Certificat de formation en entretien ménager.';
                break;
            case 'Maintenance':
                message = 'Exemple de document requis: Diplôme de maintenance ou expérience équivalente.';
                break;
            case 'Jardinage et entretien extérieur':
                message = 'Exemple de document requis: Certificat en horticulture ou expérience prouvée.';
                break;
            case 'Livraison':
                message = 'Exemple de document requis: Permis de conduire.';
                break;
            case 'Gestion des déchets':
                message = 'Exemple de document requis: Certification en gestion des déchets.';
                break;
            case 'Soutien administratif':
                message = 'Exemple de document requis: Diplôme en administration ou secrétariat.';
                break;
            case 'Déménagement':
                message = 'Exemple de document requis: Expérience en déménagement.';
                break;
            case 'Chauffeur':
                message = 'Exemple de document requis: Permis de conduire et historique de conduite.';
                break;
            case 'Sécurité':
                message = 'Exemple de document requis: Certificat de formation en sécurité.';
                break;
            default:
                message = '';
                break;
        }
        setDocumentMessage(message);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedDomaine || !selectedFile) {
            setSubmissionStatus('Veuillez remplir tous les champs.');
            return;
        }

        const formData = new FormData();
        formData.append('domaine', selectedDomaine);
        formData.append('file', selectedFile);

        try {
            await createDemandeCertification(formData);
            localStorage.setItem('submissionStatus', 'Votre demande a été soumise avec succès.');
            setSelectedDomaine('');
            setSelectedFile(null);
            setDocumentMessage('');
        }
        catch (error) {
            localStorage.setItem('submissionStatus', 'Une erreur s\'est produite lors de la soumission de votre demande.');
        }

        window.location.reload();
    };

    return (
        <div>
            <h1>Mes Domaines</h1>
            <hr />
            <h2>Votre domaine de certification</h2>
            {domaines.length === 0 ? (
                <p>Vous n'êtes certifié dans aucun domaine, c'est le moment de devenir un prestataire certifié par PCS !</p>
            ) : (
                <p>Vous êtes certifié dans le domaine suivant: {domaines.map((domaine, index) => (
                    <strong><span key={index}>{domaine.domaine}</span></strong>
                ))}</p>
            )}
            <p>Notez que, une fois certifié dans un domaine, faire une nouvelle demande signifie changer de domaine. Vous ne pouvez pas exercer dans deux domaines à la fois.</p>
            
            <Form onSubmit={handleSubmit}>
                <h3>Demander à être certifié</h3>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formDomaine">
                        <Form.Label>Domaine</Form.Label>
                        <Form.Control as="select" value={selectedDomaine} onChange={handleSelectChange} required>
                            <option value="">Sélectionnez</option>
                            <option value="Conciergerie">Conciergerie</option>
                            <option value="Entretien ménager">Entretien ménager</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Jardinage et entretien extérieur">Jardinage et entretien extérieur</option>
                            <option value="Livraison">Livraison</option>
                            <option value="Gestion des déchets">Gestion des déchets</option>
                            <option value="Soutien administratif">Soutien administratif</option>
                            <option value="Déménagement">Déménagement</option>
                            <option value="Chauffeur">Chauffeur</option>
                            <option value="Sécurité">Sécurité</option>
                        </Form.Control>
                    </Form.Group>
                </Row>
                {documentMessage && (
                    <div className="mb-3">
                        <p><strong>Documents requis:</strong> {documentMessage}</p>
                    </div>
                )}
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Fichier</Form.Label>
                    <Form.Control type="file" accept=".pdf" onChange={handleFileChange} required />
                </Form.Group>
                <Button variant="primary" type="submit">Soumettre</Button>
                {submissionStatus && (
                    <div className="mt-3">
                        <p>{submissionStatus}</p>
                    </div>
                )}
            </Form>
        </div>
    );
}

export default MesDomaines;
