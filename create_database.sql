create table clientsBailleurs
(
    id              int auto_increment
        primary key,
    nom             varchar(255) null,
    prenom          varchar(255) null,
    adresseMail     varchar(255) null,
    motDePasse      varchar(255) null,
    dateDeNaissance date         null,
    admin           tinyint(1)   null
);

create table bienImo
(
    id                 int auto_increment
        primary key,
    cheminImg          varchar(255)   null,
    ville              varchar(255)   null,
    adresse            varchar(255)   null,
    id_ClientBailleur  int            null,
    prix               decimal(10, 2) null,
    nomBien            varchar(255)   null,
    description        text           null,
    statutValidation   int            null,
    disponible         int            null,
    typeDePropriete    varchar(255)   null,
    nombreChambres     int            null,
    nombreLits         int            null,
    nombreSallesDeBain int            null,
    wifi               tinyint(1)     null,
    cuisine            tinyint(1)     null,
    balcon             tinyint(1)     null,
    jardin             tinyint(1)     null,
    parking            tinyint(1)     null,
    piscine            tinyint(1)     null,
    jaccuzzi           tinyint(1)     null,
    salleDeSport       tinyint(1)     null,
    climatisation      tinyint(1)     null,
    productId          varchar(255)   null,
    constraint bienImo_ibfk_1
        foreign key (id_ClientBailleur) references clientsBailleurs (id)
);

create index id_ClientBailleur
    on bienImo (id_ClientBailleur);

create table bienImoImages
(
    id        int auto_increment
        primary key,
    bienImoId int          null,
    imagePath varchar(255) null,
    constraint bienImoImages_ibfk_1
        foreign key (bienImoId) references bienImo (id)
            on delete cascade
);

create index bienImoId
    on bienImoImages (bienImoId);

create table discussion
(
    discussion_id int not null
        primary key
);

create table messages
(
    id            int auto_increment
        primary key,
    id_sender     int                                 null,
    id_receiver   int                                 null,
    type_sender   varchar(35)                         null,
    type_receiver varchar(35)                         null,
    content       text                                null,
    timestamp     timestamp default CURRENT_TIMESTAMP null
);

create table prestataires
(
    id              int auto_increment
        primary key,
    nom             varchar(255)         null,
    prenom          varchar(255)         null,
    adresseMail     varchar(255)         null,
    motDePasse      varchar(255)         null,
    dateDeNaissance date                 null,
    admin           tinyint(1)           null,
    valide          tinyint(1) default 0 null
);

create table userBannis
(
    id              int auto_increment
        primary key,
    nom             varchar(100) null,
    prenom          varchar(100) null,
    adresseMail     varchar(100) null,
    dateBanissement datetime     null
);

create table voyageurs
(
    id              int auto_increment
        primary key,
    nom             varchar(255) null,
    prenom          varchar(255) null,
    adresseMail     varchar(255) null,
    motDePasse      varchar(255) null,
    dateDeNaissance date         null,
    admin           tinyint(1)   null,
    customerId      varchar(50)  null
);

create table abonnement
(
    id                 int auto_increment
        primary key,
    id_Voyageur        int          null,
    type               varchar(255) null,
    dateDebut          date         null,
    dateRenouvellement date         null,
    dateFin            date         null,
    idProduitStripe    varchar(255) null,
    typeEcheance       varchar(25)  null,
    statut             varchar(25)  null,
    constraint abonnement_ibfk_2
        foreign key (id_Voyageur) references voyageurs (id)
);

create index id_Voyageur
    on abonnement (id_Voyageur);

create table finances
(
    id                int auto_increment
        primary key,
    id_ClientBailleur int            null,
    id_Prestataire    int            null,
    montant           decimal(10, 2) null,
    type              varchar(50)    null,
    dateTransaction   date           null,
    id_Voyageur       int            null,
    nomDocument       varchar(255)   null,
    constraint finances_ibfk_1
        foreign key (id_ClientBailleur) references clientsBailleurs (id),
    constraint finances_ibfk_2
        foreign key (id_Prestataire) references prestataires (id),
    constraint fk_finances_voyageurs
        foreign key (id_Voyageur) references voyageurs (id)
);

create index id_ClientBailleur
    on finances (id_ClientBailleur);

create index id_Prestataire
    on finances (id_Prestataire);

create table prestation
(
    id                int auto_increment
        primary key,
    id_BienImmobilier int            null,
    id_Prestataire    int            null,
    typeIntervention  varchar(50)    null,
    id_Voyageur       int            null,
    prix              decimal(10, 2) null,
    date              date           null,
    statut            varchar(50)    null,
    nom               varchar(255)   null,
    description       text           null,
    id_ClientBailleur int            null,
    ville             varchar(255)   null,
    lieux             varchar(255)   null,
    constraint fk_id_ClientBailleur
        foreign key (id_ClientBailleur) references clientsBailleurs (id),
    constraint fk_id_Voyageur
        foreign key (id_Voyageur) references voyageurs (id),
    constraint prestation_ibfk_1
        foreign key (id_BienImmobilier) references bienImo (id),
    constraint prestation_ibfk_2
        foreign key (id_Prestataire) references prestataires (id)
);

create table evaluationPrestation
(
    id                int auto_increment
        primary key,
    id_BienImmobilier int         null,
    id_Prestataire    int         null,
    typeIntervention  varchar(50) null,
    note              int         null,
    commentaire       text        null,
    id_Prestation     int         null,
    constraint evaluationPrestation_ibfk_1
        foreign key (id_BienImmobilier) references bienImo (id),
    constraint evaluationPrestation_ibfk_2
        foreign key (id_Prestataire) references prestataires (id),
    constraint fk_id_Prestation
        foreign key (id_Prestation) references prestation (id),
    check (`note` between 1 and 5)
);

create index id_BienImmobilier
    on evaluationPrestation (id_BienImmobilier);

create index id_Prestataire
    on evaluationPrestation (id_Prestataire);

create index id_BienImmobilier
    on prestation (id_BienImmobilier);

create index id_Prestataire
    on prestation (id_Prestataire);

create table reservation
(
    id                int auto_increment
        primary key,
    id_BienImmobilier int            null,
    id_ClientVoyageur int            null,
    dateDebut         date           null,
    dateFin           date           null,
    statut            varchar(50)    null,
    nomBien           varchar(255)   null,
    prix              decimal(10, 2) null,
    cheminImg         varchar(255)   null,
    id_servicesupp    int            null,
    constraint reservation_ibfk_1
        foreign key (id_BienImmobilier) references bienImo (id),
    constraint reservation_ibfk_2
        foreign key (id_ClientVoyageur) references voyageurs (id)
);

create table contrat
(
    id               int auto_increment
        primary key,
    id_Reservation   int         null,
    id_Prestation    int         null,
    id_Prestataire   int         null,
    id_Bailleur      int         null,
    id_Voyageur      int         null,
    typeContrat      varchar(50) null,
    typeIntervention varchar(50) null,
    dateDebutContrat date        null,
    dateFinContrat   date        null,
    statut           varchar(50) null,
    constraint contrat_ibfk_1
        foreign key (id_Reservation) references reservation (id),
    constraint contrat_ibfk_2
        foreign key (id_Prestation) references prestation (id),
    constraint contrat_ibfk_3
        foreign key (id_Prestataire) references prestataires (id),
    constraint contrat_ibfk_4
        foreign key (id_Bailleur) references clientsBailleurs (id),
    constraint contrat_ibfk_5
        foreign key (id_Voyageur) references voyageurs (id)
);

create index id_Bailleur
    on contrat (id_Bailleur);

create index id_Prestataire
    on contrat (id_Prestataire);

create index id_Prestation
    on contrat (id_Prestation);

create index id_Reservation
    on contrat (id_Reservation);

create index id_Voyageur
    on contrat (id_Voyageur);

create table etatDesLieux
(
    id                 int auto_increment
        primary key,
    id_BienImmobilier  int                                       null,
    id_Bailleur        int                                       null,
    id_Reservation     int                                       null,
    typeEtat           enum ('arrivee', 'depart')                null,
    dateEtat           date                                      null,
    etatGeneral        varchar(255)                              null,
    piecesManquantes   text                                      null,
    dommagesConstates  text                                      null,
    signatureBailleur  tinyint(1)                                null,
    signatureLocataire tinyint(1)                                null,
    status             enum ('en attente', 'valide', 'conteste') null,
    constraint etatDesLieux_ibfk_1
        foreign key (id_BienImmobilier) references bienImo (id),
    constraint etatDesLieux_ibfk_2
        foreign key (id_Bailleur) references clientsBailleurs (id),
    constraint etatDesLieux_ibfk_3
        foreign key (id_Reservation) references reservation (id)
);

create index id_Bailleur
    on etatDesLieux (id_Bailleur);

create index id_BienImmobilier
    on etatDesLieux (id_BienImmobilier);

create index id_Reservation
    on etatDesLieux (id_Reservation);

create table facture
(
    id                int auto_increment
        primary key,
    id_Reservation    int            null,
    id_ClientBailleur int            null,
    montantTotal      decimal(10, 2) null,
    dateEmission      date           null,
    constraint facture_ibfk_1
        foreign key (id_Reservation) references reservation (id),
    constraint facture_ibfk_2
        foreign key (id_ClientBailleur) references clientsBailleurs (id)
);

create index id_ClientBailleur
    on facture (id_ClientBailleur);

create index id_Reservation
    on facture (id_Reservation);

create table paiement
(
    id              int auto_increment
        primary key,
    id_Reservation  int            null,
    montant         decimal(10, 2) null,
    datePaiement    date           null,
    methodePaiement varchar(50)    null,
    statut          varchar(50)    null,
    nom             varchar(255)   null,
    id_Utilisateur  int            null,
    typeUtilisateur varchar(50)    null,
    constraint paiement_ibfk_1
        foreign key (id_Reservation) references reservation (id)
);

create index id_Reservation
    on paiement (id_Reservation);

create index id_BienImmobilier
    on reservation (id_BienImmobilier);

create index id_ClientVoyageur
    on reservation (id_ClientVoyageur);

create table signalement
(
    id                int auto_increment
        primary key,
    id_ClientBailleur int     null,
    id_Voyageur       int     null,
    id_Prestataire    int     null,
    sujet             text    null,
    statut            tinyint null,
    constraint signalement_ibfk_1
        foreign key (id_ClientBailleur) references clientsBailleurs (id),
    constraint signalement_ibfk_2
        foreign key (id_Voyageur) references voyageurs (id),
    constraint signalement_ibfk_3
        foreign key (id_Prestataire) references prestataires (id)
);

create index id_ClientBailleur
    on signalement (id_ClientBailleur);

create index id_Prestataire
    on signalement (id_Prestataire);

create index id_Voyageur
    on signalement (id_Voyageur);


